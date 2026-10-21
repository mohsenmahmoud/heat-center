import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background, Chip, DeviceMockup, FadeUp, KineticHeadline, Logo, Swoosh } from './parts.jsx';
import { useTheme } from './theme.js';

const layout = (width, height) => ({
  pad: width * 0.08,
  h1: width * (height > width ? 0.085 : 0.06),
  body: width * (height > width ? 0.042 : 0.03),
  chip: width * (height > width ? 0.034 : 0.025),
});

function TextBlock({ scene, L, surface }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: L.body * 0.9 }}>
      <KineticHeadline text={scene.headline} size={L.h1} color={surface.fg} />
      <Swoosh width={L.h1 * 4.5} color={surface.line} />
      {scene.subtext && (
        <FadeUp delay={14}>
          <div style={{ fontSize: L.body, fontWeight: 500, color: surface.soft, lineHeight: 1.5, maxWidth: '95%' }}>{scene.subtext}</div>
        </FadeUp>
      )}
      {scene.bullets?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: L.chip * 0.7, marginTop: L.chip * 0.4 }}>
          {scene.bullets.map((b, i) => (
            <Chip key={i} size={L.chip} delay={20 + i * 6} surface={surface} variant={scene.type === 'pain' ? 'pain' : 'mark'}>
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
  const surface = useTheme().alt;
  const punch = interpolate(frame, [0, 8, 14], [1.25, 0.97, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill>
      <Background visual={scene.visual} base={base} tone="alt" />
      <AbsoluteFill style={{ justifyContent: 'center', padding: L.pad, transform: `scale(${punch})` }}>
        <KineticHeadline text={scene.headline} size={L.h1 * 1.2} color={surface.fg} />
        {scene.subtext && (
          <FadeUp delay={16} style={{ marginTop: L.body }}>
            <div style={{ display: 'inline-block', fontSize: L.body, fontWeight: 600, color: surface.pillFg, background: surface.pillBg, padding: `${L.body * 0.3}px ${L.body * 0.7}px`, borderRadius: 14 }}>
              {scene.subtext}
            </div>
          </FadeUp>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export function StandardScene({ scene, base, language, website }) {
  const { width, height } = useVideoConfig();
  const theme = useTheme();
  const L = layout(width, height);
  const portrait = height > width;
  const hasMockup = scene.visual?.kind === 'mockup' && scene.visual.src;
  const tone = scene.type === 'pain' ? 'alt' : 'main';

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
          <TextBlock scene={scene} L={L} surface={theme[tone]} />
        </div>
        {hasMockup && (
          <div style={{ flex: 1, display: 'flex', alignItems: portrait ? 'flex-end' : 'center', justifyContent: 'center', minHeight: 0 }}>
            <DeviceMockup src={scene.visual.src} base={base} orientation={scene.visual.orientation} rtl={language === 'ar'} website={website} width={portrait ? width * 0.84 : width * 0.42} />
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export function ProofScene({ scene, base, language }) {
  const { width, height } = useVideoConfig();
  const L = layout(width, height);
  const theme = useTheme();
  const labels = language === 'ar' ? ['قبل', 'بعد'] : ['Before', 'After'];
  const card = (label, text, dark, delay) => (
    <FadeUp delay={delay}>
      <div style={{ background: dark ? theme.cardDark : theme.cardLight, borderRadius: 28, padding: L.body * 1.1, boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: L.chip, fontWeight: 700, color: dark ? theme.before : theme.after, marginBottom: L.chip * 0.4 }}>{label}</div>
        <div style={{ fontSize: L.body * 1.15, fontWeight: 700, lineHeight: 1.4, color: dark ? '#FFFFFF' : theme.cardText }}>{text}</div>
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

export function CtaScene({ scene, base, cta, logoSrc, brandName }) {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const surface = theme.main;
  const { fps, width, height } = useVideoConfig();
  const L = layout(width, height);
  const pop = spring({ frame: frame - 24, fps, config: { damping: 9 } });
  const pulse = 1 + Math.sin(frame / 6) * 0.03 * Math.min(1, frame / 40);
  return (
    <AbsoluteFill>
      <Background visual={null} base={base} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: L.pad, gap: L.body * 1.2, textAlign: 'center' }}>
        <FadeUp>
          <Logo src={logoSrc} base={base} height={L.h1 * 1.6} name={brandName} color={surface.fg} backdrop={theme.logoBackdrop} />
        </FadeUp>
        <KineticHeadline text={scene.headline} size={L.h1} color={surface.fg} align="center" delay={6} />
        {scene.subtext && (
          <FadeUp delay={14}>
            <div style={{ fontSize: L.body, color: surface.soft, lineHeight: 1.5 }}>{scene.subtext}</div>
          </FadeUp>
        )}
        <div style={{ transform: `scale(${pop * pulse})`, background: surface.buttonBg, color: surface.buttonFg, fontWeight: 800, fontSize: L.body * 1.15, padding: `${L.body * 0.6}px ${L.body * 1.6}px`, borderRadius: 999, boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
          {cta?.button || cta?.headline}
        </div>
        {cta?.contact && (
          <FadeUp delay={30}>
            <div style={{ fontSize: L.chip, color: surface.fg, opacity: 0.9, direction: 'ltr' }}>{cta.contact}</div>
          </FadeUp>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
