import * as cheerio from 'cheerio';
import { safeFetch, readLimited } from '../lib/net.js';
import { errors, AppError } from '../lib/errors.js';

const MAX_TEXT = 12000;

/** Reads the readable text and key images of a public web page. */
export async function scrapePage(url) {
  let html;
  try {
    const res = await safeFetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (QudraMarketingStudio; +https://qudratms.com)', Accept: 'text/html' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!(res.headers.get('content-type') || '').includes('html')) throw new Error('not an HTML page');
    html = (await readLimited(res, 3e6)).toString('utf8');
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw errors.scrapeFailed(err.message);
  }

  const $ = cheerio.load(html);
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

  return { url, title, text, images: [...new Set(images)].slice(0, 6) };
}
