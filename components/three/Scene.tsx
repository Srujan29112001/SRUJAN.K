'use client';

import { ReactNode, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  Noise,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

interface SceneProps {
  children: ReactNode;
  className?: string;
  cameraPosition?: [number, number, number];
  fov?: number;
  enablePostProcessing?: boolean;
  enableBloom?: boolean;
  enableChromaticAberration?: boolean;
  bloomIntensity?: number;
}

function Loader() {
  return null; // Silent loader
}

// Post-processing effects component
function Effects({
  enableBloom = true,
  enableChromaticAberration = true,
  bloomIntensity = 0.4,
}: {
  enableBloom?: boolean;
  enableChromaticAberration?: boolean;
  bloomIntensity?: number;
}) {
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
          offset={new THREE.Vector2(0.001, 0.001)}
          radialModulation={false}
          modulationOffset={0.5}
        />
      )}
      <Vignette
        offset={0.3}
        darkness={0.5}
        blendFunction={BlendFunction.NORMAL}
      />
      <Noise
        opacity={0.015}
        blendFunction={BlendFunction.OVERLAY}
      />
    </EffectComposer>
  );
}

export function Scene({
  children,
  className = '',
  cameraPosition = [0, 0, 5],
  fov = 45,
  enablePostProcessing = true,
  enableBloom = true,
  enableChromaticAberration = true,
  bloomIntensity = 0.4,
}: SceneProps) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        camera={{ position: cameraPosition, fov }}
        dpr={[1, 1.5]} // OPTIMIZED: Reduced from [1, 2]
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={<Loader />}>
          {/* Ambient lighting */}
          <ambientLight intensity={0.4} />

          {/* Main light */}
          <pointLight position={[10, 10, 10]} intensity={0.8} />

          {/* Accent light - Cyan */}
          <pointLight position={[-10, -10, -10]} intensity={0.3} color="#06B6D4" />

          {/* Purple rim light */}
          <pointLight position={[0, 10, -5]} intensity={0.5} color="#6D64A3" />

          {/* Warm accent light */}
          <pointLight position={[5, -5, 5]} intensity={0.2} color="#F59E0B" />

          {/* Fog for depth */}
          <fog attach="fog" args={['#030712', 5, 20]} />

          {children}

          {/* Post-processing effects */}
          {enablePostProcessing && (
            <Effects
              enableBloom={enableBloom}
              enableChromaticAberration={enableChromaticAberration}
              bloomIntensity={bloomIntensity}
            />
          )}

          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Lightweight scene without post-processing for performance
export function LightScene({
  children,
  className = '',
  cameraPosition = [0, 0, 5],
  fov = 45,
}: Omit<SceneProps, 'enablePostProcessing' | 'enableBloom' | 'enableChromaticAberration' | 'bloomIntensity'>) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        camera={{ position: cameraPosition, fov }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'low-power',
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={0.6} />
          {children}
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
