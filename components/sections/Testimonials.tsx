'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { testimonials } from '@/data/testimonials';
import { Quote } from 'lucide-react';

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // =========== PINNED PORTAL EMERGENCE SEQUENCE ===========
      // Same pattern as Skills section but with violet theme
      const revealTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=1500',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        }
      });

      // Phase 1 → 2: Light fades, clouds appear
      revealTl.to('.portal-light-layer', {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
      })
        .to('.portal-clouds-layer', {
          opacity: 1,
          duration: 0.2,
        }, '<0.1');

      // Phase 2 → 3: Clouds fade, revealing blurred content
      revealTl.to('.portal-clouds-layer', {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
      }, '>0.1')
        .to('.portal-blur-layer', {
          opacity: 1,
          duration: 0.1,
        }, '<');

      // Phase 3 → 4: Blur clears to show crisp content
      revealTl.to('.portal-blur-layer', {
        backdropFilter: 'blur(0px)',
        webkitBackdropFilter: 'blur(0px)',
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
      }, '>0.1');

      // Content animations (after blur clears)
      revealTl.from(headerRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.2,
      }, '>-0.1')
        .to('.testimonial-marquee', {
          opacity: 1,
          y: 0,
          duration: 0.3,
        }, '<0.1');

      // Initialize as hidden
      gsap.set('.testimonial-marquee', { opacity: 0, y: 30 });

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
          gradient.addColorStop(0, `rgba(255, 255, 255, ${this.brightness})`);
          gradient.addColorStop(0.3, `rgba(255, 255, 255, ${this.brightness * 0.3})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx!.beginPath();
          ctx!.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
          ctx!.fillStyle = gradient;
          ctx!.fill();
        }

        // Star core
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
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
      style={{ marginTop: '-60px', paddingTop: '60px' }} // Overlap to hide any border line
    >
      {/* ========== PORTAL EMERGENCE LAYERS ========== */}

      {/* Layer 1: BRIGHT LIGHT - MUST MATCH WormholeTransition flash-portal (cyan-50 = #ecfeff) */}
      <div
        className="portal-light-layer absolute inset-0 z-[60] pointer-events-none bg-cyan-50"
        style={{ top: '-60px' }} // Extend upward to cover any gap
      />

      {/* Layer 2: CLOUDS/FOG (appears after light fades) - blue/cyan tint */}
      <div
        className="portal-clouds-layer absolute inset-0 z-[55] pointer-events-none opacity-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 30% 20%, rgba(96, 165, 250, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 60%, rgba(59, 130, 246, 0.3) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 80%, rgba(37, 99, 235, 0.3) 0%, transparent 45%),
            radial-gradient(ellipse at 20% 70%, rgba(96, 165, 250, 0.25) 0%, transparent 35%),
            radial-gradient(ellipse at 80% 30%, rgba(59, 130, 246, 0.3) 0%, transparent 40%),
            linear-gradient(to bottom, rgba(10, 20, 40, 0.6) 0%, rgba(0, 0, 0, 0.8) 100%)
          `,
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
        }}
      />

      {/* Layer 3: BLUR (shows blurred content, then clears) */}
      <div
        className="portal-blur-layer absolute inset-0 z-[50] pointer-events-none opacity-0"
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(0, 0, 0, 0.2)',
        }}
      />

      {/* ========== END PORTAL EMERGENCE LAYERS ========== */}

      {/* Uniform Particle Network Background */}
      <canvas ref={canvasRef} className="absolute inset-0 z-[1] opacity-60 pointer-events-none" />

      {/* Vignette Overlay (Very Subtle - only affects far edges) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)] pointer-events-none z-[2]" />

      <div id="testimonials-content" className="container-custom relative z-10">
        {/* Section header */}
        <div ref={headerRef} className="testimonials-header mb-12 sm:mb-16 md:mb-20 text-center relative px-4">
          {/* Blue Glow Effect (same as other sections) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[300px] sm:h-[400px] bg-blue-600/20 blur-[120px] rounded-full -z-20 pointer-events-none mix-blend-screen" />

          <div className="inline-block bg-black/50 px-4 sm:px-6 py-1 border border-cyan-500/30 rounded-full backdrop-blur-md">
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-cyan-400">
              Social Proof
            </span>
          </div>
          <h2 className="mt-4 sm:mt-6 font-display text-4xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight">
            TESTIMONIALS
          </h2>
          <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-base sm:text-lg text-text-secondary px-4">
            Trusted by founders and enterprises across the globe.
          </p>
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
                    <p className="text-xs sm:text-sm font-mono text-text-muted truncate">{t.role}, {t.company}</p>
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

