'use client';

import { useState, useEffect, useLayoutEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Preloader } from '@/components/sections/Preloader';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Skills } from '@/components/sections/Skills';
import ProjectsShowcase from '@/components/sections/ProjectsShowcase';
import { Blog } from '@/components/sections/Blog';
import { Testimonials } from '@/components/sections/Testimonials';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/sections/Footer';
import { ServicesShowcase } from '@/components/sections/ServicesShowcase';

// AI Chat lives outside Contact so it can be its own section, swappable in
// page order, and reachable from the navbar.
const HolographicChat = dynamic(
  () => import('@/components/sections/HolographicChat'),
  { ssr: false }
);

// Resume Gate — recruiters describe their role, agents check fit against the
// whole portfolio and assemble a tailored one-page resume.
const ResumeGate = dynamic(
  () => import('@/components/sections/ResumeGate'),
  { ssr: false }
);

// 3D interactive knowledge graph — the same portfolio map the AI agents search
const KnowledgeGraph3D = dynamic(
  () => import('@/components/sections/KnowledgeGraph3D'),
  { ssr: false }
);

// Services — the AI-assistant showcase (immersive 3D "at your service" hero),
// integrated as a portfolio section. Pricing calculator intentionally dropped.
const AIHero = dynamic(
  () => import('@/components/sections/AIHero'),
  { ssr: false }
);
import { CustomCursor } from '@/components/ui/CustomCursor';
import { Navigation } from '@/components/ui/Navigation';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { ScanlinesOverlay, VignetteOverlay } from '@/components/ui/AnimatedBackground';
// CursorTrail disabled for performance - was causing continuous canvas redraws
import { MotionProvider } from '@/components/ui/ResponsiveMotion';
import { PageNavProvider, usePageNav } from '@/components/providers/PageNav';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// The active "page" group. Each is a full, standalone view; the navbar swaps
// between them. The whole tree stays mounted under one route, so every smart
// feature (AI chat + KB auto-sync, knowledge graph, resume) keeps its exact
// props, providers and API wiring — only what's VISIBLE changes.
function PagedMain({
  activeCategory,
  setActiveCategory,
}: {
  activeCategory: 'AI' | 'Robotics' | 'Research';
  setActiveCategory: (c: 'AI' | 'Robotics' | 'Research') => void;
}) {
  const { page, goTo } = usePageNav();
  // Chat "estimate / book a call" prompts send the visitor to the Contact page
  // and land on the booking form there.
  const goBooking = () => goTo('contact', 'booking');

  return (
    <>
      <motion.div
        key={page}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {page === 'home' && (
          <>
            <Hero />
            <About />
          </>
        )}
        {page === 'skills' && (
          <Skills activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        )}
        {page === 'projects' && (
          <ProjectsShowcase activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        )}
        {page === 'blog' && <Blog />}
        {page === 'testimonials' && <Testimonials />}
        {page === 'ai' && (
          <>
            <HolographicChat onEstimateRequest={goBooking} onBookingRequest={goBooking} />
            <KnowledgeGraph3D />
          </>
        )}
        {page === 'services' && (
          <>
            <AIHero onPrimaryCta={goBooking} />
            <ServicesShowcase onPrimaryCta={goBooking} />
          </>
        )}
        {page === 'resume' && <ResumeGate />}
        {page === 'contact' && <Contact />}
      </motion.div>

      <Footer />
    </>
  );
}

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

    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(scrollChecker);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLoading]);

  useEffect(() => {
    // Prevent scroll during preloader
    if (isLoading) {
      document.body.style.overflow = 'hidden';
      // Force scroll to top while preloader is active
      window.scrollTo(0, 0);
    } else {
      // Force scroll to top right before unlocking
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      document.body.style.overflow = '';

      // Force scroll to top right after unlocking to combat browser's delayed restoration
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });

      // Delay content visibility for smoother transition
      setTimeout(() => setShowContent(true), 100);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isLoading]);

  return (
    <MotionProvider>
      <PageNavProvider>
        {/* Custom Cursor (desktop only) */}
        <CustomCursor />

        {/* Scroll Progress (tracks scroll within the current page) */}
        {!isLoading && <ScrollProgress />}

        {/* Preloader */}
        {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}

        {/* Navigation */}
        {!isLoading && <Navigation />}

        {/* Global Overlays */}
        <ScanlinesOverlay opacity={0.015} />
        <VignetteOverlay intensity={0.3} />

        {/* Main Content — one nav-controlled page at a time */}
        <main
          className={`transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <PagedMain activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        </main>
      </PageNavProvider>
    </MotionProvider>
  );
}
