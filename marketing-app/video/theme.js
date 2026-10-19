import { continueRender, delayRender } from 'remotion';
// Fonts ship with the app (no Google Fonts call at render time), so rendering works offline.
import poppins300 from '@fontsource/poppins/files/poppins-latin-300-normal.woff2';
import poppins500 from '@fontsource/poppins/files/poppins-latin-500-normal.woff2';
import poppins800 from '@fontsource/poppins/files/poppins-latin-800-normal.woff2';
import plex400 from '@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-400-normal.woff2';
import plex600 from '@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-600-normal.woff2';
import plex700 from '@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-700-normal.woff2';

const FACES = [
  ['QudraPoppins', poppins300, '300'],
  ['QudraPoppins', poppins500, '500'],
  ['QudraPoppins', poppins800, '800'],
  ['QudraPlexArabic', plex400, '400'],
  ['QudraPlexArabic', plex600, '600'],
  ['QudraPlexArabic', plex700, '700'],
];

let fontsLoading = null;
function loadFonts() {
  if (fontsLoading || typeof document === 'undefined') return;
  const handle = delayRender('Loading brand fonts');
  fontsLoading = Promise.all(
    FACES.map(([family, url, weight]) =>
      new FontFace(family, `url(${url}) format('woff2')`, { weight }).load().then((face) => document.fonts.add(face)),
    ),
  )
    .catch((err) => console.warn('Font loading failed, using system fonts', err))
    .finally(() => continueRender(handle));
}
loadFonts();

// Poppins has no Arabic glyphs, so Arabic text falls through to IBM Plex Sans Arabic.
export const fontFamily = `QudraPoppins, QudraPlexArabic, 'Segoe UI', Tahoma, sans-serif`;

export const colors = {
  green: '#3DAA63',
  greenLight: '#40B367',
  greenDeep: '#2C894D',
  greenShadow: '#226E3D',
  brandDark: '#016332',
  ink: '#1D2A22',
  mint: '#EAF6EE',
  mintBg: '#F2F8F4',
  white: '#FFFFFF',
  gray: '#868C87',
  red: '#EC736C',
};

export const gradient = 'linear-gradient(135deg, #40A664 0%, #2C894D 60%, #226E3D 100%)';

export const resolveSrc = (base, src) => (!src ? null : /^https?:/.test(src) ? src : `${base || ''}${src}`);
