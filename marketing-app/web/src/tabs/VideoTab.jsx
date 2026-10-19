import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useI18n } from '../lib/i18n.jsx';
import { useToast } from '../components/Toasts.jsx';
import { SourceForm } from '../components/video/SourceForm.jsx';
import { ScriptEditor } from '../components/video/ScriptEditor.jsx';
import { PreviewPanel } from '../components/video/PreviewPanel.jsx';
import { VideoHistory } from '../components/video/VideoHistory.jsx';

const DEFAULT_FORM = {
  topic: '',
  url: '',
  language: 'ar',
  market: 'both',
  durationSec: 45,
  visualStyle: 'mix',
  voiceMode: 'none',
  voiceUpload: null,
  music: '',
  captions: true,
};

/** Tab 1: topic/URL/images → editable script → live preview → MP4 render → history. */
export default function VideoTab({ status }) {
  const { lang } = useI18n();
  const toast = useToast();
  const [form, setForm] = useState({ ...DEFAULT_FORM, language: lang });
  const [images, setImages] = useState([]);
  const [script, setScript] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [writing, setWriting] = useState(false);
  const [scriptError, setScriptError] = useState(null);
  const [history, setHistory] = useState([]);

  const loadHistory = useCallback(() => api.get('/api/video/history').then((d) => setHistory(d.items)).catch(() => {}), []);
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const writeScript = async () => {
    setWriting(true);
    setScriptError(null);
    try {
      const data = await api.post('/api/video/script', {
        topic: form.topic,
        url: form.url,
        imageIds: images.map((i) => i.id),
        language: form.language,
        durationSec: form.durationSec,
        market: form.market,
      });
      if (data.pageImages?.length) setImages((prev) => [...prev, ...data.pageImages]);
      setScript(data.script);
      setWarnings(data.warnings);
    } catch (err) {
      setScriptError(err);
    } finally {
      setWriting(false);
    }
  };

  const reuse = (video) => {
    const { options, ...rest } = video.script;
    setScript(rest);
    setWarnings([]);
    if (options) setForm((f) => ({ ...f, ...options, music: options.music || '', voiceUpload: null, voiceMode: options.voiceMode === 'upload' ? 'none' : options.voiceMode }));
    toast.success(lang === 'ar' ? 'تم تحميل السكريبت في المحرر' : 'Script loaded into the editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(300px,360px)_minmax(0,1fr)_minmax(320px,400px)]">
        <SourceForm form={form} setForm={setForm} images={images} setImages={setImages} status={status} onWrite={writeScript} writing={writing} error={scriptError} hasScript={!!script} />
        <ScriptEditor script={script} setScript={setScript} images={images} voiceMode={form.voiceMode} warnings={warnings} writing={writing} />
        <PreviewPanel script={script} images={images} form={form} logo={status?.logo} onRendered={loadHistory} />
      </div>
      <VideoHistory items={history} onReuse={reuse} onChanged={loadHistory} />
    </div>
  );
}
