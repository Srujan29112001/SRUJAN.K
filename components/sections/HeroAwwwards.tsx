'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';
import { useIsMobile } from '@/hooks/useMediaQuery';

gsap.registerPlugin(ScrollTrigger);

// Dynamic imports for 3D
const Scene = dynamic(() => import('@/components/three/Scene').then((m) => m.Scene), { ssr: false });
const ParticleUniverse = dynamic(
  () => import('@/components/three/ParticleUniverse').then((m) => m.ParticleUniverse),
  { ssr: false }
);
const EnergyCore = dynamic(
  () => import('@/components/three/ParticleUniverse').then((m) => m.EnergyCore),
  { ssr: false }
);

export function HeroAwwwards() {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const isMobile = useIsMobile();

  // Initial reveal animation
  useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Title character animation
      const chars = gsap.utils.toArray('.hero-char');
      gsap.from(chars, {
        y: 120,
        opacity: 0,
        rotationX: -90,
        stagger: 0.04,
        duration: 1.2,
        ease: 'power4.out',
        delay: 0.3,
      });

      // Subtitle reveal
      gsap.from('.hero-subtitle', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 1,
      });

      // Tagline reveal
      gsap.from('.hero-tagline', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 1.3,
      });

      // Frame corners reveal
      gsap.from('.frame-corner', {
        scale: 0,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'back.out(1.7)',
        delay: 0.5,
      });

      // Scroll indicator
      gsap.from('.scroll-indicator', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 1.5,
      });

      // Main scroll animation - cinematic zoom through
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=150%',
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            setScrollProgress(self.progress);
          },
        },
      });

      // Frame shrinks and fades
      scrollTl.to(frameRef.current, {
        scale: 0.5,
        opacity: 0,
        ease: 'power2.in',
      }, 0);

      // Title flies at camera and fades
      scrollTl.to(titleRef.current, {
        scale: 8,
        opacity: 0,
        z: 500,
        filter: 'blur(20px)',
        ease: 'power3.in',
      }, 0);

      // Subtitle fades earlier
      scrollTl.to(subtitleRef.current, {
        opacity: 0,
        y: -100,
        ease: 'power2.in',
      }, 0);

      // Scroll indicator fades
      scrollTl.to('.scroll-indicator', {
        opacity: 0,
        y: -50,
      }, 0);

      // Canvas zooms in dramatically
      scrollTl.to(canvasContainerRef.current, {
        scale: 2,
        ease: 'power2.in',
      }, 0);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const splitText = (text: string) => {
    return text.split('').map((char, i) => (
      <span
        key={i}
        className="hero-char inline-block"
        style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-[#030712]"
    >
      {/* 3D Background */}
      <div
        ref={canvasContainerRef}
        className="absolute inset-0 z-0"
        style={{
          transform: `scale(${1 + scrollProgress * 0.5})`,
        }}
      >
        {!isMobile && (
          <Scene
            enablePostProcessing
            enableBloom
            bloomIntensity={0.6}
            enableChromaticAberration
          >
            <ParticleUniverse count={6000} scrollProgress={scrollProgress} />
            <EnergyCore scrollProgress={scrollProgress} />
          </Scene>
        )}

        {/* Mobile gradient fallback */}
        {isMobile && (
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(109,100,163,0.3)_0%,_transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(6,182,212,0.2)_0%,_transparent_50%)]" />
          </div>
        )}
      </div>

      {/* Cinematic Frame */}
      <div
        ref={frameRef}
        className="absolute inset-4 md:inset-8 lg:inset-12 z-10 pointer-events-none"
      >
        {/* Corner accents */}
        <div className="frame-corner absolute top-0 left-0 w-12 h-12 md:w-20 md:h-20">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary to-transparent" />
          <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-primary to-transparent" />
        </div>
        <div className="frame-corner absolute top-0 right-0 w-12 h-12 md:w-20 md:h-20">
          <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-primary to-transparent" />
          <div className="absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-primary to-transparent" />
        </div>
        <div className="frame-corner absolute bottom-0 left-0 w-12 h-12 md:w-20 md:h-20">
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary to-transparent" />
          <div className="absolute bottom-0 left-0 h-full w-[2px] bg-gradient-to-t from-primary to-transparent" />
        </div>
        <div className="frame-corner absolute bottom-0 right-0 w-12 h-12 md:w-20 md:h-20">
          <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-primary to-transparent" />
          <div className="absolute bottom-0 right-0 h-full w-[2px] bg-gradient-to-t from-primary to-transparent" />
        </div>

        {/* Frame info - top */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 font-mono text-[10px] md:text-xs text-white/40">
          <span className="text-primary">SYS://</span>PORTFOLIO.v3
        </div>
        <div className="absolute top-4 right-4 md:top-6 md:right-6 font-mono text-[10px] md:text-xs text-white/40 text-right">
          <span className="text-secondary">STATUS:</span> ONLINE
        </div>

        {/* Frame info - bottom */}
        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 font-mono text-[10px] md:text-xs text-white/40">
          LAT: 17.3850° N<br />
          LON: 78.4867° E
        </div>
        <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 font-mono text-[10px] md:text-xs text-white/40 text-right">
          {new Date().getFullYear()}<br />
          HYDERABAD
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex h-full flex-col items-center justify-center text-center px-4">
        {/* Pre-title label */}
        <div className="hero-subtitle mb-4 md:mb-6">
          <div className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <span className="font-mono text-[10px] md:text-xs tracking-[0.2em] text-white/70 uppercase">
              Available for Projects
            </span>
          </div>
        </div>

        {/* Main Title */}
        <div ref={titleRef} className="relative perspective-1000">
          <h1
            className="font-display font-bold text-white leading-[0.85] tracking-[-0.04em]"
            style={{ fontSize: 'clamp(3.5rem, 15vw, 14rem)' }}
          >
            {splitText('SRUJAN')}
          </h1>

          {/* Glowing underline */}
          <div className="hero-tagline mt-2 md:mt-4 h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>

        {/* Subtitle */}
        <div ref={subtitleRef} className="hero-tagline mt-6 md:mt-10 space-y-3 md:space-y-4">
          <p className="font-mono text-sm md:text-base lg:text-lg text-secondary tracking-[0.15em] uppercase">
            AI Engineer & Robotics Specialist
          </p>

          <p className="max-w-md md:max-w-xl text-sm md:text-base text-white/50 leading-relaxed">
            Building systems that perceive, reason, and act.
            <br className="hidden md:block" />
            From defense AI to consciousness studies.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mt-6 md:mt-8">
            <a
              href="#projects"
              className="group relative px-6 md:px-8 py-3 md:py-4 bg-white text-black font-medium rounded-full overflow-hidden transition-transform hover:scale-105"
            >
              <span className="relative z-10">View Projects</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a
              href="#contact"
              className="px-6 md:px-8 py-3 md:py-4 border border-white/20 text-white font-medium rounded-full backdrop-blur-sm hover:bg-white/10 hover:border-white/40 transition-all"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        ref={scrollIndicatorRef}
        className="scroll-indicator absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 md:gap-3"
      >
        <span className="font-mono text-[10px] md:text-xs tracking-[0.3em] text-white/40 uppercase">
          Scroll to Explore
        </span>
        <div className="relative w-5 h-8 md:w-6 md:h-10 rounded-full border border-white/20 flex justify-center">
          <div className="w-1 h-2 md:h-3 bg-white/60 rounded-full mt-2 animate-scroll-down" />
        </div>
      </div>

      {/* Gradient overlays */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#030712] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#030712]/50 to-transparent z-10 pointer-events-none" />
    </section>
  );
}
