'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { cn } from '@/lib/utils';

interface GlitchTextProps {
  children: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  className?: string;
  glitchOnHover?: boolean;
  continuous?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

export function GlitchText({
  children,
  as: Component = 'span',
  className = '',
  glitchOnHover = true,
  continuous = false,
  intensity = 'medium',
}: GlitchTextProps) {
  const textRef = useRef<HTMLElement>(null);
  const [isGlitching, setIsGlitching] = useState(continuous);

  const glitchChars = '!<>-_\\/[]{}—=+*^?#________';

  useEffect(() => {
    if (!continuous) return;

    const interval = setInterval(() => {
      triggerGlitch();
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [continuous]);

  const triggerGlitch = () => {
    const el = textRef.current;
    if (!el) return;

    const originalText = children;
    const duration = intensity === 'high' ? 500 : intensity === 'medium' ? 300 : 150;
    const iterations = intensity === 'high' ? 10 : intensity === 'medium' ? 6 : 3;
    let iteration = 0;

    const interval = setInterval(() => {
      el.textContent = originalText
        .split('')
        .map((char, index) => {
          if (index < iteration) {
            return originalText[index];
          }
          if (char === ' ') return ' ';
          return glitchChars[Math.floor(Math.random() * glitchChars.length)];
        })
        .join('');

      if (iteration >= originalText.length) {
        clearInterval(interval);
        el.textContent = originalText;
      }

      iteration += 1 / (iterations / originalText.length);
    }, duration / iterations);
  };

  const handleMouseEnter = () => {
    if (glitchOnHover) {
      triggerGlitch();
    }
  };

  return (
    <Component
      ref={textRef as any}
      className={cn('relative inline-block', className)}
      onMouseEnter={handleMouseEnter}
      data-text={children}
    >
      {children}
    </Component>
  );
}

// CSS Glitch effect version (more performant for continuous use)
interface CSSGlitchTextProps {
  children: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  className?: string;
}

export function CSSGlitchText({
  children,
  as: Component = 'span',
  className = '',
}: CSSGlitchTextProps) {
  return (
    <Component
      className={cn('glitch-text relative inline-block', className)}
      data-text={children}
    >
      {children}
      <style jsx>{`
        .glitch-text {
          position: relative;
        }
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.8;
        }
        .glitch-text::before {
          animation: glitch-1 2s infinite linear alternate-reverse;
          color: #06B6D4;
          clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
        }
        .glitch-text::after {
          animation: glitch-2 3s infinite linear alternate-reverse;
          color: #F59E0B;
          clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
        }
        @keyframes glitch-1 {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        @keyframes glitch-2 {
          0% { transform: translate(0); }
          20% { transform: translate(2px, -2px); }
          40% { transform: translate(2px, 2px); }
          60% { transform: translate(-2px, -2px); }
          80% { transform: translate(-2px, 2px); }
          100% { transform: translate(0); }
        }
      `}</style>
    </Component>
  );
}
