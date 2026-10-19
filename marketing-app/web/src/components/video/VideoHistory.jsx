import React, { useState } from 'react';
import { Download, History, Play, RotateCcw, Trash2, X } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useI18n } from '../../lib/i18n.jsx';
import { useToast } from '../Toasts.jsx';
import { SectionTitle } from '../ui.jsx';

export function VideoHistory({ items, onReuse, onChanged }) {
  const { t, lang } = useI18n();
  const toast = useToast();
  const [playing, setPlaying] = useState(null);

  const remove = async (video) => {
    if (!confirm(t('confirmDelete'))) return;
    try {
      await api.del(`/api/video/${video.id}`);
      onChanged();
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <section className="card p-5">
      <SectionTitle icon={History}>{t('history')}</SectionTitle>
      {!items.length ? (
        <p className="py-6 text-center text-sm text-muted">{t('noHistory')}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6" data-testid="history">
          {items.map((v) => (
            <article key={v.id} className="group overflow-hidden rounded-xl border border-line bg-raised/40">
              <button className="relative block aspect-[9/16] w-full overflow-hidden bg-black" onClick={() => setPlaying(v)} aria-label="play">
                {v.thumbName && <img src={`/videos/${v.thumbName}`} alt="" className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />}
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/35">
                  <Play className="h-10 w-10 text-white opacity-0 transition group-hover:opacity-100" />
                </span>
                <span className="absolute bottom-1.5 end-1.5 rounded bg-black/70 px-1.5 text-[11px] text-white">{Math.round(v.durationSec)}s</span>
              </button>
              <div className="space-y-2 p-2.5">
                <p className="line-clamp-2 text-xs font-semibold" title={v.title}>
                  {v.title}
                </p>
                <p className="text-[11px] text-muted">{new Date(v.createdAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                <div className="flex gap-1">
                  <a className="btn-icon !h-8 !w-8" href={`/api/video/${v.id}/download`} download title={t('download')} aria-label={t('download')}>
                    <Download className="h-3.5 w-3.5" />
                  </a>
                  <button className="btn-icon !h-8 !w-8" onClick={() => onReuse(v)} title={t('useScript')} aria-label={t('useScript')}>
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <button className="btn-icon !h-8 !w-8 hover:!text-danger" onClick={() => remove(v)} title={t('delete')} aria-label={t('delete')}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {playing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur" onClick={() => setPlaying(null)} role="dialog">
          <div className="relative max-h-full" onClick={(e) => e.stopPropagation()}>
            <button className="absolute -top-10 end-0 text-white/80 hover:text-white" onClick={() => setPlaying(null)} aria-label="close">
              <X className="h-6 w-6" />
            </button>
            <video src={`/videos/${playing.fileName}`} controls autoPlay className="max-h-[85vh] rounded-xl" />
          </div>
        </div>
      )}
    </section>
  );
}
