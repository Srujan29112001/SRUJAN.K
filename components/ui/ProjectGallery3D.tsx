'use client';

import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Image, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/**
 * ProjectGallery3D — a 3D radial page-fan: a thick book opened completely back
 * on itself so the covers touch. Rounded cards are hinged on a central vertical
 * spine and fanned evenly 360° around it. Each card carries one of the project's
 * images on its face; cards beyond the available images stay white.
 *
 * Controls: drag left/right to spin around the spine, drag up/down to tilt to
 * the top / bottom views, scroll to spin, and +/- to zoom. Original R3F build,
 * themed to each project's colour.
 */

const COUNT = 10;       // number of pages in the fan (evenly spaced)
const INNER_R = 0.32;   // gap between the spine and a page's inner edge
const W = 2.05;         // page width (radial)
const H = 2.95;         // page height (along the spine)
const D = 0.07;         // page thickness
const lerp = THREE.MathUtils.lerp;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function Page({ angle, url, accent }: { angle: number; url: string | null; accent: string }) {
  const hasImg = !!url;
  return (
    <group rotation={[0, angle, 0]}>
      {/* inner edge sits at radius INNER_R; the page extends outward along +X */}
      <group position={[INNER_R + W / 2, 0, 0]}>
        <RoundedBox args={[W, H, D]} radius={0.07} smoothness={4}>
          <meshStandardMaterial
            color={hasImg ? accent : '#f3f3f6'}
            metalness={0.15}
            roughness={0.6}
          />
        </RoundedBox>
        {hasImg && (
          <Image
            url={url as string}
            scale={[W * 0.92, H * 0.93] as unknown as number}
            position={[0, 0, D / 2 + 0.006]}
            toneMapped={false}
          />
        )}
      </group>
    </group>
  );
}

function Book({ images, accent, zoomRef }: { images: string[]; accent: string; zoomRef: { current: number } }) {
  const tiltGroup = useRef<THREE.Group>(null); // up/down → top / bottom view
  const spinGroup = useRef<THREE.Group>(null); // left/right → spin around spine
  const { gl } = useThree();

  const spinTarget = useRef(0);
  const spinCur = useRef(0);
  const tiltTarget = useRef(-0.3);
  const tiltCur = useRef(-0.3);
  const drag = useRef({ down: false, lastX: 0, lastY: 0 });

  useEffect(() => {
    const el = gl.domElement;
    const onWheel = (e: WheelEvent) => { spinTarget.current += e.deltaY * 0.0022; };
    const onDown = (e: PointerEvent) => { drag.current.down = true; drag.current.lastX = e.clientX; drag.current.lastY = e.clientY; };
    const onMove = (e: PointerEvent) => {
      if (!drag.current.down) return;
      spinTarget.current += (e.clientX - drag.current.lastX) * 0.009;       // horizontal → spin
      tiltTarget.current = clamp(tiltTarget.current + (e.clientY - drag.current.lastY) * 0.009, -1.5, 1.5); // vertical → tilt
      drag.current.lastX = e.clientX;
      drag.current.lastY = e.clientY;
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
    if (!drag.current.down) spinTarget.current += delta * 0.12; // gentle auto-spin
    spinCur.current = lerp(spinCur.current, spinTarget.current, 0.08);
    tiltCur.current = lerp(tiltCur.current, tiltTarget.current, 0.1);
    if (spinGroup.current) spinGroup.current.rotation.y = spinCur.current;
    if (tiltGroup.current) {
      tiltGroup.current.rotation.x = tiltCur.current;
      const z = lerp(tiltGroup.current.scale.x, zoomRef.current, 0.14);
      tiltGroup.current.scale.setScalar(z);
    }
  });

  const step = (Math.PI * 2) / COUNT;
  return (
    <group ref={tiltGroup}>
      <group ref={spinGroup}>
        {Array.from({ length: COUNT }).map((_, i) => (
          <Page key={i} angle={i * step} url={images[i] ?? null} accent={accent} />
        ))}
      </group>
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
  const zoomRef = useRef(1);
  const zoomBy = (f: number) => { zoomRef.current = clamp(zoomRef.current * f, 0.45, 2.6); };

  const btn =
    'flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur-sm text-white/80 text-lg leading-none hover:text-white hover:border-white/50 transition active:scale-95';

  return (
    <div className="relative w-full h-full">
      <Canvas
        dpr={[1, 1.8]}
        camera={{ position: [0, 0.6, 7.6], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ touchAction: 'none' }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 6, 5]} intensity={1.15} />
        <directionalLight position={[-5, -1, 2]} intensity={0.4} />
        <pointLight position={[-3, 2, 4]} intensity={0.5} color={color} />
        <Suspense fallback={null}>
          <Book images={imgs} accent={color} zoomRef={zoomRef} />
        </Suspense>
      </Canvas>

      {/* zoom controls */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
        <button type="button" aria-label="Zoom in" className={btn} onPointerDown={(e) => e.stopPropagation()} onClick={() => zoomBy(1.18)}>
          +
        </button>
        <button type="button" aria-label="Zoom out" className={btn} onPointerDown={(e) => e.stopPropagation()} onClick={() => zoomBy(0.85)}>
          −
        </button>
      </div>
    </div>
  );
}
