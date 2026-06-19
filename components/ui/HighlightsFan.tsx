'use client';

import { useState, useEffect, type CSSProperties } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project } from '@/data/projects';

/**
 * HighlightsFan — the category's first projects shown as an arc/fan of photo
 * cards with a giant ghosted title behind them. Click a side card to bring it
 * to centre; click the centre card (or "View Project") to open its detail page.
 * Pure CSS transforms (no WebGL) so it stays light. Mobile falls back to a
 * snap-scroll row.
 *
 * The interaction is inspired by award-style creative portfolios, implemented
 * originally here and themed to each project's own colour + imagery.
 */

// A short word for the giant ghosted backdrop (full title can be long).
function shortLabel(title: string): string {
  return title.split(/[—–:(]/)[0].trim() || title;
}

function FanCard({
  project,
  offset,
  active,
  onClick,
}: {
  project: Project;
  offset: number;
  active: boolean;
  onClick: () => void;
}) {
  const abs = Math.abs(offset);
  const accent = project.color || '#22d3ee';
  const style: CSSProperties = {
    transform: `translateX(calc(${offset} * clamp(58px, 9vw, 132px))) translateY(${abs * 16}px) rotate(${offset * 6}deg) scale(${active ? 1.06 : 1 - abs * 0.05})`,
    zIndex: 30 - abs,
    opacity: abs > 3 ? 0 : Math.max(0.45, 1 - abs * 0.12),
    transition: 'transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.45s ease, box-shadow 0.4s ease',
    boxShadow: active ? `0 30px 70px -20px ${accent}cc, 0 0 0 1.5px ${accent}` : '0 24px 50px -28px rgba(0,0,0,0.9)',
    pointerEvents: abs > 3 ? 'none' : 'auto',
  };
  return (
    <button
      onClick={onClick}
      aria-label={project.title}
      style={style}
      className="group absolute w-[clamp(140px,17vw,212px)] aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 will-change-transform"
    >
      <Image src={project.image} alt={project.title} fill className="object-cover" sizes="220px" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      {project.ongoing && (
        <span className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-red-500/40 text-[8px] font-semibold uppercase tracking-wider text-red-400">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Live
        </span>
      )}
      {/* centre-card "View" affordance */}
      {active && (
        <span
          className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-mono uppercase tracking-wider text-white opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: `linear-gradient(to top, ${accent}cc, transparent)` }}
        >
          View Project <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      )}
    </button>
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
  const [active, setActive] = useState(0);
  // Clamp if the project set shrinks (category change handled by remount key).
  useEffect(() => {
    if (active > projects.length - 1) setActive(0);
  }, [projects.length, active]);

  if (!projects.length) return null;
  const current = projects[Math.min(active, projects.length - 1)];
  const go = (dir: number) =>
    setActive((a) => Math.max(0, Math.min(projects.length - 1, a + dir)));

  return (
    <div className="mb-14 sm:mb-20">
      {/* Desktop / tablet: the fan */}
      <div className="hidden sm:block relative h-[clamp(360px,52vh,560px)] select-none">
        {/* giant ghosted title behind the fan */}
        <AnimatePresence mode="wait">
          <motion.span
            key={current.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 0.06, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="pointer-events-none absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2 z-0 font-display font-bold text-white whitespace-nowrap tracking-tight"
            style={{ fontSize: 'clamp(3rem, 11vw, 10rem)' }}
          >
            {shortLabel(current.title)}
          </motion.span>
        </AnimatePresence>

        {/* the cards */}
        <div className="absolute inset-x-0 top-[6%] bottom-[18%] flex items-center justify-center [perspective:1200px]">
          {projects.map((p, i) => (
            <FanCard
              key={p.id}
              project={p}
              offset={i - active}
              active={i === active}
              onClick={() => (i === active ? onOpen(p) : setActive(i))}
            />
          ))}
        </div>

        {/* prev / next */}
        <button
          onClick={() => go(-1)}
          disabled={active === 0}
          aria-label="Previous highlight"
          className="absolute left-2 sm:left-6 top-[40%] z-40 p-2.5 rounded-full border border-white/15 bg-black/40 backdrop-blur-sm text-white/70 hover:text-white hover:border-white/40 transition disabled:opacity-25 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => go(1)}
          disabled={active === projects.length - 1}
          aria-label="Next highlight"
          className="absolute right-2 sm:right-6 top-[40%] z-40 p-2.5 rounded-full border border-white/15 bg-black/40 backdrop-blur-sm text-white/70 hover:text-white hover:border-white/40 transition disabled:opacity-25 disabled:pointer-events-none"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* active label */}
        <div className="absolute inset-x-0 bottom-0 z-40 flex flex-col items-center text-center px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <button
                onClick={() => onOpen(current)}
                className="group font-display text-xl sm:text-2xl md:text-3xl font-bold text-white hover:opacity-90 transition-opacity max-w-[80vw] truncate"
              >
                {current.title}
              </button>
              <div className="mt-2 flex items-center gap-2.5 font-mono text-[10px] sm:text-xs uppercase tracking-wider text-white/40">
                <span style={{ color: accent }}>{String(active + 1).padStart(2, '0')}</span>
                <span className="text-white/20">/</span>
                <span>{String(projects.length).padStart(2, '0')}</span>
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
              onClick={() => setActive(i)}
              aria-label={`Go to ${p.title}`}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === active ? 22 : 7,
                backgroundColor: i === active ? accent : 'rgba(255,255,255,0.25)',
              }}
            />
          ))}
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
