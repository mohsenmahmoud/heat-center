import * as cheerio from 'cheerio';
import { safeFetch, readLimited } from '../lib/net.js';
import { errors, AppError } from '../lib/errors.js';

const MAX_TEXT = 12000;
const UA = 'Mozilla/5.0 (MarketingStudio; local)';
const HEX = /#(?:[0-9a-f]{6}|[0-9a-f]{3})\b/gi;

function normalizeHex(c) {
  let h = c.slice(1).toLowerCase();
  if (h.length === 3) h = [...h].map((x) => x + x).join('');
  return `#${h}`;
}

/** Colours a page actually uses, most used first (theme-color counts most). Pure white/black are skipped. */
async function pageColors($, url) {
  const counts = new Map();
  const add = (raw, weight = 1) => {
    if (!raw || !/^#/.test(raw.trim())) return;
    const c = normalizeHex(raw.trim());
    if (c === '#ffffff' || c === '#000000') return;
    counts.set(c, (counts.get(c) || 0) + weight);
  };
  add($('meta[name="theme-color"]').attr('content'), 50);
  add($('meta[name="msapplication-TileColor"]').attr('content'), 30);
  let css = $('style').text() + ' ' + $('[style]').map((_, el) => $(el).attr('style')).get().join(' ');
  // Most sites keep their palette in an external stylesheet: read up to two from the same site.
  const sheets = $('link[rel="stylesheet"]')
    .map((_, el) => $(el).attr('href'))
    .get()
    .map((href) => {
      try {
        return new URL(href, url);
      } catch {
        return null;
      }
    })
    .filter((u) => u && u.host === new URL(url).host)
    .slice(0, 2);
  for (const sheet of sheets) {
    try {
      const res = await safeFetch(sheet.toString(), { headers: { 'User-Agent': UA, Accept: 'text/css' }, timeoutMs: 8000 });
      if (res.ok) css += ' ' + (await readLimited(res, 1.5e6)).toString('utf8');
    } catch {
      /* colours are a hint only */
    }
  }
  for (const m of css.matchAll(HEX)) add(m[0]);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([c]) => c);
}

/** Reads the readable text and key images (and, on request, the colours) of a public web page. */
export async function scrapePage(url, { colors = false } = {}) {
  let html;
  try {
    const res = await safeFetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!(res.headers.get('content-type') || '').includes('html')) throw new Error('not an HTML page');
    html = (await readLimited(res, 3e6)).toString('utf8');
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw errors.scrapeFailed(err.message);
  }

  const $ = cheerio.load(html);
  const palette = colors ? await pageColors($, url) : [];
  $('script, style, noscript, svg, nav, footer, iframe, form').remove();
  const meta = (name) => $(`meta[property="${name}"], meta[name="${name}"]`).attr('content') || '';
  const title = meta('og:title') || $('title').text().trim();
  const description = meta('og:description') || meta('description');

  const blocks = [];
  $('h1, h2, h3, p, li').each((_, el) => {
    const t = $(el).text().replace(/\s+/g, ' ').trim();
    if (t.length > 25 && !blocks.includes(t)) blocks.push(t);
  });
  const text = [description, ...blocks].join('\n').slice(0, MAX_TEXT);
  if (text.length < 40) throw errors.scrapeFailed('page has too little readable text (it may need JavaScript)');

  const images = [meta('og:image'), ...$('img').map((_, el) => $(el).attr('src')).get()]
    .filter(Boolean)
    .map((src) => {
      try {
        return new URL(src, url).toString();
      } catch {
        return null;
      }
    })
    .filter((src) => src && /^https?:/.test(src) && !/\.svg(\?|$)/i.test(src));

  return { url, title, text, images: [...new Set(images)].slice(0, 6), colors: palette };
}
