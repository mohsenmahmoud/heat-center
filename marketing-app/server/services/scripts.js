import { config } from '../config.js';
import { fitDurations } from '../../video/timing.js';

/**
 * Turns Claude's raw script into the editable script the video tab and renderer use:
 * stable scene ids, uploaded images pinned to product scenes, durations fitted, brand contact on the CTA.
 */
export function finalizeScript(ai, { language, durationSec, topic = '', imageIds = [] }) {
  const queue = [...imageIds];
  const scenes = ai.scenes.map((s, i) => ({
    id: `s${i + 1}`,
    ...s,
    imageId: ['feature', 'solution'].includes(s.type) && queue.length ? queue.shift() : null,
  }));
  const contact = [config.brand.website, config.brand.whatsapp].filter(Boolean).join('  ·  ');
  return {
    title: ai.title,
    language,
    aspect: '9:16',
    topic,
    scenes: fitDurations(scenes, durationSec),
    cta: { ...ai.cta, contact },
    caption: ai.caption,
    hashtags: ai.hashtags,
  };
}

/** The spoken text of a script, scene by scene: what to read when recording a voiceover. */
export const voiceoverText = (script) => script.scenes.map((s) => s.voiceover).filter(Boolean).join('\n');
