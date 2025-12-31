'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { cn } from '@/lib/utils';

interface TextRevealProps {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  className?: string;
  animation?: 'chars' | 'words' | 'lines' | 'fade';
  delay?: number;
  duration?: number;
  stagger?: number;
  trigger?: 'load' | 'scroll';
  start?: string;
}

export function TextReveal({
  children,
  as: Component = 'div',
  className = '',
  animation = 'words',
  delay = 0,
  duration = 0.8,
  stagger = 0.02,
  trigger = 'scroll',
  start = 'top 80%',
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || hasAnimated.current) return;

    const text = container.textContent || '';
    let elements: HTMLSpanElement[] = [];

    // Clear and rebuild content based on animation type
    container.innerHTML = '';

    if (animation === 'chars') {
      // Split into characters
      text.split('').forEach((char) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        span.className = 'char';
        container.appendChild(span);
        elements.push(span);
      });
    } else if (animation === 'words') {
      // Split into words
      text.split(' ').forEach((word, i, arr) => {
        const wordWrapper = document.createElement('span');
        wordWrapper.style.display = 'inline-block';
        wordWrapper.style.overflow = 'hidden';
        wordWrapper.style.verticalAlign = 'bottom';

        const span = document.createElement('span');
        span.textContent = word;
        span.style.display = 'inline-block';
        span.className = 'word';

        wordWrapper.appendChild(span);
        container.appendChild(wordWrapper);

        if (i < arr.length - 1) {
          const space = document.createTextNode('\u00A0');
          container.appendChild(space);
        }

        elements.push(span);
      });
    } else if (animation === 'lines') {
      // Wrap entire content
      const span = document.createElement('span');
      span.textContent = text;
      span.style.display = 'block';
      span.className = 'line';
      container.appendChild(span);
      elements.push(span);
    } else {
      // Fade animation - just wrap content
      const span = document.createElement('span');
      span.textContent = text;
      span.style.display = 'inline-block';
      span.className = 'fade-text';
      container.appendChild(span);
      elements.push(span);
    }

    // Set initial state
    gsap.set(elements, {
      y: animation === 'fade' ? 20 : 100,
      opacity: animation === 'fade' ? 0 : 1,
      rotateX: animation === 'chars' ? -90 : 0,
    });

    // Create animation
    const animationConfig = {
      y: 0,
      opacity: 1,
      rotateX: 0,
      duration,
      stagger,
      ease: 'power4.out',
      delay: trigger === 'load' ? delay : 0,
    };

    if (trigger === 'scroll') {
      gsap.to(elements, {
        ...animationConfig,
        scrollTrigger: {
          trigger: container,
          start,
          toggleActions: 'play none none reverse',
        },
      });
    } else {
      gsap.to(elements, animationConfig);
    }

    hasAnimated.current = true;

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === container) {
          st.kill();
        }
      });
    };
  }, [animation, delay, duration, stagger, trigger, start]);

  return (
    <Component
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className={cn('overflow-hidden', className)}
      style={{ perspective: animation === 'chars' ? '1000px' : undefined }}
    >
      {children}
    </Component>
  );
}

// Simpler heading component with reveal
interface RevealHeadingProps {
  children: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  className?: string;
  delay?: number;
}

export function RevealHeading({
  children,
  as: Component = 'h2',
  className = '',
  delay = 0,
}: RevealHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.from(el, {
      y: 60,
      opacity: 0,
      duration: 1,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  }, [delay]);

  return (
    <Component ref={ref} className={className}>
      {children}
    </Component>
  );
}
