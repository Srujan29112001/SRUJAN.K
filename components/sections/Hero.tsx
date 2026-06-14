'use client';

import { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { useIsMobile } from '@/hooks/useMediaQuery';

// Dynamic import for 3D components (Optional Fallback)
const Scene = dynamic(() => import('@/components/three/Scene').then((m) => m.Scene), {
  ssr: false,
});
const NeuralTunnel = dynamic(() => import('@/components/three/NeuralTunnel').then((m) => m.NeuralTunnel), {
  ssr: false,
});

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();
  // The bg video can take a moment to buffer on a fresh device; until it can
  // play we cover the static poster with a clean branded loader and only then
  // fade the video in.
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    // If the video is already cached/ready before React attaches the handler.
    if (videoRef.current && videoRef.current.readyState >= 3) setVideoReady(true);
    // Safety net: never let the loader stick (slow link, reduced-data, etc.).
    // The video underneath is always rendered, so revealing it early just shows
    // the poster/first frame — never black.
    const t = setTimeout(() => setVideoReady(true), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial Reveal
      const tl = gsap.timeline({ delay: 0.5 });

      tl.from('.hero-char', {
        y: 100,
        opacity: 0,
        rotateX: -90,
        stagger: 0.05,
        duration: 1,
        ease: 'power4.out',
      })
        .from('.hero-sub', {
          y: 20,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
        }, '-=0.5');

      // Scroll Transition (Warp Effect)
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: '+=100%',
        pin: true,
        scrub: true,
        animation: gsap.timeline()
          // Fade out text
          .to(contentRef.current, {
            scale: 2,
            opacity: 0,
            filter: 'blur(10px)',
            ease: 'power2.in',
          })
          // Zoom into video
          .to(videoRef.current, {
            scale: 1.5,
            opacity: 0,
            ease: 'power1.in',
          }, 0)
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const nameChars = 'SRUJAN'.split('');

  return (
    <section ref={containerRef} id="hero" className="relative h-screen w-full overflow-hidden bg-black">

      {/* Video Background Layer */}
      <div className="absolute inset-0 z-0">
        {/* Video is ALWAYS rendered (poster shows until the first frame), so
            the hero can never go black — the veil below only hides the brief
            poster→video swap and always fades on ready or the timeout. */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onCanPlay={() => setVideoReady(true)}
          onPlaying={() => setVideoReady(true)}
          onLoadedData={() => setVideoReady(true)}
          onError={() => setVideoReady(true)}
          className="absolute inset-0 w-full h-full object-cover opacity-50 sm:opacity-60"
          poster="/images/projects/hero-ai.png" // Fallback image
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>

        {/* Overlay Gradient for readability - Enhanced for mobile */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80 sm:from-black/30 sm:via-transparent sm:to-black/80" />

        {/* Loading veil — a clean dark backdrop + branded spinner over the
            poster while the video buffers; fades the moment it can play (or
            after the safety timeout). Pointer-events off so it never blocks. */}
        <div
          className={`absolute inset-0 z-[1] flex flex-col items-center justify-center bg-[#0A0A12] transition-opacity duration-700 pointer-events-none ${videoReady ? 'opacity-0' : 'opacity-100'}`}
        >
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/15" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin" />
          </div>
          <span className="mt-5 font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-400/60">
            Initializing
          </span>
        </div>
      </div>

      {/* Content Layer */}
      <div ref={contentRef} className="relative z-10 flex h-full flex-col items-center justify-center text-center pointer-events-none px-4 sm:px-6">

        {/* Holographic Name - Responsive sizing */}
        <h1 className="relative mb-4 sm:mb-6 font-display font-bold leading-none tracking-tighter text-white mix-blend-difference"
          style={{ fontSize: 'clamp(3rem, 12vw, 12rem)' }}>
          {nameChars.map((char, i) => (
            <span key={i} className="hero-char inline-block relative">
              {char}
            </span>
          ))}
        </h1>

        {/* Subtitle - Responsive spacing and sizing */}
        <div className="hero-sub space-y-8 sm:space-y-12 pointer-events-auto max-w-full">
          <p className="font-mono text-[9px] xs:text-[10px] sm:text-xs md:text-sm text-cyan-400/80 tracking-[0.3em] sm:tracking-[0.5em] uppercase px-2">
            Architect of Intelligence
          </p>

          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-white/40 animate-pulse">
              Scroll Down
            </span>
            <div className="h-8 sm:h-12 w-[1px] bg-gradient-to-b from-white/20 to-transparent" />
          </div>
        </div>

      </div>

    </section>
  );
}
