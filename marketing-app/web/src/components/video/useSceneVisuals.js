import { useCallback, useRef, useState } from 'react';
import { api } from '../../lib/api.js';
import { uploadFiles } from './SourceForm.jsx';

const CONCURRENCY = 3;
const sizeOf = (item) => (item.width && item.height ? { w: item.width, h: item.height } : null);

/**
 * Scene images: AI images made for every scene that has none, your own image on any scene (reviewed by the AI so
 * it is framed for that scene), swapping, removing and switching how an image is shown.
 */
export function useSceneVisuals({ setScript, setImages, brandId, market, toast }) {
  const [busy, setBusy] = useState(() => new Set());
  const [progress, setProgress] = useState(null);
  const run = useRef(0);

  const mark = (id, on) =>
    setBusy((prev) => {
      const next = new Set(prev);
      on ? next.add(id) : next.delete(id);
      return next;
    });
  const patchScene = useCallback((id, patch) => setScript((s) => s && { ...s, scenes: s.scenes.map((sc) => (sc.id === id ? { ...sc, ...patch } : sc)) }), [setScript]);

  const generate = useCallback(
    async (scene) => {
      const prompt = scene.imagePrompt || scene.visualIdea || scene.headline;
      if (!prompt?.trim()) return;
      mark(scene.id, true);
      try {
        const item = await api.post('/api/video/scene-image', { prompt, brandId, market });
        setImages((prev) => [...prev, item]);
        patchScene(scene.id, { imageId: item.id, imageUrl: item.url, imageSize: sizeOf(item), imageSource: 'ai', imageMode: 'photo', shot: null });
      } catch (err) {
        toast.error(err);
      } finally {
        mark(scene.id, false);
      }
    },
    [brandId, market, patchScene, setImages, toast],
  );

  /** Makes AI images for every scene without one (except the CTA), a few at a time. */
  const fillAll = useCallback(
    async (script) => {
      const todo = script.scenes.filter((s) => !s.imageId && s.type !== 'cta' && (s.imagePrompt || s.visualIdea));
      if (!todo.length) return;
      const id = ++run.current;
      let done = 0;
      setProgress({ done, total: todo.length });
      const queue = [...todo];
      const worker = async () => {
        for (let scene = queue.shift(); scene && run.current === id; scene = queue.shift()) {
          await generate(scene);
          setProgress({ done: ++done, total: todo.length });
        }
      };
      await Promise.all(Array.from({ length: CONCURRENCY }, worker));
      if (run.current === id) setProgress(null);
    },
    [generate],
  );

  /** Stops filling (a new script replaced the one being filled). */
  const cancel = useCallback(() => {
    run.current++;
    setProgress(null);
  }, []);

  /** Puts an image on a scene and lets the AI decide how to frame it there. */
  const pickImage = useCallback(
    async (scene, image, language) => {
      patchScene(scene.id, { imageId: image.id, imageUrl: image.url, imageSize: sizeOf(image), imageSource: image.source === 'ai' ? 'ai' : 'user', imageMode: image.source === 'ai' ? 'photo' : 'screen', shot: null });
      if (image.source === 'ai') return;
      mark(scene.id, true);
      try {
        const { shot } = await api.post('/api/video/analyze-image', { uploadId: image.id, headline: scene.headline, subtext: scene.subtext, language, brandId });
        patchScene(scene.id, { shot, imageMode: shot.kind === 'photo' ? 'photo' : 'screen' });
      } catch (err) {
        toast.error(err);
      } finally {
        mark(scene.id, false);
      }
    },
    [brandId, patchScene, toast],
  );

  const upload = useCallback(
    async (scene, file, language) => {
      mark(scene.id, true);
      try {
        const [item] = await uploadFiles([file]);
        setImages((prev) => [...prev, item]);
        mark(scene.id, false);
        await pickImage(scene, item, language);
      } catch (err) {
        toast.error(err);
        mark(scene.id, false);
      }
    },
    [setImages, toast, pickImage],
  );

  const clear = useCallback((scene) => patchScene(scene.id, { imageId: null, imageUrl: null, imageSize: null, imageSource: null, imageMode: null, shot: null }), [patchScene]);
  const setMode = useCallback((scene, imageMode) => patchScene(scene.id, { imageMode }), [patchScene]);
  const setCallout = useCallback((scene, callout) => patchScene(scene.id, { shot: scene.shot ? { ...scene.shot, callout } : null }), [patchScene]);

  return { busy, progress, generate, fillAll, cancel, pickImage, upload, clear, setMode, setCallout };
}
