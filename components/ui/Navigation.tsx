'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePageNav, type PageId } from '@/components/providers/PageNav';
import { useTheme } from '@/components/providers/ThemeProvider';

const navLinks: { label: string; page: PageId }[] = [
  { label: 'Home', page: 'home' },        // Hero + Journey
  { label: 'Skills', page: 'skills' },
  { label: 'Projects', page: 'projects' },
  { label: 'Blog', page: 'blog' },
  { label: 'Testimonials', page: 'testimonials' },
  { label: 'AI', page: 'ai' },            // AI Chat + Neural Map
  { label: 'Resume', page: 'resume' },
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
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const { page, goTo } = usePageNav();
  const { theme, toggle } = useTheme();

  // Role rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Nav entrance + background-on-scroll (scroll is per-page now)
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    gsap.fromTo(
      nav,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 0.5, ease: 'power3.out' }
    );

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent, target: PageId) => {
    e.preventDefault();
    setIsMenuOpen(false);
    goTo(target);
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
          transition: 'background-color 0.3s ease',
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
            href="#home"
            onClick={(e) => handleNavClick(e, 'home')}
            className="group flex items-center gap-3"
          >
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
                key={link.page}
                href={`#${link.page}`}
                onClick={(e) => handleNavClick(e, link.page)}
                className={cn(
                  'relative px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-all duration-300',
                  page === link.page ? 'text-cyan-400' : 'text-white/50 hover:text-white'
                )}
              >
                {link.label}
                <span
                  className={cn(
                    'absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-cyan-400 rounded-full transition-all duration-300',
                    page === link.page ? 'w-3' : 'w-0'
                  )}
                />
              </a>
            ))}
          </div>

          {/* Right side: theme toggle + CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggle}
              aria-label="Toggle light / dark mode"
              title="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 hover:text-white hover:border-cyan-400 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, 'contact')}
              className={cn(
                'group relative inline-flex items-center gap-2 px-4 py-2 overflow-hidden rounded-full border font-mono text-[10px] uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]',
                page === 'contact'
                  ? 'border-cyan-400 bg-cyan-500/20 text-white'
                  : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:border-cyan-400 hover:bg-cyan-500/20 hover:text-white'
              )}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="relative z-10">Let&apos;s Connect</span>
              <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Mobile: theme toggle + menu */}
          <div className="flex items-center gap-1 md:hidden">
          <button
            onClick={toggle}
            aria-label="Toggle light / dark mode"
            className="flex h-9 w-9 items-center justify-center rounded-full text-cyan-400"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <button
            className="relative flex h-10 w-10 flex-col items-center justify-center gap-1.5"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            style={{ zIndex: 100000 }}
          >
            <span className={cn('h-0.5 w-6 bg-white transition-all duration-300', isMenuOpen && 'translate-y-2 rotate-45 bg-cyan-400')} />
            <span className={cn('h-0.5 w-6 bg-white transition-all duration-300', isMenuOpen && 'opacity-0')} />
            <span className={cn('h-0.5 w-6 bg-white transition-all duration-300', isMenuOpen && '-translate-y-2 -rotate-45 bg-cyan-400')} />
          </button>
          </div>
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
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative flex h-full flex-col items-center justify-center gap-5 pt-20">
          {navLinks.map((link, index) => (
            <a
              key={link.page}
              href={`#${link.page}`}
              onClick={(e) => handleNavClick(e, link.page)}
              className={cn(
                'font-display text-2xl font-bold transition-all duration-300 hover:text-cyan-400',
                page === link.page ? 'text-cyan-400' : 'text-white',
                isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              )}
              style={{ transitionDelay: isMenuOpen ? `${index * 60}ms` : '0ms' }}
            >
              <span className="mr-3 font-mono text-xs text-cyan-400/50">0{index + 1}</span>
              {link.label}
            </a>
          ))}

          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, 'contact')}
            className={cn(
              'mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full border border-cyan-500/50 bg-cyan-500/10 font-mono text-sm uppercase tracking-wider text-cyan-400 transition-all duration-300 hover:bg-cyan-500/20',
              isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            )}
            style={{ transitionDelay: isMenuOpen ? `${navLinks.length * 60}ms` : '0ms' }}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Let&apos;s Connect
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>

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
