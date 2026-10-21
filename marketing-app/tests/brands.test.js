import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/app.js';
import { brandSystemPrompt, lintBrand } from '../server/brand/index.js';
import { QUDRA } from '../server/brand/qudra.js';
import { contrast, makeTheme } from '../video/brand-theme.js';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAAEUlEQVR4nGNgYPj/n4GBgQEADvoB/1vQ4z8AAAAASUVORK5CYII=', 'base64');

const NOOR = {
  name: { ar: 'نور', en: 'Noor' },
  tagline: { ar: 'وجبات صحية لحد باب البيت', en: 'Healthy meals to your door' },
  category: 'Healthy meal delivery app in Cairo',
  website: 'noor.app',
  contact: '+20 100 000 0000',
  description: 'Fresh, portion-controlled meals delivered daily.',
  audience: 'Busy young professionals who want to eat well. Never write to restaurants.',
  features: '- Weekly meal plans\n- Calorie counts on every meal',
  voice: '1. Friendly and upbeat.',
  glossary: '',
  rules: 'Never mention diets or weight loss.',
  ctas: { ar: ['اطلب وجبتك الأولى'], en: ['Order your first meal'] },
  hashtags: ['#نور', '#أكل_صحي'],
  banned: ['رجيم'],
  visual: { primary: '#F97316', secondary: '#B4410C', accent: '#FACC15', dark: '#24160E', light: '#FFF1E6', look: 'dark', fontLatin: 'montserrat', fontArabic: 'cairo' },
};

let app;
const agent = () => request(app);
beforeAll(() => {
  app = createApp();
});

