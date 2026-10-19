import React, { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Clapperboard, Info, Languages, LogOut, Moon, Sun } from 'lucide-react';
import { api } from './lib/api.js';
import { useI18n } from './lib/i18n.jsx';
import { Login } from './components/Login.jsx';
import { Spinner } from './components/ui.jsx';
import VideoTab from './tabs/VideoTab.jsx';
import PlannerTab from './tabs/PlannerTab.jsx';

export default function App() {
  const { t, toggleLang, toggleTheme, theme } = useI18n();
  const [auth, setAuth] = useState(null);
  const [status, setStatus] = useState(null);
  const [tab, setTab] = useState(() => (location.hash === '#planner' ? 'planner' : 'video'));

  const loadStatus = useCallback(() => api.get('/api/status').then(setStatus).catch(() => setStatus(null)), []);

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
  ];

  return (
    <div className="backdrop min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#40A664] via-[#2C894D] to-[#226E3D] shadow-glow">
              <img src="/brand/logo.png" alt="" className="h-5 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold">{t('appName')}</div>
              <div className="text-[11px] text-muted">
                {caps?.writer ? `${caps.writer === 'mock' ? 'Demo' : 'Claude'} · ${caps.model}` : 'localhost'}
              </div>
            </div>
          </div>

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
              <button
                className="btn-icon"
                title={t('logout')}
                aria-label={t('logout')}
                onClick={() => api.post('/api/auth/logout').finally(() => setAuth({ ...auth, authenticated: false }))}
              >
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
          <VideoTab status={status} />
        </div>
        <div hidden={tab !== 'planner'}>
          <PlannerTab status={status} />
        </div>
      </main>
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
