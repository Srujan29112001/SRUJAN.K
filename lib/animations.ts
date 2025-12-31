'use client';

import { gsap } from './gsap';

/**
 * Fade in from bottom animation
 */
export const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] },
};

/**
 * Fade in from left animation
 */
export const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] },
};

/**
 * Fade in from right animation
 */
export const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] },
};

/**
 * Scale in animation
 */
export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
};

/**
 * Stagger container for children animations
 */
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

/**
 * Stagger children animation
 */
export const staggerItem = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
};

/**
 * Create text reveal animation with GSAP
 */
export function createTextReveal(
  element: HTMLElement,
  options: {
    duration?: number;
    delay?: number;
    stagger?: number;
    ease?: string;
  } = {}
) {
  const { duration = 0.8, delay = 0, stagger = 0.02, ease = 'power4.out' } = options;

  const chars = element.querySelectorAll('.char');
  if (chars.length === 0) return;

  return gsap.from(chars, {
    opacity: 0,
    y: 100,
    rotateX: -90,
    duration,
    delay,
    stagger,
    ease,
  });
}

/**
 * Create scroll reveal animation with GSAP
 */
export function createScrollReveal(
  element: HTMLElement | HTMLElement[],
  options: {
    y?: number;
    opacity?: number;
    duration?: number;
    stagger?: number;
    start?: string;
    end?: string;
    scrub?: boolean | number;
  } = {}
) {
  const {
    y = 60,
    opacity = 0,
    duration = 1,
    stagger = 0.1,
    start = 'top 80%',
    end = 'bottom 20%',
    scrub = false,
  } = options;

  return gsap.from(element, {
    y,
    opacity,
    duration,
    stagger,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: element,
      start,
      end,
      scrub,
      toggleActions: 'play none none reverse',
    },
  });
}

/**
 * Create parallax effect with GSAP
 */
export function createParallax(
  element: HTMLElement,
  options: {
    yPercent?: number;
    scale?: number;
    opacity?: number;
    start?: string;
    end?: string;
  } = {}
) {
  const {
    yPercent = 50,
    scale = 1,
    opacity = 1,
    start = 'top bottom',
    end = 'bottom top',
  } = options;

  return gsap.to(element, {
    yPercent,
    scale,
    opacity,
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start,
      end,
      scrub: 1,
    },
  });
}

/**
 * Create magnetic effect for buttons
 */
export function createMagneticEffect(
  element: HTMLElement,
  strength: number = 0.3
): () => void {
  const onMouseMove = (e: MouseEvent) => {
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

  const onMouseLeave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)',
    });
  };

  element.addEventListener('mousemove', onMouseMove);
  element.addEventListener('mouseleave', onMouseLeave);

  return () => {
    element.removeEventListener('mousemove', onMouseMove);
    element.removeEventListener('mouseleave', onMouseLeave);
  };
}

/**
 * Create hover tilt effect for cards
 */
export function createTiltEffect(
  element: HTMLElement,
  intensity: number = 15
): () => void {
  const onMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / intensity;
    const rotateY = (centerX - x) / intensity;

    gsap.to(element, {
      rotateX,
      rotateY,
      transformPerspective: 1000,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const onMouseLeave = () => {
    gsap.to(element, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)',
    });
  };

  element.addEventListener('mousemove', onMouseMove);
  element.addEventListener('mouseleave', onMouseLeave);

  return () => {
    element.removeEventListener('mousemove', onMouseMove);
    element.removeEventListener('mouseleave', onMouseLeave);
  };
}
