import { Router } from 'express';
import { capabilities, config } from '../config.js';
import { checkPassword, clearSessionCookie, isAuthenticated, setSessionCookie } from '../lib/auth.js';
import { errors } from '../lib/errors.js';
import { findLogo, listMusic } from '../services/render.js';

export const publicRouter = Router();

publicRouter.get('/health', (_req, res) => res.json({ ok: true }));

publicRouter.get('/auth/status', (req, res) => res.json({ required: !!config.appPassword, authenticated: isAuthenticated(req) }));

const attempts = new Map();
publicRouter.post('/auth/login', (req, res, next) => {
  // Slow down guessing: at most 10 tries per minute.
  const minute = Math.floor(Date.now() / 60000);
  const count = (attempts.get(minute) || 0) + 1;
  attempts.clear();
  attempts.set(minute, count);
  if (count > 10) return next(errors.rateLimited());
  if (!config.appPassword) return res.json({ ok: true });
  if (!checkPassword(req.body?.password || '')) return next(errors.badPassword());
  setSessionCookie(res);
  res.json({ ok: true });
});

publicRouter.post('/auth/logout', (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

export const systemRouter = Router();

systemRouter.get('/status', (_req, res) => {
  res.json({
    capabilities: capabilities(),
    music: listMusic(),
    logo: findLogo(),
    brand: config.brand,
  });
});
