'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { cn } from '@/lib/utils';

interface ScrollProgressProps {
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  color?: string;
  height?: number;
  showPercentage?: boolean;
}

export function ScrollProgress({
  className = '',
  position = 'top',
  color = 'var(--color-primary)',
  height = 3,
  showPercentage = false,
}: ScrollProgressProps) {
  const progressRef = useRef<HTMLDivElement>(null);
  const percentageRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const progress = progressRef.current;
    const percentage = percentageRef.current;
    if (!progress) return;

    const tween = gsap.to(progress, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
        onUpdate: (self) => {
          if (percentage) {
            percentage.textContent = `${Math.round(self.progress * 100)}%`;
          }
        },
      },
    });

    return () => {
      tween.kill();
    };
  }, []);

  const isVertical = position === 'left' || position === 'right';
  const positionClasses = {
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0',
    left: 'top-0 bottom-0 left-0',
    right: 'top-0 bottom-0 right-0',
  };

  return (
    <>
      <div
        className={cn(
          'fixed z-50',
          positionClasses[position],
          className
        )}
        style={{
          height: isVertical ? '100%' : height,
          width: isVertical ? height : '100%',
        }}
      >
        <div
          ref={progressRef}
          className="origin-left"
          style={{
            height: '100%',
            width: '100%',
            backgroundColor: color,
            transform: isVertical ? 'scaleY(0)' : 'scaleX(0)',
            transformOrigin: isVertical ? 'top' : 'left',
          }}
        />
      </div>

      {showPercentage && (
        <span
          ref={percentageRef}
          className="fixed right-4 top-4 z-50 font-mono text-xs text-white/60"
        >
          0%
        </span>
      )}
    </>
  );
}

// Section progress indicator
interface SectionProgressProps {
  sections: string[];
  className?: string;
}

export function SectionProgress({ sections, className = '' }: SectionProgressProps) {
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    sections.forEach((sectionId, index) => {
      const section = document.getElementById(sectionId);
      const dot = dotsRef.current[index];
      if (!section || !dot) return;

      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => {
          gsap.to(dot, {
            scale: 1.5,
            backgroundColor: 'var(--color-primary)',
            duration: 0.3,
          });
        },
        onLeave: () => {
          gsap.to(dot, {
            scale: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            duration: 0.3,
          });
        },
        onEnterBack: () => {
          gsap.to(dot, {
            scale: 1.5,
            backgroundColor: 'var(--color-primary)',
            duration: 0.3,
          });
        },
        onLeaveBack: () => {
          gsap.to(dot, {
            scale: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            duration: 0.3,
          });
        },
      });
    });
  }, [sections]);

  return (
    <div
      className={cn(
        'fixed right-6 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-3',
        className
      )}
    >
      {sections.map((section, index) => (
        <div
          key={section}
          ref={(el) => { dotsRef.current[index] = el; }}
          className="h-2 w-2 cursor-pointer rounded-full bg-white/30 transition-all"
          onClick={() => {
            const el = document.getElementById(section);
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          title={section}
        />
      ))}
    </div>
  );
}
