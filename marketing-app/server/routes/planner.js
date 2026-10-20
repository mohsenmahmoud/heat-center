import { Router } from 'express';
import { plansRepo } from '../db.js';
import { errors } from '../lib/errors.js';
import { lintBrand } from '../brand/qudra.js';
import { PlanRequest, PostUpdate } from '../services/schemas.js';
import { rewritePost, writeDayScript, writeWeekPlan } from '../services/ai/index.js';
import { finalizeScript } from '../services/scripts.js';
import { buildSlots, slotFromPost, toPost } from '../services/planner.js';
import { planToDocx, planToMarkdown } from '../services/export.js';

export const plannerRouter = Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function loadPlan(id) {
  const plan = plansRepo.get(id);
  if (!plan) throw errors.notFound('Plan');
  return plan;
}

function findPost(plan, postId) {
  const index = plan.posts.findIndex((p) => p.id === postId);
  if (index < 0) throw errors.notFound('Post');
  return index;
}

plannerRouter.post(
  '/generate',
  wrap(async (req, res) => {
    const input = PlanRequest.parse(req.body);
    const slots = buildSlots(input);
    const contents = await writeWeekPlan({ slots, language: input.language, market: input.market, focus: input.focus });
    const posts = slots.map((slot, i) => toPost(slot, contents[i]));
    const plan = plansRepo.add({ weekStart: input.weekStart, language: input.language, settings: input, posts });
    res.status(201).json(plan);
  }),
);

plannerRouter.get('/', (_req, res) => {
  res.json({ items: plansRepo.list().map(({ posts, ...p }) => ({ ...p, postCount: posts.length })) });
});

plannerRouter.get('/:id', wrap(async (req, res) => res.json(loadPlan(req.params.id))));

plannerRouter.put(
  '/:id/posts/:postId',
  wrap(async (req, res) => {
    const plan = loadPlan(req.params.id);
    const index = findPost(plan, req.params.postId);
    const update = PostUpdate.parse(req.body);
    plan.posts[index] = { ...plan.posts[index], ...update, warnings: lintBrand(update) };
    res.json(plansRepo.updatePosts(plan.id, plan.posts).posts[index]);
  }),
);

plannerRouter.post(
  '/:id/posts/:postId/regenerate',
  wrap(async (req, res) => {
    const plan = loadPlan(req.params.id);
    const index = findPost(plan, req.params.postId);
    const old = plan.posts[index];
    const slot = slotFromPost(old, plan.language);
    const content = await rewritePost({
      slot: { ...slot, currentHook: old.hook },
      language: plan.language,
      market: plan.settings.market,
      focus: plan.settings.focus,
      otherHooks: plan.posts.filter((_, i) => i !== index).map((p) => p.hook),
      instruction: String(req.body?.instruction || '').slice(0, 500),
    });
    plan.posts[index] = { ...toPost(slot, content), id: old.id };
    res.json(plansRepo.updatePosts(plan.id, plan.posts).posts[index]);
  }),
);

// Writes (or rewrites) the full video script for one day of the plan.
plannerRouter.post(
  '/:id/posts/:postId/script',
  wrap(async (req, res) => {
    const plan = loadPlan(req.params.id);
    const index = findPost(plan, req.params.postId);
    const post = plan.posts[index];
    const slot = slotFromPost(post, plan.language);
    const durationSec = plan.settings.durationSec || 45;
    const ai = await writeDayScript({
      post,
      pillar: slot.pillar,
      platform: post.platform,
      language: plan.language,
      market: plan.settings.market,
      focus: plan.settings.focus,
      otherHooks: plan.posts.filter((_, i) => i !== index).map((p) => p.hook),
      durationSec,
    });
    const script = finalizeScript(ai, { language: plan.language, durationSec, topic: post.hook });
    // A new script means any earlier video no longer matches it.
    res.json(plansRepo.patchPost(plan.id, post.id, { script, videoId: null }));
  }),
);

plannerRouter.delete(
  '/:id',
  wrap(async (req, res) => {
    loadPlan(req.params.id);
    plansRepo.remove(req.params.id);
    res.json({ ok: true });
  }),
);

plannerRouter.get(
  '/:id/export',
  wrap(async (req, res) => {
    const plan = loadPlan(req.params.id);
    const base = `qudra-plan-${plan.weekStart}`;
    if (req.query.format === 'docx') {
      const buffer = await planToDocx(plan);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${base}.docx"`);
      return res.send(buffer);
    }
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${base}.md"`);
    res.send(planToMarkdown(plan));
  }),
);
