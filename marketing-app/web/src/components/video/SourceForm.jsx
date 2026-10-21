import React, { useRef, useState } from 'react';
import { ImagePlus, Mic, Sparkles, Wand2, X } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useI18n } from '../../lib/i18n.jsx';
import { useToast } from '../Toasts.jsx';
import { ErrorBox, Field, SectionTitle, Segmented, Spinner } from '../ui.jsx';
import { ReferencePicker } from './ReferencePicker.jsx';

function orientationOf(url) {
  return new Promise((resolve) => {
    const img = new Image();
    // Same rule as the server: wide screen, tall desktop page, or phone screenshot.
    img.onload = () => {
      const ratio = img.naturalHeight / img.naturalWidth;
      resolve(ratio >= 1.8 ? 'phone' : ratio > 1 ? 'portrait' : 'landscape');
    };
    img.onerror = () => resolve('landscape');
    img.src = url;
  });
}

/** Same rule as the server, from a known pixel size. */
export const orientationFromSize = (w, h) => (!w || !h ? null : h / w >= 1.8 ? 'phone' : h / w > 1 ? 'portrait' : 'landscape');

export async function uploadFiles(files) {
  const body = new FormData();
  for (const f of files) body.append('files', f);
  const { items } = await api.post('/api/uploads', body);
  return Promise.all(items.map(async (i) => (i.mime.startsWith('image/') ? { ...i, orientation: orientationFromSize(i.width, i.height) || (await orientationOf(i.url)) } : i)));
}

