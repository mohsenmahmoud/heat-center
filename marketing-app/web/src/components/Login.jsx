import React, { useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { api } from '../lib/api.js';
import { useI18n } from '../lib/i18n.jsx';
import { ErrorBox, Spinner } from './ui.jsx';

export function Login({ onDone }) {
  const { t, toggleLang } = useI18n();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post('/api/auth/login', { password });
      onDone();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="backdrop flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-5 p-7 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <button type="button" className="text-xs text-muted hover:text-fg" onClick={toggleLang}>
            {t('language')}
          </button>
        </div>
        <div>
          <h1 className="text-lg font-bold">{t('appName')}</h1>
          <p className="text-sm text-muted">{t('loginTitle')}</p>
        </div>
        <input className="input" type="password" autoFocus placeholder={t('password')} value={password} onChange={(e) => setPassword(e.target.value)} aria-label={t('password')} />
        <ErrorBox error={error} />
        <button className="btn-accent w-full" disabled={busy || !password}>
          {busy && <Spinner />}
          {t('signIn')}
        </button>
      </form>
    </div>
  );
}
