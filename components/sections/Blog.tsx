'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { blogPosts, type BlogPost } from '@/data/blog';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { BlogModal, useBlogModal } from '@/components/ui/BlogModal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const dispatches = blogPosts; // already newest-first (Dec → Sep)
const pad = (i: number) => String(i + 1).padStart(3, '0');
const dateline = (p: BlogPost) =>
  `${p.date} · ${p.dispatchLabel ?? 'Field Note'} · ${p.readTime.replace(' read', '')}`.toUpperCase();

/**
 * THE LOGBOOK — the Blog as a researcher's bound field-notebook you leaf
 * through: a left "Index of Dispatches" (a literary table of contents) and a
 * right "open leaf" showing one dispatch at a time, with a 3D page-turn between
 * them. Deliberately analog — the one tactile surface on an otherwise 3D site.
 * Fully token-driven so it flips dark→cream and cyan→orange.
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

  // Header reveal + re-target the exit-blur handoff onto the new spread wrapper.
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.logbook-header', {
        opacity: 0, y: 50, duration: 1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
      });
      gsap.from('.logbook-spread', {
        opacity: 0, y: 40, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.logbook-spread', start: 'top 85%', toggleActions: 'play none none reverse' },
      });
      gsap.to(contentRef.current, {
        scale: 1.1, opacity: 0, filter: 'blur(14px)', ease: 'power2.in',
        scrollTrigger: { trigger: sectionRef.current, start: 'bottom 90%', end: 'bottom top', scrub: 1 },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // ── THE PAGE TURN — direction-aware 3D leaf flip (the section's signature) ──
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

    const rot = dir === 'next' ? -18 : 18;
    const x = dir === 'next' ? -18 : 18;
    const sweep = leaf.querySelector('.leaf-sweep');
    gsap.timeline({ onComplete: () => { turningRef.current = false; } })
      .set(sweep, { opacity: 0 })
      .to(leaf, { rotateY: rot, x, duration: 0.3, ease: 'power3.in' })
      .to(sweep, { opacity: 1, duration: 0.3 }, 0)
      .add(() => setActiveIndex(i))
      .to(leaf, { rotateY: 0, x: 0, duration: 0.34, ease: 'power3.out' })
      .to(sweep, { opacity: 0, duration: 0.25 }, '<')
      .to(leaf, { scale: 0.99, duration: 0.08, yoyo: true, repeat: 1 }, '>-0.04')
      .add(() => {
        const hand = leaf.querySelectorAll('.leaf-handplaced');
        gsap.fromTo(hand, { opacity: 0, y: 6 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.3 });
      });
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
        {/* Heading (canonical convention) */}
        <div className="logbook-header mb-10 sm:mb-14 md:mb-16">
          <SectionHeading
            eyebrow="Field Dispatches"
            title="THE LOGBOOK"
            subtitle="A captain's log from the frontier — agents, silicon, embodiment, and the freelance trenches. Four entries, kept in order, newest first."
            meta={`${pad(dispatches.length - 1)} ENTRIES`}
          />
        </div>

        {/* THE DESK + OPEN SPREAD */}
        <div
          className="logbook-spread relative rounded-2xl border bg-bg-elevated p-5 sm:p-8 md:p-10"
          style={{
            borderColor: 'var(--hairline, rgba(255,255,255,0.1))',
            backgroundImage:
              'repeating-linear-gradient(transparent 0 27px, rgba(120,120,120,0.10) 27px 28px)',
          }}
        >
          {/* soft center-gutter shadow (desktop fold) */}
          <div
            className="hidden md:block absolute top-8 bottom-8 left-[38%] w-10 -translate-x-1/2 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.07), transparent)' }}
          />

          <div className="md:grid md:grid-cols-[38%_62%] md:gap-8 lg:gap-12" style={{ perspective: '1800px' }}>
            {/* ── LEFT PAGE — THE INDEX ─────────────────────────────────── */}
            <div className="md:pr-2">
              <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-text-muted tabular-nums mb-4 sm:mb-6">
                Index of Dispatches — {pad(dispatches.length - 1)} Entries
              </p>

              <div className="flex md:block gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-1 px-1">
                {dispatches.map((p, i) => {
                  const isActive = i === activeIndex;
                  return (
                    <button
                      key={p.id}
                      onClick={() => onRow(i)}
                      aria-current={isActive ? 'true' : undefined}
                      className={cn(
                        'group text-left shrink-0 md:shrink md:w-full rounded-lg md:rounded-none border-l-2 transition-colors duration-300',
                        'min-w-[220px] md:min-w-0 px-3 md:px-4 py-3 md:py-4',
                        isActive
                          ? 'border-cyan-400 bg-bg-surface/50 md:bg-transparent'
                          : 'border-transparent hover:bg-bg-surface/30'
                      )}
                    >
                      <div className="flex items-baseline gap-2 md:gap-3">
                        <span className={cn('font-mono text-[11px] tabular-nums shrink-0', isActive ? 'text-cyan-400' : 'text-text-muted')}>
                          No.&nbsp;{pad(i)}
                        </span>
                        <span className={cn('font-display text-sm sm:text-base font-bold leading-tight transition-colors', isActive ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary')}>
                          {p.title}
                        </span>
                        {/* TOC leader dots → read-time (desktop) */}
                        <span className="hidden md:block flex-1 mx-2 translate-y-[-3px] border-b border-dotted border-text-muted/40" />
                        <span className="hidden md:inline font-mono text-[10px] text-text-muted tabular-nums shrink-0">{p.readTime.replace(' read', '')}</span>
                      </div>
                      <div className="md:pl-[3.1rem] mt-1.5">
                        <p className="italic text-xs sm:text-sm text-text-secondary leading-snug">{p.caption}</p>
                        <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider text-text-muted mt-1">{dateline(p)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── RIGHT PAGE — THE OPEN LEAF ────────────────────────────── */}
            <div
              ref={leafRef}
              className="relative mt-8 md:mt-0 md:pl-2"
              style={{ transformStyle: 'preserve-3d', transformOrigin: 'left center' }}
            >
              {/* light-sweep during a turn */}
              <div
                className="leaf-sweep absolute -inset-2 pointer-events-none opacity-0 z-20"
                style={{ background: 'linear-gradient(105deg, transparent 32%, rgba(var(--accent-rgb),0.12) 50%, transparent 68%)' }}
              />

              {/* No. + dateline */}
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums text-text-primary leading-none">
                  No.&nbsp;{pad(activeIndex)}
                </span>
                <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-text-muted text-right pt-1 max-w-[9rem] leading-relaxed">
                  {dateline(active)}
                </span>
              </div>

              {/* pasted-in plate + marginal note */}
              <div className="relative mt-6 sm:mt-7">
                <div className="leaf-handplaced relative mx-auto w-[82%] sm:w-[74%]" style={{ transform: 'rotate(-1.2deg)' }}>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[2px] border-4 border-bg-surface shadow-xl">
                    <Image src={active.image} alt={active.title} fill className="object-cover" sizes="(max-width:768px) 80vw, 40vw" />
                    {/* duotone wash in the post's colour */}
                    <div className="absolute inset-0 mix-blend-soft-light opacity-30" style={{ backgroundColor: active.color }} />
                  </div>
                  {/* faux tape strip */}
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 rotate-[7deg] rounded-[1px]"
                    style={{ backgroundColor: 'rgba(150,140,125,0.4)', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
                  />
                </div>
                {/* handwritten marginal note */}
                <p
                  className="leaf-handplaced absolute right-0 sm:-right-4 bottom-2 max-w-[8.5rem] sm:max-w-[10rem] italic text-xs sm:text-sm text-cyan-400 leading-snug"
                  style={{ transform: 'rotate(-2.5deg)' }}
                >
                  note — {active.note}
                </p>
              </div>

              {/* title + standfirst */}
              <button onClick={() => openModal(active)} className="block text-left mt-7 sm:mt-8 group">
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-text-primary group-hover:text-cyan-400 transition-colors leading-tight">
                  {active.title}
                </h3>
              </button>
              <p className="mt-3 text-sm sm:text-base text-text-secondary leading-relaxed">{active.summary}</p>

              {/* pull-quote in the margin */}
              {active.pullQuote && (
                <blockquote className="leaf-handplaced mt-5 pl-4 border-l-2 border-cyan-400 italic text-base sm:text-lg text-text-primary/90 leading-relaxed">
                  &ldquo;{active.pullQuote}&rdquo;
                </blockquote>
              )}

              {/* wax-stamp tags */}
              <div className="mt-6 flex flex-wrap gap-2">
                {active.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full border border-cyan-400/40 font-mono text-[10px] uppercase tracking-wider text-cyan-400">
                    {tag}
                  </span>
                ))}
              </div>

              {/* footer — open + turn-to */}
              <div className="mt-8 pt-5 border-t flex flex-wrap items-center justify-between gap-4" style={{ borderColor: 'var(--hairline, rgba(255,255,255,0.1))' }}>
                <button
                  onClick={() => openModal(active)}
                  className="group inline-flex items-center gap-2 font-mono text-xs sm:text-sm uppercase tracking-wider text-cyan-400 hover:text-text-primary transition-colors"
                >
                  Open dispatch
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>

                <div className="flex items-center gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted hidden sm:inline">Turn to</span>
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

              {/* page-corner dog-ear → next */}
              {activeIndex < dispatches.length - 1 && (
                <button
                  onClick={() => turnTo(activeIndex + 1, 'next')}
                  aria-label="Next dispatch"
                  title="next dispatch"
                  className="hidden md:block absolute -bottom-10 -right-10 group"
                >
                  <svg width="56" height="56" viewBox="0 0 56 56" className="transition-transform group-hover:scale-110">
                    <path d="M56 0 L56 56 L0 56 Z" fill="rgba(var(--accent-rgb),0.18)" />
                    <path d="M56 0 L56 56 L0 56" fill="none" stroke="rgba(var(--accent-rgb),0.5)" strokeWidth="1" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FILED ON MEDIUM — last archival entry */}
        <div className="mt-10 sm:mt-12 flex justify-center">
          <a
            href="https://medium.com/@srujan29112001"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 font-mono text-xs sm:text-sm uppercase tracking-[0.2em] text-text-muted hover:text-cyan-400 transition-colors"
          >
            <span className="border-b border-transparent group-hover:border-cyan-400/60 transition-colors pb-0.5">Filed on Medium</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
        </div>
      </div>

      {/* Article sub-page */}
      <BlogModal post={selectedPost} isOpen={isOpen} onClose={closeModal} />
    </section>
  );
}
