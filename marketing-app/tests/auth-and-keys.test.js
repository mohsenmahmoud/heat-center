import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

// This file runs with a password and without any AI key (each test file gets fresh modules).
process.env.APP_PASSWORD = 'correct horse';
process.env.MOCK_AI = 'false';
delete process.env.ANTHROPIC_API_KEY;

let app;
beforeAll(async () => {
  const { createApp } = await import('../server/app.js');
  app = createApp();
});

describe('password protection', () => {
  it('blocks the API until signed in', async () => {
    expect((await request(app).get('/api/auth/status')).body).toEqual({ required: true, authenticated: false });
    const res = await request(app).get('/api/status');
    expect(res.status).toBe(401);
    expect(res.body.error.message.ar).toBe('يجب تسجيل الدخول أولاً.');
  });

  it('rejects a wrong password and accepts the right one', async () => {
    expect((await request(app).post('/api/auth/login').send({ password: 'nope' })).status).toBe(401);
    const ok = await request(app).post('/api/auth/login').send({ password: 'correct horse' });
    expect(ok.status).toBe(200);
    const cookie = ok.headers['set-cookie'][0];
    expect(cookie).toMatch(/HttpOnly/);
    expect((await request(app).get('/api/status').set('Cookie', cookie)).status).toBe(200);
  });

  it('rejects a forged session cookie', async () => {
    const res = await request(app).get('/api/status').set('Cookie', 'qms_session=9999999999999.abc.deadbeef');
    expect(res.status).toBe(401);
  });
});

describe('missing Claude key', () => {
  it('explains how to add the key instead of failing silently', async () => {
    const login = await request(app).post('/api/auth/login').send({ password: 'correct horse' });
    const cookie = login.headers['set-cookie'][0];
    const status = await request(app).get('/api/status').set('Cookie', cookie);
    expect(status.body.capabilities.writer).toBeNull();

    const res = await request(app).post('/api/video/script').set('Cookie', cookie).send({ topic: 'x' });
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('MISSING_CLAUDE_KEY');
    expect(res.body.error.message.ar).toContain('ANTHROPIC_API_KEY');

    const plan = await request(app).post('/api/planner/generate').set('Cookie', cookie).send({ weekStart: '2026-10-24' });
    expect(plan.status).toBe(503);
  });
});
