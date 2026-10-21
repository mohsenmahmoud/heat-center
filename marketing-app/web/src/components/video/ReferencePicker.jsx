import React, { useRef, useState } from 'react';
import { Clapperboard, Film, Link2, Upload, X } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useI18n } from '../../lib/i18n.jsx';
import { ErrorBox, Spinner } from '../ui.jsx';

/** "Make it like this one": a YouTube link or an uploaded video, analyzed by Gemini into a blueprint. */
export function ReferencePicker({ blueprint, onChange, enabled, language }) {
  const { t } = useI18n();
  const fileInput = useRef(null);
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async (picked = file) => {
    setBusy(true);
    setError(null);
    try {
      let uploadId = null;
      if (picked && !url.trim()) {
        const body = new FormData();
        body.append('file', picked);
        uploadId = (await api.post('/api/uploads/video', body)).id;
      }
      const { blueprint: result } = await api.post('/api/video/reference', { url: url.trim(), uploadId, language });
      onChange(result);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  if (blueprint) {
    return (
      <div className="space-y-2 rounded-xl border border-accent/40 bg-accent/10 p-3 text-xs" data-testid="reference-card">
        <div className="flex items-center gap-2">
          <Film className="h-4 w-4 text-accent" />
          <span className="flex-1 font-semibold">{t('referenceReady')}</span>
          <button className="btn-icon !h-7 !w-7" onClick={() => onChange(null)} aria-label="remove">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="leading-relaxed text-muted" dir="auto">
          {blueprint.summary}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <span className="chip !py-0.5">
            {blueprint.scenes.length} {t('refScenes')} · {Math.round(blueprint.durationSec)}
            {t('sec')}
          </span>
        </div>
        <dl className="space-y-1">
          {[
            [t('refHook'), blueprint.hookPattern],
            [t('refPacing'), blueprint.pacing],
            [t('refVoice'), blueprint.voiceStyle],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="inline font-semibold">{k}: </dt>
              <dd className="inline text-muted" dir="auto">
                {v}
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-[11px] text-muted">{t('refNote')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Link2 className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input className="input !ps-9" dir="ltr" type="url" placeholder={t('referencePh')} value={url} onChange={(e) => setUrl(e.target.value)} disabled={!enabled || busy} data-testid="reference-url" />
      </div>
      <div className="flex gap-2">
        <button type="button" className="btn-ghost flex-1 !py-2 text-xs" onClick={() => fileInput.current?.click()} disabled={!enabled || busy}>
          <Upload className="h-3.5 w-3.5" />
          <span className="truncate">{file ? file.name : t('uploadReference')}</span>
        </button>
        <button type="button" className="btn-primary flex-1 !py-2 text-xs" onClick={() => analyze()} disabled={!enabled || busy || (!url.trim() && !file)} data-testid="analyze-reference">
          {busy ? <Spinner className="h-3.5 w-3.5" /> : <Clapperboard className="h-3.5 w-3.5" />}
          {busy ? t('analyzing') : t('analyzeReference')}
        </button>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        hidden
        data-testid="reference-file"
        onChange={(e) => {
          setFile(e.target.files[0] || null);
          setUrl('');
          e.target.value = '';
        }}
      />
      <p className="text-xs text-muted">{enabled ? t('referenceHint') : t('referenceNeedsGemini')}</p>
      <ErrorBox error={error} />
    </div>
  );
}
