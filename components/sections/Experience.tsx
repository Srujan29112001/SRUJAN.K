'use client';

import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { experiences } from '@/data/experience';
import { cn } from '@/lib/utils';

export function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section title animation
      gsap.from('.experience-header', {
        opacity: 0,
        y: 60,
        duration: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Timeline line animation
      gsap.from('.timeline-line', {
        scaleY: 0,
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: timelineRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Experience cards stagger animation with parallax
      const cards = gsap.utils.toArray('.experience-card');
      cards.forEach((card, i) => {
        gsap.from(card as HTMLElement, {
          opacity: 0,
          x: i % 2 === 0 ? -60 : 60,
          duration: 0.8,
          scrollTrigger: {
            trigger: card as HTMLElement,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });

        // Parallax effect
        gsap.to(card as HTMLElement, {
          yPercent: -10,
          ease: 'none',
          scrollTrigger: {
            trigger: card as HTMLElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      });

      // Timeline dots animation
      gsap.from('.timeline-dot', {
        scale: 0,
        duration: 0.5,
        stagger: 0.2,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: timelineRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="relative overflow-hidden bg-bg-base py-24 md:py-32"
    >
      <div className="container-custom">
        {/* Section header */}
        <div className="experience-header mb-16 text-center md:mb-24 relative">
          {/* Blue Glow Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full -z-20 pointer-events-none mix-blend-screen" />

          <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            Career Path
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Experience
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-text-secondary">
            From defense research to independent consciousness studies.
          </p>
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          {/* Timeline line - center on desktop, left on mobile */}
          <div className="timeline-line absolute left-4 top-0 h-full w-[2px] origin-top bg-gradient-to-b from-primary via-secondary to-accent md:left-1/2 md:-translate-x-1/2" />

          {/* Experience items */}
          <div className="relative space-y-12 md:space-y-24">
            {experiences.map((exp, i) => (
              <div
                key={exp.id}
                className={cn(
                  'experience-card relative pl-12 md:w-1/2 md:pl-0',
                  i % 2 === 0 ? 'md:pr-16' : 'md:ml-auto md:pl-16'
                )}
              >
                {/* Timeline dot */}
                <div
                  className={cn(
                    'timeline-dot absolute left-3 top-2 z-10 h-3 w-3 rounded-full border-2 border-bg-base md:top-4',
                    i % 2 === 0
                      ? 'md:-right-[7px] md:left-auto'
                      : 'md:-left-[7px]'
                  )}
                  style={{ backgroundColor: exp.color }}
                />

                {/* Connector line to dot - mobile */}
                <div className="absolute left-4 top-3 h-[2px] w-6 bg-white/10 md:hidden" />

                {/* Card */}
                <div
                  className="relative rounded-2xl border border-white/5 bg-bg-surface p-6 transition-all duration-300 hover:border-white/10 hover:shadow-lg md:p-8"
                  style={{
                    boxShadow: `0 0 0 1px ${exp.color}10`,
                  }}
                >
                  {/* Type badge */}
                  <span
                    className="mb-4 inline-block rounded-full px-3 py-1 font-mono text-xs uppercase"
                    style={{
                      backgroundColor: `${exp.color}20`,
                      color: exp.color,
                    }}
                  >
                    {exp.type}
                  </span>

                  {/* Period */}
                  <span className="mb-2 block font-mono text-sm text-text-muted">
                    {exp.period}
                  </span>

                  {/* Title */}
                  <h3 className="mb-1 font-display text-2xl font-bold text-white">
                    {exp.title}
                  </h3>

                  {/* Organization */}
                  <p className="mb-4 font-medium" style={{ color: exp.color }}>
                    {exp.organization}
                  </p>

                  {/* Description */}
                  <p className="mb-6 text-text-secondary">{exp.description}</p>

                  {/* Highlights */}
                  <ul className="space-y-2">
                    {exp.highlights.map((highlight, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-3 text-sm text-text-muted"
                      >
                        <span
                          className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: exp.color }}
                        />
                        {highlight}
                      </li>
                    ))}
                  </ul>

                  {/* Corner glow */}
                  <div
                    className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-10 blur-3xl"
                    style={{ backgroundColor: exp.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div
        className="absolute left-0 top-1/3 h-[600px] w-[600px] rounded-full opacity-5 blur-3xl"
        style={{ background: 'var(--gradient-primary)' }}
      />
    </section>
  );
}
