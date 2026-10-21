import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import request from 'supertest';

// Only a Gemini key: the app must pick Gemini on its own.
process.env.MOCK_AI = 'false';
process.env.GEMINI_API_KEY = 'test-gemini-key';
delete process.env.ANTHROPIC_API_KEY;
delete process.env.AI_PROVIDER;

// Stand-in for Google's API: records each request and answers with whatever the test queues.
const calls = [];
let nextReply;
vi.mock('@google/genai', async (importOriginal) => {
  const actual = await importOriginal();
  class FakeGoogleGenAI {
    constructor(opts) {
      this.opts = opts;
      this.models = {
        generateContent: async (params) => {
          calls.push({ opts: this.opts, params });
          // Text-to-speech requests get 0.5s of silent 24 kHz PCM, like the real API.
          if (params.config?.responseModalities?.includes('AUDIO')) {
            return { candidates: [{ content: { parts: [{ inlineData: { mimeType: 'audio/L16;codec=pcm;rate=24000', data: Buffer.alloc(24000).toString('base64') } }] } }] };
          }
          return nextReply();
        },
      };
    }
  }
  return { ...actual, GoogleGenAI: FakeGoogleGenAI };
});

let app;
let mockScript;
beforeAll(async () => {
  ({ mockScript } = await import('../server/services/ai/mock.js'));
  const { createApp } = await import('../server/app.js');
  app = createApp();
});
beforeEach(() => {
  calls.length = 0;
});

const reply = (obj, finishReason = 'STOP') => () => ({ text: JSON.stringify(obj), candidates: [{ finishReason }] });

describe('Gemini as the writer', () => {
  it('is selected automatically when it is the only key', async () => {
    const res = await request(app).get('/api/status');
    expect(res.body.capabilities.writer).toBe('gemini');
    expect(res.body.capabilities.model).toBe('gemini-flash-latest');
  });

  it('writes a video script with structured JSON output and the brand system prompt', async () => {
    nextReply = reply(mockScript({ topic: 'الأقساط', language: 'ar' }));
    const res = await request(app).post('/api/video/script').send({ topic: 'الأقساط', language: 'ar', durationSec: 45 });
    expect(res.status).toBe(200);
    expect(res.body.script.scenes[0].type).toBe('hook');
    const { opts, params } = calls[0];
    expect(opts.apiKey).toBe('test-gemini-key');
    expect(params.model).toBe('gemini-flash-latest');
    expect(params.config.responseMimeType).toBe('application/json');
    expect(params.config.responseJsonSchema.additionalProperties).toBe(false);
    expect(params.config.systemInstruction).toContain('Qudra');
    expect(params.contents[0].parts.at(-1).text).toContain('الأقساط');
  });

  it('writes a weekly plan and day scripts', async () => {
    const post = { hook: 'h', caption: 'c', visualIdea: 'v', hashtags: ['#قدرة'], cta: 'احجز ديمو', format: 'Reel 9:16', bestTime: '20:00' };
    nextReply = reply({ posts: Array.from({ length: 7 }, () => post) });
    const plan = await request(app).post('/api/planner/generate').send({ weekStart: '2026-10-24', language: 'ar' });
    expect(plan.status).toBe(201);
    nextReply = reply(mockScript({ topic: 'h', language: 'ar' }));
    const day = await request(app).post(`/api/planner/${plan.body.id}/posts/${plan.body.posts[0].id}/script`);
    expect(day.status).toBe(200);
    expect(day.body.script.scenes.length).toBeGreaterThan(5);
  });

  it('asks again for the missing days when the model returns a short week', async () => {
    const post = (hook) => ({ hook, caption: 'c', visualIdea: 'v', hashtags: ['#x'], cta: 'احجز', format: 'Reel 9:16', bestTime: '20:00' });
    const replies = [reply({ posts: [1, 2, 3, 4].map((i) => post(`h${i}`)) }), reply({ posts: [5, 6, 7].map((i) => post(`h${i}`)) })];
    nextReply = () => replies.shift()();
    const plan = await request(app).post('/api/planner/generate').send({ weekStart: '2026-10-24', language: 'ar' });
    expect(plan.status).toBe(201);
    expect(plan.body.posts.map((p) => p.hook)).toEqual(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7']);
    expect(calls[1].params.contents[0].parts[0].text).toContain('remaining 3 day(s)');
    expect(calls[1].params.contents[0].parts[0].text).toContain('"h4"');

    // Still short after the retry: a clear, friendly error instead of "unexpected error".
    nextReply = reply({ posts: [post('a')] });
    const short = await request(app).post('/api/planner/generate').send({ weekStart: '2026-10-24', language: 'ar' });
    expect(short.status).toBe(502);
    expect(short.body.error.code).toBe('AI_BAD_OUTPUT');
  });

  it.each([
    ['a rejected key', () => { throw new (globalThis.__ApiError)({ status: 400, message: 'API key not valid. Please pass a valid API key.' }); }, 'INVALID_GEMINI_KEY'],
    ['an unknown model', () => { throw new (globalThis.__ApiError)({ status: 404, message: 'models/x is not found' }); }, 'GEMINI_MODEL_NOT_FOUND'],
    ['a rate limit', () => { throw new (globalThis.__ApiError)({ status: 429, message: 'quota' }); }, 'RATE_LIMITED'],
    ['a safety block', reply({}, 'SAFETY'), 'AI_REFUSED'],
    ['broken JSON', () => ({ text: '{oops', candidates: [{ finishReason: 'STOP' }] }), 'AI_BAD_OUTPUT'],
  ])('turns %s into a friendly error', async (_name, fn, code) => {
    globalThis.__ApiError ??= (await import('@google/genai')).ApiError;
    nextReply = fn;
    const res = await request(app).post('/api/video/script').send({ topic: 'x' });
    expect(res.body.error.code).toBe(code);
    expect(res.body.error.message.ar).toBeTruthy();
  });
});

describe('AI voice with the same Gemini key', () => {
  it('is available automatically and offers voices', async () => {
    const res = await request(app).get('/api/status');
    expect(res.body.capabilities.tts).toBe('gemini');
    expect(res.body.capabilities.reference).toBe(true);
    expect(res.body.voices).toContain('Charon');
  });

  it('speaks a line into a playable WAV, cached for the render', async () => {
    const body = { text: 'كم قسطاً متأخراً عندك؟', language: 'ar', voiceName: 'Kore' };
    const first = await request(app).post('/api/video/voice-preview').send(body);
    expect(first.status).toBe(200);
    expect(first.body.url).toMatch(/^\/media\/tts-[a-f0-9]+\.wav$/);
    expect(first.body.seconds).toBeCloseTo(0.5, 2);
    const wav = await request(app).get(first.body.url).buffer(true).parse((res, cb) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => cb(null, Buffer.concat(chunks)));
    });
    expect(wav.body.subarray(0, 4).toString()).toBe('RIFF');
    const tts = calls.find((c) => c.params.config?.responseModalities);
    expect(tts.params.config.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName).toBe('Kore');
    expect(tts.params.contents[0].parts[0].text).toContain(body.text);

    calls.length = 0;
    const again = await request(app).post('/api/video/voice-preview').send(body);
    expect(again.body.url).toBe(first.body.url);
    expect(calls).toHaveLength(0);
  });
});

