'use client';

import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Image, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/**
 * ProjectGallery3D — a 3D radial page-fan: a thick book opened completely back
 * on itself so the covers touch. A fixed number of rounded cards share a centre
 * and fan out 360° in the screen plane (a "hand of cards" facing the viewer),
 * layered in depth for physical thickness. Each card carries one of the
 * project's images; cards beyond the available images stay white. The fan
 * gently auto-spins and spins smoothly on drag / scroll. Original R3F
 * implementation, themed to each project's colour.
 */

const COUNT = 17;       // pages in the fan
const INNER_R = 0.18;   // how close pages reach the centre
const W = 1.9;          // card width
const H = 2.7;          // card height
const D = 0.07;         // card thickness
const Z_STAGGER = 0.05; // depth layering between consecutive cards
const lerp = THREE.MathUtils.lerp;

function Page({
  angle,
  z,
  url,
  accent,
}: {
  angle: number;
  z: number;
  url: string | null;
  accent: string;
}) {
  const hasImg = !!url;
  return (
    <group rotation={[0, 0, angle]} position={[0, 0, z]}>
      {/* lower edge near the centre; the card extends outward along +Y */}
      <group position={[0, INNER_R + H / 2, 0]}>
        <RoundedBox args={[W, H, D]} radius={0.08} smoothness={4}>
          <meshStandardMaterial color={hasImg ? accent : '#f3f3f6'} metalness={0.12} roughness={0.62} />
        </RoundedBox>
        {hasImg && (
          <Image
            url={url as string}
            scale={[W * 0.9, H * 0.92] as unknown as number}
            position={[0, 0, D / 2 + 0.006]}
            toneMapped={false}
          />
        )}
      </group>
    </group>
  );
}

function Book({ images, accent }: { images: string[]; accent: string }) {
  const ref = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const target = useRef(0);
  const cur = useRef(0);
  const drag = useRef({ down: false, lastX: 0 });

  useEffect(() => {
    const el = gl.domElement;
    const onWheel = (e: WheelEvent) => { target.current += e.deltaY * 0.0022; };
    const onDown = (e: PointerEvent) => { drag.current.down = true; drag.current.lastX = e.clientX; };
    const onMove = (e: PointerEvent) => {
      if (drag.current.down) {
        target.current += (e.clientX - drag.current.lastX) * 0.009;
        drag.current.lastX = e.clientX;
      }
    };
    const onUp = () => { drag.current.down = false; };
    el.addEventListener('wheel', onWheel, { passive: true });
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [gl]);

  useFrame((_, delta) => {
    if (!drag.current.down) target.current += delta * 0.08; // gentle auto-spin
    cur.current = lerp(cur.current, target.current, 0.08);
    if (ref.current) ref.current.rotation.set(-0.18, 0.14, cur.current);
  });

  const step = (Math.PI * 2) / COUNT;
  const mid = (COUNT - 1) / 2;
  return (
    <group ref={ref}>
      {Array.from({ length: COUNT }).map((_, i) => (
        <Page key={i} angle={i * step} z={(i - mid) * Z_STAGGER} url={images[i] ?? null} accent={accent} />
      ))}
    </group>
  );
}

export default function ProjectGallery3D({
  images,
  color = '#22d3ee',
}: {
  images: string[];
  color?: string;
}) {
  const imgs = (images && images.length ? images : []).slice(0, COUNT);

  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0, 0, 8.4], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: 'none' }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 6]} intensity={1.1} />
      <directionalLight position={[-4, -2, 3]} intensity={0.4} />
      <pointLight position={[-3, 2, 5]} intensity={0.5} color={color} />
      <Suspense fallback={null}>
        <Book images={imgs} accent={color} />
      </Suspense>
    </Canvas>
  );
}
