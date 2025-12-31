'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';

interface FluidCursorProps {
  color?: string;
  size?: number;
  mixBlendMode?: 'difference' | 'exclusion' | 'normal' | 'multiply';
}

export function FluidCursor({
  color = '#6D64A3',
  size = 20,
  mixBlendMode = 'difference',
}: FluidCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [hoverText, setHoverText] = useState<string | null>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Check for touch device
    if ('ontouchstart' in window) {
      setIsHidden(true);
      return;
    }

    const cursor = cursorRef.current;
    const follower = followerRef.current;
    const trail = trailRef.current;
    if (!cursor || !follower) return;

    let cursorX = 0;
    let cursorY = 0;
    let followerX = 0;
    let followerY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);
    const handleMouseEnter = () => setIsHidden(false);
    const handleMouseLeave = () => setIsHidden(true);

    // Check for interactive elements
    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest('a, button, [data-cursor], input, textarea, select');

      if (interactive) {
        setIsPointer(true);

        // Check for custom cursor text
        const cursorText = interactive.getAttribute('data-cursor-text');
        if (cursorText) {
          setHoverText(cursorText);
        }

        // Check for custom cursor style
        const cursorStyle = interactive.getAttribute('data-cursor');
        if (cursorStyle === 'hide') {
          setIsHidden(true);
        }
      } else {
        setIsPointer(false);
        setHoverText(null);
      }
    };

    // Animation loop
    const animate = () => {
      // Main cursor (faster)
      cursorX += (mousePos.current.x - cursorX) * 0.2;
      cursorY += (mousePos.current.y - cursorY) * 0.2;

      // Follower (slower, elastic)
      followerX += (mousePos.current.x - followerX) * 0.08;
      followerY += (mousePos.current.y - followerY) * 0.08;

      gsap.set(cursor, {
        x: cursorX - (isPointer ? size * 1.5 : size) / 2,
        y: cursorY - (isPointer ? size * 1.5 : size) / 2,
      });

      gsap.set(follower, {
        x: followerX - (isPointer ? size * 3 : size * 2) / 2,
        y: followerY - (isPointer ? size * 3 : size * 2) / 2,
      });

      if (trail) {
        gsap.set(trail, {
          x: followerX,
          y: followerY,
        });
      }

      requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousemove', handleElementHover);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousemove', handleElementHover);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [size, isPointer]);

  if (isHidden) return null;

  return (
    <>
      {/* Main cursor dot */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full transition-[width,height,background-color] duration-200"
        style={{
          width: isPointer ? size * 1.5 : size,
          height: isPointer ? size * 1.5 : size,
          backgroundColor: isPressed ? '#ffffff' : color,
          mixBlendMode,
          transform: `scale(${isPressed ? 0.8 : 1})`,
        }}
      />

      {/* Follower ring */}
      <div
        ref={followerRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] rounded-full border transition-all duration-300"
        style={{
          width: isPointer ? size * 3 : size * 2,
          height: isPointer ? size * 3 : size * 2,
          borderColor: `${color}${isPointer ? '80' : '40'}`,
          backgroundColor: isPointer ? `${color}10` : 'transparent',
          transform: `scale(${isPressed ? 0.9 : 1})`,
        }}
      >
        {/* Hover text */}
        {hoverText && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-xs text-white">
            {hoverText}
          </span>
        )}
      </div>
    </>
  );
}

// Magnetic element wrapper
export function MagneticWrapper({
  children,
  strength = 0.3,
  className = '',
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      gsap.to(element, {
        x: deltaX,
        y: deltaY,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)',
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

// Cursor spotlight effect
export function CursorSpotlight({
  size = 400,
  color = 'rgba(109, 100, 163, 0.1)',
  blur = 100,
}: {
  size?: number;
  color?: string;
  blur?: number;
}) {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const spotlight = spotlightRef.current;
    if (!spotlight) return;

    const handleMouseMove = (e: MouseEvent) => {
      gsap.to(spotlight, {
        x: e.clientX - size / 2,
        y: e.clientY - size / 2,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [size]);

  return (
    <div
      ref={spotlightRef}
      className="pointer-events-none fixed left-0 top-0 z-[1] rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: `blur(${blur}px)`,
      }}
    />
  );
}

// Reveal on hover effect
export function RevealOnHover({
  children,
  revealContent,
  className = '',
}: {
  children: React.ReactNode;
  revealContent: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const [maskPosition, setMaskPosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMaskPosition({ x, y });
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className={`group relative overflow-hidden ${className}`}>
      {/* Base content */}
      <div className="relative z-10">{children}</div>

      {/* Reveal content */}
      <div
        ref={revealRef}
        className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          WebkitMaskImage: `radial-gradient(circle 100px at ${maskPosition.x}% ${maskPosition.y}%, black 0%, transparent 100%)`,
          maskImage: `radial-gradient(circle 100px at ${maskPosition.x}% ${maskPosition.y}%, black 0%, transparent 100%)`,
        }}
      >
        {revealContent}
      </div>
    </div>
  );
}
