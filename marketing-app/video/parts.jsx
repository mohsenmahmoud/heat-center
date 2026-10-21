import React from 'react';
import { AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { resolveSrc, useTheme } from './theme.js';

/** Scene background: the brand surface (gradient, flat colour, dark or light), or stock/AI media under a brand-tinted overlay. */
export function Background({ visual, base, tone = 'main' }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const surface = useTheme()[tone];
  const zoom = interpolate(frame, [0, durationInFrames], [1.08, 1.0]);
  const drift = Math.sin(frame / 40) * 60;
  const src = resolveSrc(base, visual?.src);
  const isMedia = src && (visual.kind === 'video' || visual.kind === 'image');

  return (
    <AbsoluteFill style={{ background: surface.bg, overflow: 'hidden' }}>
      {isMedia && (
        <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
          {visual.kind === 'video' ? (
            <OffthreadVideo src={src} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: isMedia ? surface.overlay : 'transparent' }} />
      {/* soft light blobs keep plain backgrounds alive */}
      <div style={{ position: 'absolute', width: '90%', aspectRatio: '1', borderRadius: '50%', top: '-25%', left: `${-20 + drift / 20}%`, background: `radial-gradient(circle, ${surface.glow}, transparent 65%)` }} />
      <div style={{ position: 'absolute', width: '80%', aspectRatio: '1', borderRadius: '50%', bottom: '-30%', right: `${-25 - drift / 25}%`, background: `radial-gradient(circle, ${surface.glow}, transparent 60%)`, opacity: 0.75 }} />
      <Grid color={surface.grid} />
    </AbsoluteFill>
  );
}

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

/**
 * Uploaded screenshot inside a browser frame (desktop screens) or a phone frame (phone screenshots).
 * Wide screens slowly zoom into the top corner where KPIs live; tall pages scroll, so details stay readable on a phone.
 */
export function DeviceMockup({ src, base, orientation, width, rtl, website, delay = 6 }) {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const { fps, durationInFrames } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 90 } });
  const float = Math.sin(frame / 18) * 6;
  const progress = interpolate(frame, [delay + 18, durationInFrames - 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const url = resolveSrc(base, src);
  const common = { transform: `translateY(${(1 - s) * 300 + float}px) rotate(${(1 - s) * -6}deg)`, opacity: s, boxShadow: '0 40px 90px rgba(0,0,0,0.35)', background: '#FFFFFF', overflow: 'hidden' };

  if (orientation === 'phone') {
    return (
      <div style={{ ...common, height: '100%', maxWidth: width * 0.62, aspectRatio: '9 / 19', borderRadius: 56, border: `14px solid ${theme.frame}` }}>
        <Img src={url} style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', objectPosition: `50% ${progress * 100}%` }} />
      </div>
    );
  }
  const tall = orientation === 'portrait';
  return (
    <div style={{ ...common, width, borderRadius: 22, display: 'flex', flexDirection: 'column', ...(tall ? { height: '100%' } : {}) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', background: theme.barBg, direction: 'ltr', flexShrink: 0 }}>
        {['#EC736C', '#E0A54D', '#3DAA63'].map((c) => (
          <span key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />
        ))}
        <span style={{ marginLeft: 16, flex: 1, padding: '6px 16px', borderRadius: 10, background: '#FFFFFF', color: '#868C87', fontSize: 20, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{website || ''}</span>
      </div>
      {tall ? (
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <Img src={url} style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', objectPosition: `50% ${progress * 100}%` }} />
        </div>
      ) : (
        <div style={{ overflow: 'hidden', aspectRatio: '4 / 3' }}>
          <Img src={url} style={{ width: '100%', display: 'block', transform: `scale(${1 + progress * 0.6})`, transformOrigin: rtl ? 'top right' : 'top left' }} />
        </div>
      )}
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
