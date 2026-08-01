'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { skillCategories } from '@/data/skills';
import { SectionHeading } from '@/components/ui/SectionHeading';

interface SkillsProps {
  activeCategory: 'AI' | 'Robotics' | 'Research';
  setActiveCategory: (category: 'AI' | 'Robotics' | 'Research') => void;
}

// The narrative spine — each discipline is a "chapter" in how Srujan builds.
// Skill values/details come from data/skills.ts; the story lives here.
const DISCIPLINES: Array<{
  key: 'AI' | 'Robotics' | 'Research';
  id: string;
  chapter: string;
  story: string;
}> = [
  {
    key: 'AI',
    id: 'ai-core',
    chapter: 'Chapter I — The Mind',
    story: 'It started with a question: can a machine learn to see, read, and reason? From CNNs and computer vision to LLMs, RAG and agentic systems — this is where the intelligence gets architected.',
  },
  {
    key: 'Robotics',
    id: 'robotics',
    chapter: 'Chapter II — The Body',
    story: 'Then the mind needed a body. Control loops, SLAM, sensor fusion and edge inference on Jetson — the craft of turning a prediction into motion in the physical world.',
  },
  {
    key: 'Research',
    id: 'research',
    chapter: 'Chapter III — The Why',
    story: 'Underneath it all, the urge to understand why. Chaos and nonlinear dynamics, computational neuroscience, quantum and space science — the theory that fuels every build.',
  },
];

function chips(details?: string): string[] {
  return (details || '').split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * Reveal-on-scroll that cannot get stuck. `whileInView` depends on
 * IntersectionObserver, which some mobile browsers never fire for these bars —
 * leaving them permanently empty. This watches the element and ALSO releases
 * after a short grace period, so the fill always happens.
 */
function useRevealed(ref: React.RefObject<Element>, delay = 900) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (shown) return;
    const el = ref.current;
    let io: IntersectionObserver | undefined;
    if (el && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => { if (entries.some((e) => e.isIntersecting)) { setShown(true); io?.disconnect(); } },
        { threshold: 0.15 }
      );
      io.observe(el);
    }
    const t = setTimeout(() => setShown(true), delay); // safety net
    return () => { io?.disconnect(); clearTimeout(t); };
  }, [ref, delay, shown]);
  return shown;
}

