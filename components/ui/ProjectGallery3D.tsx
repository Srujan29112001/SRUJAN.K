'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Image, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/**
 * ProjectGallery3D — an interactive 3D card flipbook of a project's images.
 * Solid rounded cards with real edge thickness flow from the background to the
 * foreground in a coverflow; the front card faces the viewer. Faceted shapes
 * drift behind for a spatial feel, and the whole scene parallaxes smoothly to
 * the cursor. Auto-advances; scroll or drag to flip. Scales to any number of
 * images. Original R3F implementation, themed to each project's colour.
 */

const CARD_W = 2.5;
const CARD_H = 3.3;
const CARD_D = 0.18;
const lerp = THREE.MathUtils.lerp;

function Card({
  index,
  url,
  color,
  currentRef,
  total,
}: {
  index: number;
  url: string;
  color: string;
  currentRef: { current: number };
  total: number;
}) {
  const grp = useRef<THREE.Group>(null);
  const boxMat = useRef<THREE.MeshStandardMaterial>(null);
  const img = useRef<any>(null);

  useFrame(() => {
    const g = grp.current;
    if (!g) return;
    // shortest wrapped offset so cards cycle endlessly back → front
    let o = (index - currentRef.current) % total;
    if (o > total / 2) o -= total;
    if (o < -total / 2) o += total;

    const x = 1.15 - o * 1.28;
    const y = -o * 0.03;
    const z = 1.5 - o * 1.45;
    const ry = -0.32 - o * 0.16;
    const s = Math.max(0.45, 1.22 - Math.abs(o) * 0.14);
    g.position.set(x, y, z);
    g.rotation.set(0, ry, 0);
    g.scale.setScalar(s);

    const op = Math.max(0, Math.min(1, 1 - Math.max(0, Math.abs(o) - 2.1) * 0.7));
    g.visible = op > 0.03;
    if (boxMat.current) boxMat.current.opacity = op;
    if (img.current && img.current.material) img.current.material.opacity = op;
  });

  return (
    <group ref={grp}>
      <RoundedBox args={[CARD_W, CARD_H, CARD_D]} radius={0.1} smoothness={4}>
        <meshStandardMaterial ref={boxMat} color={color} metalness={0.25} roughness={0.55} transparent />
      </RoundedBox>
      <Image
        ref={img}
        url={url}
        scale={[CARD_W * 0.92, CARD_H * 0.93] as unknown as number}
        position={[0, 0, CARD_D / 2 + 0.012]}
        transparent
        toneMapped={false}
      />
    </group>
  );
}

function FloatingShapes({ color }: { color: string }) {
  const ref = useRef<THREE.Group>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        pos: [
          (i % 2 === 0 ? -1 : 1) * (2.6 + (i % 3) * 1.1),
          (i % 3 - 1) * 1.8,
          -2.5 - (i % 4) * 1.3,
        ] as [number, number, number],
        scale: 0.5 + (i % 3) * 0.32,
        speed: 0.05 + (i % 3) * 0.03,
      })),
    []
  );
  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    g.children.forEach((m, i) => {
      m.rotation.x += delta * seeds[i].speed;
      m.rotation.y += delta * seeds[i].speed * 0.8;
    });
  });
  return (
    <group ref={ref}>
      {seeds.map((s, i) => (
        <mesh key={i} position={s.pos} scale={s.scale}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={i % 4 === 0 ? color : '#3a3a44'}
            flatShading
            metalness={0.3}
            roughness={0.7}
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ images, color }: { images: string[]; color: string }) {
  const total = images.length;
  const currentRef = useRef(0);
  const targetParallax = useRef({ x: 0, y: 0 });
  const sceneRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const drag = useRef({ down: false, lastX: 0 });

  // scroll + drag to flip; auto-advance otherwise.
  useEffect(() => {
    const el = gl.domElement;
    const onWheel = (e: WheelEvent) => {
      currentRef.current += e.deltaY * 0.0016;
    };
    const onDown = (e: PointerEvent) => {
      drag.current.down = true;
      drag.current.lastX = e.clientX;
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      targetParallax.current.x = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) || 0;
      targetParallax.current.y = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) || 0;
      if (drag.current.down) {
        currentRef.current -= (e.clientX - drag.current.lastX) * 0.006;
        drag.current.lastX = e.clientX;
      }
    };
    const onUp = () => { drag.current.down = false; };
    const onLeave = () => { drag.current.down = false; targetParallax.current.x = 0; targetParallax.current.y = 0; };

    el.addEventListener('wheel', onWheel, { passive: true });
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [gl]);

  useFrame((_, delta) => {
    // gentle auto-advance (paused while dragging)
    if (!drag.current.down) currentRef.current += delta * 0.16;
    // smooth cursor parallax on the whole scene
    const g = sceneRef.current;
    if (g) {
      g.rotation.y = lerp(g.rotation.y, targetParallax.current.x * 0.28, 0.06);
      g.rotation.x = lerp(g.rotation.x, targetParallax.current.y * 0.18, 0.06);
      g.position.x = lerp(g.position.x, targetParallax.current.x * 0.4, 0.06);
    }
  });

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 4]} intensity={1.15} />
      <pointLight position={[-4, -2, 2]} intensity={0.6} color={color} />
      <FloatingShapes color={color} />
      <group ref={sceneRef}>
        {images.map((url, i) => (
          <Card key={`${i}-${url}`} index={i} url={url} color={color} currentRef={currentRef} total={total} />
        ))}
      </group>
    </>
  );
}

export default function ProjectGallery3D({
  images,
  color = '#22d3ee',
}: {
  images: string[];
  color?: string;
}) {
  const imgs = (images && images.length ? images : []).slice(0, 12);
  if (imgs.length === 0) return null;

  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: 'none' }}
    >
      <Suspense fallback={null}>
        <Scene images={imgs} color={color} />
      </Suspense>
    </Canvas>
  );
}
