import React, { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Clock, Copy, FileText, Plus, Trash2, Volume2 } from 'lucide-react';
import { SceneVisual } from './SceneVisual.jsx';
import { totalSeconds, MIN_TOTAL_SEC, MAX_TOTAL_SEC } from '../../../../video/timing.js';
import { api, copyText } from '../../lib/api.js';
import { useI18n } from '../../lib/i18n.jsx';
import { useToast } from '../Toasts.jsx';
import { Field, SectionTitle, Spinner, Warnings } from '../ui.jsx';

const TYPES = ['hook', 'pain', 'solution', 'feature', 'proof', 'cta'];
const TRANSITIONS = ['fade', 'slide', 'wipe', 'flip'];

export function ScriptEditor({ script, setScript, images, visuals, imagesOn, voiceMode, voiceName, voiceRate = 1.1, warnings, writing }) {
  const { t } = useI18n();
  const toast = useToast();
  const [speaking, setSpeaking] = useState(null);
  const audio = useRef(null);

  // Speaks one scene's line with the chosen AI voice (the server caches it, so rendering reuses the clip).
  const listen = async (scene) => {
    audio.current?.pause();
    setSpeaking(scene.id);
    try {
      const { url } = await api.post('/api/video/voice-preview', { text: scene.voiceover, language: script.language, voiceName });
      const a = new Audio(url);
      a.playbackRate = voiceRate;
      audio.current = a;
      a.onended = () => setSpeaking(null);
      await a.play();
    } catch (err) {
      toast.error(err);
      setSpeaking(null);
    }
  };

  if (writing && !script) return <EditorSkeleton />;
  if (!script) {
    return (
      <section className="card flex min-h-[420px] flex-col items-center justify-center gap-3 p-8 text-center text-sm text-muted">
        <FileText className="h-8 w-8 text-accent/70" />
        <p className="max-w-xs">{t('topicPh')}</p>
      </section>
    );
  }

  const total = totalSeconds(script.scenes);
  const inRange = total >= MIN_TOTAL_SEC - 0.5 && total <= MAX_TOTAL_SEC + 0.5;
  const update = (patch) => setScript((s) => ({ ...s, ...patch }));
  const updateScene = (i, patch) => setScript((s) => ({ ...s, scenes: s.scenes.map((sc, j) => (j === i ? { ...sc, ...patch } : sc)) }));
  const move = (i, dir) =>
    setScript((s) => {
      const scenes = [...s.scenes];
      [scenes[i], scenes[i + dir]] = [scenes[i + dir], scenes[i]];
      return { ...s, scenes };
    });
  const remove = (i) => setScript((s) => ({ ...s, scenes: s.scenes.filter((_, j) => j !== i) }));
  const add = () =>
    setScript((s) => {
      const scenes = [...s.scenes];
      const at = scenes.at(-1)?.type === 'cta' ? scenes.length - 1 : scenes.length;
      scenes.splice(at, 0, { id: `s${Date.now()}`, type: 'feature', headline: '', subtext: '', bullets: [], durationSec: 6, transition: 'fade', stockQuery: '', visualIdea: '', voiceover: '', imageId: null });
      return { ...s, scenes };
    });

  return (
    <section className={`card space-y-4 p-5 ${writing ? 'pointer-events-none opacity-60' : ''}`}>
      <SectionTitle
        icon={FileText}
        right={
          <span className={`chip ${inRange ? 'text-accent' : 'border-warn/50 text-warn'}`} title={inRange ? '' : t('outOfRange')}>
            <Clock className="h-3.5 w-3.5" />
            {t('total')}: {total.toFixed(1)}
            {t('sec')}
          </span>
        }
      >
        {t('script')}
      </SectionTitle>

      <input className="input font-semibold" value={script.title} onChange={(e) => update({ title: e.target.value })} aria-label="title" />
      {visuals?.progress && (
        <div className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-xs" data-testid="visuals-progress">
          <Spinner className="h-3.5 w-3.5 text-accent" />
          {t('makingImages')} {visuals.progress.done}/{visuals.progress.total}
        </div>
      )}
      <Warnings items={warnings} />

      <ol className="space-y-3">
        {script.scenes.map((scene, i) => (
          <li key={scene.id} className="rounded-xl border border-line bg-raised/40 p-3.5" data-testid="scene">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-fg text-[11px] font-bold text-bg">{i + 1}</span>
              <select className="input !w-auto !py-1 text-xs" value={scene.type} onChange={(e) => updateScene(i, { type: e.target.value })} aria-label="type">
                {TYPES.map((ty) => (
                  <option key={ty} value={ty}>
                    {t(`types.${ty}`)}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-1 text-xs text-muted">
                <Clock className="h-3.5 w-3.5" />
                <input type="number" min={2} max={15} step={0.5} className="input !w-16 !px-2 !py-1 text-xs" value={scene.durationSec} onChange={(e) => updateScene(i, { durationSec: Math.max(1, Number(e.target.value) || 1) })} aria-label="duration" />
              </label>
              <select className="input !w-auto !py-1 text-xs" value={scene.transition} onChange={(e) => updateScene(i, { transition: e.target.value })} title={t('transition')} aria-label={t('transition')}>
                {TRANSITIONS.map((tr) => (
                  <option key={tr} value={tr}>
                    ↪ {tr}
                  </option>
                ))}
              </select>
              <div className="ms-auto flex gap-1">
                {voiceMode === 'ai' && scene.voiceover && (
                  <button className="btn-icon !h-7 !w-auto gap-1 !px-2 text-[11px]" onClick={() => listen(scene)} disabled={speaking === scene.id} title={t('listen')} data-testid="listen">
                    {speaking === scene.id ? <Spinner className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                    {t('listen')}
                  </button>
                )}
                <button className="btn-icon !h-7 !w-7" disabled={i === 0} onClick={() => move(i, -1)} aria-label="up">
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button className="btn-icon !h-7 !w-7" disabled={i === script.scenes.length - 1} onClick={() => move(i, 1)} aria-label="down">
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button className="btn-icon !h-7 !w-7 hover:!text-danger" disabled={script.scenes.length <= 2} onClick={() => remove(i)} aria-label={t('delete')}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <Field label={t('headline')} className="sm:col-span-2">
                <input className="input" value={scene.headline} onChange={(e) => updateScene(i, { headline: e.target.value })} />
              </Field>
              <Field label={t('subtext')} className="sm:col-span-2">
                <textarea className="input min-h-[52px] resize-y" rows={2} value={scene.subtext} onChange={(e) => updateScene(i, { subtext: e.target.value })} />
              </Field>
              <Field label={t('bullets')} className="sm:col-span-2">
                <input className="input" value={scene.bullets.join('، ')} onChange={(e) => updateScene(i, { bullets: e.target.value.split(/[,،]/).map((b) => b.trim()).filter(Boolean).slice(0, 6) })} />
              </Field>
              {voiceMode !== 'none' && (
                <Field label={t('voiceover')} className="sm:col-span-2">
                  <textarea className="input min-h-[52px] resize-y" rows={2} value={scene.voiceover} onChange={(e) => updateScene(i, { voiceover: e.target.value })} />
                </Field>
              )}
            </div>
            {scene.type !== 'cta' && <SceneVisual scene={scene} images={images} visuals={visuals} imagesOn={imagesOn} language={script.language} />}
          </li>
        ))}
      </ol>

      <button className="btn-ghost w-full text-xs" onClick={add} disabled={script.scenes.length >= 12}>
        <Plus className="h-4 w-4" />
        {t('addScene')}
      </button>

      <div className="rounded-xl border border-accent/30 bg-accent/5 p-3.5">
        <span className="label !text-accent">{t('cta')}</span>
        <div className="grid gap-2.5 sm:grid-cols-3">
          <Field label={t('ctaHeadline')}>
            <input className="input" value={script.cta.headline} onChange={(e) => update({ cta: { ...script.cta, headline: e.target.value } })} />
          </Field>
          <Field label={t('ctaButton')}>
            <input className="input" value={script.cta.button} onChange={(e) => update({ cta: { ...script.cta, button: e.target.value } })} />
          </Field>
          <Field label={t('ctaContact')}>
            <input className="input" dir="ltr" value={script.cta.contact} onChange={(e) => update({ cta: { ...script.cta, contact: e.target.value } })} />
          </Field>
        </div>
      </div>

      {script.caption && (
        <div className="rounded-xl border border-line p-3.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="label !mb-0">{t('caption')}</span>
            <button
              className="btn-ghost !px-2.5 !py-1 text-xs"
              onClick={async () => (await copyText(`${script.caption}\n\n${script.hashtags.join(' ')}`)) && toast.success({ ar: 'تم النسخ', en: 'Copied' })}
            >
              <Copy className="h-3.5 w-3.5" />
              {t('copy')}
            </button>
          </div>
          <textarea className="input min-h-[72px] resize-y" value={script.caption} onChange={(e) => update({ caption: e.target.value })} />
          <p className="mt-1.5 text-xs text-accent">{script.hashtags.join(' ')}</p>
        </div>
      )}
    </section>
  );
}

function EditorSkeleton() {
  return (
    <section className="card space-y-3 p-5" aria-busy="true">
      <div className="skeleton h-6 w-1/3" />
      <div className="skeleton h-10" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="skeleton h-28" />
      ))}
    </section>
  );
}
