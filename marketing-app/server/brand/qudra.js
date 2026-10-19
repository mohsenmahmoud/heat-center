/**
 * Qudra brand system: the single place the app reads voice, palette and rules from.
 * Edit this file to change how every generated script and post sounds.
 */
export const brand = {
  name: { ar: 'قُدرة', en: 'Qudra' },
  website: 'qudratms.com',
  tagline: {
    ar: 'كل عمليات التدريب في منصة واحدة',
    en: 'All Your Training Operations in One Platform',
  },
  colors: {
    green: '#3DAA63',
    greenLight: '#40B367',
    greenDeep: '#2C894D',
    greenShadow: '#226E3D',
    brandDark: '#016332',
    ink: '#1D2A22',
    mint: '#EAF6EE',
    mintBg: '#F2F8F4',
    white: '#FFFFFF',
    gray: '#868C87',
    red: '#EC736C',
    amber: '#E0A54D',
  },
  gradient: 'linear-gradient(135deg, #40A664 0%, #2C894D 60%, #226E3D 100%)',
  ctas: {
    ar: ['احجز ديمو مجاني', 'ابعتلنا "ديمو" على واتساب', 'جرّب قدرة على أكاديميتك'],
    en: ['Book a free demo', 'Message us "demo" on WhatsApp', 'Try Qudra on your academy'],
  },
};

export const PILLARS = [
  { key: 'pain', ar: 'ألم التشغيل', en: 'Operational pain', share: 2 },
  { key: 'product', ar: 'قدرة في الشغل', en: 'Product in action', share: 2 },
  { key: 'roi', ar: 'أرقام ونمو', en: 'ROI & growth', share: 1 },
  { key: 'insight', ar: 'خبرة المجال', en: 'Industry insight', share: 1 },
  { key: 'trust', ar: 'ورا الكواليس / ثقة', en: 'Behind the scenes & trust', share: 1 },
];

export const PLATFORMS = {
  linkedin: { label: 'LinkedIn', tone: 'expert and calm, B2B owner/GM voice', length: '80–200 words, hook in the first line, story → insight → CTA', format: 'Text post or document carousel' },
  facebook: { label: 'Facebook', tone: 'warm and scene-based', length: '60–150 words', format: 'Post with image or short video, CTA to WhatsApp/Messenger' },
  instagram: { label: 'Instagram', tone: 'punchy and visual', length: 'caption ≤ 80 words', format: 'Carousel (5–7 slides) or Reel' },
  tiktok: { label: 'TikTok / Shorts', tone: 'bold, fast, scroll-stopping', length: 'caption ≤ 40 words; content is a 20–45s vertical video', format: 'Vertical video (Reel/Short)' },
};

export const BANNED_PHRASES = [
  'في عالم اليوم المتسارع', 'في ظل التطور التكنولوجي', 'لا شك أن', 'مما لا شك فيه', 'نقلة نوعية',
  'ثورة في', 'رحلتك نحو', 'اكتشف الآن', 'بكل سهولة ويسر', 'الحل الأمثل', 'الحل الشامل',
  'نفخر بأن نقدم', 'هل تعلم أن', 'ارتقِ بـ', 'عزز من', 'في متناول يدك',
  'unlock', 'revolutionize', 'seamless', 'game-changer', 'game changer', 'cutting-edge', 'elevate',
  "in today's fast-paced world",
];

/** Returns the banned phrases found in any string field of `value` (deep). */
export function lintBrand(value) {
  const text = JSON.stringify(value ?? '').toLowerCase();
  return BANNED_PHRASES.filter((p) => text.includes(p.toLowerCase()));
}

export const FEATURES = `
- Operations: branches, courses, trainers, groups/cohorts, students, trainer schedules; filters by branch, trainer, status, category and attendance type (online / in-person / recorded).
- Learning: certificates and certificate templates, student reports, trainer evaluations, learning library.
- Community: student community and discussion topics.
- Finance: payments, collection schedule (installments), payroll, expenses, budget, financial reports.
- Communication: send message, messages inbox, push notifications.
- Student mobile app: current lecture + "Join session" button, attendance %, overdue assignments, pending evaluations, session calendar.
- Multi-branch academies, Arabic-first RTL interface.`;

export function brandSystemPrompt(language) {
  const lang =
    language === 'ar'
      ? 'Write in clear, simplified Modern Standard Arabic (فصحى مبسطة) that reads naturally for both Egypt and the Gulf. No Egyptian-only slang. Max ~2 English technical terms per piece (e.g. Dashboard).'
      : 'Write in clear, concise English with the same operator voice.';
  return `You are the senior content strategist for Qudra (قُدرة), a B2B Training Management System (نظام إدارة التدريب) for academies and training centers in Egypt and the Gulf. Website: qudratms.com.
Tagline: "All Your Training Operations in One Platform" / "كل عمليات التدريب في منصة واحدة".
Promise: the academy runs on a system, not on Excel, WhatsApp groups and memory.

Reader: the academy/training-center owner or manager (B2B). Never write to students or parents.

Voice:
1. Operator, not marketer: concrete scenes from running a training center beat abstract benefits.
2. Short, punchy sentences. One idea per line.
3. Pain first, then the system, then one clear next step.
4. Proof over adjectives. Describe a concrete before/after.
5. Respect the reader. No lecturing, no fear-mongering, no "هل تعلم؟" clichés.

Product features you may mention (do not invent others):${FEATURES}

Glossary: طالب/الطلاب (never متدرب), مدرب, أكاديمية / مركز تدريب (never مدرسة), دورة / برنامج تدريبي, مجموعة / دفعة, محاضرة / جلسة, أقساط, شهادة.

Hard rules:
- Never invent statistics, client names, testimonials, awards, integrations or prices. If a number would help, describe the before/after instead, or insert the placeholder "[رقم حقيقي]" / "[real number]".
- Never use these phrases: ${BANNED_PHRASES.join(' | ')}.
- 0–2 emoji per piece, functional only. 3–5 relevant hashtags (e.g. #قدرة #إدارة_التدريب #مراكز_التدريب).
- One CTA per piece. Preferred: ${brand.ctas.ar.join(' / ')} (English: ${brand.ctas.en.join(' / ')}).
- Never name competitors; compare against "Excel, paper and WhatsApp".

Language: ${lang}`;
}
