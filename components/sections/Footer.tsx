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

    // Special handling for Journey (About section)
    if (href === '#about') {
      const storyTrack = document.querySelector('.story-track') as HTMLElement;
      if (storyTrack) {
        gsap.set(storyTrack, { x: 0 });
      }
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

    // Special handling for Skills
    if (href === '#skills-content') {
      const skillsSection = document.getElementById('skills');
      if (skillsSection) {
        const skillsTop = skillsSection.getBoundingClientRect().top;
        if (skillsTop > 0) {
          // Force animation layers to completed state
          const warpLight = document.querySelector('.warp-light-layer') as HTMLElement;
          const warpClouds = document.querySelector('.warp-clouds-layer') as HTMLElement;
          const warpBlur = document.querySelector('.warp-blur-layer') as HTMLElement;
          const skillGroups = document.querySelectorAll('.skill-group');
          if (warpLight) gsap.set(warpLight, { opacity: 0 });
          if (warpClouds) gsap.set(warpClouds, { opacity: 0 });
          if (warpBlur) gsap.set(warpBlur, { opacity: 0, backdropFilter: 'blur(0px)' });
          skillGroups.forEach(group => gsap.set(group, { opacity: 1, y: 0 }));

          const pinSpacer = skillsSection.parentElement;
          const targetElement = pinSpacer?.classList.contains('pin-spacer') ? pinSpacer : skillsSection;
          const sectionStart = targetElement.getBoundingClientRect().top + window.scrollY;
          scrollTo(sectionStart + 1500, { immediate: true, duration: 0 });
          setTimeout(() => ScrollTrigger.refresh(), 100);
        } else {
          scrollTo(href, { offset: -80 });
        }
      } else {
        scrollTo(href, { offset: -80 });
      }
      return;
    }

    // Special handling for Testimonials
    if (href === '#testimonials-content') {
      const testimonialsSection = document.getElementById('testimonials');
      if (testimonialsSection) {
        const testimonialsTop = testimonialsSection.getBoundingClientRect().top;
        if (testimonialsTop > 0) {
          // Force animation layers to completed state
          const portalLight = document.querySelector('.portal-light-layer') as HTMLElement;
          const portalClouds = document.querySelector('.portal-clouds-layer') as HTMLElement;
          const portalBlur = document.querySelector('.portal-blur-layer') as HTMLElement;
          const testimonialMarquee = document.querySelector('.testimonial-marquee') as HTMLElement;
          if (portalLight) gsap.set(portalLight, { opacity: 0 });
          if (portalClouds) gsap.set(portalClouds, { opacity: 0 });
          if (portalBlur) gsap.set(portalBlur, { opacity: 0, backdropFilter: 'blur(0px)' });
          if (testimonialMarquee) gsap.set(testimonialMarquee, { opacity: 1, y: 0 });

          const pinSpacer = testimonialsSection.parentElement;
          const targetElement = pinSpacer?.classList.contains('pin-spacer') ? pinSpacer : testimonialsSection;
          const sectionStart = targetElement.getBoundingClientRect().top + window.scrollY;
          scrollTo(sectionStart + 1500, { immediate: true, duration: 0 });
          setTimeout(() => ScrollTrigger.refresh(), 100);
        } else {
          scrollTo(href, { offset: -80 });
        }
      } else {
        scrollTo(href, { offset: -80 });
      }
      return;
    }

    // Default scroll
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
