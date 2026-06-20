'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
 * HighlightsFan — the category's first projects as a physical, draggable fan of
 * photo cards floating in front of a giant ghosted title. Grab and fling it
 * (inertia + spring snap), it parallaxes to your cursor, and depth is real:
 * cards recede, shrink and blur as they move off-centre. Click the centre card
 * (or "View Project") to open its detail page. Pure framer-motion physics; no
 * WebGL. Mobile falls back to a snap-scroll row.
 *
 * An original implementation themed to each project's own colour + imagery.
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
  onClick,
}: {
  project: Project;
  index: number;
  pos: MotionValue<number>;
  spacing: MotionValue<number>;
  cardW: number;
  cardH: number;
  onClick: () => void;
}) {
  const off = useTransform(pos, (p) => index - p);
  const x = useTransform([off, spacing] as [MotionValue<number>, MotionValue<number>], ([o, s]: number[]) => o * s);
  const y = useTransform(off, (o) => Math.abs(o) * 11);
  const rotate = useTransform(off, (o) => o * 5);
  const scale = useTransform(off, (o) => Math.max(0.72, 1.05 - Math.abs(o) * 0.07));
  const zIndex = useTransform(off, (o) => Math.round(50 - Math.abs(o) * 6));
  const opacity = useTransform(off, (o) => (Math.abs(o) > 3.6 ? 0 : Math.max(0.5, 1 - Math.abs(o) * 0.12)));
  const filter = useTransform(off, (o) => `blur(${clamp((Math.abs(o) - 1.1) * 1.7, 0, 3.6)}px)`);
  const accent = project.color || '#22d3ee';

  return (
    <motion.button
      data-index={index}
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
        boxShadow: `0 40px 80px -28px rgba(0,0,0,0.95)`,
      }}
      className="group absolute left-1/2 top-1/2 rounded-2xl overflow-hidden border border-white/10 will-change-transform"
    >
      <span className="block w-full h-full fan-float" style={{ animationDelay: `${index * 0.45}s` }}>
        <Image src={project.image} alt={project.title} fill className="object-cover" sizes="240px" draggable={false} />
      </span>
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
      <span className="pointer-events-none absolute inset-0 rounded-2xl" style={{ boxShadow: `inset 0 0 0 1.5px ${accent}55` }} />
      {project.ongoing && (
        <span className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-red-500/40 text-[8px] font-semibold uppercase tracking-wider text-red-400">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Live
        </span>
      )}
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
  const [active, setActive] = useState(0);
  const [dims, setDims] = useState({ spacing: 120, cardW: 200, cardH: 266 });

  // Fractional carousel position → spring (the "weight" of the fan).
  const pos = useMotionValue(0);
  const posSpring = useSpring(pos, { stiffness: 110, damping: 20, mass: 0.9 });
  const spacingMV = useMotionValue(120);

  // Cursor parallax for the whole fan.
  const pxRaw = useMotionValue(0);
  const pyRaw = useMotionValue(0);
  const px = useSpring(pxRaw, { stiffness: 90, damping: 18 });
  const py = useSpring(pyRaw, { stiffness: 90, damping: 18 });
  const rotY = useTransform(px, (v) => v * 7);
  const rotX = useTransform(py, (v) => v * -5);
  const shiftX = useTransform(px, (v) => v * 16);
  const ghostShift = useTransform(px, (v) => v * -28);

  const len = projects.length;

  // Responsive sizing.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth || 900;
      const spacing = clamp(w * 0.095, 52, 124);
      const cardW = clamp(w * 0.16, 156, 236);
      const cardH = cardW * (4 / 3);
      setDims({ spacing, cardW, cardH });
      spacingMV.set(spacing);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [spacingMV]);

  const goTo = useCallback(
    (i: number) => {
      const t = clamp(i, 0, len - 1);
      pos.set(t);
      setActive(t);
    },
    [len, pos]
  );

  // ---- drag-to-fling physics ----
  // `down` = pointer held on the deck; `dragging` only flips true after the
  // pointer passes a threshold — so taps and the controls (prev/next/dots/
  // buttons, marked data-control) keep working and the pointer is never
  // captured for a simple click.
  const drag = useRef({ down: false, dragging: false, startX: 0, startPos: 0, lastX: 0, lastT: 0, vel: 0 });
  const draggedRecently = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    // Never hijack the interactive controls.
    if ((e.target as HTMLElement).closest('[data-control]')) return;
    drag.current = {
      down: true, dragging: false,
      startX: e.clientX, startPos: pos.get(), lastX: e.clientX, lastT: e.timeStamp, vel: 0,
    };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    // parallax (always)
    const r = stageRef.current?.getBoundingClientRect();
    if (r) {
      pxRaw.set(clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1));
      pyRaw.set(clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), -1, 1));
    }
    const d = drag.current;
    if (!d.down) return;
    const dx = e.clientX - d.startX;
    if (!d.dragging && Math.abs(dx) > 6) {
      d.dragging = true;
      try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* noop */ }
    }
    if (!d.dragging) return;
    pos.set(clamp(d.startPos - dx / dims.spacing, -0.45, len - 0.55));
    const dt = e.timeStamp - d.lastT || 16;
    d.vel = (e.clientX - d.lastX) / dt; // px per ms
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;
    const r2 = clamp(Math.round(pos.get()), 0, len - 1);
    if (r2 !== active) setActive(r2);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.down) return;
    d.down = false;
    if (d.dragging) {
      d.dragging = false;
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
      // project momentum into index space, then snap.
      const projected = pos.get() - (d.vel * 150) / dims.spacing;
      goTo(Math.round(projected));
      draggedRecently.current = true;
      setTimeout(() => (draggedRecently.current = false), 80);
    }
  };
  const onPointerLeave = (e: React.PointerEvent) => {
    pxRaw.set(0);
    pyRaw.set(0);
    onPointerUp(e);
  };

  const handleCardClick = (i: number, p: Project) => {
    if (draggedRecently.current) return;
    if (i === active) onOpen(p);
    else goTo(i);
  };

  if (!len) return null;
  const current = projects[clamp(active, 0, len - 1)];

  return (
    <div className="mb-14 sm:mb-20">
      {/* Desktop / tablet: the physical fan */}
      <div className="hidden sm:block">
        <div
          ref={stageRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerLeave}
          className="relative h-[clamp(420px,58vh,640px)] select-none cursor-grab active:cursor-grabbing [perspective:1400px]"
          style={{ touchAction: 'pan-y' }}
        >
          {/* giant ghosted title */}
          <AnimatePresence mode="wait">
            <motion.span
              key={current.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.06, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{ x: ghostShift, fontSize: 'clamp(3.5rem, 13vw, 12rem)' }}
              className="pointer-events-none absolute left-1/2 top-[32%] -translate-x-1/2 -translate-y-1/2 z-0 font-display font-bold text-white whitespace-nowrap tracking-tighter"
            >
              {shortLabel(current.title)}
            </motion.span>
          </AnimatePresence>

          {/* cards on a parallax plane */}
          <motion.div
            style={{ rotateX: rotX, rotateY: rotY, x: shiftX, transformPerspective: 1400 }}
            className="absolute inset-0 [transform-style:preserve-3d]"
          >
            <div className="absolute inset-x-0 top-[8%] bottom-[20%]">
              {projects.map((p, i) => (
                <FanCard
                  key={p.id}
                  project={p}
                  index={i}
                  pos={posSpring}
                  spacing={spacingMV}
                  cardW={dims.cardW}
                  cardH={dims.cardH}
                  onClick={() => handleCardClick(i, p)}
                />
              ))}
            </div>
          </motion.div>

          {/* prev / next */}
          <button
            data-control
            onClick={() => goTo(active - 1)}
            disabled={active === 0}
            aria-label="Previous"
            className="absolute left-2 sm:left-6 top-[42%] z-40 p-2.5 rounded-full border border-white/15 bg-black/40 backdrop-blur-sm text-white/70 hover:text-white hover:border-white/40 transition disabled:opacity-20 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            data-control
            onClick={() => goTo(active + 1)}
            disabled={active === len - 1}
            aria-label="Next"
            className="absolute right-2 sm:right-6 top-[42%] z-40 p-2.5 rounded-full border border-white/15 bg-black/40 backdrop-blur-sm text-white/70 hover:text-white hover:border-white/40 transition disabled:opacity-20 disabled:pointer-events-none"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* active label */}
          <div className="absolute inset-x-0 bottom-0 z-40 flex flex-col items-center text-center px-4 pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center pointer-events-auto"
              >
                <button
                  data-control
                  onClick={() => onOpen(current)}
                  className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-white hover:opacity-90 transition-opacity max-w-[80vw] truncate"
                >
                  {current.title}
                </button>
                <div className="mt-2 flex items-center gap-2.5 font-mono text-[10px] sm:text-xs uppercase tracking-wider text-white/40">
                  <span style={{ color: accent }}>{String(active + 1).padStart(2, '0')}</span>
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
                  data-control
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
                data-control
                onClick={() => goTo(i)}
                aria-label={`Go to ${p.title}`}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: i === active ? 22 : 7, backgroundColor: i === active ? accent : 'rgba(255,255,255,0.25)' }}
              />
            ))}
          </div>

          {/* grab hint */}
          <div className="absolute bottom-2 right-4 z-40 font-mono text-[10px] uppercase tracking-[0.25em] text-white/25 pointer-events-none">
            Drag / fling
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

      <style jsx global>{`
        @keyframes fanFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }
        .fan-float {
          animation: fanFloat 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default HighlightsFan;
