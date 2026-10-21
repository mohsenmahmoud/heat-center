import dns from 'node:dns/promises';
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { errors } from './errors.js';

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
  }
  const v = ip.toLowerCase();
  if (v.startsWith('::ffff:')) return isPrivateIp(v.slice(7));
  return v === '::1' || v === '::' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80');
}

/** Rejects URLs that aren't http(s) or that resolve to a local/private network address. */
export async function assertPublicUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw errors.validation('Invalid URL', 'الرابط غير صحيح.');
  }
  if (!['http:', 'https:'].includes(url.protocol)) throw errors.validation('Only http(s) URLs are allowed', 'مسموح فقط بروابط http أو https.');
  const host = url.hostname.replace(/^\[|\]$/g, '');
  const addresses = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true }).catch(() => []);
  if (!addresses.length) throw errors.scrapeFailed('host not found');
  if (addresses.some((a) => isPrivateIp(a.address))) throw errors.blockedUrl();
  return url;
}

/** fetch() that re-checks every redirect hop against the private-address rule. */
export async function safeFetch(raw, { timeoutMs = 15000, headers = {}, maxRedirects = 3 } = {}) {
  let current = raw;
  for (let hop = 0; hop <= maxRedirects; hop++) {
    await assertPublicUrl(current);
    const res = await fetch(current, { redirect: 'manual', headers, signal: AbortSignal.timeout(timeoutMs) });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      current = new URL(res.headers.get('location'), current).toString();
      continue;
    }
    return res;
  }
  throw errors.scrapeFailed('too many redirects');
}

export async function readLimited(res, maxBytes) {
  const reader = res.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error(`response larger than ${Math.round(maxBytes / 1e6)} MB`);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'video/mp4': '.mp4', 'audio/mpeg': '.mp3' };

/** Downloads a remote media file into `dir`, cached by URL. Returns the file name. */
export async function downloadToDir(url, dir, { maxBytes = 80e6, fallbackExt = '.bin' } = {}) {
  const hash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 20);
  const existing = fs.readdirSync(dir).find((f) => f.startsWith(hash));
  if (existing) return existing;
  const res = await safeFetch(url, { timeoutMs: 60000 });
  if (!res.ok) throw new Error(`download failed with HTTP ${res.status}`);
  const type = (res.headers.get('content-type') || '').split(';')[0];
  const name = hash + (EXT[type] || path.extname(new URL(url).pathname) || fallbackExt);
  fs.writeFileSync(path.join(dir, name), await readLimited(res, maxBytes));
  return name;
}

export function saveBuffer(buffer, dir, ext) {
  const name = crypto.randomBytes(16).toString('hex') + ext;
  fs.writeFileSync(path.join(dir, name), buffer);
  return name;
}
