'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollTo } from '@/hooks/useLenis';
import { setNavigating, subscribeToVideoPlaying } from '@/lib/navigationState';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const navLinks = [
  { label: 'Journey', href: '#about' },
  { label: 'Skills', href: '#skills-content' },
  { label: 'Projects', href: '#projects' },
  { label: 'Blog', href: '#blog' },
  { label: 'Testimonials', href: '#testimonials-content' },
  { label: "Let's Connect", href: '#contact' },
];

// Rotating roles for the logo area
const roles = [
  'Gen AI Developer & Vibe Coder',
  'Robotics Specialist',
  'Space & Biotech Researcher',
  'Deep Learning & AI Ethics Expert',
  'Innovation Architect',
  'Consciousness Explorer',
  'Neuromorphic Engineer',
];

export function Navigation() {
  const navRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const lastScrollY = useRef(0);
  const scrollTo = useScrollTo();

  // Subscribe to video playing state to hide navbar during transitions
  useEffect(() => {
    const unsubscribe = subscribeToVideoPlaying((playing) => {
      setIsVideoPlaying(playing);
    });
    return () => unsubscribe();
  }, []);

  // Role rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
    }, 3000); // Change role every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Scroll handling for visibility and background
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Initial animation
    gsap.fromTo(nav,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 0.5, ease: 'power3.out' }
    );

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Background change
      setIsScrolled(currentScrollY > 50);

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    // Detect when user is in tunnel transitions and hide navbar
    const tunnelObserver = new IntersectionObserver(
      (entries) => {
        const isInTunnel = entries.some(entry => entry.isIntersecting);
        setIsVisible(!isInTunnel);
      },
      { threshold: 0.3 }
    );

    // Observe tunnel sections
    const warpSection = document.getElementById('warp-transition');
    const wormholeSection = document.getElementById('wormhole-transition');
    if (warpSection) tunnelObserver.observe(warpSection);
    if (wormholeSection) tunnelObserver.observe(wormholeSection);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      tunnelObserver.disconnect();
    };
  }, []);

  // Section detection for active nav highlighting - using viewport position
  useEffect(() => {
    const sections = navLinks.map(link => link.href.replace('#', ''));

    const handleSectionDetection = () => {
      const viewportHeight = window.innerHeight;
      let bestMatch = '';
      let bestScore = -Infinity;

      // First check if hero section is visible (user is at top/home)
      const heroEl = document.getElementById('hero');
      if (heroEl) {
        const heroRect = heroEl.getBoundingClientRect();
        // If hero section top is near the top of viewport, user is on home
        if (heroRect.top > -100 && heroRect.top < viewportHeight * 0.5) {
          if (activeSection !== '') {
            setActiveSection('');
          }
          return;
        }
      }

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();

          // Calculate how much of the section is in the top half of viewport
          const sectionTop = rect.top;
          const sectionBottom = rect.bottom;

          // A section is "active" when it's in the top portion of the viewport
          // Score based on how close the section top is to the top of the viewport
          // Prefer sections that have their top above the center line
          if (sectionTop < viewportHeight * 0.5 && sectionBottom > 100) {
            const score = viewportHeight - Math.abs(sectionTop);
            if (score > bestScore) {
              bestScore = score;
              bestMatch = sectionId;
            }
          }
        }
      }

      if (bestMatch !== activeSection) {
        setActiveSection(bestMatch);
      }
    };

    window.addEventListener('scroll', handleSectionDetection, { passive: true });
    handleSectionDetection(); // Initial check

    return () => window.removeEventListener('scroll', handleSectionDetection);
  }, [activeSection]);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    // Set navigating state to bypass video transitions during programmatic scroll
    setNavigating(true);

    // If navigating to Journey (About section), we need special handling
    // The About section has a horizontal scroll with pinned ScrollTrigger
    // Using smooth scroll would pass through the ScrollTrigger range, animating to panel 06
    // Solution: Use IMMEDIATE scroll to jump directly to the start without animating through
    if (href === '#about') {
      // Reset the horizontal track to panel 01
      const storyTrack = document.querySelector('.story-track') as HTMLElement;
      if (storyTrack) {
        gsap.set(storyTrack, { x: 0 });
      }

      // Get the About section and its ScrollTrigger
      const aboutSection = document.getElementById('about');
      const aboutTrigger = ScrollTrigger.getById('about-horizontal-scroll');

      if (aboutSection && aboutTrigger) {
        // Calculate the exact scroll position for the START of About section
        // We need to account for the pin-spacer that GSAP creates
        const pinSpacer = aboutSection.parentElement;
        const targetElement = pinSpacer?.classList.contains('pin-spacer') ? pinSpacer : aboutSection;
        const sectionTop = targetElement.getBoundingClientRect().top + window.scrollY;

        // Use IMMEDIATE scroll (no smooth animation) to jump directly
        // This prevents passing through the ScrollTrigger range
        scrollTo(sectionTop - 80, { immediate: true, duration: 0 });

        // Refresh ScrollTrigger after the immediate scroll
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 100);
      } else {
        // Fallback if elements not found
        scrollTo(href, { offset: -80, immediate: true });
      }
      return;
    }

    // If navigating to Skills, we need special handling
    // The Skills section has a pinned "warp emergence" animation at the top
    // Smooth scrolling from above would pass through the animation range
    // Solution: Use IMMEDIATE scroll AND force animation layers to completed state
    if (href === '#skills-content') {
      const skillsContent = document.getElementById('skills-content');
      const skillsSection = document.getElementById('skills');

      if (skillsContent && skillsSection) {
        // Check if we're above the skills section (need immediate scroll)
        const skillsTop = skillsSection.getBoundingClientRect().top;

        if (skillsTop > 0) {
          // We're above Skills - force animation layers to their "completed" state
          // This hides the warp emergence overlays that would otherwise be visible
          const warpLight = document.querySelector('.warp-light-layer') as HTMLElement;
          const warpClouds = document.querySelector('.warp-clouds-layer') as HTMLElement;
          const warpBlur = document.querySelector('.warp-blur-layer') as HTMLElement;
          const skillGroups = document.querySelectorAll('.skill-group');

          if (warpLight) gsap.set(warpLight, { opacity: 0 });
          if (warpClouds) gsap.set(warpClouds, { opacity: 0 });
          if (warpBlur) gsap.set(warpBlur, { opacity: 0, backdropFilter: 'blur(0px)' });

          // Make skill groups visible
          skillGroups.forEach(group => {
            gsap.set(group, { opacity: 1, y: 0 });
          });

          // Calculate scroll position - account for pin-spacer if it exists
          const pinSpacer = skillsSection.parentElement;
          const targetElement = pinSpacer?.classList.contains('pin-spacer') ? pinSpacer : skillsSection;

          // We want to scroll to the END of the pin (after the animation would have completed)
          // The pin end is: skillsSection start + 1500 (the end value from ScrollTrigger)
          const sectionStart = targetElement.getBoundingClientRect().top + window.scrollY;
          const pinEndPosition = sectionStart + 1500; // Match the ScrollTrigger end value

          // Use immediate scroll to jump past the animation
          scrollTo(pinEndPosition, { immediate: true, duration: 0 });

          // Refresh ScrollTrigger after the immediate scroll
          setTimeout(() => {
            ScrollTrigger.refresh();
          }, 100);
        } else {
          // We're below or in Skills - smooth scroll is fine
          scrollTo(href, { offset: -80 });
        }
      } else {
        scrollTo(href, { offset: -80 });
      }
      return;
    }

    // If navigating to Testimonials, we need special handling
    // The Testimonials section has a pinned "portal emergence" animation at the top
    // Smooth scrolling from above would pass through the animation range
    // Solution: Use IMMEDIATE scroll AND force animation layers to completed state
    if (href === '#testimonials-content') {
      const testimonialsContent = document.getElementById('testimonials-content');
      const testimonialsSection = document.getElementById('testimonials');

      if (testimonialsContent && testimonialsSection) {
        // Check if we're above the testimonials section (need immediate scroll)
        const testimonialsTop = testimonialsSection.getBoundingClientRect().top;

        if (testimonialsTop > 0) {
          // We're above Testimonials - force animation layers to their "completed" state
          // This hides the portal emergence overlays that would otherwise be visible
          const portalLight = document.querySelector('.portal-light-layer') as HTMLElement;
          const portalClouds = document.querySelector('.portal-clouds-layer') as HTMLElement;
          const portalBlur = document.querySelector('.portal-blur-layer') as HTMLElement;
          const testimonialMarquee = document.querySelector('.testimonial-marquee') as HTMLElement;

          if (portalLight) gsap.set(portalLight, { opacity: 0 });
          if (portalClouds) gsap.set(portalClouds, { opacity: 0 });
          if (portalBlur) gsap.set(portalBlur, { opacity: 0, backdropFilter: 'blur(0px)' });

          // Make testimonial marquee visible
          if (testimonialMarquee) gsap.set(testimonialMarquee, { opacity: 1, y: 0 });

          // Calculate scroll position - account for pin-spacer if it exists
          const pinSpacer = testimonialsSection.parentElement;
          const targetElement = pinSpacer?.classList.contains('pin-spacer') ? pinSpacer : testimonialsSection;

          // We want to scroll to the END of the pin (after the animation would have completed)
          // The pin end is: section start + 1500 (the end value from ScrollTrigger)
          const sectionStart = targetElement.getBoundingClientRect().top + window.scrollY;
          const pinEndPosition = sectionStart + 1500; // Match the ScrollTrigger end value

          // Use immediate scroll to jump past the animation
          scrollTo(pinEndPosition, { immediate: true, duration: 0 });

          // Refresh ScrollTrigger after the immediate scroll
          setTimeout(() => {
            ScrollTrigger.refresh();
          }, 100);
        } else {
          // We're below or in Testimonials - smooth scroll is fine
          scrollTo(href, { offset: -80 });
        }
      } else {
        scrollTo(href, { offset: -80 });
      }
      return;
    }

    scrollTo(href, { offset: -80 });
  };

  return (
    <>
      <nav
        ref={navRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 99999, // Maximum z-index to ensure visibility
          transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
          opacity: isVideoPlaying ? 0 : 1,
          pointerEvents: isVideoPlaying ? 'none' : 'auto',
          transition: 'transform 0.3s ease, background-color 0.3s ease, opacity 0.3s ease',
        }}
        className={cn(
          isScrolled
            ? 'bg-[#030712]/95 backdrop-blur-xl border-b border-cyan-500/20 shadow-[0_4px_30px_rgba(6,182,212,0.15)]'
            : 'bg-[#030712]/50 backdrop-blur-sm'
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          {/* Logo with rotating role */}
          <a
            href="#"
            onClick={(e) => handleNavClick(e, '#hero')}
            className="group flex items-center gap-3"
          >
            {/* Animated Logo Container */}
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300">
                <img
                  src="/images/logo.png"
                  alt="KS Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="flex flex-col min-w-[120px] sm:min-w-[180px]">
              <span className="font-display text-xs sm:text-sm font-semibold text-white tracking-wide">
                SRUJAN
              </span>
              {/* Rotating role text */}
              <span
                key={currentRoleIndex}
                className="font-mono text-[8px] sm:text-[9px] text-cyan-400/80 tracking-wider uppercase truncate animate-fade-in max-w-[100px] sm:max-w-none"
              >
                {roles[currentRoleIndex]}
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={cn(
                  'relative px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-all duration-300',
                  activeSection === link.href.replace('#', '')
                    ? 'text-cyan-400'
                    : 'text-white/50 hover:text-white'
                )}
              >
                {link.label}
                {/* Active indicator */}
                <span
                  className={cn(
                    'absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-cyan-400 rounded-full transition-all duration-300',
                    activeSection === link.href.replace('#', '') ? 'w-3' : 'w-0'
                  )}
                />
              </a>
            ))}
          </div>

          {/* CTA Button - AI Assistant */}
          <div className="hidden md:block">
            <Link
              href="/ai-assistant"
              className="group relative inline-flex items-center gap-2 px-4 py-2 overflow-hidden rounded-full border border-cyan-500/40 bg-cyan-500/10 font-mono text-[10px] uppercase tracking-wider text-cyan-400 transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-500/20 hover:text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="relative z-10">Hire Me for Projects</span>
              <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="relative flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            style={{ zIndex: 100000 }}
          >
            <span
              className={cn(
                'h-0.5 w-6 bg-white transition-all duration-300',
                isMenuOpen && 'translate-y-2 rotate-45 bg-cyan-400'
              )}
            />
            <span
              className={cn(
                'h-0.5 w-6 bg-white transition-all duration-300',
                isMenuOpen && 'opacity-0'
              )}
            />
            <span
              className={cn(
                'h-0.5 w-6 bg-white transition-all duration-300',
                isMenuOpen && '-translate-y-2 -rotate-45 bg-cyan-400'
              )}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99998,
          pointerEvents: isMenuOpen ? 'auto' : 'none',
        }}
        className={cn(
          'bg-[#030712]/98 backdrop-blur-xl transition-opacity duration-500 md:hidden',
          isMenuOpen ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative flex h-full flex-col items-center justify-center gap-5 pt-20">
          {navLinks.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className={cn(
                'font-display text-2xl font-bold text-white transition-all duration-300 hover:text-cyan-400',
                isMenuOpen
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-8 opacity-0'
              )}
              style={{
                transitionDelay: isMenuOpen ? `${index * 60}ms` : '0ms',
              }}
            >
              <span className="mr-3 font-mono text-xs text-cyan-400/50">0{index + 1}</span>
              {link.label}
            </a>
          ))}

          <Link
            href="/ai-assistant"
            onClick={() => setIsMenuOpen(false)}
            className={cn(
              'mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full border border-cyan-500/50 bg-cyan-500/10 font-mono text-sm uppercase tracking-wider text-cyan-400 transition-all duration-300 hover:bg-cyan-500/20',
              isMenuOpen
                ? 'translate-y-0 opacity-100'
                : 'translate-y-8 opacity-0'
            )}
            style={{
              transitionDelay: isMenuOpen ? `${navLinks.length * 60}ms` : '0ms',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Hire Me for Projects
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          {/* Current role display on mobile */}
          <div className="mt-8 text-center">
            <span className="font-mono text-[10px] text-cyan-400/60 tracking-widest uppercase">
              {roles[currentRoleIndex]}
            </span>
          </div>
        </div>
      </div>

      {/* CSS for fade-in animation */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </>
  );
}
