'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { cn } from '@/lib/utils';

interface SplitTextProps {
  children: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  className?: string;
  splitBy?: 'chars' | 'words' | 'lines';
  animation?: 'fadeUp' | 'fadeIn' | 'slideUp' | 'rotateIn' | 'scaleUp' | 'wave';
  trigger?: 'load' | 'scroll' | 'hover';
  delay?: number;
  duration?: number;
  stagger?: number;
  threshold?: number;
}

export function SplitText({
  children,
  as: Component = 'div',
  className = '',
  splitBy = 'words',
  animation = 'fadeUp',
  trigger = 'scroll',
  delay = 0,
  duration = 0.8,
  stagger = 0.03,
  threshold = 0.2,
}: SplitTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || hasAnimated.current) return;

    const text = children;
    let elements: HTMLSpanElement[] = [];

    // Clear container
    container.innerHTML = '';

    // Split text based on type
    if (splitBy === 'chars') {
      text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        span.style.setProperty('--char-index', i.toString());
        span.className = 'split-char';
        container.appendChild(span);
        elements.push(span);
      });
    } else if (splitBy === 'words') {
      text.split(' ').forEach((word, i, arr) => {
        const wordWrapper = document.createElement('span');
        wordWrapper.style.display = 'inline-block';
        wordWrapper.style.overflow = 'hidden';
        wordWrapper.style.verticalAlign = 'top';

        const span = document.createElement('span');
        span.textContent = word;
        span.style.display = 'inline-block';
        span.style.setProperty('--word-index', i.toString());
        span.className = 'split-word';

        wordWrapper.appendChild(span);
        container.appendChild(wordWrapper);

        if (i < arr.length - 1) {
          const space = document.createTextNode('\u00A0');
          container.appendChild(space);
        }

        elements.push(span);
      });
    } else {
      // Lines - wrap entire content
      const span = document.createElement('span');
      span.textContent = text;
      span.style.display = 'block';
      span.className = 'split-line';
      container.appendChild(span);
      elements.push(span);
    }

    // Animation configurations
    const animations: Record<string, gsap.TweenVars> = {
      fadeUp: { y: '100%', opacity: 0 },
      fadeIn: { opacity: 0 },
      slideUp: { y: '120%' },
      rotateIn: { rotateX: -90, opacity: 0, transformOrigin: 'top center' },
      scaleUp: { scale: 0, opacity: 0 },
      wave: { y: 30, opacity: 0 },
    };

    // Set initial state
    gsap.set(elements, animations[animation]);

    // Create animation
    const animateIn = () => {
      gsap.to(elements, {
        y: 0,
        opacity: 1,
        rotateX: 0,
        scale: 1,
        duration,
        stagger: animation === 'wave' ? { each: stagger, from: 'start' } : stagger,
        ease: animation === 'rotateIn' ? 'power4.out' : 'power3.out',
        delay: trigger === 'load' ? delay : 0,
      });
    };

    if (trigger === 'scroll') {
      ScrollTrigger.create({
        trigger: container,
        start: `top ${100 - threshold * 100}%`,
        onEnter: animateIn,
        once: true,
      });
    } else if (trigger === 'load') {
      animateIn();
    } else if (trigger === 'hover') {
      container.addEventListener('mouseenter', animateIn);
    }

    hasAnimated.current = true;

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === container) st.kill();
      });
    };
  }, [children, splitBy, animation, trigger, delay, duration, stagger, threshold]);

  return (
    <Component
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className={cn('overflow-hidden', className)}
      style={{
        perspective: animation === 'rotateIn' ? '1000px' : undefined,
      }}
    >
      {children}
    </Component>
  );
}

// Animated counter component
interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
  trigger?: 'load' | 'scroll';
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 2,
  decimals = 0,
  className = '',
  trigger = 'scroll',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return;

    const animate = () => {
      gsap.to(
        { val: 0 },
        {
          val: value,
          duration,
          ease: 'power2.out',
          onUpdate: function () {
            el.textContent = `${prefix}${this.targets()[0].val.toFixed(decimals)}${suffix}`;
          },
        }
      );
    };

    if (trigger === 'scroll') {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        onEnter: animate,
        once: true,
      });
    } else {
      animate();
    }

    hasAnimated.current = true;
  }, [value, suffix, prefix, duration, decimals, trigger]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}

// Typewriter effect
interface TypewriterProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
  onComplete?: () => void;
}

export function Typewriter({
  text,
  className = '',
  speed = 50,
  delay = 0,
  cursor = true,
  onComplete,
}: TypewriterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(cursor);

  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          if (cursor) {
            setTimeout(() => setShowCursor(false), 1000);
          }
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay, cursor, onComplete]);

  return (
    <span ref={ref} className={className}>
      {displayText}
      {showCursor && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}

// Need to import useState for Typewriter
import { useState } from 'react';
