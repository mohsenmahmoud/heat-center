import path from 'node:path';
import { z } from 'zod';
import { ApiError, GoogleGenAI, createPartFromUri } from '@google/genai';
import { config } from '../config.js';
import { errors, AppError } from '../lib/errors.js';
import { toStrictJsonSchema } from './ai/json-schema.js';
import { SCENE_TYPES, TRANSITIONS } from './schemas.js';

/** What we learn from a reference video: its structure and style, to rebuild for any brand. */
export const BlueprintSchema = z.object({
  summary: z.string(),
  durationSec: z.number(),
  hookPattern: z.string(),
  tone: z.string(),
  pacing: z.string(),
  voiceStyle: z.string(),
  textStyle: z.string(),
  scenes: z.array(
    z.object({
      type: z.enum(SCENE_TYPES),
      durationSec: z.number(),
      onScreenText: z.string(),
      voiceover: z.string(),
      purpose: z.string(),
      visual: z.string(),
      transition: z.enum(TRANSITIONS),
    }),
  ),
});

const YOUTUBE = /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/i;

const notSupportedLink = () =>
  new AppError(
    'REFERENCE_LINK_UNSUPPORTED',
    400,
    'روابط يوتيوب فقط مدعومة مباشرة. لفيديو من تيك توك أو إنستجرام أو لينكدإن: نزّله على جهازك وارفعه كملف.',
    'Only YouTube links can be analyzed directly. For TikTok, Instagram or LinkedIn videos, download the video and upload the file.',
  );

const needsGemini = () =>
  new AppError(
    'REFERENCE_NEEDS_GEMINI',
    503,
    'تحليل الفيديو المرجعي يحتاج مفتاح Gemini. أضف GEMINI_API_KEY في ملف .env ثم أعد التشغيل.',
    'Analyzing a reference video needs a Gemini key. Add GEMINI_API_KEY to .env and restart.',
  );

const PROMPT = `You are a short-form video analyst. Watch this marketing video closely, start to finish.
Describe its structure so another team can rebuild a video with the SAME structure, pacing and style for a different product.

Return:
- summary: 1–2 sentences on what the video does and why it works.
- durationSec: its total length in seconds.
- hookPattern: how the first 3 seconds grab attention (question, bold claim, pain scene, number…).
- tone, pacing (cuts per second, energy), voiceStyle (narrator gender/energy/speed, or "no voiceover"), textStyle (amount and size of on-screen text, captions or not).
- scenes: every distinct scene/shot group in order (max 12). For each: type (closest of hook | pain | solution | feature | proof | cta), durationSec, onScreenText (exact, original language), voiceover (exact narration in the original language, empty if none), purpose (what the scene does for the viewer), visual (what is shown and how it moves), transition into the next scene (closest of fade | slide | wipe | flip).
Scene durations must add up to about durationSec. Be precise; do not invent scenes that are not there.`;

let client;
const gemini = () => (client ??= new GoogleGenAI({ apiKey: config.geminiKey }));

async function uploadAndWait(filePath, mimeType) {
  const file = await gemini().files.upload({ file: filePath, config: { mimeType } });
  const deadline = Date.now() + 3 * 60 * 1000;
  let current = file;
  while (current.state === 'PROCESSING' && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 2000));
    current = await gemini().files.get({ name: file.name });
  }
  if (current.state !== 'ACTIVE') throw errors.providerFailed('Gemini', `video processing ${current.state || 'timed out'}`);
  return current;
}

/**
 * Watches a reference video (a YouTube link or an uploaded file) with Gemini and returns its blueprint.
 * `upload` is an uploads row for a video file.
 */
export async function analyzeReference({ url, upload, language = 'ar' }) {
  if (!config.geminiKey) throw needsGemini();
  let videoPart;
  if (upload) {
    const file = await uploadAndWait(path.join(config.paths.uploads, upload.file_name), upload.mime).catch((err) => {
      throw err instanceof AppError ? err : errors.providerFailed('Gemini', err.message);
    });
    videoPart = createPartFromUri(file.uri, file.mimeType);
  } else {
    const id = YOUTUBE.exec(url || '')?.[1];
    if (!id) throw notSupportedLink();
    videoPart = { fileData: { fileUri: `https://www.youtube.com/watch?v=${id}`, mimeType: 'video/*' } };
  }

  let response;
  try {
    response = await gemini().models.generateContent({
      model: config.geminiModel,
      contents: [{ role: 'user', parts: [videoPart, { text: `${PROMPT}\nWrite summary, hookPattern, tone, pacing, voiceStyle, textStyle, purpose and visual in ${language === 'ar' ? 'Arabic' : 'English'}; keep onScreenText and voiceover exactly as in the video.` }] }],
      config: { responseMimeType: 'application/json', responseJsonSchema: toStrictJsonSchema(BlueprintSchema), maxOutputTokens: 16000 },
    });
  } catch (err) {
    if (err instanceof ApiError) {
      console.error(`[reference] Gemini error ${err.status}:`, err.message);
      if (err.status === 400 && /api key/i.test(err.message)) throw errors.invalidGeminiKey();
      if (err.status === 429) throw errors.rateLimited('Gemini');
      if (err.status === 400 || err.status === 403 || err.status === 404) {
        throw new AppError(
          'REFERENCE_UNREADABLE',
          422,
          'تعذّر على Gemini مشاهدة هذا الفيديو (قد يكون خاصاً أو محمياً). جرّب فيديو عاماً أو ارفعه كملف.',
          'Gemini could not watch this video (it may be private or restricted). Try a public video or upload the file.',
        );
      }
    }
    throw errors.aiUnavailable('Gemini');
  }
  try {
    const blueprint = BlueprintSchema.parse(JSON.parse(response.text ?? ''));
    if (!blueprint.scenes.length) throw new Error('no scenes');
    return { ...blueprint, scenes: blueprint.scenes.slice(0, 12) };
  } catch (err) {
    console.error('[reference] could not parse blueprint:', err.message);
    throw errors.aiBadOutput('Gemini');
  }
}
