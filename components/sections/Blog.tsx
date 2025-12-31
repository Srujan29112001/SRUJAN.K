'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { blogPosts } from '@/data/blog';
import { cn } from '@/lib/utils';
import { Calendar, Clock } from 'lucide-react';
import { BlogModal, useBlogModal } from '@/components/ui/BlogModal';

export function Blog() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { selectedPost, isOpen, openModal, closeModal } = useBlogModal();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section title animation
      gsap.from('.blog-header', {
        opacity: 0,
        y: 60,
        duration: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Timeline line animation
      gsap.from('.timeline-line', {
        scaleY: 0,
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: timelineRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Blog cards stagger animation with parallax
      const cards = gsap.utils.toArray('.blog-card');
      cards.forEach((card, i) => {
        gsap.from(card as HTMLElement, {
          opacity: 0,
          x: i % 2 === 0 ? -60 : 60,
          duration: 0.8,
          scrollTrigger: {
            trigger: card as HTMLElement,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });
      });

      // Timeline dots animation
      gsap.from('.timeline-dot', {
        scale: 0,
        duration: 0.5,
        stagger: 0.2,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: timelineRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      });

      // =========== EXIT ANIMATION (flows into WormholeTransition) ===========
      // As user scrolls past the Blog section, content scales up, blurs and fades
      gsap.to(contentRef.current, {
        scale: 1.15,
        opacity: 0,
        filter: 'blur(15px)',
        ease: 'power2.in',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'bottom 90%',
          end: 'bottom top',
          scrub: 1,
        },
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // --------------------------------------------------------------------------
  // Interactive Wave Effect Background (Canvas)
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
    let ripples: Ripple[] = [];

    // Mouse tracking
    let mouseX = -1000;
    let mouseY = -1000;
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    const MOUSE_RADIUS = 150;

    // Wave spawning
    let rippleTimer: ReturnType<typeof setInterval> | null = null;
    const RIPPLE_INTERVAL = 2000; // More frequent waves

    class Ripple {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      opacity: number;
      speed: number;
      lineWidth: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 1200; // Larger radius
        this.opacity = 0.7; // More visible
        this.speed = 3; // Faster expansion
        this.lineWidth = 3; // Thicker lines
      }

      update(): boolean {
        this.radius += this.speed;
        this.opacity = 0.7 * (1 - this.radius / this.maxRadius);
        this.lineWidth = 3 * (1 - this.radius / this.maxRadius);
        return this.radius < this.maxRadius;
      }

      draw() {
        if (this.opacity <= 0) return;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(6, 182, 212, ${this.opacity})`;
        ctx!.lineWidth = this.lineWidth;
        ctx!.stroke();

        // Secondary ring
        if (this.radius > 30) {
          ctx!.beginPath();
          ctx!.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(59, 130, 246, ${this.opacity * 0.4})`;
          ctx!.lineWidth = this.lineWidth * 0.5;
          ctx!.stroke();
        }
      }
    }

    const initCanvas = () => {
      width = canvas.width = section.offsetWidth;
      height = canvas.height = section.offsetHeight;
    };

    const createRipple = () => {
      if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        ripples.push(new Ripple(mouseX, mouseY));
      }
    };

    const startRipples = () => {
      if (rippleTimer) return;
      createRipple();
      rippleTimer = setInterval(createRipple, RIPPLE_INTERVAL);
    };

    const stopRipples = () => {
      if (rippleTimer) {
        clearInterval(rippleTimer);
        rippleTimer = null;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      startRipples();
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
      stopRipples();
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      scrollVelocity = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;
      setTimeout(() => { scrollVelocity *= 0.9; }, 50);
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw ripples only (no particles)
      ripples = ripples.filter(r => { const alive = r.update(); if (alive) r.draw(); return alive; });

      animationFrameId = requestAnimationFrame(animate);
    };

    section.addEventListener('mousemove', handleMouseMove);
    section.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => { initCanvas(); });
    resizeObserver.observe(section);
    initCanvas();
    animate();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      section.removeEventListener('mousemove', handleMouseMove);
      section.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      stopRipples();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="blog"
      className="relative overflow-hidden bg-bg-base py-16 sm:py-20 md:py-24 lg:py-32"
    >
      {/* Wave Effect Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 z-[1] opacity-80 pointer-events-none" />

      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)] pointer-events-none z-[2]" />

      {/* Content wrapper for exit animation */}
      <div ref={contentRef} className="relative z-10">
        <div className="container-custom px-4 sm:px-6">
          {/* Section header */}
          <div className="blog-header mb-12 sm:mb-16 md:mb-20 lg:mb-24 text-center relative">
            {/* Blue Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full -z-20 pointer-events-none mix-blend-screen" />

            <div className="inline-block bg-black/50 px-4 sm:px-6 py-2 border border-cyan-500/30 rounded-full backdrop-blur-md">
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-cyan-400">
                Insights & Writing
              </span>
            </div>
            <h2 className="mt-4 sm:mt-5 md:mt-6 font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight px-2">
              BLOG
            </h2>
            <p className="mx-auto mt-3 sm:mt-4 max-w-xl text-sm sm:text-base md:text-lg text-text-secondary px-4">
              Thinking out loud about Agents, AGI, and Engineering.
            </p>
          </div>

          {/* Timeline */}
          <div ref={timelineRef} className="relative">
            {/* Timeline line - center on desktop, left on mobile */}
            <div className="timeline-line absolute left-4 top-0 h-full w-[2px] origin-top bg-gradient-to-b from-primary via-secondary to-accent md:left-1/2 md:-translate-x-1/2" />

            {/* Blog items */}
            <div className="relative space-y-8 sm:space-y-12 md:space-y-16 lg:space-y-24">
              {blogPosts.map((post, i) => (
                <div
                  key={post.id}
                  className={cn(
                    'blog-card relative pl-12 md:w-1/2 md:pl-0',
                    i % 2 === 0 ? 'md:pr-16' : 'md:ml-auto md:pl-16'
                  )}
                >
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      'timeline-dot absolute left-3 top-2 z-10 h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 rounded-full border-2 border-bg-base sm:top-3 md:top-4',
                      i % 2 === 0
                        ? 'md:-right-[7px] md:left-auto'
                        : 'md:-left-[7px]'
                    )}
                    style={{ backgroundColor: post.color }}
                  />

                  {/* Connector line to dot - mobile */}
                  <div className="absolute left-4 top-3 h-[2px] w-6 bg-white/10 md:hidden" />

                  {/* Card - Now fully clickable */}
                  <div
                    onClick={() => openModal(post)}
                    className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/5 bg-bg-surface transition-all duration-300 hover:border-white/10 hover:shadow-lg group cursor-pointer active:scale-[0.98]"
                    style={{
                      boxShadow: `0 0 0 1px ${post.color}10`,
                    }}
                  >
                    {/* Image Header */}
                    <div className="relative h-40 sm:h-44 md:h-48 w-full overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

                      {/* Tags Overlay - Desktop only */}
                      <div className="absolute top-3 left-3 right-3 md:top-4 md:left-4 md:right-4 hidden sm:flex flex-wrap gap-1.5 md:gap-2 z-20">
                        {post.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 text-xs font-mono font-medium bg-black/60 backdrop-blur-md rounded border border-white/10 text-white/90 whitespace-nowrap">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Click to read hint */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-xs sm:text-sm border border-white/20">
                          Click to Read
                        </span>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                      {/* Meta Info */}
                      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-[10px] sm:text-xs font-mono text-text-muted">
                        <span className="flex items-center gap-1 sm:gap-1.5">
                          <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1 sm:gap-1.5">
                          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          {post.readTime}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="mb-2 sm:mb-3 font-display text-lg sm:text-xl md:text-2xl font-bold text-white group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>

                      {/* Summary */}
                      <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                        {post.summary}
                      </p>
                    </div>

                    {/* Corner glow */}
                    <div
                      className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-10 blur-3xl group-hover:opacity-20 transition-opacity"
                      style={{ backgroundColor: post.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Read More Button */}
            <div className="mt-12 sm:mt-16 md:mt-20 lg:mt-24 flex justify-center">
              <a
                href="https://medium.com/@srujan.hardik"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl border-2 border-cyan-500 bg-cyan-500 transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/30 active:scale-95"
              >
                {/* Button text */}
                <span className="font-mono text-xs sm:text-sm uppercase tracking-wider text-black font-bold group-hover:text-black transition-colors">
                  Read More on Medium
                </span>

                {/* Arrow icon */}
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-black group-hover:text-black group-hover:translate-x-1 transition-all duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>

                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </a>
            </div>
          </div>
        </div>
      </div> {/* End content wrapper */}

      {/* Background decoration */}
      <div
        className="absolute left-0 top-1/3 h-[600px] w-[600px] rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: 'var(--gradient-primary)' }}
      />

      {/* Blog Modal */}
      <BlogModal
        post={selectedPost}
        isOpen={isOpen}
        onClose={closeModal}
      />
    </section>
  );
}
