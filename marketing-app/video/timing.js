// Shared by the Remotion composition (browser) and the server, so both agree on video length.
export const FPS = 30;
export const TRANSITION_FRAMES = 15;
export const MIN_TOTAL_SEC = 40;
export const MAX_TOTAL_SEC = 60;
const MIN_SCENE_SEC = 3;
const MAX_SCENE_SEC = 14;

export const DIMENSIONS = {
  '9:16': { width: 1080, height: 1920 },
  '1:1': { width: 1080, height: 1080 },
  '4:5': { width: 1080, height: 1350 },
  '16:9': { width: 1920, height: 1080 },
};

export const sceneFrames = (scene) => Math.max(1, Math.round(scene.durationSec * FPS));

export function totalFrames(scenes) {
  if (!scenes?.length) return FPS;
  const sum = scenes.reduce((acc, s) => acc + sceneFrames(s), 0);
  return sum - (scenes.length - 1) * TRANSITION_FRAMES;
}

export const totalSeconds = (scenes) => totalFrames(scenes) / FPS;

/**
 * Scales scene durations so the finished video (after transition overlaps) lasts
 * `targetSec`, keeping every scene readable (3–14s) and rounded to 0.5s.
 */
export function fitDurations(scenes, targetSec) {
  if (!scenes.length) return scenes;
  const overlapSec = ((scenes.length - 1) * TRANSITION_FRAMES) / FPS;
  const wanted = targetSec + overlapSec;
  const current = scenes.reduce((a, s) => a + (Number(s.durationSec) || 5), 0);
  const ratio = wanted / current;
  const scaled = scenes.map((s) => {
    const d = Math.round((Number(s.durationSec) || 5) * ratio * 2) / 2;
    return { ...s, durationSec: Math.min(MAX_SCENE_SEC, Math.max(MIN_SCENE_SEC, d)) };
  });
  // Spread any rounding/clamping remainder in 0.5s steps over scenes that still have room.
  let diff = Math.round((wanted - scaled.reduce((a, s) => a + s.durationSec, 0)) * 2) / 2;
  for (let guard = 0; Math.abs(diff) >= 0.5 && guard < 200; guard++) {
    const step = diff > 0 ? 0.5 : -0.5;
    const room = scaled
      .map((s, idx) => ({ s, idx }))
      .filter(({ s }) => (step > 0 ? s.durationSec + step <= MAX_SCENE_SEC : s.durationSec + step >= MIN_SCENE_SEC))
      .sort((a, b) => (step > 0 ? a.s.durationSec - b.s.durationSec : b.s.durationSec - a.s.durationSec))[0];
    if (!room) break;
    scaled[room.idx] = { ...room.s, durationSec: room.s.durationSec + step };
    diff -= step;
  }
  return scaled;
}
