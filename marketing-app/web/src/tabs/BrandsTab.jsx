import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Player } from '@remotion/player';
import { Check, Globe, ImagePlus, MonitorPlay, Palette, Plus, Save, Sparkles, Trash2, Wand2, X } from 'lucide-react';
import { BrandVideo } from '../../../video/BrandVideo.jsx';
import { ARABIC_FONTS, DEFAULT_VISUAL, LATIN_FONTS, LOOKS } from '../../../video/brand-theme.js';
import { FPS, totalFrames } from '../../../video/timing.js';
import { api } from '../lib/api.js';
import { useI18n } from '../lib/i18n.jsx';
import { brandLabel, useBrands } from '../lib/brands.jsx';
import { useToast } from '../components/Toasts.jsx';
import { ErrorBox, Field, SectionTitle, Segmented, Spinner } from '../components/ui.jsx';

const PALETTES = [
  { name: 'Green', colors: ['#40A664', '#226E3D', '#3DAA63', '#1D2A22', '#EAF6EE'] },
  { name: 'Ocean', colors: ['#2F6FED', '#173C8C', '#38BDF8', '#0F172A', '#E6EEFF'] },
  { name: 'Royal', colors: ['#7C3AED', '#4C1D95', '#F59E0B', '#1E1B2E', '#F1EAFE'] },
  { name: 'Sunset', colors: ['#F97316', '#B4410C', '#FACC15', '#24160E', '#FFF1E6'] },
  { name: 'Rose', colors: ['#E11D48', '#881337', '#FB7185', '#2A1018', '#FFE4EA'] },
  { name: 'Teal', colors: ['#0D9488', '#115E59', '#5EEAD4', '#0F1F1E', '#E0F7F4'] },
  { name: 'Gold', colors: ['#C8A24A', '#7A5C1C', '#E9D18A', '#141210', '#F7F0DF'] },
  { name: 'Mono', colors: ['#1F2937', '#030712', '#6366F1', '#0B0B0F', '#F3F4F6'] },
];
const COLOR_KEYS = ['primary', 'secondary', 'accent', 'dark', 'light'];

const lines = (text) =>
  String(text || '')
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);

/** Brand (API shape) → editable form (lists as text). */
function toForm(brand) {
  return {
    id: brand?.id || null,
    logoUrl: brand?.logoUrl || null,
    name: { ar: brand?.name?.ar || '', en: brand?.name?.en || '' },
    tagline: { ar: brand?.tagline?.ar || '', en: brand?.tagline?.en || '' },
    category: brand?.category || '',
    website: brand?.website || '',
    contact: brand?.contact || '',
    description: brand?.description || '',
    audience: brand?.audience || '',
    features: brand?.features || '',
    voice: brand?.voice || '',
    glossary: brand?.glossary || '',
    rules: brand?.rules || '',
    ctasAr: (brand?.ctas?.ar || []).join('\n'),
    ctasEn: (brand?.ctas?.en || []).join('\n'),
    hashtags: (brand?.hashtags || []).join(' '),
    banned: (brand?.banned || []).join('\n'),
    // A new brand starts on a palette that is clearly not the first brand's.
    visual: brand ? { ...DEFAULT_VISUAL, ...brand.visual } : { ...DEFAULT_VISUAL, ...Object.fromEntries(COLOR_KEYS.map((k, i) => [k, PALETTES[1].colors[i]])), fontArabic: 'cairo' },
  };
}

/** Editable form → BrandInput for the API. */
function toInput(form) {
  return {
    name: form.name,
    tagline: form.tagline,
    category: form.category,
    website: form.website.trim(),
    contact: form.contact.trim(),
    description: form.description,
    audience: form.audience,
    features: form.features,
    voice: form.voice,
    glossary: form.glossary,
    rules: form.rules,
    ctas: { ar: lines(form.ctasAr).slice(0, 6), en: lines(form.ctasEn).slice(0, 6) },
    hashtags: form.hashtags
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((h) => (h.startsWith('#') ? h : `#${h}`))
      .slice(0, 10),
    banned: lines(form.banned).slice(0, 60),
    visual: form.visual,
  };
}

