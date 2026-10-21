import React, { createContext, useCallback, useContext, useState } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useI18n } from '../lib/i18n.jsx';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const { pick } = useI18n();

  const dismiss = useCallback((id) => setToasts((ts) => ts.filter((t) => t.id !== id)), []);
  const push = useCallback(
    (kind, message) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((ts) => [...ts.slice(-3), { id, kind, message }]);
      setTimeout(() => dismiss(id), kind === 'error' ? 8000 : 2500);
    },
    [dismiss],
  );

  const api = {
    success: (msg) => push('success', msg),
    // Accepts an ApiError, a bilingual {ar, en} object or a plain string.
    error: (err) => push('error', err?.messages || err?.message || err),
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`pointer-events-auto flex max-w-lg items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur ${t.kind === 'error' ? 'border-danger/40 bg-surface text-fg' : 'border-accent/40 bg-surface text-fg'}`}>
            {t.kind === 'error' ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />}
            <span className="flex-1">{pick(t.message)}</span>
            <button className="text-muted hover:text-fg" onClick={() => dismiss(t.id)} aria-label="close">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
