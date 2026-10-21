import React, { useCallback, useEffect, useState } from 'react';
import { CalendarDays, ChevronDown, Clapperboard, Info, Languages, LogOut, Moon, Palette, Sun } from 'lucide-react';
import { api } from './lib/api.js';
import { useI18n } from './lib/i18n.jsx';
import { BrandsProvider, brandLabel, useBrands } from './lib/brands.jsx';
import { Login } from './components/Login.jsx';
import { Spinner } from './components/ui.jsx';
import VideoTab from './tabs/VideoTab.jsx';
import PlannerTab from './tabs/PlannerTab.jsx';
import BrandsTab from './tabs/BrandsTab.jsx';

export default function App() {
  const { t, toggleLang, toggleTheme, theme } = useI18n();
  const [auth, setAuth] = useState(null);
  const [status, setStatus] = useState(null);
  const [tab, setTab] = useState(() => (['#planner', '#brands'].includes(location.hash) ? location.hash.slice(1) : 'video'));

  // A plan day sent to the video tab: { script, source, nonce }.
  const [handoff, setHandoff] = useState(null);
  const openInVideo = useCallback((payload) => {
    setHandoff({ ...payload, nonce: Date.now() });
    setTab('video');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const loadStatus = useCallback(
    () =>
      api
        .get('/api/status')
        .then(setStatus)
        .catch(() => setStatus(null)),
    [],
  );

  useEffect(() => {
    api
      .get('/api/auth/status')
      .then(setAuth)
      .catch(() => setAuth({ required: false, authenticated: true, offline: true }));
    const onUnauthorized = () => setAuth((a) => ({ ...a, authenticated: false }));
    window.addEventListener('qms:unauthorized', onUnauthorized);
    return () => window.removeEventListener('qms:unauthorized', onUnauthorized);
  }, []);

  useEffect(() => {
    if (auth?.authenticated) loadStatus();
  }, [auth, loadStatus]);

  useEffect(() => {
    history.replaceState(null, '', `#${tab}`);
  }, [tab]);

  if (!auth) {
    return (
      <div className="backdrop flex min-h-screen items-center justify-center">
        <Spinner className="h-6 w-6 text-accent" />
      </div>
    );
  }
  if (auth.required && !auth.authenticated) return <Login onDone={() => setAuth({ ...auth, authenticated: true })} />;

  const caps = status?.capabilities;
  const tabs = [
    { key: 'video', label: t('tabVideo'), icon: Clapperboard },
    { key: 'planner', label: t('tabPlanner'), icon: CalendarDays },
    { key: 'brands', label: t('tabBrands'), icon: Palette },
  ];

  return (
    <BrandsProvider enabled={!!auth.authenticated || !auth.required}>
      <div className="backdrop min-h-screen">
        <header className="sticky top-0 z-40 border-b border-line bg-bg/75 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
            <BrandSwitcher caps={caps} onManage={() => setTab('brands')} />

            <nav className="order-3 flex w-full gap-1 rounded-2xl border border-line bg-surface/70 p-1 sm:order-none sm:mx-auto sm:w-auto" role="tablist">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => setTab(key)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition sm:flex-none ${tab === key ? 'bg-fg text-bg shadow' : 'text-muted hover:text-fg'}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>

            <div className="ms-auto flex items-center gap-2 sm:ms-0">
              <button className="btn-ghost !px-3 !py-2 text-xs" onClick={toggleLang} title="Language">
                <Languages className="h-4 w-4" />
                {t('language')}
              </button>
              <button className="btn-icon" onClick={toggleTheme} title={t('theme')} aria-label={t('theme')}>
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              {auth.required && (
                <button className="btn-icon" title={t('logout')} aria-label={t('logout')} onClick={() => api.post('/api/auth/logout').finally(() => setAuth({ ...auth, authenticated: false }))}>
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">
          {status && !caps?.writer && <Banner tone="warn">{t('noWriter')}</Banner>}
          {caps?.writer === 'mock' && <Banner tone="info">{t('demoMode')}</Banner>}
          {/* Both tabs stay mounted so switching keeps unsaved work. */}
          <div hidden={tab !== 'video'}>
            <VideoTab status={status} handoff={handoff} />
          </div>
          <div hidden={tab !== 'planner'}>
            <PlannerTab status={status} onOpenInVideo={openInVideo} />
          </div>
          <div hidden={tab !== 'brands'}>
            <BrandsTab status={status} />
          </div>
        </main>
      </div>
    </BrandsProvider>
  );
}

/** The brand everything is made for right now: logo badge in its colours, and a picker to switch. */
function BrandSwitcher({ caps, onManage }) {
  const { t, lang } = useI18n();
  const { brands, active, setActiveId } = useBrands();
  const v = active?.visual;
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-glow" style={{ background: v ? `linear-gradient(135deg, ${v.primary}, ${v.secondary})` : undefined }}>
        {active?.logoUrl ? <img src={active.logoUrl} alt="" className="h-5 max-w-[28px] object-contain" /> : <span className="text-sm font-bold text-white">{brandLabel(active, lang)?.slice(0, 1)}</span>}
      </div>
      <div className="leading-tight">
        <label className="relative flex items-center gap-1 text-sm font-bold">
          <span className="sr-only">{t('activeBrand')}</span>
          <select
            className="cursor-pointer appearance-none bg-transparent pe-5 font-bold outline-none"
            value={active?.id || ''}
            onChange={(e) => (e.target.value === '__manage' ? onManage() : setActiveId(e.target.value))}
            data-testid="brand-switcher"
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {brandLabel(b, lang)}
              </option>
            ))}
            <option value="__manage">{t('manageBrands')}</option>
          </select>
          <ChevronDown className="pointer-events-none absolute end-0 h-3.5 w-3.5 text-muted" />
        </label>
        <div className="text-[11px] text-muted">
          {t('appName')} · {caps?.writer ? `${{ mock: 'Demo', claude: 'Claude', gemini: 'Gemini' }[caps.writer]}` : 'localhost'}
        </div>
      </div>
    </div>
  );
}

function Banner({ tone, children }) {
  return (
    <div className={`mb-5 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${tone === 'warn' ? 'border-warn/40 bg-warn/10' : 'border-accent/30 bg-accent/10'}`}>
      <Info className={`mt-0.5 h-4 w-4 shrink-0 ${tone === 'warn' ? 'text-warn' : 'text-accent'}`} />
      <span>{children}</span>
    </div>
  );
}
