import React from 'react';
import { AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { resolveSrc, useTheme } from './theme.js';
import { rgba } from './brand-theme.js';

/**
 * Scene background: the brand surface (gradient, flat colour, dark or light), or a photo/footage with slow camera
 * motion toward its focus, a scrim where the text sits and a light brand tint.
 */
export function Background({ visual, base, tone = 'main', scrim = 'top' }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const theme = useTheme();
  const surface = theme[tone];
  const drift = Math.sin(frame / 40) * 60;
  const src = resolveSrc(base, visual?.src);
  const isMedia = src && (visual.kind === 'video' || visual.kind === 'image');
  const zoom = interpolate(frame, [0, durationInFrames], isMedia ? [1.02, 1.14] : [1.08, 1.0]);
  const focus = visual?.focus;
  const origin = focus ? `${(focus.x + focus.w / 2) * 100}% ${(focus.y + focus.h / 2) * 100}%` : '50% 40%';

  if (isMedia) {
    return (
      <AbsoluteFill style={{ background: theme.media.bg, overflow: 'hidden' }}>
        <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: origin }}>
          {visual.kind === 'video' ? (
            <OffthreadVideo src={src} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: origin }} />
          )}
        </AbsoluteFill>
        <AbsoluteFill style={{ background: theme.media.tint }} />
        <AbsoluteFill style={{ background: theme.media.scrim(scrim) }} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ background: surface.bg, overflow: 'hidden' }}>
      {/* soft light blobs keep plain backgrounds alive */}
      <div style={{ position: 'absolute', width: '90%', aspectRatio: '1', borderRadius: '50%', top: '-25%', left: `${-20 + drift / 20}%`, background: `radial-gradient(circle, ${surface.glow}, transparent 65%)` }} />
      <div style={{ position: 'absolute', width: '80%', aspectRatio: '1', borderRadius: '50%', bottom: '-30%', right: `${-25 - drift / 25}%`, background: `radial-gradient(circle, ${surface.glow}, transparent 60%)`, opacity: 0.75 }} />
      <Grid color={surface.grid} />
    </AbsoluteFill>
  );
}

/** True when a scene's visual is a photo or footage shown full screen. */
export const isMediaVisual = (visual) => !!visual?.src && (visual.kind === 'image' || visual.kind === 'video');

function Grid({ color }) {
  const frame = useCurrentFrame();
  const offset = (frame * 0.6) % 80;
  return (
    <AbsoluteFill
      style={{
        opacity: 0.08,
        backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
        backgroundPosition: `0 ${offset}px`,
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
      }}
    />
  );
}

/** Headline revealed word by word with a spring. */
export function KineticHeadline({ text, size, color, delay = 0, weight = 800, align = 'start' }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = String(text || '').split(/\s+/).filter(Boolean);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: `0 ${size * 0.28}px`, justifyContent: align === 'center' ? 'center' : 'flex-start', lineHeight: 1.25 }}>
      {words.map((w, i) => {
        const s = spring({ frame: frame - delay - i * 3, fps, config: { damping: 14, stiffness: 140 } });
        return (
          <span key={i} style={{ display: 'inline-block', fontSize: size, fontWeight: weight, color, opacity: s, transform: `translateY(${(1 - s) * size * 0.6}px)` }}>
            {w}
          </span>
        );
      })}
    </div>
  );
}

export function FadeUp({ children, delay = 0, style }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18 } });
  return <div style={{ opacity: s, transform: `translateY(${(1 - s) * 40}px)`, ...style }}>{children}</div>;
}

/** A curved swoosh under the headline, drawn on. */
export function Swoosh({ width, color, delay = 8 }) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame - delay, [0, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <svg width={width} height={width * 0.09} viewBox="0 0 400 36" style={{ display: 'block', overflow: 'visible' }}>
      <path d="M4 26 C 120 4, 260 4, 396 22" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - progress} />
    </svg>
  );
}

