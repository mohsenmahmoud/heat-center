import React, { useCallback, useEffect, useState } from 'react';
import { CalendarDays, CalendarRange, Copy, FileDown, FileText, Trash2, Wand2 } from 'lucide-react';
import { api, copyText } from '../lib/api.js';
import { useI18n } from '../lib/i18n.jsx';
import { useToast } from '../components/Toasts.jsx';
import { ErrorBox, Field, SectionTitle, Segmented, Spinner } from '../components/ui.jsx';
import { PostCard, postToText } from '../components/planner/PostCard.jsx';

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

/** Tab 2: 7-day plan with per-day editing, regenerating, copying and Markdown/Word export. */
export default function PlannerTab({ status }) {
  const { t, lang } = useI18n();
  const toast = useToast();
  const [form, setForm] = useState({ weekStart: nextSaturday(), platforms: PLATFORMS.map((p) => p.key), language: lang, market: 'both', focus: '' });
  const [plan, setPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const loadPlans = useCallback(() => api.get('/api/planner').then((d) => setPlans(d.items)).catch(() => {}), []);
  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const generate = async () => {
    setBusy(true);
    setError(null);
    try {
      const created = await api.post('/api/planner/generate', form);
      setPlan(created);
      loadPlans();
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
            </select>
          </Field>
        </div>
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
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3" data-testid="plan-grid">
              {plan.posts.map((post) => (
                <PostCard key={post.id} planId={plan.id} post={post} onChange={replacePost} />
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
