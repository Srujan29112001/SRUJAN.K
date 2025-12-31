'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from '@/lib/gsap';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ShowcaseItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  color: string;
  index: string;
}

interface HorizontalShowcaseProps {
  items: ShowcaseItem[];
  className?: string;
}

export function HorizontalShowcase({ items, className = '' }: HorizontalShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const totalWidth = track.scrollWidth;
    const viewportWidth = container.offsetWidth;
    const scrollDistance = totalWidth - viewportWidth;

    // Horizontal scroll on vertical scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: `+=${scrollDistance}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          const newIndex = Math.floor(progress * items.length);
          if (newIndex !== activeIndex && newIndex < items.length) {
            setActiveIndex(newIndex);
          }
        },
      },
    });

    tl.to(track, {
      x: -scrollDistance,
      ease: 'none',
    });

    return () => {
      tl.kill();
    };
  }, [items.length, activeIndex]);

  return (
    <section
      ref={containerRef}
      className={`relative h-screen w-full overflow-hidden bg-bg-base ${className}`}
    >
      {/* Background gradient based on active item */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(ellipse at 70% 50%, ${items[activeIndex]?.color}15 0%, transparent 60%)`,
        }}
      />

      {/* Progress indicator */}
      <div className="absolute left-8 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-4 lg:flex">
        {items.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-12 w-0.5 rounded-full transition-all duration-500',
              i === activeIndex ? 'bg-primary' : 'bg-white/20'
            )}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="absolute right-8 top-8 z-20 hidden font-mono text-sm text-text-muted lg:block">
        <span className="text-2xl font-bold text-white">{String(activeIndex + 1).padStart(2, '0')}</span>
        <span className="mx-2">/</span>
        <span>{String(items.length).padStart(2, '0')}</span>
      </div>

      {/* Horizontal track */}
      <div
        ref={trackRef}
        className="flex h-full items-center gap-8 px-8 lg:gap-16 lg:px-20"
        style={{ width: `${items.length * 85}vw` }}
      >
        {items.map((item, i) => (
          <ShowcaseCard
            key={item.id}
            item={item}
            isActive={i === activeIndex}
          />
        ))}
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
        <div className="flex items-center gap-3 font-mono text-xs text-text-muted">
          <span>SCROLL</span>
          <div className="flex items-center gap-1">
            <div className="h-px w-8 bg-text-muted" />
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShowcaseCard({
  item,
  isActive,
}: {
  item: ShowcaseItem;
  isActive: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    gsap.to(cardRef.current, {
      scale: isActive ? 1 : 0.9,
      opacity: isActive ? 1 : 0.5,
      duration: 0.5,
      ease: 'power2.out',
    });
  }, [isActive]);

  return (
    <div
      ref={cardRef}
      className="group relative flex h-[70vh] w-[75vw] flex-shrink-0 flex-col overflow-hidden rounded-3xl bg-bg-surface lg:w-[65vw] lg:flex-row"
      style={{ boxShadow: isActive ? `0 0 60px ${item.color}20` : 'none' }}
    >
      {/* Image side */}
      <div className="relative h-1/2 w-full overflow-hidden lg:h-full lg:w-1/2">
        <div
          className="absolute inset-0 z-10"
          style={{
            background: `linear-gradient(to right, transparent 0%, ${item.color}10 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-transparent to-transparent lg:bg-gradient-to-r" />

        {/* Placeholder gradient for now */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${item.color}30 0%, ${item.color}10 50%, transparent 100%)`,
          }}
        />

        {/* Index number */}
        <span
          className="absolute bottom-4 left-4 font-display text-8xl font-bold opacity-10 lg:bottom-8 lg:left-8 lg:text-[12rem]"
          style={{ color: item.color }}
        >
          {item.index}
        </span>
      </div>

      {/* Content side */}
      <div className="relative flex h-1/2 w-full flex-col justify-center p-6 lg:h-full lg:w-1/2 lg:p-12">
        {/* Category label */}
        {item.subtitle && (
          <span
            className="mb-4 font-mono text-xs uppercase tracking-widest"
            style={{ color: item.color }}
          >
            {item.subtitle}
          </span>
        )}

        {/* Title */}
        <h3 className="mb-4 font-display text-3xl font-bold text-white lg:text-5xl">
          {item.title}
        </h3>

        {/* Description */}
        <p className="mb-8 max-w-md text-base leading-relaxed text-text-secondary lg:text-lg">
          {item.description}
        </p>

        {/* CTA */}
        <button
          className="group/btn flex w-fit items-center gap-3 rounded-full border px-6 py-3 font-mono text-sm transition-all hover:gap-4"
          style={{
            borderColor: `${item.color}50`,
            color: item.color,
          }}
        >
          <span>View Project</span>
          <svg
            className="h-4 w-4 transition-transform group-hover/btn:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>

        {/* Decorative corner */}
        <div
          className="absolute right-0 top-0 h-32 w-32 opacity-20"
          style={{
            background: `radial-gradient(circle at top right, ${item.color} 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Hover border glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 0 1px ${item.color}50`,
        }}
      />
    </div>
  );
}

// Alternative: Card-based horizontal scroll
export function HorizontalCards({
  items,
  className = '',
}: {
  items: Array<{
    id: string;
    title: string;
    description: string;
    image?: string;
    color: string;
    tech?: string[];
  }>;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const cards = cardsRef.current;
    if (!container || !cards) return;

    const scrollWidth = cards.scrollWidth - container.offsetWidth;

    gsap.to(cards, {
      x: -scrollWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top center',
        end: `+=${scrollWidth}`,
        scrub: 1,
      },
    });
  }, []);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div ref={cardsRef} className="flex gap-6 py-8">
        {items.map((item, i) => (
          <div
            key={item.id}
            className="group relative w-[350px] flex-shrink-0 overflow-hidden rounded-2xl bg-bg-surface p-6 transition-all duration-500 hover:scale-[1.02]"
            style={{ boxShadow: `0 0 0 1px ${item.color}20` }}
          >
            {/* Image placeholder */}
            <div
              className="mb-4 aspect-video w-full rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${item.color}30 0%, ${item.color}10 100%)`,
              }}
            />

            <h4 className="mb-2 text-xl font-bold text-white">{item.title}</h4>
            <p className="mb-4 text-sm text-text-muted line-clamp-2">{item.description}</p>

            {item.tech && (
              <div className="flex flex-wrap gap-2">
                {item.tech.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white/5 px-2 py-1 text-xs text-text-secondary"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Hover effect */}
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: `radial-gradient(circle at center, ${item.color}10 0%, transparent 70%)`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Igloo-style marquee text
export function MarqueeText({
  text,
  speed = 20,
  direction = 'left',
  className = '',
}: {
  text: string;
  speed?: number;
  direction?: 'left' | 'right';
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const content = container.querySelector('.marquee-content') as HTMLElement;
    if (!content) return;

    const width = content.offsetWidth;
    const duration = width / speed;

    gsap.to(content, {
      x: direction === 'left' ? -width / 2 : width / 2,
      duration,
      ease: 'none',
      repeat: -1,
    });
  }, [speed, direction]);

  const repeatedText = `${text} — `.repeat(10);

  return (
    <div ref={containerRef} className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div className="marquee-content inline-block">
        <span className="font-display text-6xl font-bold text-white/5 md:text-8xl lg:text-[10rem]">
          {repeatedText}
        </span>
      </div>
    </div>
  );
}
