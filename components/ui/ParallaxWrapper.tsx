'use client';

import { useRef, useEffect, ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { cn } from '@/lib/utils';

interface ParallaxWrapperProps {
  children: ReactNode;
  className?: string;
  speed?: number; // Positive = moves slower, Negative = moves faster
  direction?: 'vertical' | 'horizontal';
  scale?: { start?: number; end?: number };
  opacity?: { start?: number; end?: number };
  rotate?: { start?: number; end?: number };
}

export function ParallaxWrapper({
  children,
  className = '',
  speed = 0.5,
  direction = 'vertical',
  scale,
  opacity,
  rotate,
}: ParallaxWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const animationProps: gsap.TweenVars = {
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    };

    // Add movement based on direction
    if (direction === 'vertical') {
      animationProps.yPercent = speed * 100;
    } else {
      animationProps.xPercent = speed * 100;
    }

    // Add optional scale
    if (scale) {
      animationProps.scale = scale.end ?? 1;
      gsap.set(el, { scale: scale.start ?? 1 });
    }

    // Add optional opacity
    if (opacity) {
      animationProps.opacity = opacity.end ?? 1;
      gsap.set(el, { opacity: opacity.start ?? 1 });
    }

    // Add optional rotation
    if (rotate) {
      animationProps.rotate = rotate.end ?? 0;
      gsap.set(el, { rotate: rotate.start ?? 0 });
    }

    const tween = gsap.to(el, animationProps);

    return () => {
      tween.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) {
          st.kill();
        }
      });
    };
  }, [speed, direction, scale, opacity, rotate]);

  return (
    <div ref={ref} className={cn('will-change-transform', className)}>
      {children}
    </div>
  );
}

// Simpler parallax for images
interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
  scale?: number;
}

export function ParallaxImage({
  src,
  alt,
  className = '',
  speed = 0.3,
  scale = 1.2,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image) return;

    // Set initial scale for parallax effect
    gsap.set(image, { scale });

    const tween = gsap.to(image, {
      yPercent: speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });

    return () => {
      tween.kill();
    };
  }, [speed, scale]);

  return (
    <div ref={containerRef} className={cn('overflow-hidden', className)}>
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className="h-full w-full object-cover will-change-transform"
      />
    </div>
  );
}
