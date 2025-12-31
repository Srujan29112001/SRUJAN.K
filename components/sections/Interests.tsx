'use client';

import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { interests } from '@/data/interests';

export function Interests() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section title animation
      gsap.from('.interests-header', {
        opacity: 0,
        y: 60,
        duration: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Cards stagger animation
      gsap.from('.interest-card', {
        opacity: 0,
        y: 40,
        scale: 0.95,
        duration: 0.6,
        stagger: 0.1,
        scrollTrigger: {
          trigger: '.interests-grid',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="interests"
      className="relative overflow-hidden bg-bg-elevated py-24 md:py-32"
    >
      <div className="container-custom">
        {/* Section header */}
        <div className="interests-header mb-16 text-center md:mb-20 relative">
          {/* Blue Glow Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full -z-20 pointer-events-none mix-blend-screen" />

          <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            Beyond Code
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Laboratories for Intelligence
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
            Every interest is a testing ground for principles I apply to AI — pattern
            recognition, real-time adaptation, decision-making under uncertainty.
          </p>
        </div>

        {/* Interests grid */}
        <div className="interests-grid grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {interests.map((interest) => (
            <div
              key={interest.id}
              className="interest-card group relative overflow-hidden rounded-2xl border border-white/5 bg-bg-surface p-6 transition-all duration-300 hover:border-white/10 hover:shadow-lg"
            >
              {/* Icon */}
              <div className="mb-4 text-4xl">{interest.icon}</div>

              {/* Title */}
              <h3 className="mb-1 font-display text-xl font-bold text-white">
                {interest.title}
              </h3>

              {/* Subtitle */}
              <p
                className="mb-3 font-mono text-xs uppercase tracking-wider"
                style={{ color: interest.color }}
              >
                {interest.subtitle}
              </p>

              {/* Description */}
              <p className="text-sm text-text-muted">{interest.description}</p>

              {/* Hover border */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  boxShadow: `inset 0 0 0 1px ${interest.color}30`,
                }}
              />

              {/* Corner glow */}
              <div
                className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-20"
                style={{ backgroundColor: interest.color }}
              />
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="mt-20 text-center">
          <blockquote className="mx-auto max-w-3xl">
            <p className="font-display text-xl italic text-text-secondary md:text-2xl">
              "Every hobby reveals computational principles hiding in plain sight.
              Guitar improvisation is real-time pattern completion. Skateboarding is
              iterative optimization. FPV racing is edge-case control theory."
            </p>
            <footer className="mt-4 font-mono text-sm text-text-muted">
              — On learning from everything
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Decorative line */}
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </section>
  );
}