export function Chip({ children, size, surface, variant = 'mark', delay = 0 }) {
  const { before } = useTheme();
  const pain = variant === 'pain';
  const style = pain
    ? { background: 'rgba(255,255,255,0.12)', color: surface.fg, border: `2px solid ${surface.fg === '#FFFFFF' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)'}` }
    : { background: surface.chipBg, color: surface.chipFg };
  return (
    <FadeUp delay={delay}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.5, padding: `${size * 0.45}px ${size * 0.9}px`, borderRadius: size * 2, fontSize: size, fontWeight: 600, ...style }}>
        <span style={{ color: pain ? before : surface.mark, fontWeight: 800 }}>{pain ? '✕' : '✓'}</span>
        {children}
      </div>
    </FadeUp>
  );
}

const FULL = { x: 0, y: 0, w: 1, h: 1 };
const FALLBACK_SIZE = { phone: { w: 900, h: 1950 }, portrait: { w: 1000, h: 1600 }, landscape: { w: 1600, h: 1000 } };
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => (lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, v)));

/**
 * A screenshot, presented rather than pasted: inside a phone or browser frame that tilts in, cropped to its useful
 * content, then a slow camera move into the area that proves the scene, a spotlight on it and a short label.
 * `shot` comes from the AI review of the image (see server/services/visuals.js); without it, a sensible default.
 * `boxW` × `boxH` is the room the scene leaves for the device, in pixels.
 */
