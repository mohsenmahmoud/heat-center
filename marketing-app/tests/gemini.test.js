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
