'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/ui/Reveal';
import { usePageNav, resolveHashToPage } from '@/components/providers/PageNav';

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
    gallery: [] as string[],
  },
];

type StoryPanel = (typeof storyPanels)[number];

// Themed gradient hero shown when a panel has no photo yet. Reads as
// intentional, never a broken <img>.
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

// Lightbox collage for a panel's gallery.
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
  const timelineRef = useRef<HTMLDivElement>(null);
  const [galleryPanel, setGalleryPanel] = useState<StoryPanel | null>(null);
  const { goTo } = usePageNav();

  // Spine progress fill — fills as the timeline scrolls through the viewport.
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 70%', 'end 70%'],
  });

  // Panel button click: external URLs / routes use the <a> default; in-page
  // anchors (e.g. the Testimonials button) switch to the matching page.
  const goPanelLink = (e: { preventDefault(): void }, link: string) => {
    if (!link.startsWith('#')) return;
    e.preventDefault();
    const target = resolveHashToPage(link);
    if (target) goTo(target);
  };

  return (
    <>
      {galleryPanel && <GalleryModal panel={galleryPanel} onClose={() => setGalleryPanel(null)} />}
      <section
        id="about"
        className="relative bg-black text-white overflow-hidden py-20 sm:py-24 md:py-28 lg:py-32"
      >
        {/* faint grid + glow backdrop */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
          <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[600px] h-[360px] rounded-full blur-[150px] bg-blue-600/15 mix-blend-screen" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          {/* Header */}
          <Reveal className="mb-12 sm:mb-16 md:mb-20" amount={0.4}>
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.3em] text-cyan-400">
                ( The Journey )
              </span>
              <span className="h-px flex-grow bg-white/10" />
              <span className="font-mono text-[11px] sm:text-xs text-white/30 tabular-nums">
                {String(storyPanels.length).padStart(2, '0')} Chapters
              </span>
            </div>
            <h2 className="font-display text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-bold tracking-[-0.03em] leading-[0.9]">
              THE JOURNEY
            </h2>
            <p className="mt-4 sm:mt-5 max-w-2xl text-base sm:text-lg text-text-secondary">
              From JEE rank lists to defence labs to autonomous agents — a decade of building intelligence,
              and questioning what makes it possible. Scroll the story.
            </p>
          </Reveal>

          {/* Timeline */}
          <div ref={timelineRef} className="relative">
            {/* spine — left rail on mobile, centre on desktop */}
            <div className="absolute top-0 bottom-0 left-[18px] lg:left-1/2 -translate-x-1/2 w-px bg-white/10">
              <motion.div
                className="absolute top-0 left-0 w-full h-full origin-top"
                style={{
                  scaleY: scrollYProgress,
                  background: 'linear-gradient(180deg, #06B6D4 0%, #8B7EC8 50%, #A855F7 100%)',
                  boxShadow: '0 0 12px rgba(34,211,238,0.5)',
                }}
              />
            </div>

            {storyPanels.map((panel, i) => {
              const flip = i % 2 === 1; // alternate image/content sides on desktop
              return (
                <Reveal key={panel.id} amount={0.2} className="block">
                  <div className="relative pl-12 lg:pl-0 lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-20 items-center pb-14 sm:pb-16 lg:pb-28">
                    {/* node */}
                    <span
                      className="absolute left-[18px] lg:left-1/2 top-1 lg:top-1/2 -translate-x-1/2 lg:-translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full font-mono text-[11px] sm:text-xs font-bold backdrop-blur-md"
                      style={{
                        background: 'var(--color-bg-elevated)',
                        border: `2px solid ${panel.color}`,
                        color: panel.color,
                        boxShadow: `0 0 18px ${panel.color}66`,
                      }}
                    >
                      {panel.number}
                    </span>

                    {/* IMAGE */}
                    <div className={cn('mb-6 lg:mb-0', flip ? 'lg:order-2 lg:pl-10' : 'lg:order-1 lg:pr-10')}>
                      <div className="relative group">
                        <div
                          className="relative aspect-[16/10] rounded-2xl overflow-hidden border transition-transform duration-500"
                          style={{ borderColor: `${panel.color}30`, boxShadow: `0 30px 70px -28px ${panel.color}66` }}
                        >
                          {panel.image ? (
                            <>
                              <Image src={panel.image} alt="" aria-hidden fill className="object-cover scale-110 blur-2xl opacity-30" />
                              <Image src={panel.image} alt={panel.title} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${panel.color}1f 0%, transparent 55%)` }} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            </>
                          ) : (
                            <PanelImagePlaceholder panel={panel} />
                          )}
                          {/* accent underline grows on hover */}
                          <span
                            className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-500 ease-out"
                            style={{ background: panel.color }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div className={cn(flip ? 'lg:order-1 lg:pr-10' : 'lg:order-2 lg:pl-10')}>
                      <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] mb-2 sm:mb-3" style={{ color: panel.color }}>
                        {panel.subtitle}
                      </p>
                      <h3
                        className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 leading-[1.05]"
                        style={{ background: `linear-gradient(135deg, var(--color-text-primary) 0%, ${panel.color} 120%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                      >
                        {panel.title}
                      </h3>
                      <p className="text-sm sm:text-base leading-relaxed text-text-secondary/90 mb-5 max-w-xl">
                        {panel.content}
                      </p>

                      {/* stats */}
                      <div className="flex gap-3 sm:gap-4 mb-5 flex-wrap">
                        {panel.stats.map((stat, j) => (
                          <div
                            key={j}
                            className="relative px-3.5 py-2.5 rounded-xl overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${panel.color}30` }}
                          >
                            <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at center, ${panel.color}40 0%, transparent 70%)` }} />
                            <span className="relative block font-display text-xl sm:text-2xl font-bold text-white">
                              {stat.value}
                              <span className="font-mono text-sm" style={{ color: panel.color }}>{stat.suffix}</span>
                            </span>
                            <span className="relative text-[10px] sm:text-xs text-text-muted">{stat.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* buttons */}
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
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-mono text-xs sm:text-sm tracking-wider transition-all duration-300 hover:scale-105 active:scale-95"
                            style={{ border: `1px solid ${panel.color}`, color: panel.color }}
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
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
