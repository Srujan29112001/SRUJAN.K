'use client';

import { useState, useEffect, useRef, type CSSProperties } from 'react';
import Image from 'next/image';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project } from '@/data/projects';

/**
 * HighlightsFan — the category's first projects as a hover-driven coverflow
 * deck. Move the cursor across the deck (or hover a card) and that card glides
 * to the centre, ZOOMS UP and sharpens while the rest recede and soften. Click
 * the focused card (or "View Project") to open its detail page. The whole deck
 * parallaxes gently to the cursor. Mobile falls back to a snap-scroll row.
 *
 * Original implementation themed to each project's own colour + imagery.
 */

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function shortLabel(title: string): string {
  return title.split(/[—–:(]/)[0].trim() || title;
}

function FanCard({
  project,
  index,
  pos,
  spacing,
  cardW,
  cardH,
  onEnter,
  onClick,
}: {
  project: Project;
  index: number;
  pos: MotionValue<number>;
  spacing: MotionValue<number>;
  cardW: number;
  cardH: number;
  onEnter: () => void;
  onClick: () => void;
}) {
  const off = useTransform(pos, (p) => index - p);
  const x = useTransform([off, spacing] as [MotionValue<number>, MotionValue<number>], ([o, s]: number[]) => o * s);
  const y = useTransform(off, (o) => Math.abs(o) * 15);
  const rotate = useTransform(off, (o) => o * 7);
  // Centre card zooms up + crisp; cards recede, shrink and soften with distance.
  const scale = useTransform(off, (o) => clamp(1.18 - Math.abs(o) * 0.16, 0.64, 1.18));
  const zIndex = useTransform(off, (o) => Math.round(60 - Math.abs(o) * 8));
  const opacity = useTransform(off, (o) => (Math.abs(o) > 3.6 ? 0 : clamp(1 - Math.abs(o) * 0.15, 0.4, 1)));
  const filter = useTransform(off, (o) => `blur(${clamp((Math.abs(o) - 0.6) * 1.9, 0, 4)}px)`);
  const ringOpacity = useTransform(off, (o) => clamp(1 - Math.abs(o) * 2, 0, 1));
  const accent = project.color || '#22d3ee';

  return (
    <motion.button
      onPointerEnter={onEnter}
      onFocus={onEnter}
      onClick={onClick}
      aria-label={project.title}
      style={{
        x,
        y,
        rotate,
        scale,
        zIndex,
        opacity,
        filter,
        width: cardW,
        height: cardH,
        marginLeft: -cardW / 2,
        marginTop: -cardH / 2,
        boxShadow: `0 44px 90px -26px rgba(0,0,0,0.95)`,
      }}
      className="group absolute left-1/2 top-1/2 rounded-2xl overflow-hidden border border-white/10 will-change-transform"
    >
      <Image src={project.image} alt={project.title} fill className="object-cover" sizes="260px" draggable={false} />
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      {/* focus ring (fades in as the card reaches centre) */}
      <motion.span
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ opacity: ringOpacity, boxShadow: `inset 0 0 0 2px ${accent}, 0 0 30px ${accent}55` }}
      />
      {project.ongoing && (
        <span className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-red-500/40 text-[8px] font-semibold uppercase tracking-wider text-red-400">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Live
        </span>
      )}
      {/* "view" affordance on the focused card */}
      <motion.span
        style={{ opacity: ringOpacity }}
        className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-mono uppercase tracking-wider text-white"
      >
        View Project <ArrowUpRight className="w-3.5 h-3.5" />
      </motion.span>
    </motion.button>
  );
}

