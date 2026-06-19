'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Image, OrbitControls, Float } from '@react-three/drei';

/**
 * ProjectGallery3D — a scattered, draggable, slowly auto-rotating cluster of a
 * project's images floating in 3D space (the interaction is inspired by
 * award-style creative portfolios; implemented originally here for Srujan's
 * own project imagery). Drag to orbit; the cluster idles with a gentle float.
 *
 * Mounted on demand inside the project detail view only, so it never costs
 * anything until a project is opened.
 */

// Deterministic scatter — varied position / tilt / size so the cluster reads
// as a hand of photo cards suspended in space rather than a neat grid.
type Slot = { position: [number, number, number]; rotation: [number, number, number]; scale: [number, number] };

const SLOTS: Slot[] = [
  { position: [-0.2, 0.25, 0.6], rotation: [0, 0.12, 0.04], scale: [2.5, 3.2] },   // hero card, front-centre
  { position: [-2.7, 0.7, -1.4], rotation: [0, 0.45, 0.14], scale: [1.9, 2.5] },
  { position: [2.6, -0.2, -1.1], rotation: [0, -0.4, -0.12], scale: [1.8, 2.4] },
  { position: [0.6, 1.5, -2.6], rotation: [0, 0.05, 0.06], scale: [2.3, 1.55] },
  { position: [-1.6, -1.5, -0.6], rotation: [0, 0.28, -0.1], scale: [1.7, 1.2] },
  { position: [3.2, 1.2, -2.4], rotation: [0, -0.55, 0.1], scale: [1.5, 2.0] },
  { position: [-3.3, -0.7, -2.0], rotation: [0, 0.6, -0.06], scale: [1.45, 1.95] },
];

function Card({ url, slot, color }: { url: string; slot: Slot; color: string }) {
  const [w, h] = slot.scale;
  return (
    <Float speed={1.3} rotationIntensity={0.22} floatIntensity={0.55}>
      <group position={slot.position} rotation={slot.rotation}>
        {/* coloured backing → a thin card edge in the project's colour */}
        <mesh position={[0, 0, -0.03]}>
          <planeGeometry args={[w + 0.1, h + 0.1]} />
          <meshBasicMaterial color={color} transparent opacity={0.85} />
        </mesh>
        {/* dark mat behind the photo so transparent PNGs still read as a card */}
        <mesh position={[0, 0, -0.015]}>
          <planeGeometry args={[w + 0.02, h + 0.02]} />
          <meshBasicMaterial color="#0a0a0f" />
        </mesh>
        <Image url={url} scale={[w, h]} transparent toneMapped={false} />
      </group>
    </Float>
  );
}

export default function ProjectGallery3D({
  images,
  color = '#22d3ee',
}: {
  images: string[];
  color?: string;
}) {
  const urls = (images && images.length ? images : []).slice(0, SLOTS.length);
  // If a project has only one or two images, keep the cluster from looking
  // empty by reusing them across a few slots.
  const filled = urls.length === 0
    ? []
    : Array.from({ length: Math.min(SLOTS.length, Math.max(urls.length, urls.length === 1 ? 3 : urls.length)) },
        (_, i) => urls[i % urls.length]);

  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0, 0, 8], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: 'none' }}
    >
      <Suspense fallback={null}>
        {filled.map((url, i) => (
          <Card key={`${i}-${url}`} url={url} slot={SLOTS[i % SLOTS.length]} color={color} />
        ))}
      </Suspense>
      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.8}
        rotateSpeed={0.5}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={(2 * Math.PI) / 3}
      />
    </Canvas>
  );
}
