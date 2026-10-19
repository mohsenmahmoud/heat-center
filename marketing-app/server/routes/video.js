import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';
import { uploadsRepo, videosRepo } from '../db.js';
import { errors } from '../lib/errors.js';
import { downloadToDir } from '../lib/net.js';
import { lintBrand } from '../brand/qudra.js';
import { fitDurations, totalSeconds } from '../../video/timing.js';
import { RenderRequest, ScriptRequest } from '../services/schemas.js';
import { writeVideoScript } from '../services/ai/index.js';
import { scrapePage } from '../services/scraper.js';
import { activeJob, createJob, getJob, subscribe } from '../services/jobs.js';
import { runRenderJob } from '../services/render.js';

export const videoRouter = Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const CLAUDE_IMAGE_LIMIT = 5 * 1024 * 1024;

function imageBlocks(uploads) {
  return uploads
    .filter((u) => u.mime.startsWith('image/') && u.size <= CLAUDE_IMAGE_LIMIT)
    .slice(0, 4)
    .map((u) => ({
      type: 'image',
      source: { type: 'base64', media_type: u.mime, data: fs.readFileSync(path.join(config.paths.uploads, u.file_name)).toString('base64') },
    }));
}

/** Saves up to 3 images from a scraped page as uploads, so they can be used as mockups. */
async function importPageImages(urls) {
  const items = [];
  for (const url of urls.slice(0, 3)) {
    try {
      const fileName = await downloadToDir(url, config.paths.uploads, { maxBytes: 10e6 });
      const ext = path.extname(fileName).toLowerCase();
      const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }[ext];
      if (!mime) continue;
      const row = uploadsRepo.add({ originalName: path.basename(new URL(url).pathname) || 'page-image', fileName, mime, size: fs.statSync(path.join(config.paths.uploads, fileName)).size });
      items.push({ id: row.id, name: row.original_name, mime, size: row.size, url: `/uploads/${fileName}` });
    } catch (err) {
      console.warn('[script] skipped page image', url, err.message);
    }
  }
  return items;
}

videoRouter.post(
  '/script',
  wrap(async (req, res) => {
    const input = ScriptRequest.parse(req.body);
    if (!input.topic.trim() && !input.url.trim() && !input.imageIds.length) {
      throw errors.validation('Add a topic, a URL or at least one image', 'أضف موضوعاً أو رابطاً أو صورة واحدة على الأقل.');
    }
    const uploads = input.imageIds.map((id) => uploadsRepo.get(id)).filter(Boolean);
    const page = input.url.trim() ? await scrapePage(input.url.trim()) : null;
    const pageImages = page && uploads.length === 0 ? await importPageImages(page.images) : [];
    const allImages = [...uploads.map((u) => ({ id: u.id, mime: u.mime })), ...pageImages];

    const ai = await writeVideoScript({
      topic: input.topic.trim(),
      page,
      images: imageBlocks([...uploads, ...pageImages.map((p) => uploadsRepo.get(p.id))]),
      language: input.language,
      durationSec: input.durationSec,
      market: input.market,
    });

    // Pin images to the scenes that show the product, in order.
    const queue = allImages.filter((i) => i.mime.startsWith('image/')).map((i) => i.id);
    const scenes = ai.scenes.map((s, i) => ({
      id: `s${i + 1}`,
      ...s,
      imageId: ['feature', 'solution'].includes(s.type) && queue.length ? queue.shift() : null,
    }));

    const contact = [config.brand.website, config.brand.whatsapp].filter(Boolean).join('  ·  ');
    const script = {
      title: ai.title,
      language: input.language,
      aspect: '9:16',
      topic: input.topic || page?.title || '',
      scenes: fitDurations(scenes, input.durationSec),
      cta: { ...ai.cta, contact },
      caption: ai.caption,
      hashtags: ai.hashtags,
    };
    res.json({ script, durationSec: totalSeconds(script.scenes), warnings: lintBrand(script), pageImages });
  }),
);

videoRouter.post(
  '/render',
  wrap(async (req, res) => {
    const body = RenderRequest.parse(req.body);
    if (activeJob()) throw errors.busy();
    for (const s of body.script.scenes) if (s.imageId && !uploadsRepo.get(s.imageId)) throw errors.notFound('Scene image');
    const job = createJob({ title: body.script.title });
    // Fire and forget; progress goes out through /jobs/:id/events.
    runRenderJob(job.id, body);
    res.status(202).json({ jobId: job.id });
  }),
);

videoRouter.get('/jobs/:id', (req, res, next) => {
  const job = getJob(req.params.id);
  if (!job) return next(errors.notFound('Job'));
  res.json(job);
});

videoRouter.get('/jobs/:id/events', (req, res, next) => {
  const job = getJob(req.params.id);
  if (!job) return next(errors.notFound('Job'));
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  send(job);
  const unsubscribe = subscribe(job.id, (update) => {
    send(update);
    if (update.status === 'done' || update.status === 'error') res.end();
  });
  const ping = setInterval(() => res.write(': ping\n\n'), 15000);
  req.on('close', () => {
    clearInterval(ping);
    unsubscribe();
  });
});

videoRouter.get('/history', (_req, res) => res.json({ items: videosRepo.list() }));

videoRouter.get('/:id/download', (req, res, next) => {
  const video = videosRepo.get(req.params.id);
  if (!video) return next(errors.notFound('Video'));
  const file = path.join(config.paths.videos, video.fileName);
  if (!fs.existsSync(file)) return next(errors.notFound('Video file'));
  const safeName = (video.title || 'qudra-video').replace(/[^\p{L}\p{N}\- ]+/gu, '').trim().slice(0, 60) || 'qudra-video';
  res.download(file, `${safeName}.mp4`);
});

videoRouter.delete('/:id', (req, res, next) => {
  const video = videosRepo.get(req.params.id);
  if (!video) return next(errors.notFound('Video'));
  for (const f of [video.fileName, video.thumbName].filter(Boolean)) fs.rmSync(path.join(config.paths.videos, f), { force: true });
  videosRepo.remove(video.id);
  res.json({ ok: true });
});
