/**
 * Brand visuals → the colour tokens every scene draws with. Pure JS (no font files), so the
 * server and tests can use it too. A brand only picks 5 colours, a look and two fonts;
 * readable text colours are worked out here so any palette stays legible.
 */

export const LATIN_FONTS = [
  { id: 'poppins', label: 'Poppins' },
  { id: 'montserrat', label: 'Montserrat' },
  { id: 'inter', label: 'Inter' },
  { id: 'playfair', label: 'Playfair Display (serif)' },
  { id: 'cairo', label: 'Cairo' },
  { id: 'tajawal', label: 'Tajawal' },
];

export const ARABIC_FONTS = [
  { id: 'plex', label: 'IBM Plex Sans Arabic' },
  { id: 'cairo', label: 'Cairo' },
  { id: 'tajawal', label: 'Tajawal' },
  { id: 'almarai', label: 'Almarai' },
];

// gradient: brand gradient scenes · solid: flat brand colour · dark: dark scenes lit by the brand colour · light: light scenes, brand colour as accent
export const LOOKS = ['gradient', 'solid', 'dark', 'light'];

export const DEFAULT_VISUAL = {
  primary: '#40A664',
  secondary: '#226E3D',
  accent: '#3DAA63',
  dark: '#1D2A22',
  light: '#EAF6EE',
  look: 'gradient',
  fontLatin: 'poppins',
  fontArabic: 'plex',
};

export const isHex = (c) => typeof c === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c);

function rgb(c) {
  let h = c.slice(1);
  if (h.length === 3) h = [...h].map((x) => x + x).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

const toHex = (parts) => `#${parts.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`;

/** Blends colour a toward b by t (0 = a, 1 = b). */
export function mix(a, b, t) {
  const [x, y] = [rgb(a), rgb(b)];
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
}

export const rgba = (c, alpha) => `rgba(${rgb(c).join(', ')}, ${alpha})`;

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function luminance(c) {
  const [r, g, b] = rgb(c).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Whichever of the candidates reads best on `bg`. */
export const readableOn = (bg, ...candidates) => candidates.reduce((best, c) => (contrast(bg, c) > contrast(bg, best) ? c : best));

/** Fills missing or malformed values from the defaults. */
export function cleanVisual(visual = {}) {
  const v = { ...DEFAULT_VISUAL };
  for (const key of ['primary', 'secondary', 'accent', 'dark', 'light']) if (isHex(visual[key])) v[key] = visual[key];
  if (LOOKS.includes(visual.look)) v.look = visual.look;
  if (LATIN_FONTS.some((f) => f.id === visual.fontLatin)) v.fontLatin = visual.fontLatin;
  if (ARABIC_FONTS.some((f) => f.id === visual.fontArabic)) v.fontArabic = visual.fontArabic;
  return v;
}

const WHITE = '#FFFFFF';

/**
 * Two surfaces per look: `main` (most scenes) and `alt` (hook and pain scenes, for contrast).
 * Each surface says how to paint its background and what reads on top of it.
 */
export function makeTheme(visual) {
  const v = cleanVisual(visual);
  const { primary, secondary, accent, dark, light } = v;
  const middle = mix(primary, secondary, 0.55);
  const deep = mix(secondary, '#000000', 0.4);
  const gradient = `linear-gradient(135deg, ${primary} 0%, ${middle} 60%, ${secondary} 100%)`;

  const onColor = (bg) => readableOn(bg, WHITE, dark);
  const markOn = (bg) => (contrast(bg, accent) >= 2.2 ? accent : readableOn(bg, primary, secondary, deep, dark));

  const brandSurface = (bg, base) => {
    const fg = onColor(base);
    const light_ = fg === WHITE;
    return {
      bg,
      base,
      fg,
      soft: light_ ? light : rgba(dark, 0.78),
      line: fg,
      overlay: `linear-gradient(160deg, ${rgba(primary, 0.8)} 0%, ${rgba(secondary, 0.9)} 100%)`,
      glow: light_ ? 'rgba(255,255,255,0.16)' : rgba(WHITE, 0.3),
      grid: fg,
      chipBg: light_ ? light : WHITE,
      chipFg: readableOn(light_ ? light : WHITE, deep, dark),
      mark: markOn(light_ ? light : WHITE),
      pillBg: light_ ? light : dark,
      pillFg: light_ ? readableOn(light, dark, deep) : WHITE,
      buttonBg: light_ ? WHITE : dark,
      buttonFg: light_ ? readableOn(WHITE, deep, dark) : WHITE,
    };
  };

  const darkSurface = (base, glowColor) => ({
    bg: `radial-gradient(circle at 25% 15%, ${rgba(glowColor, 0.35)} 0%, transparent 55%), ${base}`,
    base,
    fg: WHITE,
    soft: mix(light, WHITE, 0.2),
    line: contrast(base, accent) >= 2.2 ? accent : WHITE,
    overlay: `linear-gradient(180deg, ${rgba(base, 0.72)} 0%, ${rgba(base, 0.9)} 100%)`,
    glow: 'rgba(255,255,255,0.12)',
    grid: WHITE,
    chipBg: 'rgba(255,255,255,0.1)',
    chipFg: WHITE,
    mark: contrast(base, accent) >= 2.2 ? accent : light,
    pillBg: light,
    pillFg: readableOn(light, dark, deep),
    buttonBg: contrast(base, accent) >= 2.2 ? accent : WHITE,
    buttonFg: onColor(contrast(base, accent) >= 2.2 ? accent : WHITE),
  });

  const lightBase = mix(light, WHITE, 0.4);
  const lightSurface = {
    bg: `radial-gradient(circle at 80% 10%, ${rgba(primary, 0.18)} 0%, transparent 55%), linear-gradient(170deg, ${lightBase} 0%, ${light} 100%)`,
    base: lightBase,
    fg: readableOn(lightBase, dark, deep, '#000000'),
    soft: rgba(dark, 0.72),
    line: markOn(lightBase),
    overlay: `linear-gradient(180deg, ${rgba(lightBase, 0.82)} 0%, ${rgba(light, 0.92)} 100%)`,
    glow: rgba(primary, 0.12),
    grid: dark,
    chipBg: WHITE,
    chipFg: readableOn(WHITE, dark, deep),
    mark: markOn(WHITE),
    pillBg: dark,
    pillFg: WHITE,
    buttonBg: primary,
    buttonFg: onColor(primary),
  };

  const surfaces = {
    gradient: { main: brandSurface(gradient, middle), alt: darkSurface(dark, primary) },
    solid: { main: brandSurface(primary, primary), alt: darkSurface(dark, primary) },
    dark: { main: darkSurface(dark, primary), alt: darkSurface(mix(dark, '#000000', 0.45), accent) },
    light: { main: lightSurface, alt: brandSurface(gradient, middle) },
  }[v.look];

  return {
    visual: v,
    ...surfaces,
    frame: dark,
    barBg: light,
    captionBg: rgba(dark, 0.74),
    progress: v.look === 'light' ? primary : light,
    cardDark: rgba(dark, 0.6),
    cardLight: WHITE,
    cardText: readableOn(WHITE, dark, '#000000'),
    before: '#EC736C',
    after: markOn(WHITE),
    // A dark-text main surface needs a backdrop behind (usually white) logos.
    logoBackdrop: surfaces.main.fg !== WHITE ? rgba(dark, 0.55) : null,
    fontFamily: `"brand-latin-${v.fontLatin}", "brand-arabic-${v.fontArabic}", 'Segoe UI', Tahoma, sans-serif`,
  };
}
