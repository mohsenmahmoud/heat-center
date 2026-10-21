import fs from 'node:fs';
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { parseMedia } from '@remotion/media-parser';
import { nodeReader } from '@remotion/media-parser/node';
import { config, imageProvider } from '../config.js';
import { plansRepo, uploadsRepo, videosRepo, newId } from '../db.js';
import { errors, AppError } from '../lib/errors.js';
import { imageSize, orientation } from '../lib/image-size.js';
import { fitDurations, totalSeconds, FPS, HARD_MIN_SEC, HARD_MAX_SEC, TRANSITION_FRAMES } from '../../video/timing.js';
import { findStock, generateImage, synthesizeSpeech } from './media.js';
import { updateJob } from './jobs.js';
import { brandProps, logoUrl, resolveBrand } from './brands.js';
import { analyzeImage, sceneImageStyle } from './visuals.js';

let bundlePromise = null;
/** Webpack-bundles the Remotion project once per server run. */
function getBundle() {
  bundlePromise ??= bundle({ entryPoint: config.paths.videoEntry }).catch((err) => {
    bundlePromise = null;
    throw err;
  });
  return bundlePromise;
}

export function listMusic() {
  if (!fs.existsSync(config.paths.music)) return [];
  return fs.readdirSync(config.paths.music).filter((f) => /\.(mp3|wav|m4a|aac|ogg)$/i.test(f));
}

async function audioSeconds(filePath) {
  try {
    const { durationInSeconds } = await parseMedia({ src: filePath, reader: nodeReader, fields: { durationInSeconds: true }, acknowledgeRemotionLicense: true });
    return durationInSeconds || null;
  } catch (err) {
    console.warn('[render] could not read audio duration:', err.message);
    return null;
  }
}

/**
 * Attaches a visual to every scene:
 *   an image pinned to the scene → framed by its review: a screenshot goes in a device, cropped and zoomed on
 *     its focus; a photo fills the screen
 *   otherwise (mix style) → AI image in the brand style, then stock footage/photo, then the brand background.
 */
