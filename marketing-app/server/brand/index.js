/**
 * What every brand shares: content pillars, platform rules, common clichés to avoid, and the
 * system prompt built from a brand's own profile (Brands tab). Nothing here is tied to one product.
 */

export const PILLARS = [
  { key: 'pain', ar: 'ألم العميل', en: 'Customer pain', share: 2 },
  { key: 'product', ar: 'المنتج في الشغل', en: 'Product in action', share: 2 },
  { key: 'roi', ar: 'نتائج وأرقام', en: 'Results & ROI', share: 1 },
  { key: 'insight', ar: 'خبرة المجال', en: 'Industry insight', share: 1 },
  { key: 'trust', ar: 'ثقة وكواليس', en: 'Behind the scenes & trust', share: 1 },
];

export const PLATFORMS = {
  linkedin: { label: 'LinkedIn', tone: 'expert and calm, professional voice', length: '80–200 words, hook in the first line, story → insight → CTA', format: 'Text post or document carousel' },
  facebook: { label: 'Facebook', tone: 'warm and scene-based', length: '60–150 words', format: 'Post with image or short video, CTA to WhatsApp/Messenger' },
  instagram: { label: 'Instagram', tone: 'punchy and visual', length: 'caption ≤ 80 words', format: 'Carousel (5–7 slides) or Reel' },
  tiktok: { label: 'TikTok / Shorts', tone: 'bold, fast, scroll-stopping', length: 'caption ≤ 40 words; content is a 20–45s vertical video', format: 'Vertical video (Reel/Short)' },
};

/** Generic marketing clichés no brand should use; each brand can add its own. */
export const BANNED_PHRASES = [
  'في عالم اليوم المتسارع', 'في ظل التطور التكنولوجي', 'لا شك أن', 'مما لا شك فيه', 'نقلة نوعية',
  'ثورة في', 'رحلتك نحو', 'اكتشف الآن', 'بكل سهولة ويسر', 'الحل الأمثل', 'الحل الشامل',
  'نفخر بأن نقدم', 'هل تعلم أن', 'ارتقِ بـ', 'عزز من', 'في متناول يدك',
  'unlock', 'revolutionize', 'seamless', 'game-changer', 'game changer', 'cutting-edge', 'elevate',
  "in today's fast-paced world",
];

export const bannedFor = (brand) => [...new Set([...BANNED_PHRASES, ...(brand?.banned || [])].map((p) => p.trim()).filter(Boolean))];

/** Returns the banned phrases (common + the brand's own) found in any string field of `value` (deep). */
export function lintBrand(value, brand = null) {
  const text = JSON.stringify(value ?? '').toLowerCase();
  return bannedFor(brand).filter((p) => text.includes(p.toLowerCase()));
}

export const brandName = (brand, language = 'en') => brand?.name?.[language] || brand?.name?.en || brand?.name?.ar || '';

/** Website and contact line shown under the CTA. */
export const brandContact = (brand) => [brand?.website, brand?.contact].map((x) => (x || '').trim()).filter(Boolean).join('  ·  ');

const section = (title, body) => (body && body.trim() ? `\n${title}:\n${body.trim()}\n` : '');

export function brandSystemPrompt(brand, language) {
  const lang =
    language === 'ar'
      ? 'Write in clear, simplified Modern Standard Arabic (فصحى مبسطة) that reads naturally for both Egypt and the Gulf. No Egyptian-only slang. Max ~2 English technical terms per piece.'
      : 'Write in clear, concise English with the same voice.';
  const en = brandName(brand, 'en');
  const ar = brandName(brand, 'ar');
  const names = en && ar && en !== ar ? `${en} (${ar})` : en || ar;
  const ctas = (brand.ctas?.[language] || []).filter(Boolean);
  const otherCtas = brand.ctas?.[language === 'ar' ? 'en' : 'ar'] || [];
  const hashtags = (brand.hashtags || []).filter(Boolean);

  return `You are the senior content strategist for ${names}${brand.category ? `, ${brand.category}` : ''}.${brand.website ? ` Website: ${brand.website}.` : ''}
${brand.tagline?.en || brand.tagline?.ar ? `Tagline: ${[brand.tagline.en, brand.tagline.ar].filter(Boolean).map((t) => `"${t}"`).join(' / ')}.` : ''}
${section('About the product', brand.description)}${section('Reader (who every piece speaks to)', brand.audience)}${section('Voice', brand.voice || 'Clear, concrete and human. Short sentences, one idea per line. Show a real scene or result instead of adjectives.')}${section('Product facts you may mention (do not invent others)', brand.features)}${section('Glossary (use these words)', brand.glossary)}
Hard rules:
- Never invent statistics, client names, testimonials, awards, integrations or prices. If a number would help, describe the before/after instead, or insert the placeholder "[رقم حقيقي]" / "[real number]".
- Never use these phrases: ${bannedFor(brand).join(' | ')}.
- 0–2 emoji per piece, functional only. 3–5 relevant hashtags${hashtags.length ? ` (e.g. ${hashtags.slice(0, 5).join(' ')})` : ''}.
- One CTA per piece.${ctas.length ? ` Preferred: ${ctas.join(' / ')}${otherCtas.length ? ` (other language: ${otherCtas.join(' / ')})` : ''}.` : ''}
${(brand.rules || '')
  .split('\n')
  .map((r) => r.trim().replace(/^[-•]\s*/, ''))
  .filter(Boolean)
  .map((r) => `- ${r}`)
  .join('\n')}

Language: ${lang}`.replace(/\n{3,}/g, '\n\n');
}
