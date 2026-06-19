'use client';

import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useScrollTo } from '@/hooks/useLenis';
import { setNavigating } from '@/lib/navigationState';

const footerLinks = {
  navigation: [
    { label: 'Journey', href: '#about' },
    { label: 'Skills', href: '#skills-content' },
    { label: 'Projects', href: '#projects' },
    { label: 'Blog', href: '#blog' },
    { label: 'Testimonials', href: '#testimonials-content' },
    { label: 'Contact', href: '#contact' },
  ],
};

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const scrollTo = useScrollTo();

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

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setNavigating(true);

    // Special handling for Journey (About) — it's a pinned 3D book, so jump to
    // the START of the pin rather than smooth-scrolling through the page turns.
    if (href === '#about') {
      const aboutSection = document.getElementById('about');
      const aboutTrigger = ScrollTrigger.getById('about-horizontal-scroll');
      if (aboutSection && aboutTrigger) {
        const pinSpacer = aboutSection.parentElement;
        const targetElement = pinSpacer?.classList.contains('pin-spacer') ? pinSpacer : aboutSection;
        const sectionTop = targetElement.getBoundingClientRect().top + window.scrollY;
        scrollTo(sectionTop - 80, { immediate: true, duration: 0 });
        setTimeout(() => ScrollTrigger.refresh(), 100);
      } else {
        scrollTo(href, { offset: -80, immediate: true });
      }
      return;
    }

    // Everything else (Skills/Testimonials no longer pin) — plain smooth scroll.
    scrollTo(href, { offset: -80 });
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
              href="#hero"
              onClick={(e) => handleNavClick(e, '#hero')}
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
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="text-sm sm:text-base text-text-secondary transition-colors hover:text-white active:text-primary"
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

          {/* Back to top */}
          <button
            onClick={() => {
              setNavigating(true);
              scrollTo(0, { immediate: true, duration: 0 });
            }}
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
