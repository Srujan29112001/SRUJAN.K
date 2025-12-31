'use client';

import { useEffect, useRef, useState, createContext, useContext, ReactNode } from 'react';
import { gsap } from '@/lib/gsap';

// Transition context
interface TransitionContextType {
  isTransitioning: boolean;
  startTransition: (callback?: () => void) => void;
}

const TransitionContext = createContext<TransitionContextType>({
  isTransitioning: false,
  startTransition: () => {},
});

export function usePageTransition() {
  return useContext(TransitionContext);
}

// Transition provider
export function TransitionProvider({ children }: { children: ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);

  const startTransition = (callback?: () => void) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const overlay = overlayRef.current;
    const columns = columnsRef.current?.children;
    if (!overlay || !columns) return;

    const tl = gsap.timeline({
      onComplete: () => {
        callback?.();
        // Reverse animation
        gsap.to(columns, {
          scaleY: 0,
          transformOrigin: 'top',
          duration: 0.5,
          stagger: 0.05,
          ease: 'power3.inOut',
          onComplete: () => setIsTransitioning(false),
        });
      },
    });

    tl.set(overlay, { display: 'flex' });
    tl.fromTo(
      columns,
      { scaleY: 0, transformOrigin: 'bottom' },
      {
        scaleY: 1,
        duration: 0.5,
        stagger: 0.05,
        ease: 'power3.inOut',
      }
    );
  };

  return (
    <TransitionContext.Provider value={{ isTransitioning, startTransition }}>
      {children}

      {/* Transition overlay */}
      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-[500] hidden"
      >
        <div ref={columnsRef} className="flex h-full w-full">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-full flex-1 origin-bottom bg-primary"
              style={{ transform: 'scaleY(0)' }}
            />
          ))}
        </div>
      </div>
    </TransitionContext.Provider>
  );
}

// Section reveal animation
export function SectionReveal({
  children,
  direction = 'up',
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  className?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const directionMap = {
      up: { y: 100, x: 0 },
      down: { y: -100, x: 0 },
      left: { x: 100, y: 0 },
      right: { x: -100, y: 0 },
    };

    const { x, y } = directionMap[direction];

    gsap.fromTo(
      section,
      { opacity: 0, x, y },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 1,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, [direction, delay]);

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  );
}

// Clip path reveal
export function ClipReveal({
  children,
  clipFrom = 'bottom',
  className = '',
}: {
  children: ReactNode;
  clipFrom?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const clipPaths = {
      top: {
        from: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
        to: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
      bottom: {
        from: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
        to: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
      left: {
        from: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
        to: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
      right: {
        from: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
        to: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
      center: {
        from: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
        to: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      },
    };

    const { from, to } = clipPaths[clipFrom];

    gsap.fromTo(
      container,
      { clipPath: from },
      {
        clipPath: to,
        duration: 1.2,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, [clipFrom]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

// Stagger reveal for lists/grids
export function StaggerReveal({
  children,
  stagger = 0.1,
  className = '',
}: {
  children: ReactNode;
  stagger?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.children;

    gsap.fromTo(
      items,
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, [stagger]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

// Mask text reveal (igloo-style)
export function MaskTextReveal({
  text,
  tag: Tag = 'h2',
  className = '',
  delay = 0,
}: {
  text: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  className?: string;
  delay?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const words = text.split(' ');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wordElements = container.querySelectorAll('.mask-word');

    gsap.fromTo(
      wordElements,
      { y: '100%' },
      {
        y: '0%',
        duration: 0.8,
        stagger: 0.05,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, [delay]);

  return (
    <div ref={containerRef}>
      <Tag className={className}>
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden">
            <span className="mask-word inline-block">
              {word}
              {i < words.length - 1 && '\u00A0'}
            </span>
          </span>
        ))}
      </Tag>
    </div>
  );
}

// Line reveal animation
export function LineReveal({
  children,
  className = '',
  duration = 1,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const line = lineRef.current;
    if (!container || !line) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });

    tl.fromTo(
      line,
      { scaleX: 0, transformOrigin: 'left' },
      { scaleX: 1, duration, delay, ease: 'power3.inOut' }
    );

    tl.fromTo(
      container.querySelector('.line-content'),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      `-=${duration * 0.3}`
    );
  }, [duration, delay]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        ref={lineRef}
        className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-primary to-transparent"
        style={{ transform: 'scaleX(0)' }}
      />
      <div className="line-content pt-4">{children}</div>
    </div>
  );
}

// Counter animation with scroll trigger
export function ScrollCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 2,
  className = '',
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const counterRef = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const counter = counterRef.current;
    if (!counter) return;

    const obj = { val: 0 };

    gsap.to(obj, {
      val: value,
      duration,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: counter,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
      onUpdate: () => {
        setDisplayValue(Math.round(obj.val));
      },
    });
  }, [value, duration]);

  return (
    <span ref={counterRef} className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

// Parallax section background
export function ParallaxSection({
  children,
  backgroundUrl,
  speed = 0.5,
  overlay = true,
  className = '',
}: {
  children: ReactNode;
  backgroundUrl?: string;
  speed?: number;
  overlay?: boolean;
  className?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    if (!section || !bg) return;

    gsap.to(bg, {
      yPercent: speed * 50,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, [speed]);

  return (
    <section ref={sectionRef} className={`relative overflow-hidden ${className}`}>
      {/* Parallax background */}
      <div
        ref={bgRef}
        className="absolute inset-0 -top-[20%] h-[140%] w-full"
        style={{
          backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-bg-base/80 via-bg-base/60 to-bg-base/80" />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
