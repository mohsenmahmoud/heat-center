import crypto from 'node:crypto';
import { config } from '../config.js';
import { errors } from './errors.js';

const COOKIE = 'qms_session';
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

function sign(value) {
  return crypto.createHmac('sha256', config.sessionSecret).update(value).digest('hex');
}

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

export function makeToken(now = Date.now()) {
  const payload = `${now + MAX_AGE_MS}.${crypto.randomBytes(12).toString('hex')}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token) {
  if (!token) return false;
  const idx = token.lastIndexOf('.');
  if (idx < 0) return false;
  const payload = token.slice(0, idx);
  if (!safeEqual(sign(payload), token.slice(idx + 1))) return false;
  return Number(payload.split('.')[0]) > Date.now();
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export function isAuthenticated(req) {
  return !config.appPassword || verifyToken(readCookie(req, COOKIE));
}

export function checkPassword(password) {
  // Hash both sides so the comparison is constant-time regardless of length.
  const h = (s) => crypto.createHash('sha256').update(String(s)).digest();
  return crypto.timingSafeEqual(h(password), h(config.appPassword));
}

export function setSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(makeToken())}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${MAX_AGE_MS / 1000}`);
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`);
}

export function requireAuth(req, _res, next) {
  if (isAuthenticated(req)) return next();
  next(errors.unauthorized());
}

const ALLOWED_HOSTS = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i;

/** Blocks DNS-rebinding: a malicious site can't reach us through a hostname that resolves to 127.0.0.1. */
export function localHostOnly(req, res, next) {
  if (ALLOWED_HOSTS.test(req.headers.host || '')) return next();
  res.status(403).json({ error: { code: 'FORBIDDEN_HOST', message: { ar: 'مسموح فقط من localhost.', en: 'Only localhost is allowed.' } } });
}
