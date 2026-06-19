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

    // Hide the native cursor only while this component is mounted, so no-JS /
    // touch always keep the system cursor (inputs keep their caret via CSS).
    document.documentElement.classList.add('has-custom-cursor');

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let shown = false;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Move dot immediately
      gsap.set(dot, { x: mouseX, y: mouseY });

      if (!shown) {
        shown = true;
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

    // Hover states for interactive elements — neutral/editorial (white).
    const onElEnter = () => {
      gsap.to(cursor, { scale: 1.8, backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.6)', duration: 0.3 });
      gsap.to(dot, { scale: 0.4, duration: 0.3 });
    };
    const onElLeave = () => {
      gsap.to(cursor, { scale: 1, backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.3)', duration: 0.3 });
      gsap.to(dot, { scale: 1, duration: 0.3 });
    };

    const bound: Element[] = [];
    const setupHoverEffects = () => {
      document
        .querySelectorAll('a, button, [data-cursor="pointer"], input, textarea, select')
        .forEach((el) => {
          el.addEventListener('mouseenter', onElEnter);
          el.addEventListener('mouseleave', onElLeave);
          bound.push(el);
        });
    };

    // Setup hover effects after a delay to ensure DOM is ready
    const timeout = setTimeout(setupHoverEffects, 200);

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
      bound.forEach((el) => {
        el.removeEventListener('mouseenter', onElEnter);
        el.removeEventListener('mouseleave', onElLeave);
      });
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, [isMobile]);

  // Don't render on mobile
  if (isMobile) return null;

  return (
    <>
      {/* Main cursor ring */}
      <div
        ref={cursorRef}
        className={`pointer-events-none fixed left-0 top-0 z-[999999] h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 mix-blend-difference transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ willChange: 'transform' }}
      />

      {/* Center dot */}
      <div
        ref={dotRef}
        className={`pointer-events-none fixed left-0 top-0 z-[999999] h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ willChange: 'transform' }}
      />
    </>
  );
}