/** A short sample video in the brand's style, so colour, look and font choices are visible at once. */
function sampleScript(form, lang) {
  const name = form.name[lang] || form.name.en || form.name.ar || (lang === 'ar' ? 'اسم البراند' : 'Brand name');
  const ar = lang === 'ar';
  const cta = lines(ar ? form.ctasAr : form.ctasEn)[0] || (ar ? 'تواصل معنا' : 'Get in touch');
  const scene = (id, type, headline, subtext = '', bullets = [], durationSec = 3.5) => ({ id, type, headline, subtext, bullets, durationSec, transition: 'slide', visual: { kind: 'gradient' } });
  return {
    title: 'Preview',
    language: lang,
    aspect: '9:16',
    cta: { headline: cta, button: cta, contact: [form.website, form.contact].filter(Boolean).join('  ·  ') },
    scenes: [
      scene('p1', 'hook', ar ? 'نفس المشكلة كل يوم؟' : 'Same problem every day?', ar ? 'خليك معانا 30 ثانية' : 'Give us 30 seconds'),
      scene('p2', 'pain', ar ? 'وقت ضايع ومجهود يدوي' : 'Lost time, manual work', '', ar ? ['متابعة يدوية', 'نتائج متفرقة'] : ['Manual follow-up', 'Scattered results']),
      scene('p3', 'solution', `${name}`, form.tagline[lang] || form.tagline.en || form.tagline.ar, ar ? ['أسرع', 'أوضح'] : ['Faster', 'Clearer']),
      scene('p4', 'proof', ar ? 'ساعات من الشغل' : 'Hours of work', ar ? 'دقائق وخلاص' : 'Done in minutes'),
      scene('p5', 'cta', ar ? `جرّب ${name}` : `Try ${name}`, '', [], 4),
    ],
  };
}

