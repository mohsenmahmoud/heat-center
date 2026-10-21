import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { config, imageProvider, writerProvider } from '../config.js';
import { uploadsRepo } from '../db.js';
import { AppError } from '../lib/errors.js';
import { imageSize, orientation } from '../lib/image-size.js';
import { brandName } from '../brand/index.js';
import { cleanVisual } from '../../video/brand-theme.js';
import { generateImage } from './media.js';
import { generateJson } from './ai/writer.js';

const PEOPLE = {
  egypt: 'Any people look Egyptian, in a modern Egyptian setting.',
  gulf: 'Any people look Gulf Arab (Saudi/Emirati), in a modern Gulf setting.',
  both: 'Any people look Middle Eastern (Egyptian or Gulf Arab), in a modern regional setting.',
  global: '',
};

/** Shared look for every generated scene image of a brand: realistic, on-palette, no text, room for the headline. */
export function sceneImageStyle(brand, market = 'both') {
  const v = cleanVisual(brand?.visual);
  return [
    'Photorealistic editorial photograph for a vertical social-media video, cinematic soft light, shallow depth of field, high detail',
    `colour grading with subtle accents of ${v.primary} and ${v.secondary}`,
    PEOPLE[market] || PEOPLE.both,
    'Keep the top third calm and uncluttered for a headline overlay',
    'Absolutely no text, letters, numbers, logos, watermarks or readable user interfaces anywhere in the image',
  ]
    .filter(Boolean)
    .join('. ');
}

export const imagesOff = () =>
  new AppError(
    'IMAGES_OFF',
    503,
    'توليد الصور غير مفعّل. أضف GEMINI_API_KEY في ملف .env (أو اضبط IMAGE_PROVIDER) ثم أعد التشغيل.',
    'Image generation is off. Add GEMINI_API_KEY to .env (or set IMAGE_PROVIDER) and restart.',
  );

/** An uploads row as the UI uses it (with pixel size, so the preview frames it like the renderer). */
export function uploadItem(row, extra = {}) {
  const size = row.mime.startsWith('image/') ? imageSize(path.join(config.paths.uploads, row.file_name)) : null;
  return { id: row.id, name: row.original_name, mime: row.mime, size: row.size, url: `/uploads/${row.file_name}`, width: size?.width || null, height: size?.height || null, ...extra };
}

/** Generates one scene image and stores it like an upload, so it can be pinned to a scene and swapped later. */
export async function makeSceneImage({ prompt, brand, market, aspect = '9:16' }) {
  if (!imageProvider()) throw imagesOff();
  const fileName = await generateImage(prompt, { dir: config.paths.uploads, aspect, style: sceneImageStyle(brand, market) });
  if (!fileName) throw imagesOff();
  const ext = path.extname(fileName).toLowerCase();
  const mime = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/png';
  const row = uploadsRepo.add({ originalName: 'AI image', fileName, mime, size: fs.statSync(path.join(config.paths.uploads, fileName)).size });
  return uploadItem(row, { source: 'ai' });
}

// ---------- Reviewing a user's image before it goes into a scene ----------

const AiShotSchema = z.object({
  kind: z.enum(['screenshot', 'photo']),
  content: z.array(z.number()),
  focus: z.array(z.number()),
  callout: z.string(),
});

/** Gemini-style [ymin, xmin, ymax, xmax] on 0–1000 → {x, y, w, h} on 0–1, or null when unusable. */
export function boxFrom(arr, within = null) {
  if (!Array.isArray(arr) || arr.length !== 4 || arr.some((n) => typeof n !== 'number' || !Number.isFinite(n))) return null;
  let [y0, x0, y1, x1] = arr.map((n) => Math.min(1, Math.max(0, n / 1000)));
  if (within) {
    x0 = Math.max(x0, within.x);
    y0 = Math.max(y0, within.y);
    x1 = Math.min(x1, within.x + within.w);
    y1 = Math.min(y1, within.y + within.h);
  }
  const w = x1 - x0;
  const h = y1 - y0;
  if (w < 0.04 || h < 0.03) return null;
  return { x: +x0.toFixed(4), y: +y0.toFixed(4), w: +w.toFixed(4), h: +h.toFixed(4) };
}

const FULL = { x: 0, y: 0, w: 1, h: 1 };

/** Without AI: treat it as a screenshot and focus the top area where headers and KPIs usually are. */
export function defaultShot(filePath, language = 'ar') {
  const o = orientation(filePath);
  const focus = o === 'landscape' ? { x: language === 'ar' ? 0.4 : 0, y: 0, w: 0.6, h: 0.6 } : { x: 0, y: 0, w: 1, h: 0.45 };
  return { kind: 'screenshot', content: FULL, focus, callout: '' };
}

const MAX_INLINE = 5 * 1024 * 1024;

/**
 * Looks at an image the user put on a scene and decides how to show it: screenshot (cropped to its content,
 * zoomed on the part that proves the scene, with a short label) or photo (full-screen background).
 */
export async function analyzeImage({ upload, headline = '', subtext = '', language = 'ar', brand = null }) {
  const file = path.join(config.paths.uploads, upload.file_name);
  const writer = writerProvider();
  if (!writer || writer === 'mock' || upload.size > MAX_INLINE || !upload.mime.startsWith('image/')) return defaultShot(file, language);

  const text = `This image will be shown in one scene of a vertical marketing video${brand ? ` for ${brandName(brand, 'en')}` : ''}.
Scene on-screen text: "${headline}"${subtext ? ` — "${subtext}"` : ''}

Review the image and return:
- kind: "screenshot" if it shows a user interface (app, website, dashboard, spreadsheet, chat), otherwise "photo".
- content: box around the useful content only, excluding browser bars, OS bars, empty margins and blank areas.
- focus: box around the single area that best supports the scene text (a KPI card, table rows, chart, button, form or notification; for a photo, the main subject). Prefer an area covering 10–45% of the image, inside content.
- callout: 2–5 words in ${language === 'ar' ? 'Arabic' : 'English'} naming what the focus area shows, written as a label; empty for photos unless it clearly helps.
Boxes are [ymin, xmin, ymax, xmax] integers from 0 to 1000 relative to the image.`;
  try {
    const ai = await generateJson({
      system: 'You are a senior motion designer who frames product screenshots and photos for marketing videos. Be precise with boxes.',
      content: [{ type: 'image', source: { type: 'base64', media_type: upload.mime, data: fs.readFileSync(file).toString('base64') } }, { type: 'text', text }],
      schema: AiShotSchema,
      effort: 'low',
      maxTokens: 2000,
    });
    const content = boxFrom(ai.content) || FULL;
    return {
      kind: ai.kind,
      content,
      focus: boxFrom(ai.focus, content),
      callout: ai.callout.trim().slice(0, 60),
    };
  } catch (err) {
    console.warn('[visuals] image review failed, using default framing:', err.message);
    return defaultShot(file, language);
  }
}
