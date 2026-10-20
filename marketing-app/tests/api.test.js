import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/app.js';

// A 2x1 PNG (landscape) so uploads have a real image header.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAAEUlEQVR4nGNgYPj/n4GBgQEADvoB/1vQ4z8AAAAASUVORK5CYII=', 'base64');

let app;
const agent = () => request(app);
beforeAll(() => {
  app = createApp();
});

describe('system', () => {
  it('reports health and capabilities', async () => {
    expect((await agent().get('/api/health')).body.ok).toBe(true);
    const res = await agent().get('/api/status');
    expect(res.status).toBe(200);
    expect(res.body.capabilities.writer).toBe('mock');
    expect(res.body.logo).toBe('/brand/logo.png');
  });

  it('rejects requests that do not come from localhost (DNS rebinding guard)', async () => {
    const res = await agent().get('/api/health').set('Host', 'evil.example.com');
    expect(res.status).toBe(403);
  });

  it('returns bilingual friendly errors for unknown endpoints', async () => {
    const res = await agent().get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.message.ar).toBeTruthy();
    expect(res.body.error.message.en).toBeTruthy();
  });
});

describe('uploads', () => {
  it('accepts images and rejects other file types', async () => {
    const ok = await agent().post('/api/uploads').attach('files', PNG, { filename: 'shot.png', contentType: 'image/png' });
    expect(ok.status).toBe(201);
    expect(ok.body.items[0].url).toMatch(/^\/uploads\/[a-f0-9]{32}\.png$/);
    expect((await agent().get(ok.body.items[0].url)).status).toBe(200);

    const bad = await agent().post('/api/uploads').attach('files', Buffer.from('#!/bin/sh'), { filename: 'x.sh', contentType: 'application/x-sh' });
    expect(bad.status).toBe(400);
    expect(bad.body.error.message.ar).toContain('نوع الملف');
  });
});

