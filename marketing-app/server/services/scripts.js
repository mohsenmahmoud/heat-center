import { brandContact } from '../brand/index.js';
import { fitDurations } from '../../video/timing.js';

/**
 * Turns Claude's raw script into the editable script the video tab and renderer use:
 * stable scene ids, uploaded images pinned to product scenes, durations fitted, brand contact on the CTA.
 */
export function finalizeScript(ai, { brand = null, language, durationSec, topic = '', imageIds = [] }) {
  // Prefer the AI's own choice of image per scene; fall back to filling product scenes in order.
  const chosen = ai.scenes.some((s) => s.imageIndex > 0 && s.imageIndex <= imageIds.length);
  const queue = [...imageIds];
  const used = new Set();
  const scenes = ai.scenes.map(({ imageIndex = 0, ...s }, i) => {
    let imageId = null;
    if (chosen) {
      const id = imageIds[imageIndex - 1];
      if (id && !used.has(id)) imageId = id;
    } else if (['feature', 'solution'].includes(s.type) && queue.length) {
      imageId = queue.shift();
    }
    if (imageId) used.add(imageId);
    return { id: `s${i + 1}`, ...s, imageId };
  });
  return {
    ...(brand?.id ? { brandId: brand.id } : {}),
    title: ai.title,
    language,
    aspect: '9:16',
    topic,
    scenes: fitDurations(scenes, durationSec),
    cta: { ...ai.cta, contact: brandContact(brand) },
    caption: ai.caption,
    hashtags: ai.hashtags,
  };
}

/** The spoken text of a script, scene by scene: what to read when recording a voiceover. */
export const voiceoverText = (script) => script.scenes.map((s) => s.voiceover).filter(Boolean).join('\n');
