'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Image, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/**
 * ProjectGallery3D — a 3D radial page-fan: a thick book opened completely back
 * on itself so the covers touch. Rounded cards are hinged on a central vertical
 * spine and fanned evenly 360° around it. Every card is double-sided: the front
 * face carries one image and the back face its counterpart, so spinning the fan
 * reveals a second set. The fan sizes itself to the number of cards, so there
 * are never blank filler pages.
 *
 * Controls: drag left/right to spin around the spine, drag up/down to tilt to
 * the top / bottom views, scroll to spin, and +/- to zoom. Original R3F build,
 * themed to each project's colour.
 */

export interface GalleryCard {
  front: string;
  back?: string;
}

const MIN_PAGES = 7;    // keep a full-looking fan even for image-light projects
const MAX_PAGES = 14;
const INNER_R = 0.28;   // gap between the spine and a page's inner edge
const W = 3.3;          // page width (radial) — landscape 16:9
const H = 1.86;         // page height (along the spine) — landscape 16:9
const D = 0.07;         // page thickness
const lerp = THREE.MathUtils.lerp;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function Page({
  angle,
  card,
  accent,
  frontIndex,
  backIndex,
  onOpen,
}: {
  angle: number;
  card: GalleryCard | null;
  accent: string;
  frontIndex?: number;
  backIndex?: number;
  onOpen: (i: number) => void;
}) {
  const hasImg = !!card?.front;
  const { gl } = useThree();
  const hover = (on: boolean) => { gl.domElement.style.cursor = on ? 'zoom-in' : 'auto'; };
  // double-click a face to open it full-size in the lightbox
  const faceProps = (i?: number) =>
    i === undefined
      ? {}
      : {
          onDoubleClick: (e: { stopPropagation: () => void }) => { e.stopPropagation(); hover(false); onOpen(i); },
          onPointerOver: (e: { stopPropagation: () => void }) => { e.stopPropagation(); hover(true); },
          onPointerOut: () => hover(false),
        };

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
        {card?.front && (
          <Image
            url={card.front}
            scale={[W * 0.92, H * 0.93] as unknown as number}
            position={[0, 0, D / 2 + 0.006]}
            toneMapped={false}
            {...faceProps(frontIndex)}
          />
        )}
        {/* back face — flipped 180° so it reads the right way round from behind */}
        {card?.back && (
          <Image
            url={card.back}
            scale={[W * 0.92, H * 0.93] as unknown as number}
            position={[0, 0, -(D / 2 + 0.006)]}
            rotation={[0, Math.PI, 0]}
            toneMapped={false}
            {...faceProps(backIndex)}
          />
        )}
      </group>
    </group>
  );
}

function Book({
  cards,
  accent,
  zoomRef,
  faces,
  onOpen,
}: {
  cards: GalleryCard[];
  accent: string;
  zoomRef: { current: number };
  faces: { front?: number; back?: number }[];
  onOpen: (i: number) => void;
}) {
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

  // the fan sizes itself to the cards, so there are no blank filler pages
  const pages = clamp(Math.max(cards.length, MIN_PAGES), MIN_PAGES, MAX_PAGES);
  const step = (Math.PI * 2) / pages;
  return (
    <group ref={tiltGroup}>
      <group ref={spinGroup}>
        {Array.from({ length: pages }).map((_, i) => (
          <Page
            key={i}
            angle={i * step}
            card={cards[i] ?? null}
            accent={accent}
            frontIndex={faces[i]?.front}
            backIndex={faces[i]?.back}
            onOpen={onOpen}
          />
        ))}
      </group>
    </group>
  );
}

export default function ProjectGallery3D({
  cards,
  color = '#22d3ee',
}: {
  cards: GalleryCard[];
  color?: string;
}) {
  const imgs = useMemo(() => (cards && cards.length ? cards : []).slice(0, MAX_PAGES), [cards]);
  const zoomRef = useRef(1);
  const zoomBy = (f: number) => { zoomRef.current = clamp(zoomRef.current * f, 0.45, 2.6); };

  // Flatten every visible face into one navigable list, in fan order
  // (card 1 front, card 1 back, card 2 front, …), and remember where each
  // card's faces landed so a double-click can open the right one.
  const { flat, faces } = useMemo(() => {
    const flat: string[] = [];
    const faces = imgs.map((c) => {
      const f: { front?: number; back?: number } = {};
      if (c.front) { f.front = flat.length; flat.push(c.front); }
      if (c.back) { f.back = flat.length; flat.push(c.back); }
      return f;
    });
    return { flat, faces };
  }, [imgs]);

  const [lightbox, setLightbox] = useState<number | null>(null);
  const open = lightbox !== null;
  const go = useCallback(
    (d: number) => setLightbox((i) => (i === null ? i : (i + d + flat.length) % flat.length)),
    [flat.length]
  );

  // Esc / ← / → while the lightbox is up. Capture-phase + stopPropagation so
  // Esc closes the lightbox without also closing the project modal behind it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); setLightbox(null); }
      else if (e.key === 'ArrowRight') { e.stopPropagation(); go(1); }
      else if (e.key === 'ArrowLeft') { e.stopPropagation(); go(-1); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open, go]);

  const btn =
    'flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur-sm text-white/80 text-lg leading-none hover:text-white hover:border-white/50 transition active:scale-95';
  const navBtn =
    'pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/60 backdrop-blur-md text-white/80 hover:text-white hover:border-white/60 hover:bg-black/80 transition active:scale-95';

  return (
    <div className="relative w-full h-full">
      <Canvas
        dpr={[1, 1.8]}
        camera={{ position: [0, 0.5, 9.4], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ touchAction: 'none' }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 6, 5]} intensity={1.15} />
        <directionalLight position={[-5, -1, 2]} intensity={0.4} />
        <pointLight position={[-3, 2, 4]} intensity={0.5} color={color} />
        <Suspense fallback={null}>
          <Book cards={imgs} accent={color} zoomRef={zoomRef} faces={faces} onOpen={setLightbox} />
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

      {/* ── LIGHTBOX — double-click a card face to open it full-size ───────── */}
      {open && (
        <div
          className="fixed inset-0 z-[100050] flex items-center justify-center bg-black/92 backdrop-blur-lg animate-[fadeIn_.18s_ease-out]"
          role="dialog"
          aria-modal="true"
          aria-label="Project image viewer"
          onClick={() => setLightbox(null)}
        >
          {/* close */}
          <button
            type="button"
            aria-label="Close image viewer"
            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
            className="absolute top-5 right-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/60 text-white/80 backdrop-blur-md transition hover:border-white/60 hover:text-white active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {/* the image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={flat[lightbox as number]}
            alt={`Project image ${(lightbox as number) + 1} of ${flat.length}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[86vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
            style={{ boxShadow: `0 0 90px -20px ${color}` }}
          />

          {/* prev / next */}
          {flat.length > 1 && (
            <div className="pointer-events-none absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between sm:inset-x-8">
              <button type="button" aria-label="Previous image" className={navBtn} onClick={(e) => { e.stopPropagation(); go(-1); }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button type="button" aria-label="Next image" className={navBtn} onClick={(e) => { e.stopPropagation(); go(1); }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          )}

          {/* counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/60 px-4 py-1.5 font-mono text-[11px] tracking-[0.2em] text-white/70 backdrop-blur-md tabular-nums">
            {String((lightbox as number) + 1).padStart(2, '0')} / {String(flat.length).padStart(2, '0')}
            <span className="ml-3 hidden text-white/35 sm:inline">← → to browse · esc to close</span>
          </div>
        </div>
      )}
    </div>
  );
}