describe('brands API', () => {
  let noor;

  it('starts with Qudra and its logo', async () => {
    const res = await agent().get('/api/brands');
    expect(res.status).toBe(200);
    const qudra = res.body.items.find((b) => b.id === 'qudra');
    expect(qudra.name.en).toBe('Qudra');
    expect(qudra.visual.look).toBe('gradient');
    expect(qudra.logoUrl).toMatch(/^\/brands\/qudra-[a-f0-9]+\.png$/);
    expect((await agent().get(qudra.logoUrl)).status).toBe(200);
  });

  it('creates, validates and updates a brand', async () => {
    const created = await agent().post('/api/brands').send(NOOR);
    expect(created.status).toBe(201);
    noor = created.body;
    expect(noor.id).toMatch(/^[a-f0-9]{16}$/);
    expect(noor.visual.fontArabic).toBe('cairo');

    const bad = await agent().post('/api/brands').send({ ...NOOR, name: { ar: '', en: '' } });
    expect(bad.status).toBe(400);
    const badColor = await agent().post('/api/brands').send({ ...NOOR, visual: { ...NOOR.visual, primary: 'orange' } });
    expect(badColor.status).toBe(400);

    const updated = await agent().put(`/api/brands/${noor.id}`).send({ ...NOOR, tagline: { ar: 'أكل صحي كل يوم', en: 'Eat well daily' } });
    expect(updated.body.tagline.en).toBe('Eat well daily');
  });

  it('uploads and removes a logo (images only)', async () => {
    const up = await agent().post(`/api/brands/${noor.id}/logo`).attach('file', PNG, { filename: 'logo.png', contentType: 'image/png' });
    expect(up.status).toBe(200);
    expect(up.body.logoUrl).toMatch(new RegExp(`^/brands/${noor.id}-[a-f0-9]+\\.png$`));
    const svg = await agent().post(`/api/brands/${noor.id}/logo`).attach('file', Buffer.from('<svg/>'), { filename: 'x.svg', contentType: 'image/svg+xml' });
    expect(svg.status).toBe(400);
    const removed = await agent().delete(`/api/brands/${noor.id}/logo`);
    expect(removed.body.logoUrl).toBeNull();
    expect((await agent().get(up.body.logoUrl)).status).toBe(404);
  });

  it('writes scripts in the chosen brand, with its contact and banned phrases', async () => {
    const res = await agent().post('/api/video/script').send({ topic: 'وجبة الغدا', language: 'ar', durationSec: 45, brandId: noor.id });
    expect(res.status).toBe(200);
    expect(res.body.script.brandId).toBe(noor.id);
    expect(res.body.script.cta.contact).toBe('noor.app  ·  +20 100 000 0000');
    expect(JSON.stringify(res.body.script)).toContain('نور');
    expect(JSON.stringify(res.body.script)).not.toContain('قدرة');
    expect(lintBrand({ hook: 'بدون رجيم' }, noor)).toEqual(['رجيم']);
    expect(lintBrand({ hook: 'بدون رجيم' }, null)).toEqual([]);
  });

  it('keeps plans and video history per brand', async () => {
    const plan = await agent().post('/api/planner/generate').send({ weekStart: '2026-10-24', platforms: ['instagram'], language: 'en', brandId: noor.id });
    expect(plan.status).toBe(201);
    expect(plan.body.brandId).toBe(noor.id);
    expect(plan.body.posts[0].hashtags).toContain('#نور');
    const script = await agent().post(`/api/planner/${plan.body.id}/posts/${plan.body.posts[0].id}/script`);
    expect(script.body.script.brandId).toBe(noor.id);
    expect((await agent().get(`/api/planner?brandId=${noor.id}`)).body.items.map((p) => p.id)).toEqual([plan.body.id]);
    expect((await agent().get('/api/planner?brandId=qudra')).body.items.some((p) => p.id === plan.body.id)).toBe(false);
    const md = await agent().get(`/api/planner/${plan.body.id}/export?format=md`);
    expect(md.headers['content-disposition']).toContain('noor-plan-2026-10-24.md');
    expect(md.text).toContain('# Weekly Content Plan — Noor');
  });

  it('drafts a brand from a brief (demo mode) without saving it', async () => {
    const before = (await agent().get('/api/brands')).body.items.length;
    const res = await agent().post('/api/brands/draft').send({ notes: 'Lumen: smart lighting for cafes', language: 'en' });
    expect(res.status).toBe(200);
    expect(res.body.draft.name.en).toBe('Lumen');
    expect(res.body.draft.visual.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect((await agent().get('/api/brands')).body.items.length).toBe(before);
    expect((await agent().post('/api/brands/draft').send({})).status).toBe(400);
  });

  it('never deletes the last brand', async () => {
    expect((await agent().delete(`/api/brands/${noor.id}`)).status).toBe(200);
    const last = await agent().delete('/api/brands/qudra');
    expect(last.status).toBe(400);
    expect(last.body.error.code).toBe('LAST_BRAND');
  });
});

describe('brand prompt and theme', () => {
  it('builds the system prompt from the brand profile only', () => {
    const prompt = brandSystemPrompt({ ...NOOR, id: 'x' }, 'ar');
    expect(prompt).toContain('Noor (نور)');
    expect(prompt).toContain('Busy young professionals');
    expect(prompt).toContain('- Never mention diets or weight loss.');
    expect(prompt).toContain('رجيم');
    expect(prompt).not.toMatch(/Qudra|academy/i);
    expect(brandSystemPrompt(QUDRA, 'ar')).toContain('Training Management System');
  });

  it('keeps text readable on any palette and look', () => {
    const palettes = [QUDRA.visual, NOOR.visual, { primary: '#FFE066', secondary: '#F7B500', accent: '#222222', dark: '#111111', light: '#FFFBEA' }];
    for (const visual of palettes) {
      for (const look of ['gradient', 'solid', 'dark', 'light']) {
        const theme = makeTheme({ ...visual, look });
        for (const surface of [theme.main, theme.alt]) expect(contrast(surface.base, surface.fg)).toBeGreaterThanOrEqual(3);
      }
    }
    // A pale yellow brand gets dark text instead of white.
    expect(makeTheme({ ...palettes[2], look: 'solid' }).main.fg).toBe('#111111');
    expect(makeTheme({ primary: 'nope' }).visual.primary).toBe('#40A664');
  });
});
