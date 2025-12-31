'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsMobile } from '@/hooks/useMediaQuery';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Don't render on mobile/touch devices
    if (isMobile || typeof window === 'undefined') return;

    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Move dot immediately
      gsap.set(dot, { x: mouseX, y: mouseY });

      if (!isVisible) {
        setIsVisible(true);
      }
    };

    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);

    // Smooth cursor following
    const ticker = () => {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      gsap.set(cursor, { x: cursorX, y: cursorY });
    };

    gsap.ticker.add(ticker);

    // Hover states for interactive elements
    const setupHoverEffects = () => {
      const interactives = document.querySelectorAll(
        'a, button, [data-cursor="pointer"], input, textarea, select'
      );

      interactives.forEach((el) => {
        el.addEventListener('mouseenter', () => {
          gsap.to(cursor, {
            scale: 2,
            backgroundColor: 'rgba(109, 100, 163, 0.1)',
            borderColor: 'rgba(109, 100, 163, 0.5)',
            duration: 0.3,
          });
          gsap.to(dot, {
            scale: 0.5,
            duration: 0.3,
          });
        });

        el.addEventListener('mouseleave', () => {
          gsap.to(cursor, {
            scale: 1,
            backgroundColor: 'transparent',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            duration: 0.3,
          });
          gsap.to(dot, {
            scale: 1,
            duration: 0.3,
          });
        });
      });
    };

    // Setup hover effects after a delay to ensure DOM is ready
    const timeout = setTimeout(setupHoverEffects, 100);

    // Event listeners
    window.addEventListener('mousemove', onMouseMove);
    document.body.addEventListener('mouseenter', onMouseEnter);
    document.body.addEventListener('mouseleave', onMouseLeave);

    return () => {
      gsap.ticker.remove(ticker);
      clearTimeout(timeout);
      window.removeEventListener('mousemove', onMouseMove);
      document.body.removeEventListener('mouseenter', onMouseEnter);
      document.body.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isMobile, isVisible]);

  // Don't render on mobile
  if (isMobile) return null;

  return (
    <>
      {/* Main cursor ring */}
      <div
        ref={cursorRef}
        className={`pointer-events-none fixed left-0 top-0 z-[9999] h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 mix-blend-difference transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ willChange: 'transform' }}
      />

      {/* Center dot */}
      <div
        ref={dotRef}
        className={`pointer-events-none fixed left-0 top-0 z-[9999] h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ willChange: 'transform' }}
      />
    </>
  );
}
