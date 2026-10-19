/**
 * Optional media providers behind one small interface each:
 *   findStock(query, kind)  → { fileName, kind: 'video' | 'image' } | null
 *   generateImage(prompt)   → fileName | null
 *   synthesizeSpeech(text, language) → fileName
 * Add a provider by adding a branch here and its key to .env / config.js.
 */
import { config } from '../config.js';
import { errors } from '../lib/errors.js';
import { downloadToDir, saveBuffer } from '../lib/net.js';

const mediaDir = () => config.paths.media;

async function json(url, init, providerName) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(init?.timeoutMs || 30000) });
  if (!res.ok) throw errors.providerFailed(providerName, `HTTP ${res.status}`);
  return res.json();
}

// ---------- Stock (Pexels, Pixabay) ----------

async function pexels(query) {
  const headers = { Authorization: config.pexelsKey };
  const v = await json(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&orientation=portrait&size=medium&per_page=6`, { headers }, 'Pexels');
  for (const video of v.videos || []) {
    const file = (video.video_files || [])
      .filter((f) => f.file_type === 'video/mp4' && f.height >= f.width && f.width <= 1080)
      .sort((a, b) => b.width - a.width)[0];
    if (file) return { url: file.link, kind: 'video' };
  }
  const p = await json(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=portrait&per_page=3`, { headers }, 'Pexels');
  const photo = p.photos?.[0];
  return photo ? { url: photo.src.portrait || photo.src.large2x, kind: 'image' } : null;
}

async function pixabay(query) {
  const q = encodeURIComponent(query);
  const v = await json(`https://pixabay.com/api/videos/?key=${config.pixabayKey}&q=${q}&per_page=5&safesearch=true`, {}, 'Pixabay');
  const vid = v.hits?.find((h) => h.videos?.medium?.url);
  if (vid) return { url: vid.videos.medium.url, kind: 'video' };
  const p = await json(`https://pixabay.com/api/?key=${config.pixabayKey}&q=${q}&orientation=vertical&image_type=photo&per_page=3&safesearch=true`, {}, 'Pixabay');
  const img = p.hits?.[0];
  return img ? { url: img.largeImageURL, kind: 'image' } : null;
}

/** Tries each configured stock library in turn; returns null when none has a match. */
export async function findStock(query) {
  if (!query?.trim()) return null;
  const providers = [config.pexelsKey && pexels, config.pixabayKey && pixabay].filter(Boolean);
  for (const provider of providers) {
    try {
      const hit = await provider(query);
      if (hit) return { fileName: await downloadToDir(hit.url, mediaDir()), kind: hit.kind };
    } catch (err) {
      console.warn(`[stock] ${provider.name} failed for "${query}":`, err.message);
    }
  }
  return null;
}

// ---------- AI images (flexible provider) ----------

export async function generateImage(prompt) {
  const full = `${prompt}. Vertical 9:16 background photo for a B2B training-center marketing video, soft natural light, green and white tones, no text, no logos.`;
  if (config.imageProvider === 'openai' && config.openaiKey) {
    const data = await json(
      'https://api.openai.com/v1/images/generations',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.openaiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1', prompt: full, size: '1024x1536', n: 1 }),
        timeoutMs: 120000,
      },
      'OpenAI Images',
    );
    const b64 = data.data?.[0]?.b64_json;
    if (b64) return saveBuffer(Buffer.from(b64, 'base64'), mediaDir(), '.png');
    if (data.data?.[0]?.url) return downloadToDir(data.data[0].url, mediaDir());
    return null;
  }
  if (config.imageProvider === 'replicate' && config.replicateKey) {
    const data = await json(
      `https://api.replicate.com/v1/models/${config.replicateModel}/predictions`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.replicateKey}`, 'Content-Type': 'application/json', Prefer: 'wait' },
        body: JSON.stringify({ input: { prompt: full, aspect_ratio: '9:16' } }),
        timeoutMs: 120000,
      },
      'Replicate',
    );
    const out = Array.isArray(data.output) ? data.output[0] : data.output;
    return out ? downloadToDir(out, mediaDir()) : null;
  }
  return null;
}

// ---------- Text to speech (flexible provider) ----------

export async function synthesizeSpeech(text) {
  let res;
  if (config.ttsProvider === 'elevenlabs' && config.elevenlabsKey) {
    res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${config.elevenlabsVoice}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': config.elevenlabsKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model_id: process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2' }),
      signal: AbortSignal.timeout(120000),
    });
  } else if (config.ttsProvider === 'openai' && config.openaiKey) {
    res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts', voice: config.openaiTtsVoice, input: text, response_format: 'mp3' }),
      signal: AbortSignal.timeout(120000),
    });
  } else {
    throw errors.validation('No text-to-speech provider is configured', 'لا يوجد مزوّد صوت AI. أضف مفتاح ElevenLabs أو OpenAI في .env، أو اختر وضعاً صوتياً آخر.');
  }
  if (!res.ok) throw errors.providerFailed(config.ttsProvider, `HTTP ${res.status}`);
  return saveBuffer(Buffer.from(await res.arrayBuffer()), mediaDir(), '.mp3');
}
