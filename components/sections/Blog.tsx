'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { blogPosts, type BlogPost } from '@/data/blog';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { BlogModal, useBlogModal } from '@/components/ui/BlogModal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const dispatches = blogPosts; // newest-first (Dec → Sep)
const pad = (i: number) => String(i + 1).padStart(3, '0');
const dateline = (p: BlogPost) =>
  `${p.date} · ${p.dispatchLabel ?? 'Field Note'} · ${p.readTime.replace(' read', '')}`.toUpperCase();
const HAIRLINE = 'var(--hairline, rgba(255,255,255,0.12))';

/**
 * THE LOGBOOK — the Blog as a researcher's field-notebook you leaf through:
 * a left "Index of Dispatches" and a right "open leaf" showing one dispatch,
 * with a 3D page-turn between them. Clean editorial layout, token-driven so it
 * flips dark→cream and cyan→orange.
 */
export function Blog() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const leafRef = useRef<HTMLDivElement>(null);
  const turningRef = useRef(false);
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState(0);
  const { selectedPost, isOpen, openModal, closeModal } = useBlogModal();

  const active = dispatches[activeIndex];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.logbook-header', {
        opacity: 0, y: 40, duration: 0.9,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
      });
      gsap.from('.logbook-spread', {
        opacity: 0, y: 36, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: '.logbook-spread', start: 'top 88%', toggleActions: 'play none none reverse' },
      });
      gsap.to(contentRef.current, {
        scale: 1.08, opacity: 0, filter: 'blur(12px)', ease: 'power2.in',
        scrollTrigger: { trigger: sectionRef.current, start: 'bottom 88%', end: 'bottom top', scrub: 1 },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // ── THE PAGE TURN — direction-aware 3D leaf flip ───────────────────────────
  const turnTo = (i: number, dir: 'next' | 'prev') => {
    if (i === activeIndex || i < 0 || i >= dispatches.length || turningRef.current) return;
    const leaf = leafRef.current;
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!leaf || reduce) { setActiveIndex(i); return; }
    turningRef.current = true;

    if (isMobile) {
      gsap.timeline({ onComplete: () => { turningRef.current = false; } })
        .to(leaf, { opacity: 0, y: 10, duration: 0.16, ease: 'power2.in' })
        .add(() => setActiveIndex(i))
        .to(leaf, { opacity: 1, y: 0, duration: 0.26, ease: 'power2.out' });
      return;
    }

    const rot = dir === 'next' ? -16 : 16;
    const x = dir === 'next' ? -16 : 16;
    const sweep = leaf.querySelector('.leaf-sweep');
    gsap.timeline({ onComplete: () => { turningRef.current = false; } })
      .set(sweep, { opacity: 0 })
      .to(leaf, { rotateY: rot, x, duration: 0.3, ease: 'power3.in' })
      .to(sweep, { opacity: 1, duration: 0.3 }, 0)
      .add(() => setActiveIndex(i))
      .to(leaf, { rotateY: 0, x: 0, duration: 0.34, ease: 'power3.out' })
      .to(sweep, { opacity: 0, duration: 0.25 }, '<')
      .to(leaf, { scale: 0.992, duration: 0.08, yoyo: true, repeat: 1 }, '>-0.04');
  };

  const onRow = (i: number) =>
    i === activeIndex ? openModal(dispatches[i]) : turnTo(i, i > activeIndex ? 'next' : 'prev');

  return (
    <section
      ref={sectionRef}
      id="blog"
      className="relative overflow-hidden bg-bg-base py-16 sm:py-20 md:py-24 lg:py-28"
    >
      <div ref={contentRef} className="relative z-10 container-custom px-4 sm:px-6">
        {/* Heading */}
        <div className="logbook-header mb-10 sm:mb-12 md:mb-14">
          <SectionHeading
            eyebrow="Field Dispatches"
            title="THE LOGBOOK"
            subtitle="A captain's log from the frontier — agents, silicon, embodiment, and the freelance trenches. Four entries, kept in order, newest first."
            meta={`${pad(dispatches.length - 1)} ENTRIES`}
          />
        </div>

        {/* THE OPEN SPREAD */}
        <div
          className="logbook-spread relative mx-auto max-w-6xl rounded-2xl border bg-bg-elevated overflow-hidden"
          style={{ borderColor: HAIRLINE }}
        >
          <div
            className="relative md:grid md:grid-cols-[33%_67%] p-5 sm:p-8 md:p-9 lg:p-11"
            style={{ perspective: '2000px' }}
          >
            {/* crisp gutter divider (desktop) */}
            <div
              className="hidden md:block absolute top-9 lg:top-11 bottom-9 lg:bottom-11 left-[33%] w-px"
              style={{ backgroundColor: HAIRLINE }}
            />

            {/* ── LEFT PAGE — THE INDEX ───────────────────────────────────── */}
            <div className="md:pr-7 lg:pr-9">
              <div className="flex items-baseline justify-between pb-3 mb-1 border-b" style={{ borderColor: HAIRLINE }}>
                <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-text-muted">Index of Dispatches</span>
                <span className="font-mono text-[10px] text-text-muted tabular-nums">{pad(dispatches.length - 1)}</span>
              </div>

              <div className="flex md:block gap-3 overflow-x-auto md:overflow-visible -mx-1 px-1 md:mx-0 md:px-0">
                {dispatches.map((p, i) => {
                  const isActive = i === activeIndex;
                  return (
                    <button
                      key={p.id}
                      onClick={() => onRow(i)}
                      aria-current={isActive ? 'true' : undefined}
                      className={cn(
                        'group text-left shrink-0 md:shrink md:w-full transition-colors duration-300 relative',
                        'min-w-[230px] md:min-w-0 rounded-lg md:rounded-none py-4 px-3 md:px-4 md:border-b',
                        isActive ? 'bg-bg-surface/40 md:bg-transparent' : 'hover:bg-bg-surface/25'
                      )}
                      style={{ borderColor: HAIRLINE }}
                    >
                      {/* active marker */}
                      <span
                        className={cn('absolute left-0 top-3 bottom-3 w-[2px] rounded transition-opacity', isActive ? 'opacity-100' : 'opacity-0')}
                        style={{ backgroundColor: 'var(--accent)' }}
                      />
                      <div className="flex items-baseline gap-2.5 md:pl-3">
                        <span className={cn('font-mono text-[11px] tabular-nums shrink-0', isActive ? 'text-cyan-400' : 'text-text-muted')}>
                          {pad(i)}
                        </span>
                        <span className={cn('font-display text-sm font-bold leading-snug transition-colors flex-1', isActive ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary')}>
                          {p.title}
                        </span>
                        <span className="font-mono text-[10px] text-text-muted tabular-nums shrink-0 hidden md:inline">{p.readTime.replace(' read', '')}</span>
                      </div>
                      <p className="md:pl-3 mt-1.5 italic text-xs text-text-secondary leading-snug">{p.caption}</p>
                      <p className="md:pl-3 mt-1 font-mono text-[9px] uppercase tracking-wider text-text-muted">{dateline(p)}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── RIGHT PAGE — THE OPEN LEAF ──────────────────────────────── */}
            <div
              ref={leafRef}
              className="relative mt-8 md:mt-0 md:pl-7 lg:pl-9"
              style={{ transformStyle: 'preserve-3d', transformOrigin: 'left center' }}
            >
              <div
                className="leaf-sweep absolute inset-0 pointer-events-none opacity-0 z-20"
                style={{ background: 'linear-gradient(105deg, transparent 34%, rgba(var(--accent-rgb),0.12) 50%, transparent 66%)' }}
              />

              {/* header: No. + dateline on one baseline */}
              <div className="flex items-end justify-between gap-4 pb-3 border-b" style={{ borderColor: HAIRLINE }}>
                <span className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-text-primary leading-none">
                  No.&nbsp;{pad(activeIndex)}
                </span>
                <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-text-muted text-right leading-relaxed">
                  {dateline(active)}
                </span>
              </div>

              {/* plate */}
              <figure className="mt-6">
                <div className="relative aspect-[16/9] overflow-hidden rounded-md border shadow-lg" style={{ borderColor: HAIRLINE }}>
                  <Image src={active.image} alt={active.title} fill className="object-cover" sizes="(max-width:768px) 90vw, 50vw" />
                  <div className="absolute inset-0 mix-blend-soft-light opacity-25" style={{ backgroundColor: active.color }} />
                </div>
                <figcaption className="mt-2.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  <span className="text-cyan-400">Plate {pad(activeIndex)}</span>
                  <span className="opacity-50">·</span>
                  <span className="italic normal-case tracking-normal text-[11px] text-text-secondary">{active.note}</span>
                </figcaption>
              </figure>

              {/* title + standfirst */}
              <button onClick={() => openModal(active)} className="block text-left mt-6 group">
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-text-primary group-hover:text-cyan-400 transition-colors leading-tight">
                  {active.title}
                </h3>
              </button>
              <p className="mt-3 text-sm sm:text-base text-text-secondary leading-relaxed">{active.summary}</p>

              {/* pull-quote */}
              {active.pullQuote && (
                <blockquote className="mt-5 pl-4 border-l-2 italic text-base text-text-primary/90 leading-relaxed" style={{ borderColor: 'var(--accent)' }}>
                  &ldquo;{active.pullQuote}&rdquo;
                </blockquote>
              )}

              {/* tags */}
              <div className="mt-6 flex flex-wrap gap-2">
                {active.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full border border-cyan-400/40 font-mono text-[10px] uppercase tracking-wider text-cyan-400">
                    {tag}
                  </span>
                ))}
              </div>

              {/* footer */}
              <div className="mt-7 pt-5 border-t flex items-center justify-between gap-4" style={{ borderColor: HAIRLINE }}>
                <button
                  onClick={() => openModal(active)}
                  className="group inline-flex items-center gap-2 font-mono text-xs sm:text-sm uppercase tracking-wider text-cyan-400 hover:text-text-primary transition-colors"
                >
                  Open dispatch
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted hidden sm:inline">Turn to</span>
                  <button
                    onClick={() => turnTo(activeIndex - 1, 'prev')}
                    disabled={activeIndex === 0}
                    aria-label="Previous dispatch"
                    className="w-9 h-9 rounded-full border border-cyan-400/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-400/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button
                    onClick={() => turnTo(activeIndex + 1, 'next')}
                    disabled={activeIndex === dispatches.length - 1}
                    aria-label="Next dispatch"
                    className="w-9 h-9 rounded-full border border-cyan-400/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-400/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FILED ON MEDIUM */}
        <div className="mt-8 sm:mt-10 flex justify-center">
          <a
            href="https://medium.com/@srujan29112001"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-text-muted hover:text-cyan-400 transition-colors"
          >
            <span className="border-b border-transparent group-hover:border-cyan-400/60 transition-colors pb-0.5">The full archive lives on Medium</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
        </div>
      </div>

      <BlogModal post={selectedPost} isOpen={isOpen} onClose={closeModal} />
    </section>
  );
}
