'use client';

import { useEffect, useRef, useState, ReactNode, createContext, useContext } from 'react';
import { gsap } from '@/lib/gsap';

// Motion preferences context
interface MotionContextType {
  prefersReducedMotion: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const MotionContext = createContext<MotionContextType>({
  prefersReducedMotion: false,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
});

export function useMotionPreferences() {
  return useContext(MotionContext);
}

// Provider component
export function MotionProvider({ children }: { children: ReactNode }) {
  const [motionContext, setMotionContext] = useState<MotionContextType>({
    prefersReducedMotion: false,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateMotionPreference = () => {
      setMotionContext((prev) => ({
        ...prev,
        prefersReducedMotion: mediaQuery.matches,
      }));
    };

    // Check screen size
    const updateScreenSize = () => {
      const width = window.innerWidth;
      setMotionContext((prev) => ({
        ...prev,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      }));
    };

    updateMotionPreference();
    updateScreenSize();

    mediaQuery.addEventListener('change', updateMotionPreference);
    window.addEventListener('resize', updateScreenSize);

    return () => {
      mediaQuery.removeEventListener('change', updateMotionPreference);
      window.removeEventListener('resize', updateScreenSize);
    };
  }, []);

  return (
    <MotionContext.Provider value={motionContext}>
      {children}
    </MotionContext.Provider>
  );
}

// Responsive fade-in animation
interface FadeInProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  once?: boolean;
}

export function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  threshold = 0.2,
  className = '',
  once = true,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion, isMobile } = useMotionPreferences();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Skip animation for reduced motion preference
    if (prefersReducedMotion) {
      gsap.set(element, { opacity: 1, x: 0, y: 0 });
      return;
    }

    // Reduced animation distance on mobile
    const distance = isMobile ? 30 : 50;

    const getInitialPosition = () => {
      switch (direction) {
        case 'up':
          return { y: distance, x: 0 };
        case 'down':
          return { y: -distance, x: 0 };
        case 'left':
          return { x: distance, y: 0 };
        case 'right':
          return { x: -distance, y: 0 };
        default:
          return { x: 0, y: 0 };
      }
    };

    const initial = getInitialPosition();

    gsap.fromTo(
      element,
      { opacity: 0, ...initial },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: isMobile ? duration * 0.8 : duration,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: `top ${100 - threshold * 100}%`,
          toggleActions: once ? 'play none none none' : 'play reverse play reverse',
        },
      }
    );
  }, [direction, delay, duration, threshold, once, prefersReducedMotion, isMobile]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// Responsive scale animation
interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function ScaleIn({
  children,
  delay = 0,
  duration = 0.6,
  className = '',
}: ScaleInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = useMotionPreferences();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (prefersReducedMotion) {
      gsap.set(element, { opacity: 1, scale: 1 });
      return;
    }

    gsap.fromTo(
      element,
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration,
        delay,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, [delay, duration, prefersReducedMotion]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// Stagger children animation
interface StaggerChildrenProps {
  children: ReactNode;
  stagger?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export function StaggerChildren({
  children,
  stagger = 0.1,
  direction = 'up',
  className = '',
}: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion, isMobile } = useMotionPreferences();

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const items = container.children;
    if (items.length === 0) return;

    if (prefersReducedMotion) {
      gsap.set(items, { opacity: 1, x: 0, y: 0 });
      return;
    }

    const distance = isMobile ? 20 : 40;

    const getInitialPosition = () => {
      switch (direction) {
        case 'up':
          return { y: distance, x: 0 };
        case 'down':
          return { y: -distance, x: 0 };
        case 'left':
          return { x: distance, y: 0 };
        case 'right':
          return { x: -distance, y: 0 };
        default:
          return { x: 0, y: 0 };
      }
    };

    const initial = getInitialPosition();

    gsap.fromTo(
      items,
      { opacity: 0, ...initial },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.6,
        stagger: isMobile ? stagger * 0.7 : stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, [stagger, direction, prefersReducedMotion, isMobile]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// Parallax element with responsive behavior
interface ParallaxElementProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxElement({
  children,
  speed = 0.5,
  className = '',
}: ParallaxElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion, isMobile } = useMotionPreferences();

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion || isMobile) return;

    gsap.to(element, {
      y: () => speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, [speed, prefersReducedMotion, isMobile]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// Mobile-friendly hover effect wrapper
interface HoverEffectProps {
  children: ReactNode;
  scale?: number;
  rotate?: number;
  className?: string;
}

export function HoverEffect({
  children,
  scale = 1.05,
  rotate = 0,
  className = '',
}: HoverEffectProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion, isMobile } = useMotionPreferences();

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion) return;

    // On mobile, use tap effect instead of hover
    if (isMobile) {
      const handleTouchStart = () => {
        gsap.to(element, {
          scale: scale * 0.98,
          duration: 0.2,
          ease: 'power2.out',
        });
      };

      const handleTouchEnd = () => {
        gsap.to(element, {
          scale: 1,
          duration: 0.3,
          ease: 'elastic.out(1, 0.5)',
        });
      };

      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchend', handleTouchEnd);

      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      };
    }

    // Desktop hover effect
    const handleMouseEnter = () => {
      gsap.to(element, {
        scale,
        rotation: rotate,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [scale, rotate, prefersReducedMotion, isMobile]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// Responsive text animation
interface AnimatedTextProps {
  text: string;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
}

export function AnimatedText({
  text,
  className = '',
  tag: Tag = 'p',
}: AnimatedTextProps) {
  const ref = useRef<HTMLElement>(null);
  const { prefersReducedMotion, isMobile } = useMotionPreferences();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (prefersReducedMotion) {
      element.textContent = text;
      return;
    }

    // Simple fade on mobile, character animation on desktop
    if (isMobile) {
      element.textContent = text;
      gsap.fromTo(
        element,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
          },
        }
      );
    } else {
      // Split into characters for desktop
      const chars = text.split('');
      element.innerHTML = chars
        .map((char) => `<span class="inline-block">${char === ' ' ? '&nbsp;' : char}</span>`)
        .join('');

      gsap.fromTo(
        element.querySelectorAll('span'),
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.02,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
          },
        }
      );
    }
  }, [text, prefersReducedMotion, isMobile]);

  return <Tag ref={ref as React.RefObject<HTMLElement>} className={className} />;
}

// Intersection observer wrapper for lazy animations
interface LazyAnimateProps {
  children: ReactNode;
  className?: string;
  animation?: 'fade' | 'slide' | 'scale' | 'blur';
}

export function LazyAnimate({
  children,
  className = '',
  animation = 'fade',
}: LazyAnimateProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { prefersReducedMotion } = useMotionPreferences();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const animationClasses = {
    fade: 'transition-opacity duration-700',
    slide: 'transition-all duration-700 transform',
    scale: 'transition-all duration-700 transform',
    blur: 'transition-all duration-700',
  };

  const hiddenClasses = {
    fade: 'opacity-0',
    slide: 'opacity-0 translate-y-8',
    scale: 'opacity-0 scale-95',
    blur: 'opacity-0 blur-sm',
  };

  const visibleClasses = {
    fade: 'opacity-100',
    slide: 'opacity-100 translate-y-0',
    scale: 'opacity-100 scale-100',
    blur: 'opacity-100 blur-0',
  };

  return (
    <div
      ref={ref}
      className={`${animationClasses[animation]} ${
        isVisible ? visibleClasses[animation] : hiddenClasses[animation]
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Mobile swipe handler
interface SwipeHandlerProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  className?: string;
}

export function SwipeHandler({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  className = '',
}: SwipeHandlerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      startPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startPos.current.x;
      const deltaY = endY - startPos.current.y;

      // Check horizontal swipe
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }

      // Check vertical swipe
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > threshold) {
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
