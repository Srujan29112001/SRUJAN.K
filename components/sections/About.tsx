'use client';

import { useRef, useEffect, useState } from 'react';
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
    content: `My journey began in the labs of Thapar University (2019-2023). Late nights soldering circuits, coding embedded systems, and building robots. I specialized in Robotics and Control Systems, building multiple real-world projects in embedded AI and hardware-software integration. This was where I forged my understanding of intelligent systems and the physical reality of machine perception.`,
    stats: [
      { value: 4, suffix: ' Years', label: 'Engineering' },
      { value: 1, suffix: '', label: 'Minor Project' },
      { value: 1, suffix: '', label: 'Major Project' },
    ],
    color: '#F59E0B', // Amber/Yellow
    image: '/images/experience/thapar.png',
    button: { text: 'View Degree', link: 'https://drive.google.com/file/d/1DYPLlZjPQKM_y4Cwhk4FDDl_zh3vQLam/view' },
  },
  {
    id: 'mission',
    number: '03',
    title: 'The Mission',
    subtitle: 'Operational AI for Defense — DRDL-DRDO (Defence Research and Development Laboratory)',
    content: `At DRDL-DRDO (Defence Research and Development Laboratory) (2022-2023), I applied my skills to national defense under Dr. Akula Naresh (Scientist-F). I developed "AI-Band Vision" and deployed YOLOv7 on Jetson AGX Xavier edge devices for real-time aerial threat detection. This wasn't just theory; it was mission-critical engineering where we achieved 95% field accuracy.`,
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
    subtitle: 'Consciousness-Aware Technology',
    content: `I stepped away to study what makes intelligence possible — game theory, biological neural networks, and the architecture of robust, consciousness-aware AI. To understand how emotions drive us, I immersed myself in retreats across different cultures and traditions, learning breathing techniques, body movement, and cognitive optimization. Not a detour — it was the infrastructure for everything I build now.`,
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
    content: `From Nov 2023 to present, I scaled my impact globally. Working with international and Indian clients, I architected and delivered 9 Enterprise-grade MVP projects—including the Clinical AI Copilot, Finance Analytics Platform, and EIP. I built full-stack AI apps, websites, and complex multi-agent systems, proving that rapid delivery and deep engineering can coexist.`,
    stats: [
      { value: 9, suffix: '+', label: 'MVP Products' },
      { value: 2, suffix: ' Yrs', label: 'Freelancing' },
    ],
    color: '#EC4899', // Pink
    image: '/images/experience/freelance.png',
    button: { text: 'Testimonials', link: '#testimonials-content' },
  },
  {
    id: 'genai-iiith',
    number: '08',
    title: 'The Frontier',
    subtitle: 'Advanced GenAI & Prompt Engineering — IIIT Hyderabad × TalentSprint (Feb–Jun 2026)',
    content: `A focused 4-month advanced certification in Generative AI & Prompt Engineering from IIIT Hyderabad with TalentSprint — including an on-campus visit. Under the mentorship of Prof. Ponnurangam Kumaraguru (PK), I went deep on LLMs, RAG, multi-agent systems, and responsible AI, shipping three minor projects and one major capstone.`,
    stats: [
      { value: 4, suffix: ' Months', label: 'IIIT-H × TalentSprint' },
      { value: 4, suffix: ' Projects', label: '3 Minor + 1 Capstone' },
    ],
    color: '#A855F7', // Violet
    image: '/images/experience/iiith-genai.png',
    // No mentor button — the Gallery is the panel's primary (and only) action,
    // styled like the other panels' buttons.
    gallery: [] as string[],
  },
];

type StoryPanel = (typeof storyPanels)[number];

// Themed gradient hero shown when a panel has no photo yet (e.g. panel 08
// before the campus-visit visual is generated). Reads as intentional, never
// a broken <img>.
function PanelImagePlaceholder({ panel }: { panel: StoryPanel }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: `radial-gradient(circle at 30% 30%, ${panel.color}33 0%, transparent 60%), linear-gradient(145deg, rgba(20,20,35,0.96) 0%, rgba(10,10,20,0.99) 100%)`,
      }}
    >
      <span
        className="font-display font-black leading-none opacity-20 select-none"
        style={{ color: panel.color, fontSize: 'clamp(5rem, 14vw, 11rem)' }}
      >
        {panel.number}
      </span>
      <span
        className="mt-2 font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em]"
        style={{ color: panel.color }}
      >
        Visual coming soon
      </span>
      {/* faint grid for texture */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${panel.color} 1px, transparent 1px), linear-gradient(90deg, ${panel.color} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
}

