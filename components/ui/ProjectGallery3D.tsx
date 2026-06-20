'use client';

import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Image, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/**
 * ProjectGallery3D — a 3D radial page-fan, like a book opened completely back on
 * itself so the covers touch. A fixed number of rounded, thick cards are hinged
 * on a central vertical spine and fanned 360° around it. Each card carries one
 * of the project's images on its face; cards beyond the available images stay
 * white. The whole fan auto-rotates and spins smoothly on drag / scroll.
 * Original R3F implementation, themed to each project's colour.
 */

const COUNT = 17;       // number of pages in the fan
const INNER_R = 0.32;   // gap between the spine and a page's inner edge
const W = 2.05;         // page width (radial)
const H = 2.95;         // page height (along the spine)
const D = 0.07;         // page thickness
const lerp = THREE.MathUtils.lerp;

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
    if (!drag.current.down) target.current += delta * 0.12; // gentle auto-spin
    cur.current = lerp(cur.current, target.current, 0.08);
    if (ref.current) ref.current.rotation.y = cur.current;
  });

  const step = (Math.PI * 2) / COUNT;
  return (
    <group ref={ref} rotation={[-0.32, 0, 0]}>
      {Array.from({ length: COUNT }).map((_, i) => (
        <Page key={i} angle={i * step} url={images[i] ?? null} accent={accent} />
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
      camera={{ position: [0, 0.6, 7.6], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: 'none' }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 6, 5]} intensity={1.15} />
      <directionalLight position={[-5, -1, 2]} intensity={0.4} />
      <pointLight position={[-3, 2, 4]} intensity={0.5} color={color} />
      <Suspense fallback={null}>
        <Book images={imgs} accent={color} />
      </Suspense>
    </Canvas>
  );
}
