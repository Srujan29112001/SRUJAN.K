'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
  Scanline,
  Glitch,
} from '@react-three/postprocessing';
import { BlendFunction, GlitchMode } from 'postprocessing';
import * as THREE from 'three';

interface PostProcessingProps {
  enableBloom?: boolean;
  enableChromaticAberration?: boolean;
  enableNoise?: boolean;
  enableVignette?: boolean;
  enableScanlines?: boolean;
  enableGlitch?: boolean;
  bloomIntensity?: number;
  chromaticOffset?: number;
}

export function PostProcessing({
  enableBloom = true,
  enableChromaticAberration = true,
  enableNoise = true,
  enableVignette = true,
  enableScanlines = false,
  enableGlitch = false,
  bloomIntensity = 0.5,
  chromaticOffset = 0.002,
}: PostProcessingProps) {
  const { mouse } = useThree();
  const chromaticRef = useRef<any>(null);

  // Dynamic chromatic aberration based on mouse movement
  useFrame(() => {
    if (chromaticRef.current && enableChromaticAberration) {
      const intensity = Math.abs(mouse.x) + Math.abs(mouse.y);
      chromaticRef.current.offset.set(
        chromaticOffset * intensity * mouse.x,
        chromaticOffset * intensity * mouse.y
      );
    }
  });

  return (
    <EffectComposer multisampling={0}>
      {enableBloom && (
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          height={200} // OPTIMIZED: Reduced from 300
        />
      )}

      {enableChromaticAberration && (
        <ChromaticAberration
          ref={chromaticRef}
          offset={new THREE.Vector2(chromaticOffset, chromaticOffset)}
          radialModulation={false}
          modulationOffset={0.5}
        />
      )}

      {enableNoise && (
        <Noise
          opacity={0.02}
          blendFunction={BlendFunction.OVERLAY}
        />
      )}

      {enableVignette && (
        <Vignette
          offset={0.3}
          darkness={0.6}
          blendFunction={BlendFunction.NORMAL}
        />
      )}

      {enableScanlines && (
        <Scanline
          density={1.25}
          blendFunction={BlendFunction.OVERLAY}
        />
      )}

      {enableGlitch && (
        <Glitch
          delay={new THREE.Vector2(1.5, 3.5)}
          duration={new THREE.Vector2(0.1, 0.3)}
          strength={new THREE.Vector2(0.1, 0.2)}
          mode={GlitchMode.SPORADIC}
          active
          ratio={0.85}
        />
      )}
    </EffectComposer>
  );
}

// Lighter version for performance
export function LightPostProcessing() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.3}
        luminanceThreshold={0.3}
        luminanceSmoothing={0.9}
        height={200}
      />
      <Vignette offset={0.3} darkness={0.5} />
    </EffectComposer>
  );
}
