'use client';

import { useState, useEffect, useRef } from 'react';
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
 * HighlightsFan — the category's first projects as a spread fan. Hovering a
 * card makes it ZOOM UP in place and go crisp (it does NOT slide to the centre,
 * so the cards never move out from under the cursor and the focused card stays
 * an easy, stable click target). The rest recede and soften. Click the focused
 * card (or "View Project") to open it. A very subtle cursor parallax (translate
 * only — no rotation, so nothing blurs). Mobile falls back to a snap-scroll row.
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
  center,
  spacing,
  cardW,
  cardH,
  isFocus,
  someHovered,
  onEnter,
  onClick,
}: {
  project: Project;
  index: number;
  center: number;
  spacing: number;
  cardW: number;
  cardH: number;
  isFocus: boolean;
  someHovered: boolean;
  onEnter: () => void;
  onClick: () => void;
}) {
  const accent = project.color || '#22d3ee';
  const rel = index - center;
  const baseX = rel * spacing;
  const baseRot = rel * 6;
  const baseY = Math.abs(rel) * 14;

  return (
    <motion.button
      onPointerEnter={onEnter}
      onFocus={onEnter}
      onClick={onClick}
      aria-label={project.title}
      initial={false}
      animate={{
        x: baseX, // constant per card → cards never slide on hover
        y: isFocus ? baseY - 30 : baseY,
        rotate: isFocus ? 0 : baseRot,
        scale: isFocus ? 1.2 : someHovered ? 0.9 : 0.97,
        opacity: isFocus ? 1 : someHovered ? 0.5 : 0.82,
        filter: isFocus ? 'blur(0px)' : someHovered ? 'blur(1.6px)' : 'blur(0.55px)',
        zIndex: isFocus ? 60 : 30 - Math.abs(rel),
      }}
      transition={{ type: 'spring', stiffness: 220, damping: 28, mass: 0.8 }}
      style={{
        width: cardW,
        height: cardH,
        marginLeft: -cardW / 2,
        marginTop: -cardH / 2,
        boxShadow: isFocus ? `0 50px 100px -24px ${accent}cc` : '0 30px 60px -30px rgba(0,0,0,0.9)',
      }}
      className="group absolute left-1/2 top-1/2 rounded-2xl overflow-hidden border border-white/10 will-change-transform"
    >
      <Image src={project.image} alt={project.title} fill className="object-cover" sizes="280px" draggable={false} />
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      {/* focus ring */}
      <span
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{ opacity: isFocus ? 1 : 0, boxShadow: `inset 0 0 0 2px ${accent}, 0 0 30px ${accent}55` }}
      />
      {project.ongoing && (
        <span className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-red-500/40 text-[8px] font-semibold uppercase tracking-wider text-red-400">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Live
        </span>
      )}
      {/* view affordance on the focused card */}
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-mono uppercase tracking-wider text-white transition-opacity duration-300"
        style={{ opacity: isFocus ? 1 : 0 }}
      >
        View Project <ArrowUpRight className="w-3.5 h-3.5" />
      </span>
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
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState(0);
  const [dims, setDims] = useState({ spacing: 160, cardW: 190, cardH: 253 });

  const len = projects.length;
  const center = (len - 1) / 2;
  const focus = hovered ?? selected;

  // Very subtle translate-only parallax (no rotation → nothing blurs).
  const pxRaw = useMotionValue(0);
  const pyRaw = useMotionValue(0);
  const px = useSpring(pxRaw, { stiffness: 70, damping: 18 });
  const py = useSpring(pyRaw, { stiffness: 70, damping: 18 });
  const shiftX = useTransformMul(px, 10);
  const shiftY = useTransformMul(py, 6);
  const ghostShift = useTransformMul(px, -24);

  // Responsive sizing.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth || 900;
      const cardW = clamp(w * 0.15, 152, 224);
      const cardH = cardW * (4 / 3);
      const spacing = cardW * 0.86;
      setDims({ spacing, cardW, cardH });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const go = (i: number) => {
    setHovered(null);
    setSelected(clamp(i, 0, len - 1));
  };

  const onStageMove = (e: React.PointerEvent) => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r) return;
    pxRaw.set(clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1));
    pyRaw.set(clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), -1, 1));
  };
  const onStageLeave = () => {
    pxRaw.set(0);
    pyRaw.set(0);
    setHovered(null);
  };

  if (!len) return null;
  const current = projects[clamp(focus, 0, len - 1)];

  return (
    <div className="mb-14 sm:mb-20">
      {/* Desktop / tablet: hover-to-zoom fan */}
      <div className="hidden sm:block">
        <div
          ref={stageRef}
          onPointerMove={onStageMove}
          onPointerLeave={onStageLeave}
          className="relative h-[clamp(420px,58vh,640px)] select-none"
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

          {/* cards (subtle translate parallax) */}
          <motion.div style={{ x: shiftX, y: shiftY }} className="absolute inset-0">
            <div className="absolute inset-x-0 top-[6%] bottom-[20%]">
              {projects.map((p, i) => (
                <FanCard
                  key={p.id}
                  project={p}
                  index={i}
                  center={center}
                  spacing={dims.spacing}
                  cardW={dims.cardW}
                  cardH={dims.cardH}
                  isFocus={i === focus}
                  someHovered={hovered !== null}
                  onEnter={() => { setHovered(i); setSelected(i); }}
                  onClick={() => onOpen(p)}
                />
              ))}
            </div>
          </motion.div>

          {/* prev / next (keyboard + fallback) */}
          <button
            onClick={() => go(selected - 1)}
            disabled={selected === 0}
            aria-label="Previous"
            className="absolute left-2 sm:left-6 top-[42%] z-40 p-2.5 rounded-full border border-white/15 bg-black/40 backdrop-blur-sm text-white/70 hover:text-white hover:border-white/40 transition disabled:opacity-20 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => go(selected + 1)}
            disabled={selected === len - 1}
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
                onPointerEnter={() => { setHovered(i); setSelected(i); }}
                onClick={() => go(i)}
                aria-label={`Go to ${p.title}`}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: i === focus ? 22 : 7, backgroundColor: i === focus ? accent : 'rgba(255,255,255,0.25)' }}
              />
            ))}
          </div>

          {/* hint */}
          <div className="absolute bottom-2 right-4 z-40 font-mono text-[10px] uppercase tracking-[0.25em] text-white/25 pointer-events-none">
            Hover to focus · click to open
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

// tiny helper: multiply a motion value by a factor
function useTransformMul(mv: MotionValue<number>, factor: number) {
  return useTransform(mv, (v) => v * factor);
}

export default HighlightsFan;
