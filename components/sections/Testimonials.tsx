'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { testimonials } from '@/data/testimonials';
import { Quote } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Portal-emergence intro removed along with the transitions — the section
      // now appears directly (header animates in via whileInView elsewhere).

      // GSAP Marquee
      const marquee = marqueeRef.current;
      if (marquee) {
        const content = marquee.firstChild as HTMLElement;
        const duplicate = content.cloneNode(true);
        marquee.appendChild(duplicate);

        const width = content.offsetWidth;

        const marqueeTween = gsap.to(marquee, {
          x: -width,
          duration: 40,
          ease: "none",
          repeat: -1,
        });

        marquee.addEventListener('mouseenter', () => marqueeTween.pause());
        marquee.addEventListener('mouseleave', () => marqueeTween.resume());
      }

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // --------------------------------------------------------------------------
  // Interactive Particle Background (Canvas)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;
    let animationFrameId: number;
    let particles: Particle[] = [];
    // Particle colour — white stars in dark mode, warm-amber motes in light mode
    // (so the cursor-reactive field stays visible + on-brand on the cream bg).
    let starRGB = '255, 255, 255';

    // Mouse tracking
    let mouseX = -1000;
    let mouseY = -1000;
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    const MOUSE_RADIUS = 150;

    class Particle {
      x: number;
      y: number;
      baseVx: number;
      baseVy: number;
      vx: number;
      vy: number;
      size: number;
      baseSize: number;
      twinkleSpeed: number;
      twinklePhase: number;
      brightness: number;
      isBright: boolean; // Some stars are brighter

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseVx = (Math.random() - 0.5) * 0.3; // Slower for stars
        this.baseVy = (Math.random() - 0.5) * 0.3;
        this.vx = this.baseVx;
        this.vy = this.baseVy;
        this.isBright = Math.random() > 0.85; // 15% are bright stars
        this.baseSize = this.isBright ? Math.random() * 2 + 1.5 : Math.random() * 1.5 + 0.3;
        this.size = this.baseSize;
        this.twinkleSpeed = Math.random() * 0.05 + 0.02; // Varied twinkle speeds
        this.twinklePhase = Math.random() * Math.PI * 2; // Random starting phase
        this.brightness = Math.random() * 0.5 + 0.5;
      }

      update() {
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          const angle = Math.atan2(dy, dx);
          this.vx = this.baseVx + Math.cos(angle) * force * 2;
          this.vy = this.baseVy + Math.sin(angle) * force * 2;
        } else {
          this.vx += (this.baseVx - this.vx) * 0.05;
          this.vy += (this.baseVy - this.vy) * 0.05;
        }

        this.vy += scrollVelocity * 0.01;

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Twinkle effect - oscillate size and brightness
        this.twinklePhase += this.twinkleSpeed;
        const twinkle = Math.sin(this.twinklePhase) * 0.5 + 0.5; // 0 to 1
        this.size = this.baseSize * (0.7 + twinkle * 0.6);
        this.brightness = 0.4 + twinkle * 0.6;
      }

      draw() {
        // Glow effect for bright stars
        if (this.isBright) {
          const gradient = ctx!.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 3
          );
          gradient.addColorStop(0, `rgba(${starRGB}, ${this.brightness})`);
          gradient.addColorStop(0.3, `rgba(${starRGB}, ${this.brightness * 0.3})`);
          gradient.addColorStop(1, `rgba(${starRGB}, 0)`);
          ctx!.beginPath();
          ctx!.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
          ctx!.fillStyle = gradient;
          ctx!.fill();
        }

        // Star core
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${starRGB}, ${this.brightness})`;
        ctx!.fill();
      }
    }

    const initParticles = () => {
      width = canvas.width = section.offsetWidth;
      height = canvas.height = section.offsetHeight;
      const area = width * height;
      const particleCount = Math.floor(area / 2500); // More stars
      particles = Array.from({ length: particleCount }, () => new Particle());
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      scrollVelocity = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;
      setTimeout(() => { scrollVelocity *= 0.9; }, 50);
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      starRGB = document.documentElement.classList.contains('light') ? '193, 86, 18' : '255, 255, 255';
      scrollVelocity *= 0.95;
      particles.forEach((p) => { p.update(); p.draw(); });
      animationFrameId = requestAnimationFrame(animate);
    };

    section.addEventListener('mousemove', handleMouseMove);
    section.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => { initParticles(); });
    resizeObserver.observe(section);
    initParticles();
    animate();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      section.removeEventListener('mousemove', handleMouseMove);
      section.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="relative min-h-screen overflow-hidden bg-bg-elevated py-24 md:py-32"
    >
      {/* Uniform Particle Network Background */}
      <canvas ref={canvasRef} className="absolute inset-0 z-[1] opacity-60 pointer-events-none" />

      {/* Vignette Overlay (Very Subtle - only affects far edges) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)] pointer-events-none z-[2]" />

      <div id="testimonials-content" className="container-custom relative z-10">
        {/* Section header */}
        <div ref={headerRef} className="testimonials-header mb-12 sm:mb-16 md:mb-20 relative px-4">
          <SectionHeading
            eyebrow="Social Proof"
            title="TESTIMONIALS"
            subtitle="Trusted by founders and enterprises across the globe."
          />
        </div>
      </div>

      {/* Marquee Container */}
      <div className="testimonial-marquee relative w-full overflow-hidden py-6 sm:py-10 z-10">
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 z-10 h-full w-12 sm:w-20 md:w-40 bg-gradient-to-r from-bg-elevated to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 z-10 h-full w-12 sm:w-20 md:w-40 bg-gradient-to-l from-bg-elevated to-transparent pointer-events-none" />

        <div ref={marqueeRef} className="flex gap-4 sm:gap-6 md:gap-8 w-max pl-2 sm:pl-4 group hover:[animation-play-state:paused] cursor-grab active:cursor-grabbing">
          {/* Original List */}
          <div className="flex gap-4 sm:gap-6 md:gap-8">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="relative w-[280px] sm:w-[350px] md:w-[450px] min-h-[400px] sm:min-h-[350px] md:min-h-[320px] flex-shrink-0 rounded-xl sm:rounded-2xl border border-violet-500/10 bg-bg-surface p-5 sm:p-6 md:p-8 transition-all duration-300 hover:border-violet-500/30 hover:shadow-xl hover:-translate-y-1 flex flex-col"
              >
                <Quote className="mb-4 sm:mb-6 w-6 h-6 sm:w-8 sm:h-8 text-violet-500/50" />
                <p className="mb-6 sm:mb-8 text-sm sm:text-base md:text-lg font-medium text-white/90 leading-relaxed italic line-clamp-6 sm:line-clamp-none">
                  &quot;{t.content}&quot;
                </p>

                <div className="flex items-center gap-3 sm:gap-4 mt-auto">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-violet-500/20 bg-white/5 flex-shrink-0">
                    <Image src={t.image} alt={t.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-display font-bold text-white text-sm sm:text-base truncate">{t.name}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative line */}
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-violet-500/20 to-transparent z-10" />
    </section>
  );
}

