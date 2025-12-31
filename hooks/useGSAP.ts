'use client';

import { useEffect, useRef, useCallback } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Hook for creating GSAP context with automatic cleanup
 */
export function useGSAP<T extends HTMLElement = HTMLDivElement>(
  callback: (context: gsap.Context) => void,
  dependencies: unknown[] = []
) {
  const ref = useRef<T>(null);
  const contextRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Create GSAP context scoped to the ref element
    contextRef.current = gsap.context(() => {
      callback(contextRef.current!);
    }, ref);

    // Cleanup on unmount or dependency change
    return () => {
      contextRef.current?.revert();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return ref;
}

/**
 * Hook for creating scroll-triggered animations
 */
export function useScrollTrigger<T extends HTMLElement = HTMLDivElement>(
  options: ScrollTrigger.Vars,
  dependencies: unknown[] = []
) {
  const ref = useRef<T>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    triggerRef.current = ScrollTrigger.create({
      trigger: ref.current,
      ...options,
    });

    return () => {
      triggerRef.current?.kill();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return ref;
}

/**
 * Hook for creating timeline animations
 */
export function useTimeline(
  options?: gsap.TimelineVars
): [React.RefObject<gsap.core.Timeline | null>, () => gsap.core.Timeline] {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const createTimeline = useCallback(() => {
    // Kill existing timeline if any
    timelineRef.current?.kill();

    // Create new timeline
    timelineRef.current = gsap.timeline(options);

    return timelineRef.current;
  }, [options]);

  useEffect(() => {
    return () => {
      timelineRef.current?.kill();
    };
  }, []);

  return [timelineRef, createTimeline];
}

/**
 * Hook for creating animations that respond to element visibility
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  callback: () => void,
  options: {
    threshold?: number;
    once?: boolean;
  } = {}
) {
  const ref = useRef<T>(null);
  const { threshold = 0.2, once = true } = options;

  useEffect(() => {
    if (!ref.current) return;

    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: `top ${100 - threshold * 100}%`,
      onEnter: callback,
      once,
    });

    return () => {
      trigger.kill();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, once]);

  return ref;
}
