'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const preloader = preloaderRef.current;
    if (!preloader) return;

    const tl = gsap.timeline({
      onComplete: () => {
        onComplete();
      },
    });

    // Counter animation
    tl.to(
      { value: 0 },
      {
        value: 100,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: function () {
          setCount(Math.round(this.targets()[0].value));
        },
      }
    );

    // Exit animation
    tl.to(preloader, {
      yPercent: -100,
      duration: 0.8,
      ease: 'power3.inOut',
      delay: 0.2,
    });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={preloaderRef}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black text-white"
    >
      <div className="text-center">
        <div className="mb-4 font-display text-6xl font-bold md:text-8xl">
          {count}%
        </div>
        <div className="font-mono text-sm text-primary uppercase tracking-widest">
          Initializing System
        </div>
      </div>
    </div>
  );
}