export function SourceForm({ form, setForm, images, setImages, status, onWrite, writing, error, hasScript, reference, setReference }) {
  const { t } = useI18n();
  const toast = useToast();
  const fileInput = useRef(null);
  const voiceInput = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const caps = status?.capabilities;
  // AI-made scene images live in the script editor, not in this list of the user's own images.
  const ownImages = images.filter((i) => i.source !== 'ai');

  const addImages = async (fileList) => {
    const files = [...fileList].filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    if (ownImages.length + files.length > 10) return toast.error({ ar: 'الحد الأقصى 10 صور.', en: 'Maximum 10 images.' });
    setUploading(true);
    try {
      const items = await uploadFiles(files);
      setImages((prev) => [...prev, ...items]);
    } catch (err) {
      toast.error(err);
    } finally {
      setUploading(false);
    }
  };

  const addVoice = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const [item] = await uploadFiles([file]);
      set('voiceUpload')(item);
    } catch (err) {
      toast.error(err);
    } finally {
      setUploading(false);
    }
  };

  const canWrite = !writing && !uploading && (form.topic.trim() || form.url.trim() || ownImages.length || reference) && caps?.writer;

  return (
    <section className="card space-y-5 p-5">
      <SectionTitle icon={Sparkles}>{t('source')}</SectionTitle>

      <Field label={t('topic')}>
        <textarea className="input min-h-[96px] resize-y" placeholder={t('topicPh')} value={form.topic} onChange={(e) => set('topic')(e.target.value)} maxLength={4000} />
      </Field>

      <Field label={t('url')}>
        <input className="input" dir="ltr" type="url" placeholder={t('urlPh')} value={form.url} onChange={(e) => set('url')(e.target.value)} />
      </Field>

      <div>
        <span className="label">{t('images')}</span>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addImages(e.dataTransfer.files);
          }}
          className={`flex w-full flex-col items-center gap-1.5 rounded-xl border border-dashed px-4 py-5 text-sm transition ${dragging ? 'border-accent bg-accent/10' : 'border-line hover:border-accent/60'}`}
        >
          {uploading ? <Spinner className="h-5 w-5 text-accent" /> : <ImagePlus className="h-5 w-5 text-accent" />}
          <span>{t('dropImages')}</span>
          <span className="text-xs text-muted">{t('imagesHint')}</span>
        </button>
        <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={(e) => addImages(e.target.files).finally(() => (e.target.value = ''))} data-testid="image-input" />
        {ownImages.length > 0 && (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {ownImages.map((img, i) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-line">
                <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
                <span className="absolute bottom-0.5 start-0.5 rounded bg-black/60 px-1 text-[10px] text-white">{i + 1}</span>
                <button className="absolute end-0.5 top-0.5 hidden rounded bg-black/60 p-0.5 text-white group-hover:block" onClick={() => setImages((prev) => prev.filter((x) => x.id !== img.id))} aria-label="remove">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <span className="label">{t('reference')}</span>
        <ReferencePicker
          blueprint={reference}
          enabled={!!caps?.reference}
          language={form.language}
          onChange={(bp) => {
            setReference(bp);
            // Match the reference's length (within what the renderer allows).
            if (bp) set('durationSec')(Math.min(90, Math.max(15, Math.round(bp.durationSec))));
          }}
        />
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
            <option value="global">{t('global')}</option>
          </select>
        </Field>
      </div>

      <Field label={`${t('duration')}: ${form.durationSec}${t('sec')}`}>
        <input type="range" min={reference ? 15 : 40} max={reference ? 90 : 60} step={reference ? 1 : 5} value={form.durationSec} onChange={(e) => set('durationSec')(Number(e.target.value))} className="w-full accent-[rgb(var(--accent))]" />
      </Field>

      <Field group label={t('style')}>
        <Segmented
          value={form.visualStyle}
          onChange={set('visualStyle')}
          options={[
            { value: 'motion', label: t('styleMotion') },
            { value: 'mix', label: t('styleMix') },
          ]}
        />
        {form.visualStyle === 'mix' && (
          <span className="mt-1 block text-xs text-muted">
            Stock: {caps?.stock?.join(', ') || 'off'} · AI images: {caps?.images || 'off'}
          </span>
        )}
      </Field>

      <Field group label={t('voice')} hint={form.voiceMode === 'ai' && !caps?.tts ? t('voiceAiOff') : null}>
        <Segmented
          value={form.voiceMode}
          onChange={set('voiceMode')}
          options={[
            { value: 'none', label: t('voiceNone') },
            { value: 'ai', label: t('voiceAi'), disabled: !caps?.tts, title: !caps?.tts ? t('voiceAiOff') : '' },
            { value: 'upload', label: t('voiceUpload') },
          ]}
        />
      </Field>
      {form.voiceMode === 'ai' && caps?.tts && (
        <div className="space-y-1.5">
          {status?.voices?.length > 0 && (
            <Field label={t('voicePick')}>
              <select className="input !py-2" value={form.voiceName || status.defaultVoice} onChange={(e) => set('voiceName')(e.target.value)} data-testid="voice-name">
                {status.voices.map((v) => (
                  <option key={v} value={v}>
                    {t(`voiceNames.${v}`)}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <p className="text-xs text-muted">{t('voiceAiNote')}</p>
        </div>
      )}
      {form.voiceMode === 'upload' && (
        <div>
          <button type="button" className="btn-ghost w-full text-xs" onClick={() => voiceInput.current?.click()}>
            <Mic className="h-4 w-4" />
            {form.voiceUpload ? form.voiceUpload.name : t('uploadVoice')}
          </button>
          <input ref={voiceInput} type="file" accept="audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,.mp3,.wav,.m4a" hidden onChange={(e) => addVoice(e.target.files[0]).finally(() => (e.target.value = ''))} />
        </div>
      )}

      <div className="grid grid-cols-2 items-end gap-3">
        <Field label={t('music')} hint={!status?.music?.length ? t('musicHint') : null}>
          <select className="input !py-2" value={form.music} onChange={(e) => set('music')(e.target.value)}>
            <option value="">{t('noMusic')}</option>
            {status?.music?.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </Field>
        <label className="flex cursor-pointer items-center gap-2 pb-2.5 text-sm">
          <input type="checkbox" checked={form.captions} onChange={(e) => set('captions')(e.target.checked)} className="h-4 w-4 accent-[rgb(var(--accent))]" />
          {t('captions')}
        </label>
      </div>

      <ErrorBox error={error} onRetry={canWrite ? onWrite : null} />

      <button className="btn-accent w-full" disabled={!canWrite} onClick={onWrite} data-testid="write-script">
        {writing ? <Spinner /> : <Wand2 className="h-4 w-4" />}
        {writing ? t('writing') : hasScript ? t('regenerate') : t('generateScript')}
      </button>
    </section>
  );
}
