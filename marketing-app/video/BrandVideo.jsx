import React from 'react';
import { AbsoluteFill, Audio, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { flip } from '@remotion/transitions/flip';
import { CtaScene, HookScene, ProofScene, StandardScene } from './scenes.jsx';
import { Logo } from './parts.jsx';
import { TRANSITION_FRAMES, sceneFrames } from './timing.js';
import { ThemeProvider, resolveSrc, useBrandFonts, useTheme } from './theme.js';
import { makeTheme } from './brand-theme.js';

function presentation(name, rtl) {
  // Slides and wipes follow the reading direction so Arabic moves right-to-left.
  const dir = rtl ? 'from-left' : 'from-right';
  switch (name) {
    case 'slide':
      return slide({ direction: dir });
    case 'wipe':
      return wipe({ direction: dir });
    case 'flip':
      return flip({ direction: dir });
    default:
      return fade();
  }
}

function SceneSwitch({ scene, props, brandName }) {
  const common = { scene, base: props.mediaBase, language: props.script.language };
  if (scene.type === 'hook') return <HookScene {...common} />;
  if (scene.type === 'proof') return <ProofScene {...common} />;
  if (scene.type === 'cta') return <CtaScene {...common} cta={props.script.cta} logoSrc={props.logoSrc} brandName={brandName} />;
  return <StandardScene {...common} website={props.brand?.website} />;
}

/** Burned-in subtitles of the voiceover line for the scene playing now. */
function Captions({ scenes }) {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const { width, height } = useVideoConfig();
  let start = 0;
  let current = null;
  for (const s of scenes) {
    const len = sceneFrames(s);
    if (frame >= start && frame < start + len - TRANSITION_FRAMES / 2) current = { s, start };
    start += len - TRANSITION_FRAMES;
  }
  if (!current?.s.voiceover) return null;
  const local = frame - current.start;
  const opacity = interpolate(local, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: height * 0.07 }}>
      <div
        style={{
          opacity,
          maxWidth: '86%',
          textAlign: 'center',
          fontSize: width * 0.034,
          fontWeight: 600,
          lineHeight: 1.45,
          color: '#FFFFFF',
          background: theme.captionBg,
          padding: `${width * 0.012}px ${width * 0.03}px`,
          borderRadius: 18,
        }}
      >
        {current.s.voiceover}
      </div>
    </AbsoluteFill>
  );
}

function ProgressBar() {
  const frame = useCurrentFrame();
  const { durationInFrames, width } = useVideoConfig();
  const { progress } = useTheme();
  return <div style={{ position: 'absolute', bottom: 0, left: 0, height: width * 0.006, width: `${(frame / durationInFrames) * 100}%`, background: progress, opacity: 0.85 }} />;
}

/** One brand's video: the brand (colours, look, fonts, logo, name) comes in with the props. */
export function BrandVideo(props) {
  const { script, mediaBase, logoSrc, musicSrc, voiceSrc, captions, brand } = props;
  const theme = React.useMemo(() => makeTheme(brand?.visual), [brand?.visual]);
  useBrandFonts(theme.visual);
  const brandName = brand?.name?.[script.language] || brand?.name?.en || '';
  const { width, durationInFrames, fps } = useVideoConfig();
  const rtl = script.language === 'ar';
  const scenes = script.scenes;
  const hasVoice = !!voiceSrc || scenes.some((s) => s.voice?.src);
  const musicVolume = (f) => (hasVoice ? 0.16 : 0.5) * interpolate(f, [0, fps, durationInFrames - fps * 1.5, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <ThemeProvider value={theme}>
      <AbsoluteFill style={{ fontFamily: theme.fontFamily, direction: rtl ? 'rtl' : 'ltr', background: theme.frame }}>
        <TransitionSeries>
          {scenes.map((scene, i) => (
            <React.Fragment key={scene.id || i}>
              <TransitionSeries.Sequence durationInFrames={sceneFrames(scene)}>
                <SceneSwitch scene={scene} props={props} brandName={brandName} />
                {/* AI voiceover: each scene speaks its own line, so voice and visuals stay in sync. */}
                {scene.voice?.src && <Audio src={resolveSrc(mediaBase, scene.voice.src)} playbackRate={scene.voice.rate || 1} />}
              </TransitionSeries.Sequence>
              {i < scenes.length - 1 && <TransitionSeries.Transition presentation={presentation(scene.transition, rtl)} timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })} />}
            </React.Fragment>
          ))}
        </TransitionSeries>

        {/* Logo watermark everywhere except the CTA scene, which shows it large. */}
        <AbsoluteFill style={{ padding: width * 0.06, alignItems: rtl ? 'flex-start' : 'flex-end', pointerEvents: 'none' }}>
          <Watermark scenes={scenes} logoSrc={logoSrc} base={mediaBase} name={brandName} />
        </AbsoluteFill>

        {captions && hasVoice && <Captions scenes={scenes} />}
        <ProgressBar />
        {musicSrc && <Audio src={resolveSrc(mediaBase, musicSrc)} volume={musicVolume} loop />}
        {voiceSrc && <Audio src={resolveSrc(mediaBase, voiceSrc)} />}
      </AbsoluteFill>
    </ThemeProvider>
  );
}

function Watermark({ scenes, logoSrc, base, name }) {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const { width } = useVideoConfig();
  const ctaStart = scenes.slice(0, -1).reduce((a, s) => a + sceneFrames(s) - TRANSITION_FRAMES, 0);
  const opacity = scenes.at(-1)?.type === 'cta' ? interpolate(frame, [ctaStart - 10, ctaStart + 5], [0.9, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0.9;
  // The watermark crosses light and dark scenes: on light looks a text name sits in its own dark pill.
  const pill = !logoSrc && theme.logoBackdrop ? { background: theme.logoBackdrop, padding: `${width * 0.008}px ${width * 0.02}px`, borderRadius: width * 0.02 } : {};
  return <Logo src={logoSrc} base={base} height={width * 0.055} name={name} color={pill.background ? '#FFFFFF' : theme.main.fg} backdrop={theme.logoBackdrop} style={{ opacity, ...pill }} />;
}