function SkillRow({ name, proficiency, details, color, index }: {
  name: string; proficiency: number; details?: string; color: string; index: number;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const shown = useRevealed(rowRef, 700 + index * 60);

  return (
    <motion.div
      ref={rowRef}
      initial={{ opacity: 0, y: 16 }}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="group min-w-0"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="font-display text-base sm:text-lg font-semibold text-white">{name}</h4>
        <span className="font-mono text-xs sm:text-sm tabular-nums" style={{ color }}>{proficiency}%</span>
      </div>

      {/* proficiency bar — fills on scroll-into-view.
          The bar is laid out at its final width and revealed by animating
          scaleX from a left origin. Animating a percentage `width` from 0
          silently fails on several mobile browsers (the bar just stays empty);
          a GPU transform is reliable everywhere and cheaper to composite. */}
      <div className="mt-2 h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full origin-left"
          style={{
            width: `${proficiency}%`,
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
            boxShadow: `0 0 12px ${color}66`,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: shown ? 1 : 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* tech keywords */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {chips(details).map(c => (
          <span
            key={c}
            className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-mono text-text-muted bg-white/[0.03] border border-white/[0.06] transition-colors group-hover:text-text-secondary"
          >
            {c}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function ToolCard({ name, proficiency, details, color, index }: {
  name: string; proficiency: number; details?: string; color: string; index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useRevealed(ref, 700 + index * 40);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: 0.4 }}
      className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 sm:p-4 hover:border-white/15 transition-colors"
    >
      <div className="flex items-baseline justify-between gap-2 min-w-0">
        <span className="font-display text-sm sm:text-base font-semibold text-white truncate min-w-0">{name}</span>
        <span className="font-mono text-[11px] tabular-nums flex-shrink-0" style={{ color }}>{proficiency}%</span>
      </div>
      <div className="mt-2 h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className="h-full rounded-full origin-left"
          style={{ width: `${proficiency}%`, background: color }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: shown ? 1 : 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      {details && <p className="mt-2 text-[11px] text-text-muted truncate">{details}</p>}
    </motion.div>
  );
}

export function Skills({ activeCategory, setActiveCategory }: SkillsProps) {
  const tools = useMemo(() => skillCategories.find(c => c.id === 'tools')!, []);
  const active = DISCIPLINES.find(d => d.key === activeCategory) || DISCIPLINES[0];
  const category = skillCategories.find(c => c.id === active.id)!;
  const avg = Math.round(category.skills.reduce((s, x) => s + x.proficiency, 0) / category.skills.length);
  const ActiveIcon = category.icon;

  return (
    <section id="skills" className="relative bg-black py-20 sm:py-24 md:py-28 lg:py-32 overflow-hidden">
      {/* soft glow tinted to the active discipline (grid backdrop removed — it
          was distracting to read over in light mode) */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[460px] rounded-full blur-[150px] pointer-events-none transition-colors duration-700 mix-blend-screen"
        style={{ backgroundColor: `${category.color}22` }}
      />

      <div id="skills-content" className="container-custom relative z-10 px-4 sm:px-6">
        {/* Header — canonical SectionHeading, matching the rest of the site */}
        <div className="mb-12 sm:mb-16">
          <SectionHeading
            eyebrow="Skill Matrix"
            title="THE ARSENAL"
            subtitle="Three disciplines I move between — and the engineering craft that ties them together. Pick a path."
          />
        </div>

        {/* Discipline selector */}
        <div className="flex flex-wrap items-center justify-start gap-2.5 sm:gap-4 mb-12 sm:mb-16">
          {DISCIPLINES.map(d => {
            const cat = skillCategories.find(c => c.id === d.id)!;
            const Icon = cat.icon;
            const isActive = d.key === activeCategory;
            return (
              <button
                key={d.key}
                onClick={() => setActiveCategory(d.key)}
                className="group relative inline-flex items-center gap-2.5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border font-mono text-xs sm:text-sm uppercase tracking-wider transition-all duration-300"
                style={{
                  borderColor: isActive ? cat.color : 'var(--hairline, rgba(255,255,255,0.12))',
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  backgroundColor: isActive ? `${cat.color}1f` : 'transparent',
                  boxShadow: isActive ? `0 0 24px ${cat.color}40` : 'none',
                }}
              >
                <Icon className="w-4 h-4" style={{ color: cat.color }} />
                {cat.title.split(' ')[0] === 'Artificial' ? 'AI' : d.key}
              </button>
            );
          })}
        </div>

        {/* Active discipline chapter */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_1.4fr] gap-8 lg:gap-14 items-start"
          >
            {/* Left rail: the story */}
            <div className="lg:sticky lg:top-28">
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl border mb-5"
                style={{ borderColor: `${category.color}55`, backgroundColor: `${category.color}14`, color: category.color }}
              >
                <ActiveIcon className="w-7 h-7" />
              </div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] mb-2" style={{ color: category.color }}>
                {active.chapter}
              </p>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-4">{category.title}</h3>
              <p className="text-sm sm:text-base leading-relaxed text-text-secondary/90 mb-6">{active.story}</p>

              {/* depth stat */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <span className="font-display text-4xl sm:text-5xl font-bold text-white tabular-nums">{avg}</span>
                  <span className="font-mono text-lg" style={{ color: category.color }}>%</span>
                </div>
                <div className="text-xs text-text-muted leading-tight">
                  avg depth across<br />{category.skills.length} disciplines
                </div>
              </div>
            </div>

            {/* Right: the skills */}
            <div className="space-y-6 sm:space-y-7">
              {category.skills.map((s, i) => (
                <SkillRow key={s.name} name={s.name} proficiency={s.proficiency} details={s.details} color={category.color} index={i} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Engineering Arsenal — the shared toolkit under every discipline */}
        <div className="mt-16 sm:mt-20 pt-10 border-t border-white/[0.08]">
          <div className="flex items-center gap-3 mb-6">
            <tools.icon className="w-5 h-5" style={{ color: tools.color }} />
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white">{tools.title}</h3>
            <span className="hidden sm:inline text-sm text-text-muted">— the craft under everything</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {tools.skills.map((s, i) => (
              <ToolCard key={s.name} name={s.name} proficiency={s.proficiency} details={s.details} color={tools.color} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
