import { PILLARS, PLATFORMS, lintBrand } from '../brand/index.js';
import { newId } from '../db.js';

const DAY_NAMES = {
  ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};

// Order the 7 pillar slots so the same pillar never runs on consecutive days.
const PILLAR_ORDER = ['pain', 'product', 'insight', 'pain', 'roi', 'product', 'trust'];

/**
 * Decides what each of the 7 days is (date, platform, content pillar) before asking
 * the AI to write, so the mix follows the pillar shares and every chosen platform gets used.
 */
export function buildSlots({ weekStart, platforms, language }) {
  const start = new Date(`${weekStart}T00:00:00Z`);
  // LinkedIn first: it carries the owner/GM audience; other platforms rotate after it.
  const ordered = Object.keys(PLATFORMS).filter((p) => platforms.includes(p));
  return PILLAR_ORDER.map((pillarKey, i) => {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    return {
      date: d.toISOString().slice(0, 10),
      dayName: DAY_NAMES[language][d.getUTCDay()],
      platform: ordered[i % ordered.length],
      pillar: PILLARS.find((p) => p.key === pillarKey),
    };
  });
}

export function toPost(slot, content, brand) {
  return {
    id: newId(),
    date: slot.date,
    dayName: slot.dayName,
    platform: slot.platform,
    pillar: slot.pillar.key,
    ...content,
    hashtags: content.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)),
    warnings: lintBrand(content, brand),
  };
}

export function slotFromPost(post, language) {
  return {
    date: post.date,
    dayName: post.dayName || DAY_NAMES[language][new Date(`${post.date}T00:00:00Z`).getUTCDay()],
    platform: post.platform,
    pillar: PILLARS.find((p) => p.key === post.pillar) || PILLARS[0],
  };
}
