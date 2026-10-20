import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { z } from 'zod';
import { fitDurations, totalSeconds } from '../video/timing.js';
import { lintBrand } from '../server/brand/qudra.js';
import { toStrictJsonSchema } from '../server/services/ai/json-schema.js';
import { assertPublicUrl } from '../server/lib/net.js';
import { buildSlots } from '../server/services/planner.js';
import { imageSize } from '../server/lib/image-size.js';
import { AiPlanSchema, AiScriptSchema, PostSchema } from '../server/services/schemas.js';

describe('video timing', () => {
  const scenes = [3, 8, 6, 6, 7, 5].map((d, i) => ({ id: String(i), durationSec: d }));

  it.each([40, 45, 50, 55, 60])('fits scenes to %ss after transition overlaps', (target) => {
    const fitted = fitDurations(scenes, target);
    expect(Math.abs(totalSeconds(fitted) - target)).toBeLessThanOrEqual(0.5);
    expect(fitted.every((s) => s.durationSec >= 3 && s.durationSec <= 14)).toBe(true);
  });
});

describe('brand guard', () => {
  it('finds banned phrases in Arabic and English, case-insensitively', () => {
    expect(lintBrand({ a: 'في عالم اليوم المتسارع نقدم', b: ['A Seamless flow'] })).toEqual(['في عالم اليوم المتسارع', 'seamless']);
    expect(lintBrand('آخر الشهر وانت بتجمع الحضور')).toEqual([]);
  });
});

describe('structured output schema', () => {
  it('closes every object and drops unsupported keywords', () => {
    const schema = toStrictJsonSchema(z.object({ a: z.string().min(2), b: z.array(z.object({ c: z.number().max(4) })) }));
    expect(schema.$schema).toBeUndefined();
    expect(schema.additionalProperties).toBe(false);
    expect(schema.required).toEqual(['a', 'b']);
    expect(schema.properties.b.items.additionalProperties).toBe(false);
    expect(JSON.stringify(schema)).not.toMatch(/minLength|maximum/);
  });

  it('keeps fields whose names are also schema keywords (a post field called "format")', () => {
    const schema = toStrictJsonSchema(z.object({ format: z.string().min(1), default: z.string(), pattern: z.string() }));
    expect(Object.keys(schema.properties)).toEqual(['format', 'default', 'pattern']);
    expect(schema.required).toEqual(['format', 'default', 'pattern']);
    expect(schema.properties.format).toEqual({ type: 'string' });
  });

  it('converts the real plan and script schemas without losing fields', () => {
    const plan = toStrictJsonSchema(AiPlanSchema);
    expect(plan.properties.posts.items.required).toEqual(Object.keys(PostSchema.shape));
  });

  it('converts the real script schema', () => {
    const schema = toStrictJsonSchema(AiScriptSchema);
    expect(schema.properties.scenes.items.properties.type.enum).toContain('hook');
  });
});

describe('URL safety', () => {
  it.each(['http://127.0.0.1/', 'http://10.0.0.5/', 'http://192.168.1.1/admin', 'http://[::1]/', 'http://169.254.169.254/latest'])('blocks %s', async (url) => {
    await expect(assertPublicUrl(url)).rejects.toMatchObject({ code: 'BLOCKED_URL' });
  });
  it('blocks non-http schemes', async () => {
    await expect(assertPublicUrl('file:///etc/passwd')).rejects.toMatchObject({ code: 'VALIDATION' });
  });
});

describe('planner slots', () => {
  it('starts on the given Saturday and never repeats a pillar on consecutive days', () => {
    const slots = buildSlots({ weekStart: '2026-10-24', platforms: ['facebook'], language: 'en' });
    expect(slots.map((s) => s.dayName)).toEqual(['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    for (let i = 1; i < slots.length; i++) expect(slots[i].pillar.key).not.toBe(slots[i - 1].pillar.key);
    expect(new Set(slots.map((s) => s.platform))).toEqual(new Set(['facebook']));
  });
});

describe('image size', () => {
  it('reads PNG dimensions', () => {
    const file = path.join(os.tmpdir(), 'qms-size.png');
    fs.writeFileSync(file, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAAEUlEQVR4nGNgYPj/n4GBgQEADvoB/1vQ4z8AAAAASUVORK5CYII=', 'base64'));
    expect(imageSize(file)).toEqual({ width: 2, height: 1 });
  });
});

describe('scene images', () => {
  const ai = (indexes) => ({
    title: 't',
    cta: { headline: 'c', button: 'b' },
    caption: '',
    hashtags: [],
    scenes: indexes.map((imageIndex, i) => ({ type: ['hook', 'solution', 'feature', 'feature', 'cta'][i], headline: `h${i}`, subtext: '', bullets: [], durationSec: 8, transition: 'fade', stockQuery: '', visualIdea: '', voiceover: '', imageIndex })),
  });

  it("uses the AI's choice of image for each scene, once each", async () => {
    const { finalizeScript } = await import('../server/services/scripts.js');
    const script = finalizeScript(ai([0, 0, 2, 1, 0]), { language: 'ar', durationSec: 40, imageIds: ['a', 'b'] });
    expect(script.scenes.map((s) => s.imageId)).toEqual([null, null, 'b', 'a', null]);
    expect(script.scenes[0]).not.toHaveProperty('imageIndex');
  });

  it('falls back to filling product scenes in order when the AI picked none', async () => {
    const { finalizeScript } = await import('../server/services/scripts.js');
    const script = finalizeScript(ai([0, 0, 0, 0, 0]), { language: 'ar', durationSec: 40, imageIds: ['a', 'b'] });
    expect(script.scenes.map((s) => s.imageId)).toEqual([null, 'a', 'b', null, null]);
  });
});
