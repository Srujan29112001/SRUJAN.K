'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useScrollTo } from '@/hooks/useLenis';
import { setNavigating } from '@/lib/navigationState';

const storyPanels = [
  {
    id: 'origins',
    number: '01',
    title: 'The Origins',
    subtitle: 'Krishna Murty IIT Academy (Shivam Junior College) • 2017-2019',
    content: `The spark ignited here. During my 11th & 12th standard (Intermediate), I dove deep into Mathematics, Physics, and Chemistry while preparing for JEE. The rigorous academic environment sharpened my analytical thinking and problem-solving skills. Achieved a JEE Mains score of 95.03 percentile. Beyond academics, I found discipline and mental fortitude through boxing—learning to think under pressure and adapt in real-time.`,
    stats: [
      { value: 95.03, suffix: '%ile', label: 'JEE Mains' },
      { value: 2, suffix: ' Yrs', label: 'Boxing' },
    ],
    color: '#F97316', // Orange
    image: '/images/experience/junior-college.png',
    button: { text: 'View Scorecard', link: 'https://drive.google.com/file/d/1QfDZ2-pocQHG2pc5Gg_f4-Te5Q0pBMFf/view' },
  },
  {
    id: 'foundation',
    number: '02',
    title: 'The Foundation',
    subtitle: 'Thapar University & Robotics',
    content: `My journey began in the labs of Thapar University (2019-2023). Late nights soldering circuits, coding embedded systems, and building robots. I specialized in Robotics and Control Systems, graduating with First Class with Distinction. This was where I forged my understanding of hardware-software integration and the physical reality of intelligent systems.`,
    stats: [
      { value: 4, suffix: ' Years', label: 'Engineering' },
      { value: 1, suffix: 'st', label: 'Class Distinction' },
    ],
    color: '#F59E0B', // Amber/Yellow
    image: '/images/experience/thapar.png',
    button: { text: 'View Degree', link: 'https://drive.google.com/file/d/1DYPLlZjPQKM_y4Cwhk4FDDl_zh3vQLam/view' },
  },
  {
    id: 'mission',
    number: '03',
    title: 'The Mission',
    subtitle: 'Operational AI for Defense (DRDO)',
    content: `At DRDO (2022-2023), I applied my skills to national defense under Dr. Akula Naresh (Scientist-F). I developed "AI-Band Vision" and deployed YOLOv7 on Jetson AGX Xavier edge devices for real-time aerial threat detection. This wasn't just theory; it was mission-critical engineering where we achieved 95% field accuracy.`,
    stats: [
      { value: 95, suffix: '%', label: 'Field Accuracy' },
      { value: 8, suffix: ' Mos', label: 'Deployed (DRDL)' },
    ],
    color: '#06B6D4', // Cyan/Blue
    image: '/images/experience/drdo.png',
    button: { text: 'View Certificate', link: 'https://drive.google.com/file/d/1HLe3V2GTpNk6KHFyF1Rc-cfmVhOMu4U4/view' },
  },
  {
    id: 'awakening',
    number: '04',
    title: 'The Awakening',
    subtitle: 'Consciousness & AGI Research',
    content: `I stepped away to study what makes intelligence possible. Investigating Gödel's incompleteness, game theory, and biological neural networks. I explored how stress reduction and cognitive optimization can inform robust AI architectures. This wasn't a detour—it was necessary infrastructure for understanding AGi.`,
    stats: [
      { value: 2, suffix: ' Years', label: 'Deep Research' },
      { value: 100, suffix: '%', label: 'Curiosity' },
    ],
    color: '#8B7EC8', // Purple
    image: '/images/experience/sabbatical.png',
    button: { text: 'View Memories', link: 'https://drive.google.com/drive/folders/1ZaZzv73KuIJzGQA-JWXP36YOSTw3q4DC?usp=sharing' },
  },
  {
    id: 'synthesis',
    number: '05',
    title: 'The Synthesis',
    subtitle: 'Embodied Intelligence & Flow',
    content: `My lab isn't just silicon. Guitar improvisation teaches pattern recognition. Freestyle football demands sensorimotor prediction. FPV drone racing requires control theory at 100 mph. Boxing teaches decision-making under pressure. I engineer systems that perceive and act, grounded in the flow states of biological reality.`,
    stats: [
      { value: 5, suffix: '+', label: 'Disciplines' },
      { value: 1, suffix: ' Vision', label: 'Unified' },
    ],
    color: '#10B981', // Emerald
    image: '/images/experience/flow.png',
    button: { text: 'View Gallery', link: 'https://drive.google.com/drive/folders/1ZaZzv73KuIJzGQA-JWXP36YOSTw3q4DC?usp=sharing' },
  },
  {
    id: 'butterfly-effect',
    number: '06',
    title: 'The Butterfly Effect',
    subtitle: 'Continuous Learning & Certifications',
    content: `Small investments, massive returns. I systematically stacked certifications across domains: TensorFlow, PyTorch, and Computer Vision for AI; ROS 2 and Control Systems for robotics; MLOps for deployment. Add Prompt Engineering, Cloud Computing, and Psychology—because mastering systems means understanding all systems.`,
    stats: [
      { value: 12, suffix: '+', label: 'Certifications' },
      { value: 3, suffix: ' Domains', label: 'AI, Robotics, Research' },
    ],
    color: '#3B82F6', // Blue
    image: '/images/experience/certifications.png',
    button: { text: 'View Certifications', link: '/certifications' },
  },
  {
    id: 'expansion',
    number: '07',
    title: 'The Expansion',
    subtitle: 'The Freelance Era (2023-2025)',
    content: `From Nov 2023 to present, I scaled my impact globally. Working with international and Indian clients, I architected and delivered 6 Enterprise-grade MVP projects—including the Clinical AI Copilot, Finance Analytics Platform, and EIP. I built full-stack AI apps, websites, and complex multi-agent systems, proving that rapid delivery and deep engineering can coexist.`,
    stats: [
      { value: 6, suffix: '+', label: 'MVP Products' },
      { value: 2, suffix: ' Yrs', label: 'Freelancing' },
    ],
    color: '#EC4899', // Pink
    image: '/images/experience/freelance.png',
    button: { text: 'Testimonials', link: '#testimonials-content' },
  },
];

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement[]>([]);
  const mobileCardsRef = useRef<HTMLDivElement[]>([]);
  const isMobile = useIsMobile();
  const scrollTo = useScrollTo();

  useEffect(() => {
    if (isMobile) return; // Skip horizontal scroll on mobile

    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const panels = panelsRef.current;
      if (!track || panels.length === 0) return;

      const totalWidth = track.scrollWidth - window.innerWidth;
      const exitZoomDistance = window.innerHeight;
      const totalScrollDistance = totalWidth + exitZoomDistance;

      // Calculate how much of total scroll is for panels vs exit zoom
      const panelScrollRatio = totalWidth / totalScrollDistance;

      // Horizontal scroll Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          id: 'about-horizontal-scroll',
          trigger: sectionRef.current,
          pin: true,
          scrub: 1,
          snap: {
            // FIXED: With 5 panels, there are 4 intervals to snap between
            // Panel 1 at 0%, Panel 2 at 25%, Panel 3 at 50%, Panel 4 at 75%, Panel 5 at 100%
            snapTo: (progress) => {
              const panelCount = panels.length;
              const gaps = panelCount - 1; // 5 panels = 4 gaps

              // If we're past the panel section (in exit zoom), don't snap
              if (progress > panelScrollRatio) {
                return progress; // No snapping during exit zoom
              }

              // Calculate snap interval: panelScrollRatio / (panelCount - 1)
              const panelSnapInterval = panelScrollRatio / gaps;

              // Round to nearest panel position
              const nearestPanel = Math.round(progress / panelSnapInterval);
              const snappedProgress = nearestPanel * panelSnapInterval;

              // Clamp to valid range (0 to panelScrollRatio)
              return Math.max(0, Math.min(snappedProgress, panelScrollRatio));
            },
            duration: { min: 0.15, max: 0.35 },
            ease: 'power1.inOut',
          },
          // Add extra scroll distance for the exit zoom
          end: () => `+=${totalScrollDistance}`,
          invalidateOnRefresh: true,
        },
      });

      // 1. The Scroll (only takes portion of timeline, not full 1.0)
      tl.to(track, {
        x: -totalWidth,
        ease: 'none',
        duration: panelScrollRatio, // Proportional to scroll distance
      });

      // 2. The Exit Zoom (Last Panel) - takes remaining portion of timeline
      const lastPanel = panels[panels.length - 1];
      const exitZoomRatio = 1 - panelScrollRatio;
      if (lastPanel) {
        // Fade out the entire panel container to catch borders/decorations
        tl.to(lastPanel, {
          scale: 1.5, // Slightly reduced scale to prevent pixelation artifacts
          opacity: 0,
          filter: 'blur(10px)',
          duration: exitZoomRatio,
          ease: 'power2.in',
        });

        // Background color tween REMOVED - stayed at natural #0A0A12

        // Also fade out the progress bar line at the bottom
        tl.to('.story-progress', {
          opacity: 0,
          duration: exitZoomRatio * 0.4
        }, "<"); // Start at same time
      }

      // Per-panel animations (Hooked to the timeline)
      panels.forEach((panel) => {
        const content = panel.querySelector('.panel-content');
        const image = panel.querySelector('.panel-image');
        const stats = panel.querySelectorAll('.stat-value');

        // Content reveal - FIXED: Start earlier (100% = right edge of viewport)
        if (content) {
          gsap.from(content, {
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tl,
              start: 'left 100%', // Trigger when panel enters viewport
              toggleActions: 'play none none reverse',
            },
          });
        }

        // Image reveal (Parallax/Scale) - FIXED: Start earlier
        if (image) {
          gsap.from(image, {
            scale: 1.1,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tl,
              start: 'left 95%', // Trigger slightly after content starts
              toggleActions: 'play none none reverse',
            }
          });
        }

        // Stats counter - FIXED: Start earlier
        stats.forEach((stat) => {
          const target = parseFloat(stat.getAttribute('data-value') || '0');
          const obj = { value: 0 };

          gsap.to(obj, {
            value: target,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tl,
              start: 'left 90%', // Trigger with content
              toggleActions: 'play none none none',
            },
            onUpdate: () => {
              const isDecimal = target % 1 !== 0;
              (stat as HTMLElement).textContent = isDecimal
                ? obj.value.toFixed(2)
                : Math.round(obj.value).toString();
            },
          });
        });
      });

      // Progress bar
      gsap.to('.story-progress', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${totalWidth}`,
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  // Mobile scroll animations - Simple zoom/fade when scrolling past cards
  useEffect(() => {
    if (!isMobile) return;

    let timeoutId: NodeJS.Timeout;
    const triggers: ScrollTrigger[] = [];

    const setupAnimations = () => {
      const cards = mobileCardsRef.current.filter(Boolean);

      if (cards.length === 0) return;

      // Ensure all cards start visible
      cards.forEach((card) => {
        gsap.set(card, { opacity: 1, scale: 1, filter: 'blur(0px)' });
      });

      cards.forEach((card, index) => {
        // Skip the last card - no exit animation needed
        if (index >= cards.length - 1) return;

        // Scrub animation - zoom and fade when card bottom passes viewport center
        const tl = gsap.timeline({
          scrollTrigger: {
            id: `mobile-card-fade-${index}`,
            trigger: card,
            start: 'bottom 50%',
            end: 'bottom 10%',
            scrub: 0.3,
            invalidateOnRefresh: true,
          },
        });

        tl.to(card, {
          scale: 1.15,
          opacity: 0,
          filter: 'blur(10px)',
          ease: 'power2.in',
        });

        if (tl.scrollTrigger) {
          triggers.push(tl.scrollTrigger);
        }
      });
    };

    timeoutId = setTimeout(setupAnimations, 300);

    return () => {
      clearTimeout(timeoutId);
      triggers.forEach(t => t.kill());
    };
  }, [isMobile]);

  // Mobile layout - Cards without 3D tilt
  if (isMobile) {
    return (
      <section
        ref={sectionRef}
        id="about"
        className="relative bg-bg-elevated py-16 sm:py-20 overflow-hidden"
      >
        {/* Floating particles background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Animated floating orbs */}
          <div className="absolute top-[10%] left-[10%] w-2 h-2 bg-cyan-400/40 rounded-full animate-float-slow" />
          <div className="absolute top-[30%] right-[15%] w-3 h-3 bg-purple-400/30 rounded-full animate-float-medium" />
          <div className="absolute top-[50%] left-[5%] w-1.5 h-1.5 bg-pink-400/40 rounded-full animate-float-fast" />
          <div className="absolute top-[70%] right-[10%] w-2 h-2 bg-blue-400/30 rounded-full animate-float-slow" />
          <div className="absolute top-[85%] left-[20%] w-2.5 h-2.5 bg-emerald-400/30 rounded-full animate-float-medium" />
          <div className="absolute top-[15%] right-[25%] w-1 h-1 bg-amber-400/50 rounded-full animate-float-fast" />

          {/* Large background glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-radial from-cyan-500/15 via-transparent to-transparent blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-radial from-purple-500/15 via-transparent to-transparent blur-3xl" />
        </div>

        {/* Section label (HUD Style) */}
        <div className="mb-10 sm:mb-12 px-4 sm:px-6 text-center relative z-10">
          <div className="inline-block bg-black/50 px-4 sm:px-6 py-2 border border-cyan-500/30 rounded-full backdrop-blur-md">
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-cyan-400">
              Timeline Analysis
            </span>
          </div>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight px-2">
            THE JOURNEY
          </h2>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-10 sm:gap-14 px-4 sm:px-6 relative z-10">
          {storyPanels.map((panel, i) => (
            <div
              key={panel.id}
              ref={(el) => {
                if (el) mobileCardsRef.current[i] = el;
              }}
              className="relative group mobile-journey-card"
            >
              {/* Card container */}
              <div
                className="relative rounded-2xl sm:rounded-3xl overflow-hidden transform-gpu"
                style={{
                  background: 'linear-gradient(145deg, rgba(20,20,35,0.95) 0%, rgba(10,10,20,0.98) 100%)',
                  boxShadow: `
                    0 25px 50px -12px rgba(0,0,0,0.5),
                    0 0 0 1px ${panel.color}30,
                    inset 0 1px 0 0 rgba(255,255,255,0.05)
                  `,
                }}
              >
                {/* Animated shimmer border */}
                <div
                  className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${panel.color}40 50%, transparent 100%)`,
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite linear',
                    padding: '1px',
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'xor',
                    WebkitMaskComposite: 'xor',
                  }}
                />

                {/* Number watermark */}
                <div
                  className="absolute -top-4 -right-2 font-display text-[6rem] sm:text-[8rem] font-black opacity-[0.03] z-0 select-none"
                  style={{ color: panel.color }}
                >
                  {panel.number}
                </div>

                {/* Image with parallax-like zoom */}
                {panel.image && (
                  <div className="relative h-52 sm:h-64 w-full overflow-hidden">
                    <Image
                      src={panel.image}
                      alt={panel.title}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    {/* Gradient overlays for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-transparent to-transparent" />
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        background: `linear-gradient(135deg, ${panel.color}20 0%, transparent 60%)`,
                      }}
                    />

                    {/* Floating number badge */}
                    <div
                      className="absolute top-4 left-4 px-3 py-1.5 rounded-full font-mono text-xs font-bold backdrop-blur-md"
                      style={{
                        background: `${panel.color}20`,
                        border: `1px solid ${panel.color}50`,
                        color: panel.color,
                        boxShadow: `0 0 20px ${panel.color}30`,
                      }}
                    >
                      {panel.number}
                    </div>
                  </div>
                )}

                {/* Content area */}
                <div className="p-5 sm:p-6 relative z-10">
                  {/* Title with gradient */}
                  <h3
                    className="font-display text-2xl sm:text-3xl font-bold mb-2"
                    style={{
                      background: `linear-gradient(135deg, #ffffff 0%, ${panel.color} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {panel.title}
                  </h3>

                  {/* Subtitle */}
                  <p
                    className="font-mono text-xs sm:text-sm mb-4 opacity-80"
                    style={{ color: panel.color }}
                  >
                    {panel.subtitle}
                  </p>

                  {/* Content */}
                  <p className="text-sm sm:text-base leading-relaxed text-text-secondary/90 mb-5">
                    {panel.content}
                  </p>

                  {/* Stats with glowing boxes */}
                  <div className="flex gap-4 sm:gap-6 mb-5 flex-wrap">
                    {panel.stats.map((stat, j) => (
                      <div
                        key={j}
                        className="relative px-4 py-3 rounded-xl overflow-hidden"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${panel.color}30`,
                        }}
                      >
                        {/* Stat glow */}
                        <div
                          className="absolute inset-0 opacity-20"
                          style={{
                            background: `radial-gradient(circle at center, ${panel.color}40 0%, transparent 70%)`,
                          }}
                        />
                        <span className="relative block font-display text-2xl sm:text-3xl font-bold text-white">
                          {stat.value}
                          <span className="font-mono text-lg" style={{ color: panel.color }}>{stat.suffix}</span>
                        </span>
                        <span className="relative text-xs text-text-muted">{stat.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Button with glow effect */}
                  {panel.button && (
                    <a
                      href={panel.button.link}
                      onClick={(e) => {
                        if (panel.button.link.startsWith('#')) {
                          e.preventDefault();
                          setNavigating(true);

                          if (panel.button.link === '#testimonials-content') {
                            const testimonialsContent = document.getElementById('testimonials-content');
                            const testimonialsSection = document.getElementById('testimonials');

                            if (testimonialsContent && testimonialsSection) {
                              const testimonialsTop = testimonialsSection.getBoundingClientRect().top;

                              if (testimonialsTop > 0) {
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
                                const pinEndPosition = sectionStart + 1500;

                                scrollTo(pinEndPosition, { immediate: true, duration: 0 });
                                setTimeout(() => ScrollTrigger.refresh(), 100);
                              } else {
                                scrollTo(panel.button.link, { offset: -80 });
                              }
                            } else {
                              scrollTo(panel.button.link, { offset: -80 });
                            }
                          } else {
                            scrollTo(panel.button.link, { offset: -80 });
                          }
                        }
                      }}
                      className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs sm:text-sm tracking-wider transition-all duration-300 overflow-hidden group/btn"
                      style={{
                        border: `1px solid ${panel.color}`,
                        color: panel.color,
                      }}
                    >
                      {/* Button glow on hover */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${panel.color}30 0%, transparent 100%)`,
                        }}
                      />
                      <span className="relative">{panel.button.text}</span>
                      <svg className="relative w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  )}
                </div>

                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 opacity-50"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${panel.color} 50%, transparent 100%)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* CSS for animations */}
        <style jsx>{`
          @keyframes cardReveal {
            from {
              opacity: 0;
              transform: translateY(60px) rotateX(10deg);
            }
            to {
              opacity: 1;
              transform: translateY(0) rotateX(2deg);
            }
          }
          
          @keyframes shimmer {
            from { background-position: 200% 0; }
            to { background-position: -200% 0; }
          }
          
          @keyframes float-slow {
            0%, 100% { transform: translateY(0) translateX(0); }
            25% { transform: translateY(-20px) translateX(10px); }
            50% { transform: translateY(-10px) translateX(-5px); }
            75% { transform: translateY(-25px) translateX(5px); }
          }
          
          @keyframes float-medium {
            0%, 100% { transform: translateY(0) translateX(0); }
            33% { transform: translateY(-15px) translateX(-10px); }
            66% { transform: translateY(-25px) translateX(10px); }
          }
          
          @keyframes float-fast {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-30px); }
          }
          
          .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
          .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
          .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
        `}</style>
      </section>
    );
  }

  // Desktop layout - horizontal scroll
  return (
    <section
      ref={sectionRef}
      id="about"
      className="about-section relative h-screen overflow-hidden bg-bg-elevated"
    >
      {/* Section label (HUD Style) */}
      <div className="absolute top-12 sm:top-14 left-0 right-0 z-20 text-center pointer-events-none px-4">
        {/* Blue Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[300px] sm:h-[400px] bg-blue-600/20 blur-[120px] rounded-full -z-20 pointer-events-none mix-blend-screen" />

        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight pointer-events-auto">
          THE JOURNEY
        </h2>
      </div>

      {/* Horizontal track */}
      <div
        ref={trackRef}
        className="story-track flex h-full pt-8 sm:pt-10"
        style={{ width: `${storyPanels.length * 100}vw` }}
      >
        {storyPanels.map((panel, i) => (
          <div
            key={panel.id}
            ref={(el) => {
              if (el) panelsRef.current[i] = el;
            }}
            className="story-panel relative flex h-full w-screen flex-shrink-0 items-center justify-center px-6 sm:px-10 md:px-16 lg:px-20"
          >
            <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">

              {/* Left: Content */}
              <div className="panel-content relative z-10">
                {/* Number */}
                <span
                  className="mb-3 sm:mb-4 block font-mono leading-none opacity-10"
                  style={{ color: panel.color, fontSize: 'clamp(4rem, 8vw, 8rem)' }}
                >
                  {panel.number}
                </span>

                {/* Title */}
                <h2 className="mb-2 font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                  {panel.title}
                </h2>

                {/* Subtitle */}
                <p className="mb-4 sm:mb-6 font-mono text-sm sm:text-base lg:text-lg leading-relaxed" style={{ color: panel.color }}>
                  {panel.subtitle}
                </p>

                {/* Content */}
                <p className="mb-6 sm:mb-8 lg:mb-10 text-base sm:text-lg leading-relaxed text-text-secondary">
                  {panel.content}
                </p>

                {/* Stats */}
                <div className="flex gap-8 sm:gap-12 lg:gap-16 mb-6 sm:mb-8 flex-wrap">
                  {panel.stats.map((stat, j) => (
                    <div key={j} className="stat">
                      <span
                        className="stat-value block font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white"
                        data-value={stat.value}
                      >
                        0
                      </span>
                      <span className="text-xs sm:text-sm text-text-muted">
                        {stat.suffix && (
                          <span className="text-base sm:text-lg lg:text-xl font-bold">{stat.suffix}</span>
                        )}{' '}
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Button */}
                {panel.button && (
                  <a
                    href={panel.button.link}
                    onClick={(e) => {
                      if (panel.button.link.startsWith('#')) {
                        e.preventDefault();
                        setNavigating(true);

                        // Special handling for testimonials section (same as Navigation.tsx)
                        if (panel.button.link === '#testimonials-content') {
                          const testimonialsContent = document.getElementById('testimonials-content');
                          const testimonialsSection = document.getElementById('testimonials');

                          if (testimonialsContent && testimonialsSection) {
                            // Check if we're above the testimonials section
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

                              // Make testimonial marquee visible
                              if (testimonialMarquee) gsap.set(testimonialMarquee, { opacity: 1, y: 0 });

                              // Calculate scroll position - account for pin-spacer
                              const pinSpacer = testimonialsSection.parentElement;
                              const targetElement = pinSpacer?.classList.contains('pin-spacer') ? pinSpacer : testimonialsSection;

                              // Scroll to END of pin (after animation completes)
                              const sectionStart = targetElement.getBoundingClientRect().top + window.scrollY;
                              const pinEndPosition = sectionStart + 1500; // Match ScrollTrigger end value

                              // Use immediate scroll to jump past animation
                              scrollTo(pinEndPosition, { immediate: true, duration: 0 });

                              // Refresh ScrollTrigger after scroll
                              setTimeout(() => {
                                ScrollTrigger.refresh();
                              }, 100);
                            } else {
                              // Below testimonials - smooth scroll is fine
                              scrollTo(panel.button.link, { offset: -80 });
                            }
                          } else {
                            scrollTo(panel.button.link, { offset: -80 });
                          }
                        } else {
                          // Other links - normal scroll
                          scrollTo(panel.button.link, { offset: -80 });
                        }
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-full border font-mono text-xs sm:text-sm tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 pointer-events-auto"
                    style={{
                      borderColor: panel.color,
                      color: panel.color,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = panel.color;
                      e.currentTarget.style.color = '#000';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = panel.color;
                    }}
                  >
                    {panel.button.text}
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                )}
              </div>

              {/* Right: Image */}
              <div className="panel-image relative h-[40vh] sm:h-[50vh] lg:h-[60vh] w-full rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                {panel.image && (
                  <>
                    <Image
                      src={panel.image}
                      alt={panel.title}
                      fill
                      className="object-cover"
                    />
                    {/* Overlay for text readability if needed, or just aesthetic */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />


                  </>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-[2px] w-full bg-white/10">
        <div
          className="story-progress h-full origin-left bg-primary"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>
    </section>
  );
}
