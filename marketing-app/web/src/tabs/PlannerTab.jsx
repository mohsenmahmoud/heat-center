import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarDays, CalendarRange, Copy, FileDown, FileText, Film, Trash2, Wand2 } from 'lucide-react';
import { api, copyText } from '../lib/api.js';
import { useI18n } from '../lib/i18n.jsx';
import { useToast } from '../components/Toasts.jsx';
import { useBrands } from '../lib/brands.jsx';
import { ErrorBox, Field, SectionTitle, Segmented, Spinner } from '../components/ui.jsx';
import { PLATFORM_LABEL, PostCard, postToText } from '../components/planner/PostCard.jsx';

const PLATFORMS = [
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok / Shorts' },
];

/** Next Saturday (or today if it is Saturday) as YYYY-MM-DD in local time. */
function nextSaturday() {
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const SCRIPT_CONCURRENCY = 2;

/**
 * Tab 2: a 7-day video plan. Each day is a video: angle + full script (scenes, voiceover, CTA)
 * that opens in the video generator for rendering. Days can be edited, regenerated, copied and exported.
 */
export default function PlannerTab({ status, onOpenInVideo }) {
  const { t, lang } = useI18n();
  const toast = useToast();
  const { activeId } = useBrands();
  const [form, setForm] = useState({ weekStart: nextSaturday(), platforms: PLATFORMS.map((p) => p.key), language: lang, market: 'both', focus: '', durationSec: 45 });
  const [plan, setPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [scriptBusy, setScriptBusy] = useState(() => new Set());
  const planIdRef = useRef(null);
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    planIdRef.current = plan?.id ?? null;
  }, [plan?.id]);

  const loadPlans = useCallback(() => {
    if (!activeId) return;
    api
      .get(`/api/planner?brandId=${encodeURIComponent(activeId)}`)
      .then((d) => setPlans(d.items))
      .catch(() => {});
  }, [activeId]);
  useEffect(() => {
    loadPlans();
  }, [loadPlans]);
  // Another brand: its own plans, and the open plan (if any) stays with its brand.
  useEffect(() => {
    setPlan((p) => (p && p.brandId !== activeId ? null : p));
  }, [activeId]);

  const generate = async () => {
    setBusy(true);
    setError(null);
    try {
      const created = await api.post('/api/planner/generate', { ...form, brandId: activeId });
      setPlan(created);
      planIdRef.current = created.id;
      loadPlans();
      // The plan's job is videos: write every day's script right away.
      writeScripts(created.id, created.posts.map((p) => p.id));
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const open = async (id) => {
    if (!id) return;
    try {
      setPlan(await api.get(`/api/planner/${id}`));
    } catch (err) {
      toast.error(err);
    }
  };

  const remove = async () => {
    if (!confirm(t('confirmDelete'))) return;
    try {
      await api.del(`/api/planner/${plan.id}`);
      setPlan(null);
      loadPlans();
    } catch (err) {
      toast.error(err);
    }
  };

  const busyFlag = (postId, on) =>
    setScriptBusy((prev) => {
      const next = new Set(prev);
      on ? next.add(postId) : next.delete(postId);
      return next;
    });

  const writeScript = async (planId, postId) => {
    busyFlag(postId, true);
    try {
      const post = await api.post(`/api/planner/${planId}/posts/${postId}/script`);
      // Ignore results for a plan the user has navigated away from.
      if (planIdRef.current === planId) replacePost(post);
    } catch (err) {
      toast.error(err);
    } finally {
      busyFlag(postId, false);
    }
  };

  /** Writes scripts for several days, a couple at a time so the progress is visible and rate limits are respected. */
  const writeScripts = async (planId, postIds) => {
    const queue = [...postIds];
    const worker = async () => {
      while (queue.length) await writeScript(planId, queue.shift());
    };
    await Promise.all(Array.from({ length: SCRIPT_CONCURRENCY }, worker));
  };

  const reloadPlan = useCallback(async (id) => {
    try {
      const fresh = await api.get(`/api/planner/${id}`);
      if (planIdRef.current === id) setPlan(fresh);
    } catch {
      /* the plan may have been deleted */
    }
  }, []);

  // A video rendered from one of this plan's days: refresh to show it as produced.
  useEffect(() => {
    const onRendered = (e) => e.detail?.planId && e.detail.planId === planIdRef.current && reloadPlan(e.detail.planId);
    window.addEventListener('qms:video-rendered', onRendered);
    return () => window.removeEventListener('qms:video-rendered', onRendered);
  }, [reloadPlan]);

  const openInVideo = (post) =>
    onOpenInVideo({
      script: post.script,
      source: { planId: plan.id, postId: post.id, label: `${post.dayName} ${post.date} · ${PLATFORM_LABEL[post.platform]}` },
    });

  const replacePost = (post) => setPlan((p) => ({ ...p, posts: p.posts.map((x) => (x.id === post.id ? post : x)) }));
  const togglePlatform = (key) =>
    set('platforms')(form.platforms.includes(key) ? form.platforms.filter((p) => p !== key) : [...form.platforms, key]);

  const canGenerate = !busy && form.platforms.length > 0 && status?.capabilities?.writer;

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <section className="card h-fit space-y-5 p-5 xl:sticky xl:top-24">
        <SectionTitle icon={CalendarRange}>{t('tabPlanner')}</SectionTitle>
        <Field label={t('weekStart')}>
          <input type="date" className="input" value={form.weekStart} onChange={(e) => set('weekStart')(e.target.value)} />
        </Field>
        <div>
          <span className="label">{t('platforms')}</span>
          <div className="grid grid-cols-2 gap-2">
            {PLATFORMS.map((p) => (
              <label key={p.key} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${form.platforms.includes(p.key) ? 'border-accent/60 bg-accent/10' : 'border-line text-muted'}`}>
                <input type="checkbox" className="h-3.5 w-3.5 accent-[rgb(var(--accent))]" checked={form.platforms.includes(p.key)} onChange={() => togglePlatform(p.key)} />
                {p.label}
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field group label={t('contentLang')}>
            <Segmented value={form.language} onChange={set('language')} options={[{ value: 'ar', label: 'العربية' }, { value: 'en', label: 'English' }]} />
          </Field>
          <Field label={t('market')}>
            <select className="input !py-2" value={form.market} onChange={(e) => set('market')(e.target.value)}>
              <option value="both">{t('both')}</option>
              <option value="egypt">{t('egypt')}</option>
              <option value="gulf">{t('gulf')}</option>
              <option value="global">{t('global')}</option>
            </select>
          </Field>
        </div>
        <Field label={`${t('videoLength')}: ${form.durationSec}${t('sec')}`}>
          <input type="range" min={40} max={60} step={5} value={form.durationSec} onChange={(e) => set('durationSec')(Number(e.target.value))} className="w-full accent-[rgb(var(--accent))]" />
        </Field>
        <Field label={t('focus')}>
          <textarea className="input min-h-[80px] resize-y" placeholder={t('focusPh')} value={form.focus} onChange={(e) => set('focus')(e.target.value)} maxLength={1500} />
        </Field>
        <ErrorBox error={error} onRetry={canGenerate ? generate : null} />
        <button className="btn-accent w-full" disabled={!canGenerate} onClick={generate} data-testid="generate-plan">
          {busy ? <Spinner /> : <Wand2 className="h-4 w-4" />}
          {busy ? t('planning') : t('generatePlan')}
        </button>

        {plans.length > 0 && (
          <Field label={t('previousPlans')}>
            <select className="input" value={plan?.id || ''} onChange={(e) => open(e.target.value)}>
              <option value="">—</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.weekStart} · {p.language.toUpperCase()} · {new Date(p.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB')}
                </option>
              ))}
            </select>
          </Field>
        )}
      </section>

      <section className="min-w-0 space-y-4">
        {busy && !plan && <PlanSkeleton />}
        {!busy && !plan && (
          <div className="card flex min-h-[420px] flex-col items-center justify-center gap-3 p-8 text-center text-sm text-muted">
            <CalendarDays className="h-8 w-8 text-accent/70" />
            {t('emptyPlan')}
          </div>
        )}
        {plan && (
          <>
            <div className={`card flex flex-wrap items-center gap-2 p-3 ${busy ? 'opacity-60' : ''}`}>
              <div className="me-auto px-2">
                <div className="text-sm font-bold">
                  {t('weekStart')}: {plan.weekStart}
                </div>
                <div className="text-xs text-muted">{plan.settings.platforms.map((k) => PLATFORMS.find((p) => p.key === k)?.label).join(' · ')}</div>
              </div>
              <span className="chip" data-testid="scripts-progress">
                <Film className="h-3.5 w-3.5 text-accent" />
                {plan.posts.filter((p) => p.script).length}/{plan.posts.length} {t('scriptsDone')} · {plan.posts.filter((p) => p.videoId).length} {t('videosDone')}
              </span>
              {plan.posts.some((p) => !p.script) && (
                <button
                  className="btn-accent !py-2 text-xs"
                  disabled={scriptBusy.size > 0}
                  onClick={() => writeScripts(plan.id, plan.posts.filter((p) => !p.script && !scriptBusy.has(p.id)).map((p) => p.id))}
                  data-testid="write-all-scripts"
                >
                  {scriptBusy.size > 0 ? <Spinner /> : <Film className="h-4 w-4" />}
                  {t('writeAllScripts')}
                </button>
              )}
              <a className="btn-ghost !py-2 text-xs" href={`/api/planner/${plan.id}/export?format=md`} download data-testid="export-md">
                <FileText className="h-4 w-4" />
                {t('exportMd')}
              </a>
              <a className="btn-ghost !py-2 text-xs" href={`/api/planner/${plan.id}/export?format=docx`} download data-testid="export-docx">
                <FileDown className="h-4 w-4" />
                {t('exportWord')}
              </a>
              <button
                className="btn-ghost !py-2 text-xs"
                onClick={async () => (await copyText(plan.posts.map((p) => postToText(p, true)).join('\n\n———\n\n'))) && toast.success({ ar: 'تم نسخ الخطة كاملة', en: 'Whole plan copied' })}
              >
                <Copy className="h-4 w-4" />
                {t('copyAll')}
              </button>
              <button className="btn-icon hover:!text-danger" onClick={remove} title={t('delete')} aria-label={t('delete')}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="px-1 text-xs text-muted">{t('planIntro')}</p>
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3" data-testid="plan-grid">
              {plan.posts.map((post) => (
                <PostCard
                  key={post.id}
                  planId={plan.id}
                  post={post}
                  onChange={replacePost}
                  scriptBusy={scriptBusy.has(post.id)}
                  onWriteScript={(postId) => writeScript(plan.id, postId)}
                  onOpenInVideo={openInVideo}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function PlanSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3" aria-busy="true">
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} className="card space-y-3 p-4">
          <div className="skeleton h-5 w-1/2" />
          <div className="skeleton h-8" />
          <div className="skeleton h-28" />
          <div className="skeleton h-12" />
        </div>
      ))}
    </div>
  );
}