export default function BrandsTab() {
  const { t, lang } = useI18n();
  const toast = useToast();
  const { brands, activeId, setActiveId, upsert, drop } = useBrands();
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [pendingLogo, setPendingLogo] = useState(null);
  const [draft, setDraft] = useState({ url: '', notes: '' });
  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState(null);
  const [siteColors, setSiteColors] = useState([]);
  const logoInput = useRef(null);

  // Start on the brand in use.
  useEffect(() => {
    if (!form && brands.length) open(brands.find((b) => b.id === activeId) || brands[0]);
  }, [brands, activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const pendingLogoUrl = useMemo(() => (pendingLogo ? URL.createObjectURL(pendingLogo) : null), [pendingLogo]);
  useEffect(() => () => pendingLogoUrl && URL.revokeObjectURL(pendingLogoUrl), [pendingLogoUrl]);

  const confirmLeave = () => !dirty || confirm(t('unsavedLeave'));

  const open = (brand) => {
    setSelected(brand?.id || null);
    setForm(toForm(brand));
    setPendingLogo(null);
    setDirty(false);
    setError(null);
    setSiteColors([]);
  };

  const update = (fn) => {
    setForm((f) => fn(f));
    setDirty(true);
  };
  const set = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    update((f) => ({ ...f, [key]: value }));
  };
  const setPair = (key, side) => (e) => update((f) => ({ ...f, [key]: { ...f[key], [side]: e.target.value } }));
  const setVisual = (key) => (value) => update((f) => ({ ...f, visual: { ...f.visual, [key]: value } }));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      let brand = form.id ? await api.put(`/api/brands/${form.id}`, toInput(form)) : await api.post('/api/brands', toInput(form));
      if (pendingLogo) {
        const body = new FormData();
        body.append('file', pendingLogo);
        brand = await api.post(`/api/brands/${brand.id}/logo`, body);
      }
      upsert(brand);
      if (!form.id) setActiveId(brand.id);
      open(brand);
      toast.success(t('brandSaved'));
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!form.id || !confirm(t('confirmDeleteBrand'))) return;
    try {
      await api.del(`/api/brands/${form.id}`);
      drop(form.id);
      const next = brands.find((b) => b.id !== form.id);
      if (activeId === form.id && next) setActiveId(next.id);
      open(next);
    } catch (err) {
      toast.error(err);
    }
  };

  const changeLogo = async (file) => {
    if (!file) return;
    if (!form.id) {
      setPendingLogo(file);
      setDirty(true);
      return;
    }
    try {
      const body = new FormData();
      body.append('file', file);
      const brand = await api.post(`/api/brands/${form.id}/logo`, body);
      upsert(brand);
      setForm((f) => ({ ...f, logoUrl: brand.logoUrl }));
    } catch (err) {
      toast.error(err);
    }
  };

  const removeLogo = async () => {
    if (pendingLogo) return setPendingLogo(null);
    try {
      const brand = await api.del(`/api/brands/${form.id}/logo`);
      upsert(brand);
      setForm((f) => ({ ...f, logoUrl: null }));
    } catch (err) {
      toast.error(err);
    }
  };

  const makeDraft = async () => {
    if (!confirmLeave()) return;
    setDrafting(true);
    setDraftError(null);
    try {
      const data = await api.post('/api/brands/draft', { ...draft, language: lang });
      setSelected(null);
      setForm(toForm(data.draft));
      setPendingLogo(null);
      setSiteColors(data.siteColors || []);
      setDirty(true);
      toast.success(t('draftReady'));
    } catch (err) {
      setDraftError(err);
    } finally {
      setDrafting(false);
    }
  };

  const previewLang = lang;
  const previewProps = useMemo(
    () =>
      form && {
        script: sampleScript(form, previewLang),
        mediaBase: '',
        brand: { name: form.name, website: form.website, visual: form.visual },
        logoSrc: pendingLogoUrl || form.logoUrl,
        musicSrc: null,
        voiceSrc: null,
        captions: false,
      },
    [form, previewLang, pendingLogoUrl],
  );

  const logoShown = pendingLogoUrl || form?.logoUrl;
  const canSave = form && (form.name.ar.trim() || form.name.en.trim()) && !saving;

  return (
    <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_minmax(300px,360px)]">
      {/* Brand list + AI draft */}
      <section className="space-y-4">
        <div className="card space-y-3 p-4">
          <SectionTitle icon={Palette}>{t('brands')}</SectionTitle>
          <div className="space-y-2" data-testid="brand-list">
            {brands.map((b) => (
              <button
                key={b.id}
                onClick={() => confirmLeave() && open(b)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-start transition ${selected === b.id ? 'border-accent/60 bg-accent/10' : 'border-line hover:border-accent/40'}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg" style={{ background: `linear-gradient(135deg, ${b.visual.primary}, ${b.visual.secondary})` }}>
                  {b.logoUrl ? <img src={b.logoUrl} alt="" className="h-5 max-w-[26px] object-contain" /> : <span className="text-sm font-bold text-white">{brandLabel(b, lang).slice(0, 1)}</span>}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{brandLabel(b, lang)}</span>
                  <span className="flex gap-1 pt-1">
                    {COLOR_KEYS.map((k) => (
                      <span key={k} className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ background: b.visual[k] }} />
                    ))}
                  </span>
                </span>
                {activeId === b.id && (
                  <span className="chip !px-2 !py-0.5 text-[10px]">
                    <Check className="h-3 w-3 text-accent" />
                    {t('inUse')}
                  </span>
                )}
              </button>
            ))}
          </div>
          <button className="btn-ghost w-full text-xs" onClick={() => confirmLeave() && open(null)} data-testid="new-brand">
            <Plus className="h-4 w-4" />
            {t('newBrand')}
          </button>
        </div>

        <div className="card space-y-3 p-4">
          <SectionTitle icon={Sparkles}>{t('brandFromSite')}</SectionTitle>
          <p className="text-xs text-muted">{t('brandFromSiteHint')}</p>
          <input className="input" dir="ltr" type="url" placeholder="https://example.com" value={draft.url} onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))} data-testid="draft-url" />
          <textarea className="input min-h-[80px] resize-y" placeholder={t('briefPh')} value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} maxLength={3000} data-testid="draft-notes" />
          <ErrorBox error={draftError} />
          <button className="btn-accent w-full" disabled={drafting || !(draft.url.trim() || draft.notes.trim())} onClick={makeDraft} data-testid="draft-brand">
            {drafting ? <Spinner /> : <Wand2 className="h-4 w-4" />}
            {drafting ? t('drafting') : t('draftBrand')}
          </button>
        </div>
      </section>

      {/* Editor */}
      {form ? (
        <section className="card min-w-0 space-y-6 p-5" data-testid="brand-editor">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="me-auto text-base font-bold">
              {form.id ? brandLabel(form, lang) || t('newBrand') : t('newBrand')}
              {dirty && <span className="ms-2 text-xs font-normal text-warn">● {t('unsaved')}</span>}
            </h2>
            {form.id && activeId !== form.id && (
              <button className="btn-ghost !py-2 text-xs" onClick={() => setActiveId(form.id)} data-testid="use-brand">
                <Check className="h-4 w-4" />
                {t('useBrand')}
              </button>
            )}
            {form.id && (
              <button className="btn-icon hover:!text-danger" onClick={remove} title={t('deleteBrand')} aria-label={t('deleteBrand')}>
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Identity */}
          <div className="space-y-3">
            <h3 className="label !mb-0 flex items-center gap-1.5 text-accent">
              <Globe className="h-3.5 w-3.5" />
              {t('identity')}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t('nameAr')}>
                <input className="input" dir="rtl" value={form.name.ar} onChange={setPair('name', 'ar')} maxLength={80} data-testid="brand-name-ar" />
              </Field>
              <Field label={t('nameEn')}>
                <input className="input" dir="ltr" value={form.name.en} onChange={setPair('name', 'en')} maxLength={80} data-testid="brand-name-en" />
              </Field>
              <Field label={t('taglineAr')}>
                <input className="input" dir="rtl" value={form.tagline.ar} onChange={setPair('tagline', 'ar')} maxLength={200} />
              </Field>
              <Field label={t('taglineEn')}>
                <input className="input" dir="ltr" value={form.tagline.en} onChange={setPair('tagline', 'en')} maxLength={200} />
              </Field>
              <Field label={t('website')}>
                <input className="input" dir="ltr" placeholder="example.com" value={form.website} onChange={set('website')} maxLength={120} />
              </Field>
              <Field label={t('contactField')}>
                <input className="input" dir="ltr" placeholder="+20 100 000 0000" value={form.contact} onChange={set('contact')} maxLength={120} />
              </Field>
            </div>
            <Field label={t('category')} hint={t('categoryHint')}>
              <input className="input" value={form.category} onChange={set('category')} maxLength={300} placeholder={t('categoryPh')} />
            </Field>
            <div>
              <span className="label">{t('logo')}</span>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-16 w-28 items-center justify-center overflow-hidden rounded-xl border border-line" style={{ background: `linear-gradient(135deg, ${form.visual.primary}, ${form.visual.secondary})` }}>
                  {logoShown ? <img src={logoShown} alt="" className="max-h-10 max-w-[90px] object-contain" /> : <span className="text-xs text-white/80">{t('noLogo')}</span>}
                </div>
                <button className="btn-ghost !py-2 text-xs" onClick={() => logoInput.current?.click()}>
                  <ImagePlus className="h-4 w-4" />
                  {t('uploadLogo')}
                </button>
                {logoShown && (
                  <button className="btn-ghost !py-2 text-xs" onClick={removeLogo}>
                    <X className="h-4 w-4" />
                    {t('removeLogo')}
                  </button>
                )}
                <input ref={logoInput} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => changeLogo(e.target.files[0]).finally(() => (e.target.value = ''))} data-testid="logo-input" />
              </div>
              <span className="mt-1 block text-xs text-muted">{t('logoHint')}</span>
            </div>
          </div>

          {/* Product & audience */}
          <div className="space-y-3">
            <h3 className="label !mb-0 text-accent">{t('productAudience')}</h3>
            <Field label={t('description')}>
              <textarea className="input min-h-[72px] resize-y" value={form.description} onChange={set('description')} maxLength={3000} placeholder={t('descriptionPh')} data-testid="brand-description" />
            </Field>
            <Field label={t('audience')}>
              <textarea className="input min-h-[60px] resize-y" value={form.audience} onChange={set('audience')} maxLength={1500} placeholder={t('audiencePh')} />
            </Field>
            <Field label={t('features')} hint={t('featuresHint')}>
              <textarea className="input min-h-[110px] resize-y" value={form.features} onChange={set('features')} maxLength={4000} placeholder={t('featuresPh')} />
            </Field>
          </div>

          {/* Voice */}
          <div className="space-y-3">
            <h3 className="label !mb-0 text-accent">{t('voiceStyle')}</h3>
            <Field label={t('voiceRules')}>
              <textarea className="input min-h-[96px] resize-y" value={form.voice} onChange={set('voice')} maxLength={3000} placeholder={t('voicePh')} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t('ctasAr')} hint={t('onePerLine')}>
                <textarea className="input min-h-[80px] resize-y" dir="rtl" value={form.ctasAr} onChange={set('ctasAr')} />
              </Field>
              <Field label={t('ctasEn')} hint={t('onePerLine')}>
                <textarea className="input min-h-[80px] resize-y" dir="ltr" value={form.ctasEn} onChange={set('ctasEn')} />
              </Field>
            </div>
            <Field label={t('hashtags')}>
              <input className="input" value={form.hashtags} onChange={set('hashtags')} placeholder="#brand #category" />
            </Field>
            <Field label={t('glossary')}>
              <input className="input" value={form.glossary} onChange={set('glossary')} maxLength={1500} placeholder={t('glossaryPh')} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t('rules')} hint={t('onePerLine')}>
                <textarea className="input min-h-[80px] resize-y" value={form.rules} onChange={set('rules')} maxLength={2000} placeholder={t('rulesPh')} />
              </Field>
              <Field label={t('banned')} hint={t('bannedHint')}>
                <textarea className="input min-h-[80px] resize-y" value={form.banned} onChange={set('banned')} />
              </Field>
            </div>
          </div>

          {/* Visual identity */}
          <div className="space-y-3">
            <h3 className="label !mb-0 text-accent">{t('visualIdentity')}</h3>
            <div>
              <span className="label">{t('palettes')}</span>
              <div className="flex flex-wrap gap-2">
                {PALETTES.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    title={p.name}
                    className="flex overflow-hidden rounded-lg border border-line transition hover:scale-105"
                    onClick={() => update((f) => ({ ...f, visual: { ...f.visual, ...Object.fromEntries(COLOR_KEYS.map((k, i) => [k, p.colors[i]])) } }))}
                  >
                    {p.colors.map((c) => (
                      <span key={c} className="h-6 w-4" style={{ background: c }} />
                    ))}
                  </button>
                ))}
              </div>
            </div>
            {siteColors.length > 0 && (
              <div>
                <span className="label">{t('siteColors')}</span>
                <div className="flex flex-wrap gap-1.5">
                  {siteColors.map((c) => (
                    <span key={c} className="h-6 w-6 rounded-md border border-line" style={{ background: c }} title={c} />
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {COLOR_KEYS.map((k) => (
                <label key={k} className="block">
                  <span className="label">{t(`colors.${k}`)}</span>
                  <span className="flex items-center gap-2 rounded-xl border border-line px-2 py-1.5">
                    <input type="color" value={form.visual[k]} onChange={(e) => setVisual(k)(e.target.value.toUpperCase())} className="h-7 w-8 cursor-pointer rounded border-0 bg-transparent p-0" data-testid={`color-${k}`} />
                    <span className="font-mono text-[11px] text-muted" dir="ltr">
                      {form.visual[k]}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted">{t('colorsHint')}</p>
            <Field group label={t('look')}>
              <Segmented value={form.visual.look} onChange={setVisual('look')} options={LOOKS.map((l) => ({ value: l, label: t(`looks.${l}`) }))} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t('fontLatin')}>
                <select className="input !py-2" value={form.visual.fontLatin} onChange={(e) => setVisual('fontLatin')(e.target.value)}>
                  {LATIN_FONTS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('fontArabic')}>
                <select className="input !py-2" value={form.visual.fontArabic} onChange={(e) => setVisual('fontArabic')(e.target.value)}>
                  {ARABIC_FONTS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          <ErrorBox error={error} />
          <button className="btn-accent w-full" disabled={!canSave} onClick={save} data-testid="save-brand">
            {saving ? <Spinner /> : <Save className="h-4 w-4" />}
            {saving ? t('saving') : t('saveBrand')}
          </button>
        </section>
      ) : (
        <section className="card flex min-h-[420px] items-center justify-center p-8">
          <Spinner className="h-6 w-6 text-accent" />
        </section>
      )}

      {/* Live preview */}
      <section className="card space-y-3 p-5 xl:sticky xl:top-24 xl:self-start">
        <SectionTitle icon={MonitorPlay}>{t('brandPreview')}</SectionTitle>
        <div dir="ltr" className="overflow-hidden rounded-xl border border-line bg-black">
          {previewProps && (
            <Player
              component={BrandVideo}
              inputProps={previewProps}
              durationInFrames={totalFrames(previewProps.script.scenes)}
              fps={FPS}
              compositionWidth={1080}
              compositionHeight={1920}
              style={{ width: '100%', aspectRatio: '1080 / 1920', maxHeight: '62vh' }}
              controls
              loop
              autoPlay
              acknowledgeRemotionLicense
            />
          )}
        </div>
        <p className="text-xs text-muted">{t('brandPreviewNote')}</p>
      </section>
    </div>
  );
}