export function HighlightsFan({
  projects,
  accent,
  onOpen,
}: {
  projects: Project[];
  accent: string;
  onOpen: (p: Project) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState(0); // which card is centred / selected
  const [dims, setDims] = useState({ spacing: 150, cardW: 190, cardH: 253 });

  const len = projects.length;

  // Centre position → spring (the glide).
  const pos = useMotionValue(0);
  const posSpring = useSpring(pos, { stiffness: 170, damping: 24, mass: 0.7 });
  const spacingMV = useMotionValue(150);

  // Cursor parallax for the whole deck.
  const pxRaw = useMotionValue(0);
  const pyRaw = useMotionValue(0);
  const px = useSpring(pxRaw, { stiffness: 80, damping: 18 });
  const py = useSpring(pyRaw, { stiffness: 80, damping: 18 });
  const rotY = useTransform(px, (v) => v * 6);
  const rotX = useTransform(py, (v) => v * -4);
  const shiftX = useTransform(px, (v) => v * 14);
  const ghostShift = useTransform(px, (v) => v * -26);

  // Drive the spring whenever focus changes (hover / arrows / dots).
  useEffect(() => {
    pos.set(clamp(focus, 0, len - 1));
  }, [focus, len, pos]);

  // Responsive sizing.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth || 900;
      const spacing = clamp(w * 0.135, 104, 184);
      const cardW = clamp(w * 0.155, 150, 224);
      const cardH = cardW * (4 / 3);
      setDims({ spacing, cardW, cardH });
      spacingMV.set(spacing);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [spacingMV]);

  const go = (i: number) => setFocus(clamp(i, 0, len - 1));

  const onStageMove = (e: React.PointerEvent) => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r) return;
    pxRaw.set(clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1));
    pyRaw.set(clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), -1, 1));
  };
  const onStageLeave = () => {
    pxRaw.set(0);
    pyRaw.set(0);
  };

  if (!len) return null;
  const current = projects[clamp(focus, 0, len - 1)];

  return (
    <div className="mb-14 sm:mb-20">
      {/* Desktop / tablet: the hover-driven coverflow */}
      <div className="hidden sm:block">
        <div
          ref={stageRef}
          onPointerMove={onStageMove}
          onPointerLeave={onStageLeave}
          className="relative h-[clamp(420px,58vh,640px)] select-none [perspective:1500px]"
        >
          {/* giant ghosted title */}
          <AnimatePresence mode="wait">
            <motion.span
              key={current.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.06, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ x: ghostShift, fontSize: 'clamp(3.5rem, 13vw, 12rem)' }}
              className="pointer-events-none absolute left-1/2 top-[32%] -translate-x-1/2 -translate-y-1/2 z-0 font-display font-bold text-white whitespace-nowrap tracking-tighter"
            >
              {shortLabel(current.title)}
            </motion.span>
          </AnimatePresence>

          {/* cards on a parallax plane */}
          <motion.div
            style={{ rotateX: rotX, rotateY: rotY, x: shiftX, transformPerspective: 1500 }}
            className="absolute inset-0 [transform-style:preserve-3d]"
          >
            <div className="absolute inset-x-0 top-[6%] bottom-[20%]">
              {projects.map((p, i) => (
                <FanCard
                  key={p.id}
                  project={p}
                  index={i}
                  pos={posSpring}
                  spacing={spacingMV}
                  cardW={dims.cardW}
                  cardH={dims.cardH}
                  onEnter={() => setFocus(i)}
                  onClick={() => (i === focus ? onOpen(p) : setFocus(i))}
                />
              ))}
            </div>
          </motion.div>

          {/* prev / next (still here for keyboard + as a fallback) */}
          <button
            onClick={() => go(focus - 1)}
            disabled={focus === 0}
            aria-label="Previous"
            className="absolute left-2 sm:left-6 top-[42%] z-40 p-2.5 rounded-full border border-white/15 bg-black/40 backdrop-blur-sm text-white/70 hover:text-white hover:border-white/40 transition disabled:opacity-20 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => go(focus + 1)}
            disabled={focus === len - 1}
            aria-label="Next"
            className="absolute right-2 sm:right-6 top-[42%] z-40 p-2.5 rounded-full border border-white/15 bg-black/40 backdrop-blur-sm text-white/70 hover:text-white hover:border-white/40 transition disabled:opacity-20 disabled:pointer-events-none"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* active label */}
          <div className="absolute inset-x-0 bottom-0 z-40 flex flex-col items-center text-center px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <button
                  onClick={() => onOpen(current)}
                  className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-white hover:opacity-90 transition-opacity max-w-[80vw] truncate"
                >
                  {current.title}
                </button>
                <div className="mt-2 flex items-center gap-2.5 font-mono text-[10px] sm:text-xs uppercase tracking-wider text-white/40">
                  <span style={{ color: accent }}>{String(focus + 1).padStart(2, '0')}</span>
                  <span className="text-white/20">/</span>
                  <span>{String(len).padStart(2, '0')}</span>
                  {current.metric && (
                    <>
                      <span className="text-white/20">·</span>
                      <span className="truncate max-w-[40vw]">{current.metric}</span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => onOpen(current)}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all hover:brightness-110"
                  style={{ backgroundColor: accent, color: '#000', boxShadow: `0 0 18px ${accent}55` }}
                >
                  View Project <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* dots */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 flex gap-1.5">
            {projects.map((p, i) => (
              <button
                key={p.id}
                onPointerEnter={() => setFocus(i)}
                onClick={() => setFocus(i)}
                aria-label={`Go to ${p.title}`}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: i === focus ? 22 : 7, backgroundColor: i === focus ? accent : 'rgba(255,255,255,0.25)' }}
              />
            ))}
          </div>

          {/* hint */}
          <div className="absolute bottom-2 right-4 z-40 font-mono text-[10px] uppercase tracking-[0.25em] text-white/25 pointer-events-none">
            Hover to browse · click to open
          </div>
        </div>
      </div>

      {/* Mobile: snap-scroll row */}
      <div className="sm:hidden -mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
        {projects.map((p, i) => {
          const a = p.color || accent;
          return (
            <button
              key={p.id}
              onClick={() => onOpen(p)}
              className="snap-center shrink-0 w-[68vw] aspect-[4/5] relative rounded-2xl overflow-hidden border"
              style={{ borderColor: `${a}40` }}
            >
              <Image src={p.image} alt={p.title} fill className="object-cover" sizes="70vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              {p.ongoing && (
                <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 border border-red-500/40 text-[9px] font-semibold uppercase tracking-wider text-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Live
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 p-3 text-left">
                <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: a }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h4 className="font-display text-base font-bold text-white leading-tight line-clamp-2">{p.title}</h4>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default HighlightsFan;
