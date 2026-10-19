import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(here, '..');

// Tests set MQS_SKIP_DOTENV so a developer's real keys never leak into test runs.
if (!process.env.MQS_SKIP_DOTENV) {
  dotenv.config({ path: path.join(ROOT, '.env'), quiet: true });
}

const env = process.env;
const bool = (v, fallback = false) => (v === undefined || v === '' ? fallback : /^(1|true|yes|on)$/i.test(v));
const LOOPBACK = new Set(['127.0.0.1', 'localhost', '::1']);

const dataDir = path.resolve(ROOT, env.DATA_DIR || 'data');

export const config = {
  port: Number(env.PORT || 5174),
  host: env.HOST || '127.0.0.1',
  isLoopback: LOOPBACK.has(env.HOST || '127.0.0.1'),

  appPassword: env.APP_PASSWORD || '',
  sessionSecret: env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),

  mockAi: bool(env.MOCK_AI),
  anthropicKey: env.ANTHROPIC_API_KEY || '',
  claudeModel: env.CLAUDE_MODEL || 'claude-opus-5-5',
  claudeFallbacks: (env.CLAUDE_FALLBACKS || 'default') !== 'off',

  imageProvider: (env.IMAGE_PROVIDER || 'none').toLowerCase(),
  openaiKey: env.OPENAI_API_KEY || '',
  replicateKey: env.REPLICATE_API_TOKEN || '',
  replicateModel: env.REPLICATE_IMAGE_MODEL || 'black-forest-labs/flux-schnell',

  ttsProvider: (env.TTS_PROVIDER || 'none').toLowerCase(),
  elevenlabsKey: env.ELEVENLABS_API_KEY || '',
  elevenlabsVoice: env.ELEVENLABS_VOICE_ID || '',
  openaiTtsVoice: env.OPENAI_TTS_VOICE || 'alloy',

  pexelsKey: env.PEXELS_API_KEY || '',
  pixabayKey: env.PIXABAY_API_KEY || '',

  browserExecutable: env.BROWSER_EXECUTABLE || null,
  renderConcurrency: env.RENDER_CONCURRENCY ? Number(env.RENDER_CONCURRENCY) : null,

  brand: {
    ctaDefault: env.BRAND_CTA || 'احجز ديمو مجاني',
    whatsapp: env.BRAND_WHATSAPP || '',
    website: env.BRAND_WEBSITE || 'qudratms.com',
  },

  paths: {
    root: ROOT,
    data: dataDir,
    uploads: path.join(dataDir, 'uploads'),
    media: path.join(dataDir, 'media'),
    videos: path.join(dataDir, 'videos'),
    db: path.join(dataDir, 'studio.db'),
    assets: path.join(ROOT, 'assets'),
    music: path.join(ROOT, 'assets', 'music'),
    brand: path.join(ROOT, 'assets', 'brand'),
    dist: path.join(ROOT, 'dist'),
    videoEntry: path.join(ROOT, 'video', 'index.jsx'),
  },
};

for (const dir of [config.paths.data, config.paths.uploads, config.paths.media, config.paths.videos]) {
  fs.mkdirSync(dir, { recursive: true });
}

/** Which optional capabilities are usable right now; drives the UI's enabled/disabled states. */
export function capabilities() {
  const imageReady =
    (config.imageProvider === 'openai' && !!config.openaiKey) ||
    (config.imageProvider === 'replicate' && !!config.replicateKey);
  const ttsReady =
    (config.ttsProvider === 'elevenlabs' && !!config.elevenlabsKey && !!config.elevenlabsVoice) ||
    (config.ttsProvider === 'openai' && !!config.openaiKey);
  return {
    writer: config.mockAi ? 'mock' : config.anthropicKey ? 'claude' : null,
    model: config.mockAi ? 'mock' : config.claudeModel,
    images: imageReady ? config.imageProvider : null,
    tts: ttsReady ? config.ttsProvider : null,
    stock: [config.pexelsKey && 'pexels', config.pixabayKey && 'pixabay'].filter(Boolean),
    authRequired: !!config.appPassword,
  };
}
