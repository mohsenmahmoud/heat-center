import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { BrandVideo } from './BrandVideo.jsx';
import { DIMENSIONS, FPS, totalFrames } from './timing.js';
import { sampleProps } from './sample.js';

function Root() {
  return (
    <Composition
      id="BrandVideo"
      component={BrandVideo}
      fps={FPS}
      width={1080}
      height={1920}
      durationInFrames={totalFrames(sampleProps.script.scenes)}
      defaultProps={sampleProps}
      calculateMetadata={({ props }) => ({
        durationInFrames: totalFrames(props.script.scenes),
        ...(DIMENSIONS[props.script.aspect] || DIMENSIONS['9:16']),
      })}
    />
  );
}

registerRoot(Root);