describe('Tab 1: video script', () => {
  it('requires a topic, URL or image', async () => {
    const res = await agent().post('/api/video/script').send({ topic: '  ' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION');
  });

  it('writes a script whose length fits the requested duration and pins uploaded images', async () => {
    const up = await agent().post('/api/uploads').attach('files', PNG, { filename: 'dash.png', contentType: 'image/png' });
    const imageId = up.body.items[0].id;
    const res = await agent().post('/api/video/script').send({ topic: 'تذكير الأقساط', language: 'ar', durationSec: 50, imageIds: [imageId] });
    expect(res.status).toBe(200);
    const { script, durationSec } = res.body;
    expect(durationSec).toBeGreaterThanOrEqual(49);
    expect(durationSec).toBeLessThanOrEqual(51);
    expect(script.scenes[0].type).toBe('hook');
    expect(script.scenes.at(-1).type).toBe('cta');
    expect(script.scenes.find((s) => s.imageId === imageId)?.type).toMatch(/feature|solution/);
    expect(script.cta.contact).toContain('qudratms.com');
  });

  it('validates render requests before starting a job', async () => {
    const res = await agent().post('/api/video/render').send({ script: { title: 'x' } });
    expect(res.status).toBe(400);
  });

  it('blocks URLs that point at the local network', async () => {
    const res = await agent().post('/api/video/script').send({ url: 'http://127.0.0.1:22/' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BLOCKED_URL');
  });

  it('lists history and 404s missing videos', async () => {
    expect((await agent().get('/api/video/history')).body.items).toEqual([]);
    expect((await agent().get('/api/video/abc/download')).status).toBe(404);
  });
});

describe('Tab 2: weekly planner', () => {
  let plan;

  it('generates 7 days starting on the chosen date, rotating platforms and pillars', async () => {
    const res = await agent().post('/api/planner/generate').send({ weekStart: '2026-10-24', platforms: ['linkedin', 'instagram'], language: 'ar' });
    expect(res.status).toBe(201);
    plan = res.body;
    expect(plan.posts).toHaveLength(7);
    expect(plan.posts[0].date).toBe('2026-10-24');
    expect(plan.posts[0].dayName).toBe('السبت');
    expect(plan.posts[6].date).toBe('2026-10-30');
    expect(new Set(plan.posts.map((p) => p.platform))).toEqual(new Set(['linkedin', 'instagram']));
    expect(plan.posts.filter((p) => p.pillar === 'pain')).toHaveLength(2);
    for (const p of plan.posts) {
      expect(p.hook && p.caption && p.visualIdea && p.cta).toBeTruthy();
      expect(p.hashtags.every((h) => h.startsWith('#'))).toBe(true);
    }
  });

  it('rejects an invalid week start', async () => {
    const res = await agent().post('/api/planner/generate').send({ weekStart: 'next week' });
    expect(res.status).toBe(400);
  });

  it('saves edits and flags banned brand phrases', async () => {
    const post = plan.posts[1];
    const res = await agent()
      .put(`/api/planner/${plan.id}/posts/${post.id}`)
      .send({ ...post, hook: 'اكتشف الآن الحل الأمثل', hashtags: ['#قدرة'] });
    expect(res.status).toBe(200);
    expect(res.body.hook).toBe('اكتشف الآن الحل الأمثل');
    expect(res.body.warnings).toEqual(expect.arrayContaining(['اكتشف الآن', 'الحل الأمثل']));
    const reloaded = await agent().get(`/api/planner/${plan.id}`);
    expect(reloaded.body.posts[1].hook).toBe('اكتشف الآن الحل الأمثل');
  });

  it('regenerates a single day and keeps its slot', async () => {
    const post = plan.posts[2];
    const res = await agent().post(`/api/planner/${plan.id}/posts/${post.id}/regenerate`).send({ instruction: 'about installments' });
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(post.id);
    expect(res.body.date).toBe(post.date);
    expect(res.body.platform).toBe(post.platform);
  });

  it('writes a full video script for a day, fitted to the plan length and opening with its hook', async () => {
    const post = plan.posts[0];
    const res = await agent().post(`/api/planner/${plan.id}/posts/${post.id}/script`);
    expect(res.status).toBe(200);
    const { script } = res.body;
    expect(script.scenes.length).toBeGreaterThanOrEqual(6);
    expect(script.scenes[0].type).toBe('hook');
    expect(script.scenes.at(-1).type).toBe('cta');
    expect(script.scenes.every((s) => s.voiceover)).toBe(true);
    expect(res.body.videoId).toBeNull();
    const total = script.scenes.reduce((a, s) => a + s.durationSec, 0) - (script.scenes.length - 1) * 0.5;
    expect(Math.abs(total - 45)).toBeLessThanOrEqual(0.5);
    // Saved on the plan, and accepted as-is by the renderer's validation.
    const reloaded = await agent().get(`/api/planner/${plan.id}`);
    expect(reloaded.body.posts[0].script.title).toBe(script.title);
    const { RenderRequest } = await import('../server/services/schemas.js');
    expect(RenderRequest.safeParse({ script, options: { source: { planId: plan.id, postId: post.id } } }).success).toBe(true);
  });

  it('keeps the script when a day is edited, drops it when the day gets a new angle', async () => {
    const post = (await agent().get(`/api/planner/${plan.id}`)).body.posts[0];
    const edited = await agent().put(`/api/planner/${plan.id}/posts/${post.id}`).send({ ...post, cta: 'ابعتلنا ديمو' });
    expect(edited.body.script).toBeTruthy();
    const fresh = await agent().post(`/api/planner/${plan.id}/posts/${post.id}/regenerate`).send({});
    expect(fresh.body.script).toBeUndefined();
  });

  it('exports Markdown and Word', async () => {
    await agent().post(`/api/planner/${plan.id}/posts/${plan.posts[3].id}/script`);
    const md = await agent().get(`/api/planner/${plan.id}/export?format=md`);
    expect(md.status).toBe(200);
    expect(md.headers['content-disposition']).toContain('.md');
    expect(md.text).toContain('# خطة المحتوى الأسبوعية');
    expect(md.text.match(/^## /gm)).toHaveLength(7);
    expect(md.text).toContain('### 🎬 سكريبت الفيديو');
    expect(md.text).toContain('نص التعليق الصوتي كاملاً');

    const docx = await agent().get(`/api/planner/${plan.id}/export?format=docx`).buffer(true).parse((res, cb) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => cb(null, Buffer.concat(chunks)));
    });
    expect(docx.status).toBe(200);
    expect(docx.body.subarray(0, 2).toString()).toBe('PK'); // .docx is a zip
  });

  it('lists and deletes plans', async () => {
    const list = await agent().get('/api/planner');
    expect(list.body.items.some((p) => p.id === plan.id)).toBe(true);
    expect((await agent().delete(`/api/planner/${plan.id}`)).status).toBe(200);
    expect((await agent().get(`/api/planner/${plan.id}`)).status).toBe(404);
  });
});
