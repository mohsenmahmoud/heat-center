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
  geminiKey: env.GEMINI_API_KEY || env.GOOGLE_API_KEY || '',
  geminiModel: env.GEMINI_MODEL || 'gemini-flash-latest',
  // claude | gemini. Empty = whichever has a key (Claude first).
  aiProvider: (env.AI_PROVIDER || '').toLowerCase(),

  imageProvider: (env.IMAGE_PROVIDER || 'none').toLowerCase(),
  openaiKey: env.OPENAI_API_KEY || '',
  replicateKey: env.REPLICATE_API_TOKEN || '',
  replicateModel: env.REPLICATE_IMAGE_MODEL || 'black-forest-labs/flux-schnell',

  // elevenlabs | openai | gemini | none. Empty = ElevenLabs if configured, else Gemini when a Gemini key exists.
  ttsProviderSetting: (env.TTS_PROVIDER || '').toLowerCase(),
  // 3.1 Flash TTS speaks Arabic at a natural ad pace (about twice as fast as 3.8 in tests).
  geminiTtsModel: env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview',
  geminiVoice: env.GEMINI_TTS_VOICE || 'Charon',
  // AI voices read Arabic slowly; play them a little faster (pitch is preserved).
  voiceRate: Math.min(1.5, Math.max(0.8, Number(env.VOICE_RATE) || 1.1)),
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

/** Which text-to-speech provider AI voiceovers use, or null when none is usable. */
export function ttsProvider() {
  const set = config.ttsProviderSetting;
  const ready = {
    elevenlabs: !!config.elevenlabsKey && !!config.elevenlabsVoice,
    openai: !!config.openaiKey,
    gemini: !!config.geminiKey,
  };
  if (set && set !== 'none' && set !== 'auto') return ready[set] ? set : null;
  if (set === 'none' && !config.geminiKey) return null;
  return ready.elevenlabs ? 'elevenlabs' : ready.gemini ? 'gemini' : null;
}

/** The AI that writes scripts and plans: explicit AI_PROVIDER, else the first provider with a key. */
export function writerProvider() {
  if (config.mockAi) return 'mock';
  if (config.aiProvider === 'gemini' || config.aiProvider === 'claude') return config.aiProvider;
  if (config.anthropicKey) return 'claude';
  if (config.geminiKey) return 'gemini';
  return null;
}

/** Which optional capabilities are usable right now; drives the UI's enabled/disabled states. */
export function capabilities() {
  const provider = writerProvider();
  const hasKey = provider === 'mock' || (provider === 'claude' && !!config.anthropicKey) || (provider === 'gemini' && !!config.geminiKey);
  const imageReady =
    (config.imageProvider === 'openai' && !!config.openaiKey) ||
    (config.imageProvider === 'replicate' && !!config.replicateKey);
  return {
    writer: hasKey ? provider : null,
    model: { mock: 'mock', claude: config.claudeModel, gemini: config.geminiModel }[provider] || null,
    images: imageReady ? config.imageProvider : null,
    tts: ttsProvider(),
    // Gemini can watch reference videos (used even when Claude writes the scripts).
    reference: !!config.geminiKey,
    stock: [config.pexelsKey && 'pexels', config.pixabayKey && 'pixabay'].filter(Boolean),
    authRequired: !!config.appPassword,
  };
}
