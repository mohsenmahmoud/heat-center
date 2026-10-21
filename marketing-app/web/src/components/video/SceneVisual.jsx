import React, { useRef } from 'react';
import { ImagePlus, Lightbulb, Monitor, RefreshCw, Image as ImageIcon, Sparkles, X } from 'lucide-react';
import { useI18n } from '../../lib/i18n.jsx';
import { Spinner } from '../ui.jsx';

/**
 * One scene's picture: what is on it now (AI image, your screenshot or photo), what the AI suggests uploading,
 * and the controls to make a new AI image, use your own, pick one you uploaded, or show it differently.
 */
export function SceneVisual({ scene, images, visuals, imagesOn, language }) {
  const { t } = useI18n();
  const fileInput = useRef(null);
  const image = scene.imageId && images.find((im) => im.id === scene.imageId);
  const src = image?.url || scene.imageUrl;
  const busy = visuals?.busy.has(scene.id);
  const mode = scene.imageMode || (scene.imageSource === 'ai' ? 'photo' : 'screen');
  const own = images.filter((im) => im.source !== 'ai' && im.mime.startsWith('image/'));
  const kind = !scene.imageId ? 'none' : scene.imageSource === 'ai' ? 'ai' : mode === 'photo' ? 'photo' : 'screen';

  return (
    <div className="mt-3 flex gap-3 rounded-xl border border-line bg-surface/60 p-2.5" data-testid="scene-visual">
      <div className="relative flex h-[104px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-raised">
        {src ? <img src={src} alt="" className={`h-full w-full ${mode === 'photo' ? 'object-cover' : 'object-contain'}`} /> : <ImageIcon className="h-5 w-5 text-muted" />}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Spinner className="h-5 w-5 text-white" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className={`chip !px-2 !py-0.5 ${kind === 'none' ? 'text-muted' : 'text-accent'}`} data-testid="visual-kind">
            {t(`visualKinds.${kind}`)}
          </span>
          {scene.imageId && (
            <div className="seg !p-0.5 whitespace-nowrap text-[11px]" role="group">
              <button type="button" aria-pressed={mode === 'screen'} onClick={() => visuals.setMode(scene, 'screen')} title={t('modeScreen')}>
                <Monitor className="inline h-3 w-3" /> {t('modeScreen')}
              </button>
              <button type="button" aria-pressed={mode === 'photo'} onClick={() => visuals.setMode(scene, 'photo')} title={t('modePhoto')}>
                <ImageIcon className="inline h-3 w-3" /> {t('modePhoto')}
              </button>
            </div>
          )}
        </div>
        {mode === 'screen' && scene.shot && (
          <input
            className="input !py-1 text-xs"
            value={scene.shot.callout || ''}
            maxLength={60}
            placeholder={t('calloutPh')}
            onChange={(e) => visuals.setCallout(scene, e.target.value)}
            aria-label={t('callout')}
            data-testid="callout"
          />
        )}
        {scene.screenshotHint && (
          <p className="flex gap-1 text-[11px] leading-snug text-muted" data-testid="screenshot-hint">
            <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-warn" />
            <span>
              {t('suggestedImage')}: {scene.screenshotHint}
            </span>
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {imagesOn && (
            <button className="btn-ghost !px-2 !py-1 text-[11px]" disabled={busy} onClick={() => visuals.generate(scene)} data-testid="ai-image">
              {scene.imageSource === 'ai' ? <RefreshCw className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              {scene.imageSource === 'ai' ? t('newAiImage') : t('aiImage')}
            </button>
          )}
          <button className="btn-ghost !px-2 !py-1 text-[11px]" disabled={busy} onClick={() => fileInput.current?.click()} data-testid="own-image">
            <ImagePlus className="h-3.5 w-3.5" />
            {t('ownImage')}
          </button>
          {own.length > 0 && (
            <select
              className="input !w-auto !py-1 text-[11px]"
              value=""
              disabled={busy}
              onChange={(e) => {
                const im = own.find((x) => x.id === e.target.value);
                if (im) visuals.pickImage(scene, im, language);
              }}
              aria-label={t('pickUploaded')}
            >
              <option value="">{t('pickUploaded')}</option>
              {own.map((im, n) => (
                <option key={im.id} value={im.id}>
                  #{n + 1} {im.name.slice(0, 22)}
                </option>
              ))}
            </select>
          )}
          {scene.imageId && (
            <button className="btn-ghost !px-2 !py-1 text-[11px]" disabled={busy} onClick={() => visuals.clear(scene)} title={t('noImage')}>
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={(e) => {
              const f = e.target.files[0];
              e.target.value = '';
              if (f) visuals.upload(scene, f, language);
            }}
            data-testid="scene-image-input"
          />
        </div>
      </div>
    </div>
  );
}