export function ScreenShowcase({ src, base, orientation = 'landscape', size, shot, rtl, website, boxW, boxH, delay = 6 }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const theme = useTheme();
  const url = resolveSrc(base, src);
  const img = size?.w && size?.h ? size : FALLBACK_SIZE[orientation] || FALLBACK_SIZE.landscape;
  const C = shot?.content || FULL;
  const aiFocus = shot?.focus || null;
  const F = aiFocus || (orientation === 'landscape' ? { x: rtl ? 0.4 : 0, y: 0, w: 0.6, h: 0.6 } : { x: 0, y: 0, w: 1, h: 0.45 });
  const contentRatio = (C.h * img.h) / (C.w * img.w);
  const phone = orientation === 'phone' || contentRatio >= 1.7;

  // Frame and viewport sizes in pixels.
  const border = phone ? Math.round(boxW * 0.018) + 6 : 0;
  const bar = phone ? 0 : Math.round(boxW * 0.055);
  let Vw;
  let Vh;
  if (phone) {
    Vh = Math.min(boxH - border * 2, ((boxW * 0.62 - border * 2) * 19.5) / 9);
    Vw = (Vh * 9) / 19.5;
  } else {
    Vw = boxW;
    Vh = Math.min(boxH - bar, Vw * clamp(contentRatio, 0.62, 1.25));
  }

  // Camera: cover the content, then move in on the focus and hold.
  const zoomEnd = Math.max(delay + 40, delay + 20 + (durationInFrames - delay - 30) * 0.55);
  const p = interpolate(frame, [delay + 20, zoomEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const s0 = Math.max(Vw / (C.w * img.w), Vh / (C.h * img.h));
  const s1 = clamp(Math.min(Vw / (F.w * img.w), Vh / (F.h * img.h)) * 0.84, s0, s0 * 2.6);
  const sc = lerp(s0, s1, p) * (1 + 0.015 * Math.sin(frame / 30));
  const cx = lerp(C.x + C.w / 2, F.x + F.w / 2, p);
  const cy = lerp(C.y + C.h / 2, F.y + F.h / 2, p);
  const W = img.w * sc;
  const H = img.h * sc;
  const left = clamp(Vw / 2 - cx * W, Vw - (C.x + C.w) * W, -C.x * W);
  const top = clamp(Vh / 2 - cy * H, Vh - (C.y + C.h) * H, -C.y * H);

  // Entrance: tilts up from below, then floats.
  const enter = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 80 } });
  const float = Math.sin(frame / 22) * 5;
  const glowIn = interpolate(p, [0.55, 0.85], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const label = spring({ frame: frame - zoomEnd + 6, fps, config: { damping: 12 } });
  const r = Math.round(Vw * 0.02) + 4;

  const viewport = (
    <div style={{ position: 'relative', width: Vw, height: Vh, overflow: 'hidden', background: '#FFFFFF' }}>
      <Img src={url} style={{ position: 'absolute', left, top, width: W, height: H, maxWidth: 'none' }} />
      {aiFocus && glowIn > 0 && (
        <div
          style={{
            position: 'absolute',
            left: left + F.x * W - 6,
            top: top + F.y * H - 6,
            width: F.w * W + 12,
            height: F.h * H + 12,
            borderRadius: r,
            border: `${Math.max(3, Vw * 0.006)}px solid ${theme.spotlight}`,
            boxShadow: `0 0 0 4000px rgba(0,0,0,${0.38 * glowIn}), 0 0 ${Vw * 0.04}px ${theme.spotlight}`,
            opacity: glowIn,
          }}
        />
      )}
    </div>
  );

  return (
    <div style={{ position: 'relative', perspective: 1800, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {shot?.callout && (
        <div
          style={{
            position: 'relative',
            marginBottom: -Vw * 0.045,
            zIndex: 2,
            transform: `scale(${label})`,
            opacity: label,
            background: theme.calloutBg,
            color: theme.calloutFg,
            fontWeight: 800,
            fontSize: Math.max(26, boxW * 0.042),
            padding: `${boxW * 0.014}px ${boxW * 0.04}px`,
            borderRadius: 999,
            boxShadow: '0 18px 40px rgba(0,0,0,0.3)',
            whiteSpace: 'nowrap',
          }}
        >
          {shot.callout}
        </div>
      )}
      {/* brand-coloured glow behind the device */}
      <div style={{ position: 'absolute', inset: '-12%', background: `radial-gradient(ellipse at center, ${rgba(theme.spotlight, 0.33)} 0%, transparent 62%)`, filter: 'blur(30px)', opacity: enter }} />
      <div
        style={{
          position: 'relative',
          transform: `translateY(${(1 - enter) * 260 + float}px) rotateX(${(1 - enter) * 22}deg) rotateY(${(1 - enter) * (rtl ? 10 : -10)}deg) scale(${0.9 + enter * 0.1})`,
          opacity: Math.min(1, enter * 1.4),
          boxShadow: '0 40px 90px rgba(0,0,0,0.38)',
          borderRadius: phone ? Vw * 0.13 : r,
          overflow: 'hidden',
          background: phone ? theme.frame : '#FFFFFF',
          padding: phone ? border : 0,
        }}
      >
        {phone ? (
          <div style={{ borderRadius: Vw * 0.1, overflow: 'hidden' }}>{viewport}</div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: bar * 0.18, height: bar, padding: `0 ${bar * 0.36}px`, background: theme.barBg, direction: 'ltr' }}>
              {['#EC736C', '#E0A54D', '#3DAA63'].map((c) => (
                <span key={c} style={{ width: bar * 0.24, height: bar * 0.24, borderRadius: bar, background: c }} />
              ))}
              <span style={{ marginLeft: bar * 0.3, flex: 1, padding: `${bar * 0.1}px ${bar * 0.3}px`, borderRadius: bar * 0.2, background: '#FFFFFF', color: '#868C87', fontSize: bar * 0.36, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{website || ''}</span>
            </div>
            {viewport}
          </>
        )}
      </div>
    </div>
  );
}

/** The brand logo, or its name in the brand font when no logo was uploaded. The backdrop keeps (usually white) logo images visible on light scenes. */
export function Logo({ src, base, height, name, color = '#FFFFFF', backdrop = null, style }) {
  if (!src) {
    return <div style={{ fontSize: height * 0.7, fontWeight: 800, color, letterSpacing: 1, lineHeight: 1.2, ...style }}>{name}</div>;
  }
  const pad = backdrop ? { background: backdrop, padding: `${height * 0.22}px ${height * 0.38}px`, borderRadius: height * 0.4 } : {};
  return (
    <div style={{ display: 'inline-flex', ...pad, ...style }}>
      <Img src={resolveSrc(base, src)} style={{ height, display: 'block' }} />
    </div>
  );
}
