import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Clapperboard, Clock, Copy, Download, Film, Mic, RefreshCw, Sparkles } from 'lucide-react';
import { totalSeconds } from '../../../../video/timing.js';
import { api, copyText } from '../../lib/api.js';
import { useI18n } from '../../lib/i18n.jsx';
import { useToast } from '../Toasts.jsx';
import { Field, Spinner, Warnings } from '../ui.jsx';

const PLATFORM_STYLE = {
  linkedin: 'bg-[#0A66C2]/15 text-[#5aa4ef]',
  facebook: 'bg-[#1877F2]/15 text-[#6aa7ff]',
  instagram: 'bg-[#E1306C]/15 text-[#f06d9a]',
  tiktok: 'bg-fg/10 text-fg',
};
export const PLATFORM_LABEL = { linkedin: 'LinkedIn', facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok / Shorts' };

export function postToText(post, withHeader = false) {
  const header = withHeader ? `${post.dayName} ${post.date} · ${PLATFORM_LABEL[post.platform]}\n\n` : '';
  return `${header}${post.hook}\n\n${post.caption}\n\n${post.cta}\n\n${post.hashtags.join(' ')}`;
}

export const voiceoverOf = (script) => script.scenes.map((s) => s.voiceover).filter(Boolean).join('\n');

const EDITABLE = ['hook', 'caption', 'visualIdea', 'hashtags', 'cta', 'format', 'bestTime'];
const PREVIEW_SCENES = 3;

/** One day of the plan: the video's hook, its full script, and the caption it is published with. */
export function PostCard({ planId, post, onChange, scriptBusy, onWriteScript, onOpenInVideo }) {
  const { t } = useI18n();
  const toast = useToast();
  const [draft, setDraft] = useState(post);
  const [saveState, setSaveState] = useState('idle');
  const [regenOpen, setRegenOpen] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [allScenes, setAllScenes] = useState(false);
  const timer = useRef(null);

  useEffect(() => setDraft(post), [post]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const save = async (next) => {
    setSaveState('saving');
    try {
      const body = Object.fromEntries(EDITABLE.map((k) => [k, next[k]]));
      const saved = await api.put(`/api/planner/${planId}/posts/${post.id}`, body);
      onChange(saved);
      setSaveState('saved');
    } catch (err) {
      setSaveState('idle');
      toast.error(err);
    }
  };

  // Autosave 800 ms after the last keystroke.
  const edit = (key, value) => {
    const next = { ...draft, [key]: value };
    setDraft(next);
    setSaveState('dirty');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => save(next), 800);
  };

  const regenerate = async () => {
    setRegenerating(true);
    try {
      const fresh = await api.post(`/api/planner/${planId}/posts/${post.id}/regenerate`, { instruction });
      onChange(fresh);
      setRegenOpen(false);
      setInstruction('');
      // A new angle needs a new video script.
      onWriteScript(fresh.id);
    } catch (err) {
      toast.error(err);
    } finally {
      setRegenerating(false);
    }
  };

  const script = post.script;
  const scenes = script ? (allScenes ? script.scenes : script.scenes.slice(0, PREVIEW_SCENES)) : [];

  return (
    <article className={`card flex flex-col gap-3 p-4 transition ${regenerating ? 'animate-pulse opacity-70' : ''}`} data-testid="post-card">
      <header className="flex flex-wrap items-center gap-2">
        <div className="me-auto">
          <div className="text-sm font-bold">{post.dayName}</div>
          <div className="text-[11px] tabular-nums text-muted">{post.date}</div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${PLATFORM_STYLE[post.platform]}`}>{PLATFORM_LABEL[post.platform]}</span>
        <span className="chip !text-[11px]">
          <Sparkles className="h-3 w-3 text-accent" />
          {t(`pillars.${post.pillar}`)}
        </span>
      </header>

      <Field label={t('hook')}>
        <textarea className="input min-h-[52px] resize-y font-semibold" rows={2} value={draft.hook} onChange={(e) => edit('hook', e.target.value)} />
      </Field>

      {/* The day's video script: the heart of the plan. */}
      <section className="space-y-2.5 rounded-xl border border-accent/30 bg-accent/5 p-3" data-testid="day-script">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-accent">
            <Film className="h-4 w-4" />
            {t('videoScript')}
          </span>
          {script && (
            <span className="chip !py-0.5 !text-[11px]">
              {script.scenes.length} {t('scenes')} · {Math.round(totalSeconds(script.scenes))}
              {t('sec')}
            </span>
          )}
          {post.videoId && (
            <span className="chip !border-accent/50 !py-0.5 !text-[11px] text-accent" data-testid="produced">
              <Check className="h-3 w-3" />
              {t('produced')}
            </span>
          )}
        </div>

        {scriptBusy ? (
          <div className="space-y-2" aria-busy="true">
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <Spinner className="h-3.5 w-3.5 text-accent" />
              {t('writingScript')}
            </p>
            <div className="skeleton h-10" />
            <div className="skeleton h-10" />
          </div>
        ) : !script ? (
          <button className="btn-accent w-full !py-2 text-xs" onClick={() => onWriteScript(post.id)} data-testid="write-day-script">
            <Film className="h-4 w-4" />
            {t('writeScript')}
          </button>
        ) : (
          <>
            <ol className="space-y-1.5">
              {scenes.map((s, i) => (
                <li key={s.id} className="rounded-lg bg-surface/70 px-2.5 py-2 text-xs">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-muted tabular-nums">{i + 1}</span>
                    <span className="rounded bg-raised px-1 text-[10px] text-muted">{t(`types.${s.type}`)}</span>
                    <span className="font-semibold">{s.headline}</span>
                  </div>
                  {s.voiceover && (
                    <p className="mt-1 flex gap-1 text-muted">
                      <Mic className="mt-0.5 h-3 w-3 shrink-0" />
                      <span className="line-clamp-2">{s.voiceover}</span>
                    </p>
                  )}
                </li>
              ))}
            </ol>
            {script.scenes.length > PREVIEW_SCENES && (
              <button className="text-[11px] font-semibold text-accent hover:underline" onClick={() => setAllScenes((v) => !v)}>
                {allScenes ? t('showLess') : `${t('showAllScenes')} (${script.scenes.length})`}
              </button>
            )}
            <div className="flex flex-wrap gap-1.5">
              <button className="btn-primary flex-1 !py-2 text-xs" onClick={() => onOpenInVideo(post)} data-testid="open-in-video">
                <Clapperboard className="h-3.5 w-3.5" />
                {t('openInVideo')}
              </button>
              <button
                className="btn-ghost !px-2.5 !py-2 text-xs"
                onClick={async () => (await copyText(voiceoverOf(script))) && toast.success({ ar: 'تم نسخ نص التعليق الصوتي. سجّله بصوتك.', en: 'Voiceover text copied. Record it in your voice.' })}
                title={t('copyVoiceover')}
              >
                <Mic className="h-3.5 w-3.5" />
                {t('copyVoiceover')}
              </button>
              <button className="btn-icon !h-auto" onClick={() => onWriteScript(post.id)} title={t('rewriteScript')} aria-label={t('rewriteScript')}>
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
            {post.videoId && (
              <a className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline" href={`/api/video/${post.videoId}/download`} download>
                <Download className="h-3.5 w-3.5" />
                {t('downloadVideo')}
              </a>
            )}
          </>
        )}
      </section>

      <details className="group rounded-xl border border-line">
        <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-xs font-semibold text-muted">
          {t('publishDetails')}
          <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
        </summary>
        <div className="space-y-3 border-t border-line p-3">
          <div className="grid grid-cols-2 gap-2">
            <Field label={t('format')}>
              <input className="input !py-1.5 text-xs" value={draft.format} onChange={(e) => edit('format', e.target.value)} />
            </Field>
            <Field label={t('bestTime')}>
              <div className="relative">
                <Clock className="pointer-events-none absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                <input className="input !py-1.5 !ps-8 text-xs tabular-nums" dir="ltr" value={draft.bestTime} onChange={(e) => edit('bestTime', e.target.value)} />
              </div>
            </Field>
          </div>
          <Field label={t('captionField')}>
            <textarea className="input min-h-[150px] resize-y leading-relaxed" value={draft.caption} onChange={(e) => edit('caption', e.target.value)} />
          </Field>
          <Field label={t('visualIdea')}>
            <textarea className="input min-h-[60px] resize-y text-xs" value={draft.visualIdea} onChange={(e) => edit('visualIdea', e.target.value)} />
          </Field>
          <Field label={t('ctaField')}>
            <input className="input" value={draft.cta} onChange={(e) => edit('cta', e.target.value)} />
          </Field>
          <Field label={t('hashtags')}>
            <input className="input text-accent" value={draft.hashtags.join(' ')} onChange={(e) => edit('hashtags', e.target.value.split(/\s+/).filter(Boolean).slice(0, 15))} />
          </Field>
        </div>
      </details>

      <Warnings items={post.warnings} />

      {regenOpen && (
        <div className="space-y-2 rounded-xl border border-line bg-raised/50 p-2.5">
          <input className="input text-xs" placeholder={t('regenHint')} value={instruction} onChange={(e) => setInstruction(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && regenerate()} autoFocus maxLength={500} />
          <button className="btn-accent w-full !py-2 text-xs" onClick={regenerate} disabled={regenerating}>
            {regenerating ? <Spinner className="h-3.5 w-3.5" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {t('regenPost')}
          </button>
        </div>
      )}

      <footer className="mt-auto flex items-center gap-2 pt-1">
        <span className="me-auto flex items-center gap-1 text-[11px] text-muted" aria-live="polite">
          {saveState === 'saving' && (
            <>
              <Spinner className="h-3 w-3" /> {t('saving')}
            </>
          )}
          {saveState === 'saved' && (
            <>
              <Check className="h-3 w-3 text-accent" /> {t('saved')}
            </>
          )}
        </span>
        <button className="btn-ghost !px-2.5 !py-1.5 text-xs" onClick={() => setRegenOpen((o) => !o)} disabled={regenerating} data-testid="regen">
          <RefreshCw className="h-3.5 w-3.5" />
          {t('regenPost')}
        </button>
        <button className="btn-ghost !px-2.5 !py-1.5 text-xs" onClick={async () => (await copyText(postToText(draft))) && toast.success({ ar: 'تم النسخ', en: 'Copied' })}>
          <Copy className="h-3.5 w-3.5" />
          {t('copy')}
        </button>
      </footer>
    </article>
  );
}
