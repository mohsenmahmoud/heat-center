import fs from 'node:fs';
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { parseMedia } from '@remotion/media-parser';
import { nodeReader } from '@remotion/media-parser/node';
import { config } from '../config.js';
import { uploadsRepo, videosRepo, newId } from '../db.js';
import { errors, AppError } from '../lib/errors.js';
import { orientation } from '../lib/image-size.js';
import { fitDurations, totalSeconds, MIN_TOTAL_SEC, MAX_TOTAL_SEC } from '../../video/timing.js';
import { findStock, generateImage, synthesizeSpeech } from './media.js';
import { updateJob } from './jobs.js';

let bundlePromise = null;
/** Webpack-bundles the Remotion project once per server run. */
function getBundle() {
  bundlePromise ??= bundle({ entryPoint: config.paths.videoEntry }).catch((err) => {
    bundlePromise = null;
    throw err;
  });
  return bundlePromise;
}

export function findLogo() {
  const file = fs.existsSync(config.paths.brand) && fs.readdirSync(config.paths.brand).find((f) => /^logo\.(png|svg|webp|jpe?g)$/i.test(f));
  return file ? `/brand/${file}` : null;
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
 *   scenes the user pinned an uploaded image to → device mockup with that image
 *   otherwise (mix style) → stock footage/photo, then AI image, then the brand gradient.
 */
async function prepareVisuals(script, options, report) {
  const scenes = [];
  const total = script.scenes.length;
  for (const [i, scene] of script.scenes.entries()) {
    report(i / total, scene.headline);
    let visual = { kind: 'gradient' };
    const upload = scene.imageId && uploadsRepo.get(scene.imageId);
    if (upload) {
      visual = { kind: 'mockup', src: `/uploads/${upload.file_name}`, orientation: orientation(path.join(config.paths.uploads, upload.file_name)) };
    } else if (options.visualStyle === 'mix' && scene.type !== 'cta') {
      const stock = await findStock(scene.stockQuery);
      if (stock) {
        visual = { kind: stock.kind, src: `/media/${stock.fileName}` };
      } else if (config.imageProvider !== 'none' && (scene.visualIdea || scene.stockQuery)) {
        try {
          const file = await generateImage(scene.visualIdea || scene.stockQuery);
          if (file) visual = { kind: 'image', src: `/media/${file}` };
        } catch (err) {
          console.warn('[render] AI image failed, using gradient:', err.message);
        }
      }
    }
    scenes.push({ ...scene, visual });
  }
  return scenes;
}

async function prepareVoice(script, options) {
  if (options.voiceMode === 'ai') {
    const text = script.scenes.map((s) => s.voiceover || `${s.headline}. ${s.subtext}`).join('\n');
    const file = await synthesizeSpeech(text, script.language);
    return { src: `/media/${file}`, seconds: await audioSeconds(path.join(config.paths.media, file)) };
  }
  if (options.voiceMode === 'upload' && options.voiceUploadId) {
    const upload = uploadsRepo.get(options.voiceUploadId);
    if (!upload) throw errors.notFound('Voice file');
    return { src: `/uploads/${upload.file_name}`, seconds: await audioSeconds(path.join(config.paths.uploads, upload.file_name)) };
  }
  return null;
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
    const voice = await prepareVoice(script, options);

    // Voiceover sets the pace: stretch scenes to the audio (kept within 40–60s when possible).
    let scenes = script.scenes;
    const target = voice?.seconds ? Math.min(Math.max(voice.seconds + 1.5, MIN_TOTAL_SEC), Math.max(MAX_TOTAL_SEC, voice.seconds + 1.5)) : Math.min(Math.max(totalSeconds(scenes), MIN_TOTAL_SEC), MAX_TOTAL_SEC);
    scenes = fitDurations(scenes, target);

    stage('assets', 0.05, null);
    scenes = await prepareVisuals({ ...script, scenes }, options, (p, msg) => stage('assets', 0.05 + p * 0.15, msg));

    const music = options.music && listMusic().includes(options.music) ? `/music/${encodeURIComponent(options.music)}` : null;
    const inputProps = {
      script: { ...script, scenes },
      mediaBase: `http://127.0.0.1:${config.port}`,
      logoSrc: findLogo(),
      musicSrc: music,
      voiceSrc: voice?.src || null,
      captions: options.captions,
    };

    stage('bundle', 0.2, null);
    const serveUrl = await getBundle();
    const common = { serveUrl, inputProps, browserExecutable: config.browserExecutable, logLevel: 'warn' };
    const composition = await selectComposition({ ...common, id: 'QudraVideo' });

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
      script: { ...script, scenes: scenes.map(({ visual, ...s }) => s), options },
      fileName,
      thumbName,
      durationSec: composition.durationInFrames / composition.fps,
      sizeBytes: fs.statSync(path.join(config.paths.videos, fileName)).size,
    });
    updateJob(jobId, { status: 'done', stage: 'done', progress: 1, result: saved });
  } catch (err) {
    console.error('[render] job failed:', err);
    const appErr = err instanceof AppError ? err : errors.renderFailed(err.message?.split('\n')[0] || 'unknown');
    updateJob(jobId, { status: 'error', stage: 'error', error: { code: appErr.code, message: appErr.messages } });
  }
}
