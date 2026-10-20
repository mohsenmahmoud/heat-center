/**
 * Optional media providers behind one small interface each:
 *   findStock(query, kind)  → { fileName, kind: 'video' | 'image' } | null
 *   generateImage(prompt)   → fileName | null
 *   synthesizeSpeech(text, { language, voiceName }) → { fileName, seconds }
 * Add a provider by adding a branch here and its key to .env / config.js.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config, ttsProvider } from '../config.js';
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

export const GEMINI_VOICES = ['Charon', 'Orus', 'Puck', 'Kore', 'Aoede', 'Zephyr'];

const STYLE = {
  ar: 'Speak this Arabic line as a punchy social media ad voiceover: confident and warm, brisk pace, no long pauses: ',
  en: 'Speak this line as a punchy social media ad voiceover: confident and warm, brisk pace, no long pauses: ',
};
const FALLBACK_TTS_MODEL = 'gemini-3.8-flash-tts';

/** Raw 16-bit PCM → WAV, for TTS models that return bare samples. */
function pcmToWav(pcm, sampleRate) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

/** Seconds of audio in a PCM WAV, read from its header. */
export function wavSeconds(buf) {
  const byteRate = buf.readUInt32LE(28);
  let offset = 12;
  while (offset + 8 <= buf.length) {
    const id = buf.toString('ascii', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    if (id === 'data') return Math.min(size, buf.length - offset - 8) / byteRate;
    offset += 8 + size + (size % 2);
  }
  return null;
}

async function geminiSpeech(text, { language, voiceName }) {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: config.geminiKey });
  const request = (model) =>
    ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: (STYLE[language] || STYLE.ar) + text }] }],
      config: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } } },
    });
  let response;
  try {
    response = await request(config.geminiTtsModel).catch((err) => {
      // Preview voice models come and go; fall back to the stable one.
      if (err.status === 404 && config.geminiTtsModel !== FALLBACK_TTS_MODEL) return request(FALLBACK_TTS_MODEL);
      throw err;
    });
  } catch (err) {
    throw errors.providerFailed('Gemini TTS', err.status ? `HTTP ${err.status}` : err.message);
  }
  const part = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!part) throw errors.providerFailed('Gemini TTS', 'no audio returned');
  const raw = Buffer.from(part.inlineData.data, 'base64');
  const mime = part.inlineData.mimeType || '';
  if (mime.includes('wav')) return raw;
  return pcmToWav(raw, Number(/rate=(\d+)/.exec(mime)?.[1]) || 24000);
}

/**
 * Speaks one line. Returns { fileName, seconds } (seconds null when unknown, e.g. MP3).
 * Results are cached by provider + voice + text, so a previewed line is free to reuse at render time.
 */
export async function synthesizeSpeech(text, { language = 'ar', voiceName } = {}) {
  const provider = ttsProvider();
  if (!provider) {
    throw errors.validation('No text-to-speech provider is configured', 'لا يوجد مزوّد صوت AI. أضف GEMINI_API_KEY أو مفتاح ElevenLabs في .env، أو اختر وضعاً صوتياً آخر.');
  }
  const voice = provider === 'gemini' ? (GEMINI_VOICES.includes(voiceName) ? voiceName : config.geminiVoice) : provider === 'elevenlabs' ? config.elevenlabsVoice : config.openaiTtsVoice;
  const key = crypto.createHash('sha1').update([provider, provider === 'gemini' ? config.geminiTtsModel : '', voice, language, text].join('|')).digest('hex').slice(0, 24);
  const ext = provider === 'gemini' ? '.wav' : '.mp3';
  const fileName = `tts-${key}${ext}`;
  const filePath = path.join(mediaDir(), fileName);
  if (!fs.existsSync(filePath)) {
    let buffer;
    if (provider === 'gemini') {
      buffer = await geminiSpeech(text, { language, voiceName: voice });
    } else {
      const res =
        provider === 'elevenlabs'
          ? await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${config.elevenlabsVoice}?output_format=mp3_44100_128`, {
              method: 'POST',
              headers: { 'xi-api-key': config.elevenlabsKey, 'Content-Type': 'application/json' },
              body: JSON.stringify({ text, model_id: process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2' }),
              signal: AbortSignal.timeout(120000),
            })
          : await fetch('https://api.openai.com/v1/audio/speech', {
              method: 'POST',
              headers: { Authorization: `Bearer ${config.openaiKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ model: process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts', voice: config.openaiTtsVoice, input: text, response_format: 'mp3' }),
              signal: AbortSignal.timeout(120000),
            });
      if (!res.ok) throw errors.providerFailed(provider, `HTTP ${res.status}`);
      buffer = Buffer.from(await res.arrayBuffer());
    }
    fs.writeFileSync(filePath, buffer);
  }
  const seconds = ext === '.wav' ? wavSeconds(fs.readFileSync(filePath)) : null;
  return { fileName, seconds };
}
