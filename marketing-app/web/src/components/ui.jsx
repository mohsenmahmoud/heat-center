import React from 'react';
import { AlertTriangle, Loader2, RotateCcw } from 'lucide-react';
import { useI18n } from '../lib/i18n.jsx';

/** Labelled form row. `group` renders a div so button groups don't get swallowed into one label. */
export function Field({ label, children, hint, className = '', group = false }) {
  const Tag = group ? 'div' : 'label';
  return (
    <Tag className={`block ${className}`}>
      {label && <span className="label">{label}</span>}
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </Tag>
  );
}

export function Segmented({ value, onChange, options, name }) {
  return (
    <div className="seg" role="group" aria-label={name}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} disabled={o.disabled} title={o.title} onClick={() => onChange(o.value)} className="disabled:opacity-40">
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Spinner({ className = 'h-4 w-4' }) {
  return <Loader2 className={`${className} animate-spin`} />;
}

export function ErrorBox({ error, onRetry }) {
  const { pick, t } = useI18n();
  if (!error) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm" role="alert">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
      <span className="flex-1">
        {pick(error.messages || error.message)}
        {error.code === 'INTERNAL' && error.details && (
          <span className="mt-1 block font-mono text-[11px] text-muted" dir="ltr">
            {error.details}
          </span>
        )}
      </span>
      {onRetry && (
        <button className="btn-ghost !px-2.5 !py-1 text-xs" onClick={onRetry}>
          <RotateCcw className="h-3.5 w-3.5" />
          {t('retry')}
        </button>
      )}
    </div>
  );
}

export function SectionTitle({ icon: Icon, children, right }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide">
        {Icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Icon className="h-4 w-4" />
          </span>
        )}
        {children}
      </h2>
      {right}
    </div>
  );
}

export function Warnings({ items }) {
  const { t } = useI18n();
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-warn/40 bg-warn/10 px-2.5 py-1.5 text-xs text-warn">
      <AlertTriangle className="h-3.5 w-3.5" />
      <span className="font-semibold">{t('warnings')}:</span>
      {items.map((w) => (
        <span key={w} className="rounded bg-warn/15 px-1.5">
          {w}
        </span>
      ))}
    </div>
  );
}
