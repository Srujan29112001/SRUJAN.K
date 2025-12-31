'use client';

import { useEffect, useState } from 'react';
import type Lenis from 'lenis';
import { getLenis } from '@/lib/lenis';

/**
 * Hook to access the Lenis smooth scroll instance
 */
export function useLenis(): Lenis | null {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // Wait for Lenis to be initialized
    const checkLenis = () => {
      const instance = getLenis();
      if (instance) {
        setLenis(instance);
      }
    };

    // Check immediately
    checkLenis();

    // Also check after a short delay in case it's not ready yet
    const timeout = setTimeout(checkLenis, 100);

    return () => clearTimeout(timeout);
  }, []);

  return lenis;
}

/**
 * Hook to scroll to a specific target
 */
export function useScrollTo() {
  const lenis = useLenis();

  const scrollTo = (
    target: string | number | HTMLElement,
    options?: {
      offset?: number;
      duration?: number;
      immediate?: boolean;
    }
  ) => {
    if (!lenis) {
      // Fallback to native scroll
      if (typeof target === 'string') {
        const element = document.querySelector(target);
        element?.scrollIntoView({ behavior: 'smooth' });
      } else if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      }
      return;
    }

    lenis.scrollTo(target, {
      offset: options?.offset ?? 0,
      duration: options?.duration ?? 1.2,
      immediate: options?.immediate ?? false,
    });
  };

  return scrollTo;
}

/**
 * Hook to lock/unlock scroll
 */
export function useScrollLock() {
  const lenis = useLenis();

  const lock = () => {
    lenis?.stop();
  };

  const unlock = () => {
    lenis?.start();
  };

  return { lock, unlock };
}