async function prepareVisuals(script, options, brand, report) {
  const total = script.scenes.length;
  let done = 0;
  const visualFor = async (scene) => {
    let visual = { kind: 'gradient' };
    const upload = scene.imageId && uploadsRepo.get(scene.imageId);
    if (upload) {
      const file = path.join(config.paths.uploads, upload.file_name);
      const shot = scene.shot || (scene.imageSource === 'ai' ? null : await analyzeImage({ upload, headline: scene.headline, subtext: scene.subtext, language: script.language, brand }));
      const mode = scene.imageMode || (scene.imageSource === 'ai' || shot?.kind === 'photo' ? 'photo' : 'screen');
      const size = imageSize(file);
      visual =
        mode === 'photo'
          ? { kind: 'image', src: `/uploads/${upload.file_name}`, focus: shot?.focus || null }
          : { kind: 'mockup', src: `/uploads/${upload.file_name}`, orientation: orientation(file), size: size && { w: size.width, h: size.height }, shot };
    } else if (options.visualStyle === 'mix' && scene.type !== 'cta') {
      if (imageProvider() && (scene.imagePrompt || scene.visualIdea || scene.stockQuery)) {
        try {
          const file = await generateImage(scene.imagePrompt || scene.visualIdea || scene.stockQuery, { style: sceneImageStyle(brand, script.market) });
          if (file) visual = { kind: 'image', src: `/media/${file}` };
        } catch (err) {
          console.warn('[render] AI image failed, trying stock:', err.message);
        }
      }
      if (visual.kind === 'gradient') {
        const stock = await findStock(scene.stockQuery);
        if (stock) visual = { kind: stock.kind, src: `/media/${stock.fileName}` };
      }
    }
    report(++done / total, scene.headline);
    return { ...scene, visual };
  };
  // A few scenes at a time: AI images take a few seconds each.
  const out = new Array(total);
  let next = 0;
  const worker = async () => {
    while (next < total) {
      const i = next++;
      out[i] = await visualFor(script.scenes[i]);
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  return out;
}

const TRANSITION_SEC = TRANSITION_FRAMES / FPS;

/**
 * AI voice: one clip per scene, and each scene lasts as long as its line (so voice, captions and
 * visuals stay in sync). Clips are made a few at a time.
 */
async function voiceScenes(script, options, report) {
  const rate = config.voiceRate;
  const out = new Array(script.scenes.length);
  let next = 0;
  let done = 0;
  const worker = async () => {
    while (next < script.scenes.length) {
      const i = next++;
      const scene = script.scenes[i];
      const text = (scene.voiceover || '').trim();
      if (!text) {
        out[i] = scene;
      } else {
        const clip = await synthesizeSpeech(text, { language: script.language, voiceName: options.voiceName });
        const seconds = clip.seconds ?? (await audioSeconds(path.join(config.paths.media, clip.fileName))) ?? scene.durationSec;
        // Room for the clip at the faster playback rate, plus breathing space and the overlap with the next scene.
        const tail = scene.type === 'cta' ? 1.2 : 0.4;
        out[i] = { ...scene, voice: { src: `/media/${clip.fileName}`, rate }, durationSec: Math.max(2.5, Math.round((seconds / rate + tail + TRANSITION_SEC) * 10) / 10) };
      }
      report(++done / script.scenes.length);
    }
  };
  await Promise.all(Array.from({ length: 3 }, worker));
  return out;
}

async function uploadedVoice(options) {
  if (options.voiceMode !== 'upload' || !options.voiceUploadId) return null;
  const upload = uploadsRepo.get(options.voiceUploadId);
  if (!upload) throw errors.notFound('Voice file');
  return { src: `/uploads/${upload.file_name}`, seconds: await audioSeconds(path.join(config.paths.uploads, upload.file_name)) };
}

/** Full pipeline for one job: assets → bundle → MP4 + thumbnail → history row. */
export async function runRenderJob(jobId, { script, options }) {
  let last = { name: null, progress: -1 };
  // Remotion reports progress per frame; only forward visible (0.5%) changes.
  const stage = (name, progress, message) => {
    if (name === last.name && progress - last.progress < 0.005 && !message) return;
    last = { name, progress };
    updateJob(jobId, { status: 'running', stage: name, progress, message });
  };
  try {
    stage('voice', 0.02, null);
    let scenes = script.scenes;
    const voice = await uploadedVoice(options);
    if (options.voiceMode === 'ai') {
      // The voice sets the length: scenes follow their spoken lines.
      scenes = await voiceScenes(script, options, (p) => stage('voice', 0.02 + p * 0.08, null));
    } else {
      // An uploaded recording sets the total length; otherwise keep the script's length within bounds.
      const target = voice?.seconds ? Math.max(voice.seconds + 1.5, HARD_MIN_SEC) : Math.min(Math.max(totalSeconds(scenes), HARD_MIN_SEC), HARD_MAX_SEC);
      scenes = fitDurations(scenes, target);
    }

    const brand = resolveBrand(script.brandId);
    stage('assets', 0.1, null);
    scenes = await prepareVisuals({ ...script, scenes }, options, brand, (p, msg) => stage('assets', 0.1 + p * 0.1, msg));

    const music = options.music && listMusic().includes(options.music) ? `/music/${encodeURIComponent(options.music)}` : null;
    const inputProps = {
      script: { ...script, scenes },
      mediaBase: `http://127.0.0.1:${config.port}`,
      brand: brandProps(brand),
      logoSrc: logoUrl(brand),
      musicSrc: music,
      voiceSrc: voice?.src || null,
      captions: options.captions,
    };

    stage('bundle', 0.2, null);
    const serveUrl = await getBundle();
    const common = { serveUrl, inputProps, browserExecutable: config.browserExecutable, logLevel: 'warn' };
    const composition = await selectComposition({ ...common, id: 'BrandVideo' });

    const id = newId();
    const fileName = `${id}.mp4`;
    const thumbName = `${id}.jpg`;
    stage('render', 0.25, null);
    await renderMedia({
      ...common,
      composition,
      codec: 'h264',
      crf: 20,
      outputLocation: path.join(config.paths.videos, fileName),
      concurrency: config.renderConcurrency,
      onProgress: ({ progress }) => stage('render', 0.25 + progress * 0.7, null),
    });
    stage('thumbnail', 0.96, null);
    await renderStill({ ...common, composition, frame: Math.min(45, composition.durationInFrames - 1), output: path.join(config.paths.videos, thumbName), imageFormat: 'jpeg', scale: 0.4 });

    const saved = videosRepo.add({
      id,
      title: script.title,
      language: script.language,
      topic: script.topic,
      brandId: brand.id,
      script: { ...script, brandId: brand.id, scenes: scenes.map(({ visual, voice, ...s }) => s), options },
      fileName,
      thumbName,
      durationSec: composition.durationInFrames / composition.fps,
      sizeBytes: fs.statSync(path.join(config.paths.videos, fileName)).size,
    });
    if (options.source) {
      // The edited script becomes the plan day's script, and the day points at its video.
      plansRepo.patchPost(options.source.planId, options.source.postId, { script: { ...script, scenes: scenes.map(({ visual, voice, ...s }) => s) }, videoId: saved.id });
    }
    updateJob(jobId, { status: 'done', stage: 'done', progress: 1, result: saved });
  } catch (err) {
    console.error('[render] job failed:', err);
    const appErr = err instanceof AppError ? err : errors.renderFailed(err.message?.split('\n')[0] || 'unknown');
    updateJob(jobId, { status: 'error', stage: 'error', error: { code: appErr.code, message: appErr.messages } });
  }
}
