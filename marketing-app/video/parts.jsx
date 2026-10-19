import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, gradient, resolveSrc } from './theme.js';

/** Scene background: animated brand gradient, or stock/AI media with a green duotone overlay. */
export function Background({ visual, base, tone = 'green' }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1.08, 1.0]);
  const drift = Math.sin(frame / 40) * 60;
  const src = resolveSrc(base, visual?.src);
  const isMedia = src && (visual.kind === 'video' || visual.kind === 'image');
  const overlay =
    tone === 'dark'
      ? 'linear-gradient(180deg, rgba(14,22,17,0.72) 0%, rgba(14,22,17,0.88) 100%)'
      : 'linear-gradient(160deg, rgba(64,166,100,0.80) 0%, rgba(34,110,61,0.90) 100%)';

  return (
    <AbsoluteFill style={{ background: tone === 'dark' ? colors.ink : gradient, overflow: 'hidden' }}>
      {isMedia && (
        <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
          {visual.kind === 'video' ? (
            <OffthreadVideo src={src} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: isMedia ? overlay : 'transparent' }} />
      {/* soft light blobs keep plain gradients alive */}
      <div style={{ position: 'absolute', width: '90%', aspectRatio: '1', borderRadius: '50%', top: '-25%', left: `${-20 + drift / 20}%`, background: 'radial-gradient(circle, rgba(255,255,255,0.16), transparent 65%)' }} />
      <div style={{ position: 'absolute', width: '80%', aspectRatio: '1', borderRadius: '50%', bottom: '-30%', right: `${-25 - drift / 25}%`, background: 'radial-gradient(circle, rgba(234,246,238,0.12), transparent 60%)' }} />
      <Grid />
    </AbsoluteFill>
  );
}

function Grid() {
  const frame = useCurrentFrame();
  const offset = (frame * 0.6) % 80;
  return (
    <AbsoluteFill
      style={{
        opacity: 0.08,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        backgroundPosition: `0 ${offset}px`,
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
      }}
    />
  );
}

/** Headline revealed word by word with a spring. */
export function KineticHeadline({ text, size, color = colors.white, delay = 0, weight = 800, align = 'start' }) {
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

/** The white curved swoosh from the brand banner, drawn on. */
export function Swoosh({ width, delay = 8 }) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame - delay, [0, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <svg width={width} height={width * 0.09} viewBox="0 0 400 36" style={{ display: 'block', overflow: 'visible' }}>
      <path d="M4 26 C 120 4, 260 4, 396 22" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - progress} />
    </svg>
  );
}

export function Chip({ children, size, variant = 'mint', delay = 0 }) {
  const styles = {
    mint: { background: colors.mint, color: colors.brandDark },
    pain: { background: 'rgba(255,255,255,0.12)', color: colors.white, border: '2px solid rgba(255,255,255,0.25)' },
  };
  const mark = variant === 'pain' ? '✕' : '✓';
  return (
    <FadeUp delay={delay}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.5, padding: `${size * 0.45}px ${size * 0.9}px`, borderRadius: size * 2, fontSize: size, fontWeight: 600, ...styles[variant] }}>
        <span style={{ color: variant === 'pain' ? colors.red : colors.green, fontWeight: 800 }}>{mark}</span>
        {children}
      </div>
    </FadeUp>
  );
}

/** Uploaded screenshot inside a phone (portrait) or browser (landscape) frame. */
export function DeviceMockup({ src, base, orientation, width, delay = 6 }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 90 } });
  const float = Math.sin(frame / 18) * 8;
  const url = resolveSrc(base, src);
  const common = { transform: `translateY(${(1 - s) * 300 + float}px) rotate(${(1 - s) * -6}deg)`, opacity: s, boxShadow: '0 40px 90px rgba(0,0,0,0.35)', background: colors.white, overflow: 'hidden' };

  if (orientation === 'landscape') {
    return (
      <div style={{ ...common, width, borderRadius: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', background: colors.mintBg, direction: 'ltr' }}>
          {['#EC736C', '#E0A54D', '#3DAA63'].map((c) => (
            <span key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />
          ))}
          <span style={{ marginLeft: 16, flex: 1, padding: '6px 16px', borderRadius: 10, background: colors.white, color: colors.gray, fontSize: 20 }}>qudratms.com</span>
        </div>
        <Img src={url} style={{ width: '100%', display: 'block' }} />
      </div>
    );
  }
  return (
    <div style={{ ...common, width: width * 0.62, borderRadius: 56, border: `14px solid ${colors.ink}` }}>
      <Img src={url} style={{ width: '100%', display: 'block', aspectRatio: '9 / 19', objectFit: 'cover', objectPosition: 'top' }} />
    </div>
  );
}

export function Logo({ src, base, height, style }) {
  if (!src) {
    return <div style={{ fontSize: height * 0.7, fontWeight: 800, color: colors.white, letterSpacing: 1, ...style }}>Qudra · قُدرة</div>;
  }
  return <Img src={resolveSrc(base, src)} style={{ height, ...style }} />;
}
