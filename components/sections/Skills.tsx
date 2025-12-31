'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { skillCategories, Skill } from '@/data/skills';
import { cn } from '@/lib/utils';

interface SkillsProps {
  activeCategory: 'AI' | 'Robotics' | 'Research';
  setActiveCategory: (category: 'AI' | 'Robotics' | 'Research') => void;
}

export function Skills({ activeCategory, setActiveCategory }: SkillsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  // Filter categories based on active selection
  const getFilteredCategories = () => {
    switch (activeCategory) {
      case 'AI':
        return skillCategories.filter(c => c.id === 'ai-core' || c.id === 'tools');
      case 'Robotics':
        return skillCategories.filter(c => c.id === 'robotics' || c.id === 'tools');
      case 'Research':
        return skillCategories.filter(c => c.id === 'research' || c.id === 'tools');
      default:
        return skillCategories;
    }
  };

  const filteredCategories = getFilteredCategories();

  // --------------------------------------------------------------------------
  // 1. Uniform Particle Network Background (Canvas) - Interactive
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
    const MOUSE_RADIUS = 150; // Influence radius around cursor

    class Particle {
      x: number;
      y: number;
      baseVx: number;
      baseVy: number;
      vx: number;
      vy: number;
      size: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseVx = (Math.random() - 0.5) * 0.5; // Base slow drift
        this.baseVy = (Math.random() - 0.5) * 0.5;
        this.vx = this.baseVx;
        this.vy = this.baseVy;
        this.size = Math.random() * 1.7 + 0.5; // Medium particles (0.5-2.2px)
      }

      update() {
        // Calculate distance from mouse
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Push particles away from cursor
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          const angle = Math.atan2(dy, dx);
          this.vx = this.baseVx + Math.cos(angle) * force * 2;
          this.vy = this.baseVy + Math.sin(angle) * force * 2;
        } else {
          // Gradually return to base velocity
          this.vx += (this.baseVx - this.vx) * 0.05;
          this.vy += (this.baseVy - this.vy) * 0.05;
        }

        // Add scroll influence (particles drift with scroll)
        this.vy += scrollVelocity * 0.01;

        this.x += this.vx;
        this.y += this.vy;

        // Wrap around edges
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fillStyle = 'rgba(6, 182, 212, 0.55)'; // Medium cyan
        ctx!.fill();
      }
    }

    const initParticles = () => {
      width = canvas.width = section.offsetWidth;
      height = canvas.height = section.offsetHeight;

      // Calculate density: 1 particle per 3000 pixels (more particles)
      const area = width * height;
      const particleCount = Math.floor(area / 3000);

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

      // Decay scroll velocity
      setTimeout(() => {
        scrollVelocity *= 0.9;
      }, 50);
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Decay scroll velocity over time
      scrollVelocity *= 0.95;

      // Draw particles
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    // Event listeners
    section.addEventListener('mousemove', handleMouseMove);
    section.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Resize Observer to handle dynamic height changes
    const resizeObserver = new ResizeObserver(() => {
      initParticles();
    });

    resizeObserver.observe(section);
    initParticles(); // Initial setup
    animate();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      section.removeEventListener('mousemove', handleMouseMove);
      section.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Run once on mount

  // --------------------------------------------------------------------------
  // 2. GSAP Animations - WARP EMERGENCE PINNED SEQUENCE (runs ONCE on mount)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const ctx = gsap.context(() => {
      // =========== PINNED WARP EMERGENCE SEQUENCE ===========
      // Phase 1: LIGHT (bright white/cyan covering everything)
      // Phase 2: CLOUDS appear
      // Phase 3: CLOUDS clear, revealing BLURRED content
      // Phase 4: BLUR clears, showing CRISP content
      // Phase 5: PIN releases, normal scrolling continues

      const revealTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=1500', // Extra scroll distance for the reveal sequence
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        }
      });

      // Phase 1 → 2: Light fades, clouds appear
      revealTl.to('.warp-light-layer', {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
      })
        .to('.warp-clouds-layer', {
          opacity: 1,
          duration: 0.2,
        }, '<0.1');

      // Phase 2 → 3: Clouds fade, revealing blurred content
      revealTl.to('.warp-clouds-layer', {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
      }, '>0.1')
        .to('.warp-blur-layer', {
          opacity: 1,
          duration: 0.1,
        }, '<');

      // Phase 3 → 4: Blur clears to show crisp content
      revealTl.to('.warp-blur-layer', {
        backdropFilter: 'blur(0px)',
        webkitBackdropFilter: 'blur(0px)',
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
      }, '>0.1');

      // Content animations - HEADER FIRST, then SKILLS
      // Header appears at 80% of timeline
      revealTl.from(headerRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.1,
      }, 0.8)
        // Skills appear at 90% - use fromTo() to GUARANTEE hidden start state
        .fromTo('.skill-group',
          { opacity: 0, y: 30 },  // FROM: hidden
          { opacity: 1, y: 0, duration: 0.1, stagger: 0.02 },  // TO: visible
          0.9
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []); // Empty dependency - runs ONCE on mount, never recreates ScrollTrigger

  // --------------------------------------------------------------------------
  // 3. Content Animation - runs on CATEGORY CHANGE ONLY (not initial mount)
  // --------------------------------------------------------------------------
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip animation on initial mount - let the scroll timeline handle it
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Animate skill groups when category changes (after initial mount)
    gsap.fromTo('.skill-group',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
    );
  }, [activeCategory]);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative min-h-screen bg-black py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden"
    >
      {/* ========== WARP EMERGENCE LAYERS ========== */}

      {/* Layer 1: BRIGHT LIGHT - MUST MATCH WarpTransition flash-white (cyan-50 = #ecfeff) */}
      <div
        className="warp-light-layer absolute inset-0 z-[60] pointer-events-none bg-cyan-50"
      />

      {/* Layer 2: CLOUDS/FOG (appears after light fades) */}
      <div
        className="warp-clouds-layer absolute inset-0 z-[55] pointer-events-none opacity-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 60%, rgba(200, 200, 220, 0.3) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 80%, rgba(180, 180, 200, 0.3) 0%, transparent 45%),
            radial-gradient(ellipse at 20% 70%, rgba(220, 220, 240, 0.25) 0%, transparent 35%),
            radial-gradient(ellipse at 80% 30%, rgba(200, 210, 230, 0.3) 0%, transparent 40%),
            linear-gradient(to bottom, rgba(20, 20, 30, 0.6) 0%, rgba(0, 0, 0, 0.8) 100%)
          `,
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
        }}
      />

      {/* Layer 3: BLUR (shows blurred content, then clears) */}
      <div
        className="warp-blur-layer absolute inset-0 z-[50] pointer-events-none opacity-0"
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(0, 0, 0, 0.2)',
        }}
      />

      {/* ========== END WARP EMERGENCE LAYERS ========== */}

      {/* Uniform Particle Network Background */}
      <canvas ref={canvasRef} className="absolute inset-0 z-[1] opacity-50 sm:opacity-60 pointer-events-none" />

      {/* Vignette Overlay (Very Subtle - only affects far edges) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)] pointer-events-none z-[2]" />

      <div id="skills-content" className="container-custom relative z-10 px-4 sm:px-6">

        {/* Header (HUD Style) */}
        <div ref={headerRef} className="mb-12 sm:mb-16 md:mb-20 text-center relative">
          {/* Blue Glow Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[300px] sm:h-[400px] bg-blue-600/20 blur-[120px] rounded-full -z-20 pointer-events-none mix-blend-screen" />

          <div className="inline-block bg-black px-4 sm:px-6 py-2 border border-cyan-500/30 rounded-full backdrop-blur-md">
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-cyan-400">
              System Diagnostics
            </span>
          </div>
          <h2 className="mt-4 sm:mt-5 md:mt-6 font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight px-2">
            SKILL MATRIX
          </h2>

          {/* Category Switcher */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 md:mt-10">
            {['AI', 'Robotics', 'Research'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as any)}
                className={cn(
                  "group relative px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 overflow-hidden rounded-none skew-x-[-10deg] border border-white/10 transition-all duration-300",
                  activeCategory === cat
                    ? "bg-white text-black border-white"
                    : "bg-black/50 text-white/50 hover:text-white hover:border-white/50"
                )}
              >
                <div className={cn(
                  "absolute inset-0 bg-cyan-400/20 translate-y-full transition-transform duration-300 group-hover:translate-y-0",
                  activeCategory === cat && "hidden"
                )} />
                <span className="relative inline-block skew-x-[10deg] font-bold tracking-wider text-xs sm:text-sm">
                  {cat}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid gap-6 sm:gap-8 md:gap-10 lg:gap-12 grid-cols-1 md:grid-cols-2">
          {filteredCategories.map((category) => (
            <div key={category.id} className="skill-group space-y-4 sm:space-y-6">
              {/* Category Header */}
              <div className="flex items-center gap-3 sm:gap-4 border-b border-white/10 pb-3 sm:pb-4">
                <div
                  className="p-2 sm:p-3 rounded-lg bg-white/5 border border-white/10 flex-shrink-0"
                  style={{ color: category.color }}
                >
                  <category.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-white">
                    {category.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/40 font-mono truncate">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Skills List */}
              <div className="grid gap-3 sm:gap-4">
                {category.skills.map((skill) => (
                  <SkillItem
                    key={skill.name}
                    skill={skill}
                    color={category.color}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// 3. Sub-Component: Skill Item (Holographic Card)
// --------------------------------------------------------------------------
function SkillItem({ skill, color }: { skill: Skill; color: string }) {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate circle circumference for SVG animation
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (skill.proficiency / 100) * circumference;

  return (
    <div
      className="group relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all duration-300 overflow-hidden active:scale-95"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover Glow Background */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, ${color}10 0%, transparent 100%)`
        }}
      />

      {/* Circular Progress Indicator */}
      <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center">
        {/* Background Circle */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="20"
            cy="20"
            r={radius}
            className="stroke-white/10 sm:cx-24 sm:cy-24"
            strokeWidth="3"
            fill="none"
          />
          {/* Animated Progress Circle */}
          <circle
            cx="20"
            cy="20"
            r={radius}
            stroke={color}
            strokeWidth="3"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={isHovered ? offset : circumference} // Animate on hover (or use IntersectionObserver for scroll)
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out sm:cx-24 sm:cy-24"
          />
        </svg>
        <span className="absolute text-[9px] sm:text-[10px] font-mono font-bold text-white/80">
          {skill.proficiency}%
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 relative z-10 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-cyan-200 transition-colors truncate pr-2">
            {skill.name}
          </h4>
        </div>
        <div className="flex justify-between items-center gap-2">
          <p className="text-[10px] sm:text-xs text-white/40 font-mono group-hover:text-white/60 transition-colors truncate">
            {skill.details}
          </p>

          {/* Animated Bar (Secondary Visual) */}
          <div className="h-1 w-12 sm:w-16 bg-white/10 rounded-full overflow-hidden flex-shrink-0">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: isHovered ? '100%' : '0%',
                backgroundColor: color
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
