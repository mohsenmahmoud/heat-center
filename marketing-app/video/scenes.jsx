import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background, Chip, DeviceMockup, FadeUp, KineticHeadline, Logo, Swoosh } from './parts.jsx';
import { colors } from './theme.js';

const layout = (width, height) => ({
  pad: width * 0.08,
  h1: width * (height > width ? 0.085 : 0.06),
  body: width * (height > width ? 0.042 : 0.03),
  chip: width * (height > width ? 0.034 : 0.025),
});

function TextBlock({ scene, L, variant }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: L.body * 0.9 }}>
      <KineticHeadline text={scene.headline} size={L.h1} />
      <Swoosh width={L.h1 * 4.5} />
      {scene.subtext && (
        <FadeUp delay={14}>
          <div style={{ fontSize: L.body, fontWeight: 500, color: colors.mint, lineHeight: 1.5, maxWidth: '95%' }}>{scene.subtext}</div>
        </FadeUp>
      )}
      {scene.bullets?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: L.chip * 0.7, marginTop: L.chip * 0.4 }}>
          {scene.bullets.map((b, i) => (
            <Chip key={i} size={L.chip} delay={20 + i * 6} variant={variant === 'pain' ? 'pain' : 'mint'}>
              {b}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}

export function HookScene({ scene, base }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const L = layout(width, height);
  const punch = interpolate(frame, [0, 8, 14], [1.25, 0.97, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill>
      <Background visual={scene.visual} base={base} tone="dark" />
      <AbsoluteFill style={{ justifyContent: 'center', padding: L.pad, transform: `scale(${punch})` }}>
        <KineticHeadline text={scene.headline} size={L.h1 * 1.2} />
        {scene.subtext && (
          <FadeUp delay={16} style={{ marginTop: L.body }}>
            <div style={{ display: 'inline-block', fontSize: L.body, fontWeight: 600, color: colors.ink, background: colors.mint, padding: `${L.body * 0.3}px ${L.body * 0.7}px`, borderRadius: 14 }}>
              {scene.subtext}
            </div>
          </FadeUp>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export function StandardScene({ scene, base }) {
  const { width, height } = useVideoConfig();
  const L = layout(width, height);
  const portrait = height > width;
  const hasMockup = scene.visual?.kind === 'mockup' && scene.visual.src;
  const tone = scene.type === 'pain' ? 'dark' : 'green';

  return (
    <AbsoluteFill>
      <Background visual={hasMockup ? null : scene.visual} base={base} tone={tone} />
      <AbsoluteFill
        style={{
          padding: L.pad,
          paddingTop: portrait ? height * 0.12 : L.pad,
          display: 'flex',
          flexDirection: portrait ? 'column' : 'row',
          justifyContent: hasMockup ? 'space-between' : 'center',
          alignItems: portrait ? 'stretch' : 'center',
          gap: L.pad,
        }}
      >
        <div style={{ flex: portrait ? '0 0 auto' : 1 }}>
          <TextBlock scene={scene} L={L} variant={scene.type} />
        </div>
        {hasMockup && (
          <div style={{ flex: 1, display: 'flex', alignItems: portrait ? 'flex-end' : 'center', justifyContent: 'center', minHeight: 0 }}>
            <DeviceMockup src={scene.visual.src} base={base} orientation={scene.visual.orientation} width={portrait ? width * 0.84 : width * 0.42} />
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export function ProofScene({ scene, base, language }) {
  const { width, height } = useVideoConfig();
  const L = layout(width, height);
  const labels = language === 'ar' ? ['قبل', 'بعد'] : ['Before', 'After'];
  const card = (label, text, dark, delay) => (
    <FadeUp delay={delay}>
      <div style={{ background: dark ? 'rgba(29,42,34,0.55)' : colors.white, borderRadius: 28, padding: L.body * 1.1, boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: L.chip, fontWeight: 700, color: dark ? colors.red : colors.green, marginBottom: L.chip * 0.4 }}>{label}</div>
        <div style={{ fontSize: L.body * 1.15, fontWeight: 700, lineHeight: 1.4, color: dark ? colors.white : colors.ink }}>{text}</div>
      </div>
    </FadeUp>
  );
  return (
    <AbsoluteFill>
      <Background visual={scene.visual} base={base} />
      <AbsoluteFill style={{ justifyContent: 'center', padding: L.pad, gap: L.body }}>
        {card(labels[0], scene.headline, true, 0)}
        {scene.subtext && card(labels[1], scene.subtext, false, 18)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export function CtaScene({ scene, base, cta, logoSrc }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const L = layout(width, height);
  const pop = spring({ frame: frame - 24, fps, config: { damping: 9 } });
  const pulse = 1 + Math.sin(frame / 6) * 0.03 * Math.min(1, frame / 40);
  return (
    <AbsoluteFill>
      <Background visual={null} base={base} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: L.pad, gap: L.body * 1.2, textAlign: 'center' }}>
        <FadeUp>
          <Logo src={logoSrc} base={base} height={L.h1 * 1.6} />
        </FadeUp>
        <KineticHeadline text={scene.headline} size={L.h1} align="center" delay={6} />
        {scene.subtext && (
          <FadeUp delay={14}>
            <div style={{ fontSize: L.body, color: colors.mint, lineHeight: 1.5 }}>{scene.subtext}</div>
          </FadeUp>
        )}
        <div style={{ transform: `scale(${pop * pulse})`, background: colors.white, color: colors.brandDark, fontWeight: 800, fontSize: L.body * 1.15, padding: `${L.body * 0.6}px ${L.body * 1.6}px`, borderRadius: 999, boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
          {cta?.button || cta?.headline}
        </div>
        {cta?.contact && (
          <FadeUp delay={30}>
            <div style={{ fontSize: L.chip, color: colors.white, opacity: 0.9, direction: 'ltr' }}>{cta.contact}</div>
          </FadeUp>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
