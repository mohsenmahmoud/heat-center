import { createContext, useContext, useEffect, useState } from 'react';
import { continueRender, delayRender } from 'remotion';
import { FONT_FILES } from './font-files.js';
import { makeTheme } from './brand-theme.js';

const loaded = new Map();

/** Loads one bundled family (all its weights) once per page. */
function loadFamily(script, id) {
  const key = `${script}:${id}`;
  if (!loaded.has(key)) {
    const files = FONT_FILES[key] || {};
    loaded.set(
      key,
      Promise.all(
        Object.entries(files).map(([weight, url]) =>
          new FontFace(`brand-${script}-${id}`, `url(${url}) format('woff2')`, { weight }).load().then((face) => document.fonts.add(face)),
        ),
      ).catch((err) => console.warn('Font loading failed, using system fonts', err)),
    );
  }
  return loaded.get(key);
}

/** Holds rendering until the brand's fonts are ready (and again whenever the brand switches fonts). */
export function useBrandFonts(visual) {
  const key = `${visual.fontLatin}|${visual.fontArabic}`;
  const [first] = useState(() => ({ key, handle: typeof document === 'undefined' ? null : delayRender('Loading brand fonts') }));
  useEffect(() => {
    const handle = key === first.key && first.handle !== null ? first.handle : delayRender('Loading brand fonts');
    first.handle = null;
    let done = false;
    Promise.all([loadFamily('latin', visual.fontLatin), loadFamily('arabic', visual.fontArabic)]).finally(() => {
      done = true;
      continueRender(handle);
    });
    return () => {
      if (!done) continueRender(handle);
    };
  }, [key]);
}

const ThemeContext = createContext(makeTheme());
export const ThemeProvider = ThemeContext.Provider;
export const useTheme = () => useContext(ThemeContext);

export const resolveSrc = (base, src) => (!src ? null : /^https?:/.test(src) ? src : `${base || ''}${src}`);
