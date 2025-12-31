'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
}

// Cinematic section reveal with parallax
export function CinematicReveal({
  children,
  className = '',
  delay = 0,
}: SectionRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial state
      gsap.set(contentRef.current, { y: 100, opacity: 0 });
      gsap.set(overlayRef.current, { scaleY: 1 });

      // Scroll-triggered reveal
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          end: 'top 30%',
          scrub: 1,
        },
      });

      // Overlay wipe
      tl.to(overlayRef.current, {
        scaleY: 0,
        ease: 'power2.inOut',
        duration: 1,
      }, 0);

      // Content reveal with parallax
      tl.to(contentRef.current, {
        y: 0,
        opacity: 1,
        ease: 'power2.out',
        duration: 1,
      }, 0.2);

    }, containerRef);

    return () => ctx.revert();
  }, [delay]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Reveal overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-50 bg-[#030712] origin-bottom pointer-events-none"
      />
      <div ref={contentRef}>{children}</div>
    </div>
  );
}

// Horizontal wipe transition
export function HorizontalWipe({
  children,
  className = '',
  direction = 'left',
}: SectionRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(overlayRef.current, { scaleX: 1 });

      gsap.to(overlayRef.current, {
        scaleX: 0,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
          end: 'top 25%',
          scrub: 1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [direction]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <div
        ref={overlayRef}
        className={`absolute inset-0 z-50 bg-gradient-to-r from-primary/20 to-secondary/20 pointer-events-none ${
          direction === 'left' ? 'origin-right' : 'origin-left'
        }`}
      />
      {children}
    </div>
  );
}

// Parallax container for section content
interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  id?: string;
}

export function ParallaxSection({
  children,
  className = '',
  speed = 0.5,
  id,
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(contentRef.current, {
        yPercent: -30 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [speed]);

  return (
    <section ref={sectionRef} id={id} className={`relative ${className}`}>
      <div ref={contentRef}>{children}</div>
    </section>
  );
}

// Text reveal animation - word by word
interface TextRevealAnimationProps {
  text: string;
  className?: string;
  delay?: number;
}

export function WordReveal({ text, className = '', delay = 0 }: TextRevealAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray('.word-reveal');

      gsap.from(words, {
        y: 60,
        opacity: 0,
        rotationX: -45,
        stagger: 0.08,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        delay,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [delay, text]);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div className="flex flex-wrap">
        {text.split(' ').map((word, i) => (
          <span key={i} className="word-reveal inline-block mr-[0.3em]">
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}

// Counter animation
interface CounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  decimals?: number;
}

export function AnimatedCounter({
  end,
  suffix = '',
  prefix = '',
  duration = 2,
  className = '',
  decimals = 0,
}: CounterProps) {
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const obj = { value: 0 };

      gsap.to(obj, {
        value: end,
        duration,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: counterRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.textContent = `${prefix}${obj.value.toFixed(decimals)}${suffix}`;
          }
        },
      });
    });

    return () => ctx.revert();
  }, [end, suffix, prefix, duration, decimals]);

  return (
    <span ref={counterRef} className={className}>
      {prefix}0{suffix}
    </span>
  );
}

// Stagger reveal for grids/lists
interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerReveal({
  children,
  className = '',
  staggerDelay = 0.1,
}: StaggerRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray('.stagger-item');

      gsap.from(items, {
        y: 60,
        opacity: 0,
        scale: 0.95,
        stagger: staggerDelay,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [staggerDelay]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

// Magnetic hover effect wrapper
interface MagneticHoverProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function MagneticHover({
  children,
  className = '',
  strength = 0.3,
}: MagneticHoverProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(element, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

// Line draw animation
export function LineReveal({ className = '' }: { className?: string }) {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(lineRef.current, {
        scaleX: 0,
        duration: 1.2,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: lineRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={lineRef}
      className={`h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent origin-left ${className}`}
    />
  );
}
