import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Film, X } from 'lucide-react';
import { api } from '../lib/api.js';
import { useI18n } from '../lib/i18n.jsx';
import { useToast } from '../components/Toasts.jsx';
import { useBrands } from '../lib/brands.jsx';
import { SourceForm } from '../components/video/SourceForm.jsx';
import { ScriptEditor } from '../components/video/ScriptEditor.jsx';
import { PreviewPanel } from '../components/video/PreviewPanel.jsx';
import { VideoHistory } from '../components/video/VideoHistory.jsx';
import { useSceneVisuals } from '../components/video/useSceneVisuals.js';

const DEFAULT_FORM = {
  topic: '',
  url: '',
  language: 'ar',
  market: 'both',
  durationSec: 45,
  visualStyle: 'mix',
  voiceMode: 'none',
  voiceUpload: null,
  voiceName: '',
  music: '',
  captions: true,
};

/** Tab 1: topic/URL/images → editable script → live preview → MP4 render → history. */
export default function VideoTab({ status, handoff }) {
  const { lang, t } = useI18n();
  const toast = useToast();
  const { activeId, byId } = useBrands();
  const [form, setForm] = useState({ ...DEFAULT_FORM, language: lang });
  const [images, setImages] = useState([]);
  const [script, setScript] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [writing, setWriting] = useState(false);
  const [scriptError, setScriptError] = useState(null);
  const [history, setHistory] = useState([]);
  // The weekly-plan day this script came from, if any: the rendered video gets linked back to it.
  const [source, setSource] = useState(null);
  const [reference, setReference] = useState(null);
  const voiceTouched = useRef(false);
  const visuals = useSceneVisuals({ setScript, setImages, brandId: activeId, market: form.market, toast });
  // Videos should not come out empty: give every scene an image unless the user chose motion graphics only.
  const autoFill = (next) => {
    visuals.cancel();
    if (status?.capabilities?.images && form.visualStyle === 'mix') visuals.fillAll(next);
  };

  // Videos should come out complete: default to the AI voice whenever one is available.
  useEffect(() => {
    if (status?.capabilities?.tts && !voiceTouched.current) setForm((f) => (f.voiceMode === 'none' ? { ...f, voiceMode: 'ai' } : f));
  }, [status]);
  const setFormTracked = useCallback((updater) => {
    setForm((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next.voiceMode !== prev.voiceMode) voiceTouched.current = true;
      return next;
    });
  }, []);

  useEffect(() => {
    if (!handoff?.script) return;
    setScript(handoff.script);
    autoFill(handoff.script);
    setWarnings([]);
    setScriptError(null);
    setSource(handoff.source);
    setForm((f) => ({ ...f, language: handoff.script.language }));
  }, [handoff]);

  const loadHistory = useCallback(() => {
    if (!activeId) return;
    api
      .get(`/api/video/history?brandId=${encodeURIComponent(activeId)}`)
      .then((d) => setHistory(d.items))
      .catch(() => {});
  }, [activeId]);
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const writeScript = async () => {
    setWriting(true);
    setSource(null);
    setScriptError(null);
    try {
      const data = await api.post('/api/video/script', {
        topic: form.topic,
        url: form.url,
        imageIds: images.filter((i) => i.source !== 'ai').map((i) => i.id),
        language: form.language,
        durationSec: form.durationSec,
        market: form.market,
        brandId: activeId,
        reference,
      });
      if (data.pageImages?.length) setImages((prev) => [...prev, ...data.pageImages]);
      setScript(data.script);
      autoFill(data.script);
      setWarnings(data.warnings);
    } catch (err) {
      setScriptError(err);
    } finally {
      setWriting(false);
    }
  };

  const reuse = (video) => {
    visuals.cancel();
    const { options, ...rest } = video.script;
    setScript(rest);
    setSource(null);
    setWarnings([]);
    if (options) setForm((f) => ({ ...f, ...options, music: options.music || '', voiceUpload: null, voiceMode: options.voiceMode === 'upload' ? 'none' : options.voiceMode }));
    toast.success(lang === 'ar' ? 'تم تحميل السكريبت في المحرر' : 'Script loaded into the editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {source && (
        <div className="flex items-center gap-3 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm" data-testid="plan-source">
          <Film className="h-4 w-4 shrink-0 text-accent" />
          <div className="flex-1">
            <span className="font-semibold">{t('fromPlan')}: </span>
            {source.label}
            <span className="block text-xs text-muted">{t('fromPlanNote')}</span>
          </div>
          <button className="btn-icon" onClick={() => setSource(null)} title={t('unlink')} aria-label={t('unlink')}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[minmax(300px,360px)_minmax(0,1fr)_minmax(320px,400px)]">
        <SourceForm form={form} setForm={setFormTracked} images={images} setImages={setImages} status={status} onWrite={writeScript} writing={writing} error={scriptError} hasScript={!!script} reference={reference} setReference={setReference} />
        <ScriptEditor script={script} setScript={setScript} images={images} visuals={visuals} imagesOn={!!status?.capabilities?.images} voiceMode={form.voiceMode} voiceName={form.voiceName || status?.defaultVoice} voiceRate={status?.voiceRate} warnings={warnings} writing={writing} />
        <PreviewPanel script={script} images={images} form={form} brand={byId(script?.brandId)} source={source} onRendered={loadHistory} />
      </div>
      <VideoHistory items={history} onReuse={reuse} onChanged={loadHistory} />
    </div>
  );
}
