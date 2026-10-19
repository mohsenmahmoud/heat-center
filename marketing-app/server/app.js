import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { ZodError } from 'zod';
import { config } from './config.js';
import { getDb } from './db.js';
import { localHostOnly, requireAuth } from './lib/auth.js';
import { errors, toPayload } from './lib/errors.js';
import { publicRouter, systemRouter } from './routes/system.js';
import { uploadsRouter } from './routes/uploads.js';
import { videoRouter } from './routes/video.js';
import { plannerRouter } from './routes/planner.js';

export function createApp() {
  getDb();
  const app = express();
  app.disable('x-powered-by');
  app.use(localHostOnly);
  app.use(express.json({ limit: '2mb' }));
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
  });

  // Media files have unguessable random names and must stay readable by the
  // headless renderer (which has no session cookie).
  const media = { fallthrough: false, maxAge: '1d' };
  app.use('/media', express.static(config.paths.media, media));
  app.use('/uploads', express.static(config.paths.uploads, media));
  app.use('/brand', express.static(config.paths.brand, media));
  app.use('/music', express.static(config.paths.music, media));
  app.use('/videos', requireAuth, express.static(config.paths.videos, media));

  app.use('/api', publicRouter);
  app.use('/api', requireAuth, systemRouter);
  app.use('/api/uploads', requireAuth, uploadsRouter);
  app.use('/api/video', requireAuth, videoRouter);
  app.use('/api/planner', requireAuth, plannerRouter);
  app.use('/api', (_req, _res, next) => next(errors.notFound('Endpoint')));

  // Built web UI (npm start). In development Vite serves it instead.
  if (fs.existsSync(config.paths.dist)) {
    app.use(express.static(config.paths.dist));
    app.get('*', (_req, res) => res.sendFile(path.join(config.paths.dist, 'index.html')));
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof ZodError) {
      const first = err.issues[0];
      const where = first?.path?.join('.') || 'input';
      err = errors.validation(`${where}: ${first?.message}`, `قيمة غير صحيحة في الحقل "${where}".`);
    }
    if (err?.status === 404 && err?.expose && !err.code) err = errors.notFound('File');
    const { status, body } = toPayload(err);
    if (status >= 500) console.error('[server]', err);
    res.status(status).json(body);
  });

  return app;
}