// Lightbox collage for a panel's gallery (campus visit photos + certificate).
// Empty state shows a tasteful "coming soon" card so the button is meaningful
// even before images are added.
function GalleryModal({ panel, onClose }: { panel: StoryPanel; onClose: () => void }) {
  const images = panel.gallery ?? [];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[88vh] overflow-y-auto rounded-2xl border p-5 sm:p-8"
        style={{ borderColor: `${panel.color}40`, background: 'linear-gradient(145deg, rgba(18,18,30,0.98), rgba(10,10,18,0.99))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em]" style={{ color: panel.color }}>
              {panel.number} · Gallery
            </p>
            <h3 className="mt-1 font-display text-xl sm:text-2xl font-bold text-white">{panel.title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close gallery"
            className="flex-shrink-0 w-9 h-9 rounded-full border border-white/20 text-white/80 hover:bg-white/10 transition-colors flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {images.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-3 [column-fill:_balance]">
            {images.map((src, i) => (
              <div key={i} className="mb-3 break-inside-avoid rounded-xl overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`${panel.title} ${i + 1}`} className="w-full h-auto block" />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="rounded-xl border border-dashed py-16 px-6 text-center"
            style={{ borderColor: `${panel.color}40` }}
          >
            <div className="text-4xl mb-3" aria-hidden>🎓</div>
            <p className="font-display text-lg text-white mb-1">Gallery coming soon</p>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              Campus-visit photos and the course certificate will be added here as a collage shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement[]>([]);
  const mobileCardsRef = useRef<HTMLDivElement[]>([]);
  const pageLabelRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const scrollTo = useScrollTo();
  const [galleryPanel, setGalleryPanel] = useState<StoryPanel | null>(null);

  // Panel button click: external links open normally; in-page anchors scroll
  // (with the Testimonials pin special-case mirrored from Navigation).
  const goPanelLink = (e: { preventDefault(): void }, link: string) => {
    if (!link.startsWith('#')) return;
    e.preventDefault();
    setNavigating(true);
    if (link === '#testimonials-content') {
      const tSection = document.getElementById('testimonials');
      if (tSection && tSection.getBoundingClientRect().top > 0) {
        ['.portal-light-layer', '.portal-clouds-layer', '.portal-blur-layer'].forEach((s) => {
          const el = document.querySelector(s) as HTMLElement | null;
          if (el) gsap.set(el, { opacity: 0 });
        });
        const marquee = document.querySelector('.testimonial-marquee') as HTMLElement | null;
        if (marquee) gsap.set(marquee, { opacity: 1, y: 0 });
        const pinSpacer = tSection.parentElement;
        const target = pinSpacer?.classList.contains('pin-spacer') ? pinSpacer : tSection;
        const start = target.getBoundingClientRect().top + window.scrollY;
        scrollTo(start + 1500, { immediate: true, duration: 0 });
        setTimeout(() => ScrollTrigger.refresh(), 100);
        return;
      }
    }
    scrollTo(link, { offset: -80 });
  };

  useEffect(() => {
    if (isMobile) return; // Skip horizontal scroll on mobile

    const ctx = gsap.context(() => {
      const pages = panelsRef.current.filter(Boolean);
      if (pages.length === 0) return;

      // Stack the pages — first on top — each hinged on its LEFT edge (the
      // book spine). Scrolling flips the top page leftward to reveal the next,
      // exactly like turning the pages of a book.
      pages.forEach((page, i) => {
        gsap.set(page, {
          zIndex: pages.length - i,
          rotationY: 0,
          transformOrigin: 'left center',
        });
      });

      const flips = pages.length - 1; // the final page stays open
      const PER_PAGE = 560;            // scroll px to turn one page

      const tl = gsap.timeline({
        scrollTrigger: {
          id: 'about-horizontal-scroll', // kept: Navigation jumps to this pin
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${Math.max(1, flips) * PER_PAGE}`,
          pin: true,
          anticipatePin: 1,
          scrub: 1,
          invalidateOnRefresh: true,
          snap: flips > 0
            ? { snapTo: 1 / flips, duration: { min: 0.12, max: 0.3 }, ease: 'power1.inOut' }
            : undefined,
          onUpdate: (self) => {
            const current = Math.min(flips, Math.round(self.progress * flips));
            if (pageLabelRef.current) pageLabelRef.current.innerText = String(current + 1).padStart(2, '0');
            if (progressBarRef.current) progressBarRef.current.style.transform = `scaleX(${self.progress})`;
          },
        },
      });

      pages.forEach((page, i) => {
        if (i >= flips) return; // the last page never turns
        const shadow = page.querySelector('.page-shadow');
        const curl = page.querySelector('.page-curl');

        // The turn: eased like a real leaf falling over the spine. backface
        // hidden makes it vanish past 90deg, revealing the next page beneath.
        tl.to(page, { rotationY: -170, ease: 'power2.inOut', duration: 1 }, i);

        // Flexibility: a gentle droop (skew) + the free edge rounding/curling
        // up at mid-turn, then settling — so it reads as bending paper, not a
        // rigid card. Peaks at the half-way point of the turn.
        tl.to(page, { skewY: 1.6, borderTopRightRadius: 90, borderBottomRightRadius: 70, duration: 0.5, ease: 'sine.in' }, i)
          .to(page, { skewY: 0, borderTopRightRadius: 16, borderBottomRightRadius: 16, duration: 0.5, ease: 'sine.out' }, i + 0.5);

        // Curved-surface shading that catches light near the spine and darkens
        // toward the lifting free edge — the core of the "paper" illusion.
        if (curl) {
          tl.fromTo(curl, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'sine.in' }, i)
            .to(curl, { opacity: 0, duration: 0.5, ease: 'sine.out' }, i + 0.5);
        }

        // Soft self-shadow from the spine while the page is mid-air.
        if (shadow) {
          tl.fromTo(shadow, { opacity: 0 }, { opacity: 0.55, duration: 0.5, ease: 'power1.in' }, i)
            .to(shadow, { opacity: 0, duration: 0.5, ease: 'power1.out' }, i + 0.5);
        }
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
      <>
      {galleryPanel && <GalleryModal panel={galleryPanel} onClose={() => setGalleryPanel(null)} />}
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

                {/* Image with parallax-like zoom (themed placeholder if none yet) */}
                <div className="relative h-52 sm:h-64 w-full overflow-hidden">
                  {panel.image ? (
                    <>
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
                    </>
                  ) : (
                    <PanelImagePlaceholder panel={panel} />
                  )}

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

                  {/* Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
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
                  {panel.gallery && (
                    <button
                      onClick={() => setGalleryPanel(panel)}
                      className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs sm:text-sm tracking-wider transition-all duration-300 overflow-hidden group/btn"
                      style={{ border: `1px solid ${panel.color}`, color: panel.color }}
                    >
                      <div
                        className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                        style={{ background: `linear-gradient(135deg, ${panel.color}30 0%, transparent 100%)` }}
                      />
                      <span className="relative">Gallery</span>
                      <svg className="relative w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  )}
                  </div>
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
      </>
    );
  }

  // Desktop layout — 3D book / page-turn
  return (
    <>
    {galleryPanel && <GalleryModal panel={galleryPanel} onClose={() => setGalleryPanel(null)} />}
    <section
      ref={sectionRef}
      id="about"
      className="about-section relative h-screen overflow-hidden bg-bg-elevated"
    >
      {/* Section label — sits below the fixed navbar, in its own band ABOVE
          the book (clears both the navbar and the page deck). */}
      <div className="absolute top-16 sm:top-[72px] left-0 right-0 z-30 text-center pointer-events-none px-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[200px] sm:h-[260px] bg-blue-600/20 blur-[120px] rounded-full -z-20 pointer-events-none mix-blend-screen" />
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight">
          THE JOURNEY
        </h2>
        <p className="mt-2 font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em] text-cyan-400/70">
          Scroll to turn the pages
        </p>
      </div>

      {/* Book stage — top padding clears the (now full-size) title band */}
      <div
        className="absolute inset-0 flex items-center justify-center px-4 pt-44 sm:pt-48 lg:pt-56 pb-12"
        style={{ perspective: '2600px' }}
      >
        <div
          className="book relative"
          style={{ width: 'min(92vw, 1060px)', height: 'min(62vh, 620px)', transformStyle: 'preserve-3d' }}
        >
          {/* closed-book base + spine behind the leaf deck */}
          <div className="absolute -inset-x-3 -inset-y-3 rounded-2xl bg-gradient-to-br from-[#16161f] to-[#0a0a12] border border-white/5 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8)]" />
          <div className="absolute left-0 top-0 bottom-0 w-3 -ml-3 rounded-l-2xl bg-gradient-to-r from-black/80 to-transparent" />

          {storyPanels.map((panel, i) => (
            <div
              key={panel.id}
              ref={(el) => { if (el) panelsRef.current[i] = el; }}
              className="book-page absolute inset-0 rounded-2xl overflow-hidden"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d',
                willChange: 'transform',
                background: 'linear-gradient(160deg, rgba(22,22,34,0.99) 0%, rgba(10,10,18,1) 100%)',
                boxShadow: `0 30px 60px -20px rgba(0,0,0,0.7), 0 0 0 1px ${panel.color}30`,
              }}
            >
              {/* page image banner — full image, never cropped (blurred fill
                  behind a contained image fills the letterbox elegantly) */}
              <div className="relative h-[40%] w-full overflow-hidden bg-[#070710]">
                {panel.image ? (
                  <>
                    <Image src={panel.image} alt="" aria-hidden fill className="object-cover scale-110 blur-2xl opacity-40" />
                    <Image src={panel.image} alt={panel.title} fill className="object-contain" />
                    <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, ${panel.color}18 0%, transparent 55%)` }} />
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0e0e18] to-transparent" />
                  </>
                ) : (
                  <PanelImagePlaceholder panel={panel} />
                )}
                <div
                  className="absolute top-4 left-4 px-3 py-1.5 rounded-full font-mono text-xs font-bold backdrop-blur-md z-10"
                  style={{ background: `${panel.color}20`, border: `1px solid ${panel.color}50`, color: panel.color }}
                >
                  {panel.number}
                </div>
              </div>

              {/* page content — full description shown (no inner scroll) */}
              <div className="relative h-[60%] p-5 sm:p-6 lg:p-7 flex flex-col">
                <h3
                  className="font-display text-2xl sm:text-3xl font-bold mb-1 leading-tight"
                  style={{ background: `linear-gradient(135deg,#fff 0%, ${panel.color} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                >
                  {panel.title}
                </h3>
                <p className="font-mono text-[11px] sm:text-xs mb-2.5 opacity-80" style={{ color: panel.color }}>{panel.subtitle}</p>
                <p className="text-[13px] sm:text-sm leading-relaxed text-text-secondary/90">{panel.content}</p>
                <div className="mt-auto pt-4 flex items-end justify-between gap-4 flex-wrap">
                  <div className="flex gap-4 sm:gap-6 flex-wrap">
                    {panel.stats.map((stat, j) => (
                      <div key={j} className="relative px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${panel.color}30` }}>
                        <span className="block font-display text-xl sm:text-2xl font-bold text-white">
                          {stat.value}<span className="font-mono text-sm" style={{ color: panel.color }}>{stat.suffix}</span>
                        </span>
                        <span className="text-[10px] sm:text-xs text-text-muted">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {panel.button && (
                      <a
                        href={panel.button.link}
                        onClick={(e) => goPanelLink(e, panel.button!.link)}
                        target={panel.button.link.startsWith('#') ? undefined : '_blank'}
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border font-mono text-xs sm:text-sm tracking-wider transition-all duration-300 hover:scale-105 active:scale-95"
                        style={{ borderColor: panel.color, color: panel.color }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = panel.color; e.currentTarget.style.color = '#000'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = panel.color; }}
                      >
                        {panel.button.text}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </a>
                    )}
                    {panel.gallery && (
                      <button
                        onClick={() => setGalleryPanel(panel)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border font-mono text-xs sm:text-sm tracking-wider transition-all duration-300 hover:scale-105 active:scale-95"
                        style={{ borderColor: panel.color, color: panel.color }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = panel.color; e.currentTarget.style.color = '#000'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = panel.color; }}
                      >
                        Gallery
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* curved-surface shading (the "paper" look) + self-shadow,
                  both driven by GSAP only during the turn */}
              <div className="page-curl absolute inset-0 pointer-events-none opacity-0" style={{ background: 'linear-gradient(95deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.03) 16%, rgba(0,0,0,0.08) 48%, rgba(0,0,0,0.28) 80%, rgba(0,0,0,0.5) 100%)' }} />
              <div className="page-shadow absolute inset-0 pointer-events-none opacity-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.12) 38%, transparent 100%)' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Page indicator + progress */}
      <div className="absolute bottom-5 left-0 right-0 z-30 flex flex-col items-center gap-2 pointer-events-none px-6">
        <div className="font-mono text-xs text-text-muted tracking-widest">
          PAGE <span ref={pageLabelRef} className="text-white">01</span> / {String(storyPanels.length).padStart(2, '0')}
        </div>
        <div className="w-40 sm:w-56 h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div ref={progressBarRef} className="h-full origin-left bg-gradient-to-r from-cyan-400 to-blue-500" style={{ transform: 'scaleX(0)' }} />
        </div>
      </div>
    </section>
    </>
  );
}
