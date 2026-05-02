'use client';

import { useState, useEffect, useLayoutEffect } from 'react';
import { Preloader } from '@/components/sections/Preloader';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { WarpTransition } from '@/components/sections/WarpTransition';
import { Skills } from '@/components/sections/Skills';
import ProjectsShowcase from '@/components/sections/ProjectsShowcase';
import { Blog } from '@/components/sections/Blog';
import { WormholeTransition } from '@/components/sections/WormholeTransition';
import { VideoTransition } from '@/components/sections/VideoTransition';
import { VideoTransition2 } from '@/components/sections/VideoTransition2';
import { Testimonials } from '@/components/sections/Testimonials';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/sections/Footer';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { Navigation } from '@/components/ui/Navigation';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { ScanlinesOverlay, VignetteOverlay } from '@/components/ui/AnimatedBackground';
// CursorTrail disabled for performance - was causing continuous canvas redraws
import { MotionProvider } from '@/components/ui/ResponsiveMotion';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<'AI' | 'Robotics' | 'Research'>('AI');
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  // Handle scroll restoration and force top on mount BEFORE render
  useLayoutEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Clear GSAP scroll memory which often causes the page to jump on refresh
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.clearScrollMemory('manual');
    
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollToTop();
    requestAnimationFrame(() => {
      scrollToTop();
      requestAnimationFrame(scrollToTop);
    });

    const scrollChecker = setInterval(() => {
      if (window.scrollY > 10 && isLoading) {
        scrollToTop();
      }
    }, 50);

    return () => clearInterval(scrollChecker);
  }, [isLoading]);

  useEffect(() => {
    // Prevent scroll during preloader
    if (isLoading) {
      document.body.style.overflow = 'hidden';
      // Force scroll to top while preloader is active
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = '';
      // Delay content visibility for smoother transition
      setTimeout(() => setShowContent(true), 100);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isLoading]);

  return (
    <MotionProvider>
      {/* Custom Cursor (desktop only) */}
      <CustomCursor />

      {/* CursorTrail disabled for performance */}

      {/* Scroll Progress */}
      {!isLoading && <ScrollProgress />}

      {/* Preloader */}
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}

      {/* Navigation */}
      {!isLoading && <Navigation />}

      {/* Global Overlays */}
      <ScanlinesOverlay opacity={0.015} />
      <VignetteOverlay intensity={0.3} />

      {/* Main Content */}
      <main
        className={`transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'
          }`}
      >
        <Hero />
        <About />
        <WarpTransition />
        <Skills activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        <VideoTransition />
        <ProjectsShowcase activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        <VideoTransition2 />
        <Blog />
        <WormholeTransition />
        <Testimonials />
        <Contact />
        <Footer />
      </main>
    </MotionProvider>
  );
}

