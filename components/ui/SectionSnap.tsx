'use client';

import { useEffect, useRef, useState, createContext, useContext, ReactNode } from 'react';
import { gsap } from '@/lib/gsap';

// Context for section navigation
interface SectionContextType {
  currentSection: number;
  totalSections: number;
  goToSection: (index: number) => void;
  goToNext: () => void;
  goToPrev: () => void;
}

const SectionContext = createContext<SectionContextType | null>(null);

export function useSectionNav() {
  const context = useContext(SectionContext);
  if (!context) {
    throw new Error('useSectionNav must be used within SectionSnapContainer');
  }
  return context;
}

// Main container for snap sections
interface SectionSnapContainerProps {
  children: ReactNode;
  className?: string;
  showIndicator?: boolean;
  indicatorPosition?: 'left' | 'right';
}

export function SectionSnapContainer({
  children,
  className = '',
  showIndicator = true,
  indicatorPosition = 'right',
}: SectionSnapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [totalSections, setTotalSections] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartY = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sections = container.querySelectorAll('[data-snap-section]');
    setTotalSections(sections.length);

    // Scroll to section
    const scrollToSection = (index: number) => {
      if (isAnimating || index < 0 || index >= sections.length) return;

      setIsAnimating(true);
      const section = sections[index] as HTMLElement;

      gsap.to(window, {
        scrollTo: { y: section.offsetTop, autoKill: false },
        duration: 1,
        ease: 'power3.inOut',
        onComplete: () => {
          setCurrentSection(index);
          setIsAnimating(false);
        },
      });
    };

    // Wheel handler
    const handleWheel = (e: WheelEvent) => {
      if (isAnimating) {
        e.preventDefault();
        return;
      }

      const delta = e.deltaY;
      const threshold = 50;

      if (Math.abs(delta) > threshold) {
        e.preventDefault();
        if (delta > 0 && currentSection < sections.length - 1) {
          scrollToSection(currentSection + 1);
        } else if (delta < 0 && currentSection > 0) {
          scrollToSection(currentSection - 1);
        }
      }
    };

    // Touch handlers
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isAnimating) return;

      const touchEndY = e.changedTouches[0].clientY;
      const delta = touchStartY.current - touchEndY;
      const threshold = 50;

      if (Math.abs(delta) > threshold) {
        if (delta > 0 && currentSection < sections.length - 1) {
          scrollToSection(currentSection + 1);
        } else if (delta < 0 && currentSection > 0) {
          scrollToSection(currentSection - 1);
        }
      }
    };

    // Keyboard handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        if (currentSection < sections.length - 1) {
          scrollToSection(currentSection + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        if (currentSection > 0) {
          scrollToSection(currentSection - 1);
        }
      }
    };

    // Add event listeners
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSection, isAnimating]);

  const goToSection = (index: number) => {
    const container = containerRef.current;
    if (!container || isAnimating) return;

    const sections = container.querySelectorAll('[data-snap-section]');
    if (index < 0 || index >= sections.length) return;

    setIsAnimating(true);
    const section = sections[index] as HTMLElement;

    gsap.to(window, {
      scrollTo: { y: section.offsetTop, autoKill: false },
      duration: 1,
      ease: 'power3.inOut',
      onComplete: () => {
        setCurrentSection(index);
        setIsAnimating(false);
      },
    });
  };

  const goToNext = () => goToSection(currentSection + 1);
  const goToPrev = () => goToSection(currentSection - 1);

  return (
    <SectionContext.Provider
      value={{ currentSection, totalSections, goToSection, goToNext, goToPrev }}
    >
      <div ref={containerRef} className={className}>
        {children}
        {showIndicator && totalSections > 1 && (
          <SectionIndicator position={indicatorPosition} />
        )}
      </div>
    </SectionContext.Provider>
  );
}

// Individual snap section
interface SnapSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function SnapSection({ children, className = '', id }: SnapSectionProps) {
  return (
    <section
      data-snap-section
      id={id}
      className={`min-h-screen ${className}`}
    >
      {children}
    </section>
  );
}

// Section indicator dots
function SectionIndicator({ position }: { position: 'left' | 'right' }) {
  const { currentSection, totalSections, goToSection } = useSectionNav();

  return (
    <div
      className={`fixed top-1/2 z-50 -translate-y-1/2 ${
        position === 'left' ? 'left-6' : 'right-6'
      }`}
    >
      <div className="flex flex-col gap-3">
        {Array.from({ length: totalSections }).map((_, i) => (
          <button
            key={i}
            onClick={() => goToSection(i)}
            className={`group relative flex h-3 w-3 items-center justify-center transition-all ${
              currentSection === i ? 'scale-125' : ''
            }`}
            aria-label={`Go to section ${i + 1}`}
          >
            <span
              className={`block rounded-full transition-all ${
                currentSection === i
                  ? 'h-3 w-3 bg-primary'
                  : 'h-2 w-2 bg-white/30 group-hover:bg-white/60'
              }`}
            />
            {currentSection === i && (
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/50" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Section navigation buttons
export function SectionNavButtons({ className = '' }: { className?: string }) {
  const { currentSection, totalSections, goToNext, goToPrev } = useSectionNav();

  return (
    <div className={`fixed bottom-8 right-8 z-50 flex gap-2 ${className}`}>
      <button
        onClick={goToPrev}
        disabled={currentSection === 0}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition-all hover:border-primary hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <button
        onClick={goToNext}
        disabled={currentSection === totalSections - 1}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition-all hover:border-primary hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}

// Scroll progress for snap sections
export function SectionScrollProgress({ className = '' }: { className?: string }) {
  const { currentSection, totalSections } = useSectionNav();
  const progress = ((currentSection + 1) / totalSections) * 100;

  return (
    <div className={`fixed left-0 top-0 z-50 h-1 w-full bg-white/10 ${className}`}>
      <div
        className="h-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// Cinematic section transition (organimo-style)
export function CinematicSection({
  children,
  title,
  subtitle,
  className = '',
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const titleEl = titleRef.current;
    const contentEl = contentRef.current;
    if (!section) return;

    // Title animation
    if (titleEl) {
      gsap.fromTo(
        titleEl,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }

    // Content animation
    if (contentEl) {
      gsap.fromTo(
        contentEl,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          delay: 0.3,
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }

    // Parallax background
    gsap.to(section, {
      backgroundPositionY: '30%',
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      data-snap-section
      className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 ${className}`}
    >
      {/* Decorative lines */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        <div className="absolute right-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      </div>

      {/* Title */}
      {(title || subtitle) && (
        <div ref={titleRef} className="mb-12 text-center">
          {subtitle && (
            <span className="mb-4 inline-block font-mono text-sm tracking-widest text-primary">
              {subtitle}
            </span>
          )}
          {title && (
            <h2 className="font-display text-4xl font-bold text-white md:text-6xl lg:text-7xl">
              {title}
            </h2>
          )}
        </div>
      )}

      {/* Content */}
      <div ref={contentRef} className="w-full max-w-7xl">
        {children}
      </div>
    </section>
  );
}

// Video background section
export function VideoSection({
  children,
  videoSrc,
  posterSrc,
  overlay = true,
  className = '',
}: {
  children: ReactNode;
  videoSrc: string;
  posterSrc?: string;
  overlay?: boolean;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Pause video when not in view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play();
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      data-snap-section
      className={`relative min-h-screen overflow-hidden ${className}`}
    >
      {/* Video background */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={posterSrc}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      )}

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        {children}
      </div>
    </section>
  );
}
