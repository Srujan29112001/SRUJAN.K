'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { lerp } from '@/lib/utils';

interface MousePosition {
  x: number;
  y: number;
  normalizedX: number; // -1 to 1
  normalizedY: number; // -1 to 1
}

/**
 * Hook to track mouse position
 */
export function useMousePosition(smooth: boolean = false): MousePosition {
  const [position, setPosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  });

  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = {
        x: e.clientX,
        y: e.clientY,
      };

      if (!smooth) {
        const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
        const normalizedY = (e.clientY / window.innerHeight) * 2 - 1;

        setPosition({
          x: e.clientX,
          y: e.clientY,
          normalizedX,
          normalizedY,
        });
      }
    };

    const animate = () => {
      if (smooth) {
        currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, 0.1);
        currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, 0.1);

        const normalizedX = (currentRef.current.x / window.innerWidth) * 2 - 1;
        const normalizedY = (currentRef.current.y / window.innerHeight) * 2 - 1;

        setPosition({
          x: currentRef.current.x,
          y: currentRef.current.y,
          normalizedX,
          normalizedY,
        });
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);

    if (smooth) {
      rafRef.current = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [smooth]);

  return position;
}

/**
 * Hook to track mouse position relative to an element
 */
export function useRelativeMousePosition<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
    isInside: false,
  });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normalizedX = (x / rect.width) * 2 - 1;
    const normalizedY = (y / rect.height) * 2 - 1;

    const isInside =
      x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;

    setPosition({
      x,
      y,
      normalizedX,
      normalizedY,
      isInside,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return { ref, ...position };
}
