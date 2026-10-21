import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Player } from '@remotion/player';
import { Clapperboard, Download, MonitorPlay } from 'lucide-react';
import { BrandVideo } from '../../../../video/BrandVideo.jsx';
import { DIMENSIONS, FPS, totalFrames } from '../../../../video/timing.js';
import { api } from '../../lib/api.js';
import { useI18n } from '../../lib/i18n.jsx';
import { brandVideoProps } from '../../lib/brands.jsx';
import { orientationFromSize } from './SourceForm.jsx';
import { ErrorBox, SectionTitle, Spinner } from '../ui.jsx';

/** How a scene's pinned image is shown: same rules as the renderer (server/services/render.js). */
function sceneVisual(scene, byId) {
  const img = scene.imageId && byId[scene.imageId];
  const url = img?.url || scene.imageUrl;
  if (!scene.imageId || !url) return { kind: 'gradient' };
  const mode = scene.imageMode || (scene.imageSource === 'ai' || scene.shot?.kind === 'photo' ? 'photo' : 'screen');
  if (mode === 'photo') return { kind: 'image', src: url, focus: scene.shot?.focus || null };
  const size = img?.width ? { w: img.width, h: img.height } : scene.imageSize || null;
  return { kind: 'mockup', src: url, orientation: img?.orientation || orientationFromSize(size?.w, size?.h) || 'landscape', size, shot: scene.shot || null };
}

/** Same props the server renders with, minus stock footage (fetched at render time). */
function previewProps(script, images, form, brand) {
  const byId = Object.fromEntries(images.map((i) => [i.id, i]));
  return {
    script: { ...script, scenes: script.scenes.map((s) => ({ ...s, visual: sceneVisual(s, byId) })) },
    mediaBase: '',
    brand: brandVideoProps(brand),
    logoSrc: brand?.logoUrl || null,
    musicSrc: form.music ? `/music/${encodeURIComponent(form.music)}` : null,
    voiceSrc: form.voiceMode === 'upload' && form.voiceUpload ? form.voiceUpload.url : null,
    captions: form.captions,
  };
}

export function PreviewPanel({ script, images, form, brand, source, onRendered, autoRender = 0 }) {
  const { t } = useI18n();
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const sourceRef = useRef(null);

  const props = useMemo(() => (script ? previewProps(script, images, form, brand) : null), [script, images, form, brand]);
  const dims = DIMENSIONS[script?.aspect] || DIMENSIONS['9:16'];
  const rendering = job && (job.status === 'queued' || job.status === 'running');

  useEffect(() => () => sourceRef.current?.close(), []);

  // Started from a plan day: render as soon as the scene images are ready.
  useEffect(() => {
    if (autoRender && script && !rendering) render();
  }, [autoRender]); // eslint-disable-line react-hooks/exhaustive-deps

  const render = async () => {
    setError(null);
    setResult(null);
    try {
      const { scenes, ...rest } = script;
      const { jobId } = await api.post('/api/video/render', {
        script: { ...rest, scenes: scenes.map((s) => ({ ...s, durationSec: Number(s.durationSec) })) },
        options: {
          visualStyle: form.visualStyle,
          voiceMode: form.voiceMode === 'upload' && !form.voiceUpload ? 'none' : form.voiceMode,
          voiceUploadId: form.voiceUpload?.id || null,
          voiceName: form.voiceName || null,
          music: form.music || null,
          captions: form.captions,
          source: source ? { planId: source.planId, postId: source.postId } : null,
        },
      });
      setJob({ id: jobId, status: 'queued', stage: 'queued', progress: 0 });
      const es = new EventSource(`/api/video/jobs/${jobId}/events`);
      sourceRef.current = es;
      es.onmessage = (e) => {
        const update = JSON.parse(e.data);
        setJob(update);
        if (update.status === 'done') {
          setResult(update.result);
          onRendered();
          // Lets the planner mark the day as produced.
          if (source) window.dispatchEvent(new CustomEvent('qms:video-rendered', { detail: { planId: source.planId, postId: source.postId } }));
          es.close();
        } else if (update.status === 'error') {
          setError({ messages: update.error.message });
          es.close();
        }
      };
      es.onerror = () => {
        // The stream closes normally after done/error; only report if we never finished.
        es.close();
        setJob((j) => (j && j.status !== 'done' && j.status !== 'error' ? { ...j, status: 'error' } : j));
      };
    } catch (err) {
      setError(err);
    }
  };

  return (
    <section className="card space-y-4 p-5 xl:sticky xl:top-24 xl:self-start">
      <SectionTitle icon={MonitorPlay}>{t('preview')}</SectionTitle>

      {/* The Player's own layout breaks under an RTL page; the video sets its own direction inside. */}
      <div dir="ltr" className="overflow-hidden rounded-xl border border-line bg-black">
        {props ? (
          <Player
            component={BrandVideo}
            inputProps={props}
            durationInFrames={totalFrames(props.script.scenes)}
            fps={FPS}
            compositionWidth={dims.width}
            compositionHeight={dims.height}
            style={{ width: '100%', aspectRatio: `${dims.width} / ${dims.height}`, maxHeight: '62vh' }}
            controls
            loop
            acknowledgeRemotionLicense
          />
        ) : (
          <div
            className="flex aspect-[9/16] max-h-[62vh] w-full items-center justify-center"
            style={{ background: brand ? `linear-gradient(135deg, ${brand.visual.primary}, ${brand.visual.secondary})` : undefined }}
          >
            <Clapperboard className="h-10 w-10 text-white/70" />
          </div>
        )}
      </div>
      {props && <p className="text-xs text-muted">{t('previewNote')}</p>}

      <ErrorBox error={error} onRetry={script && !rendering ? render : null} />

      {rendering && (
        <div className="space-y-2" data-testid="render-progress">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold">
              <Spinner className="h-3.5 w-3.5 text-accent" />
              {t(`stages.${job.stage}`)}
            </span>
            <span className="tabular-nums text-muted">{Math.round(job.progress * 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-raised">
            <div className="h-full rounded-full bg-accent shadow-glow transition-all duration-500" style={{ width: `${Math.max(3, job.progress * 100)}%` }} />
          </div>
          {job.message && <p className="truncate text-xs text-muted">{job.message}</p>}
        </div>
      )}

      <button className="btn-primary w-full" disabled={!script || rendering} onClick={render} data-testid="render">
        {rendering ? <Spinner /> : <Clapperboard className="h-4 w-4" />}
        {rendering ? t('rendering') : t('render')}
      </button>

      {result && (
        <div className="space-y-3 rounded-xl border border-accent/40 bg-accent/5 p-3" data-testid="render-result">
          <video src={`/videos/${result.fileName}`} controls className="w-full rounded-lg" />
          <a className="btn-accent w-full" href={`/api/video/${result.id}/download`} download>
            <Download className="h-4 w-4" />
            {t('download')} · {result.durationSec.toFixed(0)}
            {t('sec')}
          </a>
        </div>
      )}
    </section>
  );
}