describe('reference video', () => {
  const blueprint = {
    summary: 'Fast question hook then three feature beats.',
    durationSec: 30,
    hookPattern: 'question',
    tone: 'confident',
    pacing: 'fast',
    voiceStyle: 'male, energetic',
    textStyle: 'big captions',
    scenes: [
      { type: 'hook', durationSec: 3, onScreenText: 'Still on Excel?', voiceover: 'Still on Excel?', purpose: 'grab', visual: 'zoom', transition: 'slide' },
      { type: 'feature', durationSec: 9, onScreenText: 'One dashboard', voiceover: 'One dashboard for all.', purpose: 'show', visual: 'screen', transition: 'wipe' },
      { type: 'cta', durationSec: 6, onScreenText: 'Book a demo', voiceover: 'Book a demo.', purpose: 'act', visual: 'logo', transition: 'fade' },
    ],
  };

  it('watches a YouTube link through Gemini and returns its blueprint', async () => {
    nextReply = reply(blueprint);
    const res = await request(app).post('/api/video/reference').send({ url: 'https://youtube.com/shorts/abcdefghijk' });
    expect(res.status).toBe(200);
    expect(res.body.blueprint.scenes).toHaveLength(3);
    const part = calls[0].params.contents[0].parts[0];
    expect(part.fileData.fileUri).toBe('https://www.youtube.com/watch?v=abcdefghijk');
  });

  it('explains how to use TikTok/Instagram videos instead of failing', async () => {
    const res = await request(app).post('/api/video/reference').send({ url: 'https://www.tiktok.com/@a/video/1' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('REFERENCE_LINK_UNSUPPORTED');
    expect(res.body.error.message.ar).toContain('ارفعه كملف');
  });

  it('rejects an image passed as the reference video', async () => {
    const up = await request(app).post('/api/uploads').attach('files', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAAEUlEQVR4nGNgYPj/n4GBgQEADvoB/1vQ4z8AAAAASUVORK5CYII=', 'base64'), { filename: 'a.png', contentType: 'image/png' });
    const res = await request(app).post('/api/video/reference').send({ uploadId: up.body.items[0].id });
    expect(res.status).toBe(404);
  });

  it("hands the blueprint to the script writer and keeps the reference's length", async () => {
    nextReply = reply(mockScript({ topic: 'الشهادات', language: 'ar', reference: blueprint }));
    const res = await request(app).post('/api/video/script').send({ topic: 'الشهادات', language: 'ar', durationSec: 30, reference: blueprint });
    expect(res.status).toBe(200);
    expect(res.body.script.scenes.map((s) => s.type)).toEqual(['hook', 'feature', 'cta']);
    expect(res.body.durationSec).toBeCloseTo(30, 0);
    const prompt = calls.at(-1).params.contents[0].parts.at(-1).text;
    expect(prompt).toContain('<reference_video>');
    expect(prompt).toContain('Keep exactly its 3 scenes');
  });
});
