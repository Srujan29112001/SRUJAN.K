'use client';

import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useScrollTo } from '@/hooks/useLenis';
import { usePageNav, type PageId } from '@/components/providers/PageNav';

const footerLinks: { navigation: { label: string; page: PageId }[] } = {
  navigation: [
    { label: 'Journey', page: 'home' },
    { label: 'Skills', page: 'skills' },
    { label: 'Projects', page: 'projects' },
    { label: 'Blog', page: 'blog' },
    { label: 'Testimonials', page: 'testimonials' },
    { label: 'AI', page: 'ai' },
    { label: 'Resume', page: 'resume' },
    { label: 'Contact', page: 'contact' },
  ],
};

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const scrollTo = useScrollTo();
  const { page, goTo } = usePageNav();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.footer-content', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const handleNavClick = (e: React.MouseEvent, target: PageId) => {
    e.preventDefault();
    goTo(target);
  };

  return (
    <footer ref={footerRef} className="relative bg-bg-elevated pt-12 pb-48 sm:py-16 md:py-20">
      {/* Top border */}
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container-custom footer-content">
        <div className="grid gap-8 sm:gap-10 md:gap-12 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, 'home')}
              className="inline-block group"
            >
              <span className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-3xl font-bold text-white transition-colors group-hover:text-primary">
                SRUJAN
              </span>
            </a>
            <p className="mt-3 sm:mt-4 max-w-sm text-sm sm:text-base text-text-secondary leading-relaxed">
              AI/ML Engineer & Robotics Specialist. Engineering intelligence,
              questioning its foundations.
            </p>
            <p className="mt-4 sm:mt-6 font-mono text-[10px] sm:text-xs text-text-muted">
              Built with Next.js, Three.js, GSAP & Tailwind CSS
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-3 sm:mb-4 font-mono text-[10px] sm:text-xs uppercase tracking-wider text-text-muted">
              Navigation
            </h3>
            <ul className="space-y-2 sm:space-y-2.5">
              {footerLinks.navigation.map((link) => (
                <li key={link.page}>
                  <a
                    href={`#${link.page}`}
                    onClick={(e) => handleNavClick(e, link.page)}
                    className={cnActive(page === link.page)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 sm:mt-16 flex flex-col items-center justify-between gap-4 sm:gap-4 border-t border-white/5 pt-6 sm:pt-8 md:flex-row">
          <p className="font-mono text-[10px] sm:text-xs text-text-muted text-center md:text-left">
            &copy; {new Date().getFullYear()} Srujan. All rights reserved.
          </p>

          {/* Back to top (of the current page) */}
          <button
            onClick={() => scrollTo(0, { immediate: true, duration: 0 })}
            className="group flex items-center gap-2 font-mono text-[10px] sm:text-xs text-text-muted transition-colors hover:text-primary active:scale-95"
          >
            Back to top
            <svg
              className="h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:-translate-y-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}

function cnActive(active: boolean): string {
  return active
    ? 'text-sm sm:text-base text-white transition-colors'
    : 'text-sm sm:text-base text-text-secondary transition-colors hover:text-white active:text-primary';
}
