'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects, Project } from '@/data/projects';
import { getLenis } from '@/lib/lenis';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react';
import { ProjectModal, useProjectModal } from '@/components/ui/ProjectModal';
import { Reveal } from '@/components/ui/Reveal';
import { HighlightsFan } from '@/components/ui/HighlightsFan';

gsap.registerPlugin(ScrollTrigger);

type Category = 'AI' | 'Robotics' | 'Research';

const categories: Category[] = ['AI', 'Robotics', 'Research'];

// The narrative spine — same three "chapters" as the Skills section, so the
// portfolio reads as one continuous story (the Mind / the Body / the Why).
const STORY: Record<Category, { chapter: string; tagline: string; line: string }> = {
    AI: {
        chapter: 'Chapter I — The Mind',
        tagline: 'Intelligence, architected',
        line: 'Systems that see, read, reason and decide — multimodal copilots, RAG pipelines and autonomous agents that turn raw data into action.',
    },
    Robotics: {
        chapter: 'Chapter II — The Body',
        tagline: 'Intelligence, made physical',
        line: 'Perception, control and edge inference that leave the screen — vision, gesture and motion running in the real world.',
    },
    Research: {
        chapter: 'Chapter III — The Why',
        tagline: 'Intelligence, questioned',
        line: 'Curiosity as a discipline — chaos, consciousness, quantum and cosmos, explored in code for the sake of understanding.',
    },
};

const CAT_COLOR: Record<Category, string> = {
    AI: '#3B82F6',
    Robotics: '#F59E0B',
    Research: '#8B7EC8',
};

// Define priority projects to be shown first in the list
const PRIORITY_IDS: Record<Category, string[]> = {
    AI: ['clinical-ai-copilot', 'neuropsych-trading', 'advisory-platform'],
    Robotics: ['internship-semester', 'hand-gesture-cursor', 'bicep-curl-counter'],
    Research: ['space-debris', 'quantum-particle', 'cellular-automata']
};

interface ProjectsShowcaseProps {
    activeCategory: 'AI' | 'Robotics' | 'Research';
    setActiveCategory: (category: 'AI' | 'Robotics' | 'Research') => void;
}

export default function ProjectsShowcase({ activeCategory, setActiveCategory }: ProjectsShowcaseProps) {
    const { selectedProject, isOpen, openModal, closeModal } = useProjectModal();
    const containerRef = useRef<HTMLDivElement>(null);
    const projectsHeaderRef = useRef<HTMLDivElement>(null);

    // State to toggle "See More"
    const [isExpanded, setIsExpanded] = useState(false);

    // Editorial hover-reveal list: which row is hovered + a cursor-following
    // preview image. `preview` keeps the last image so it can fade out cleanly.
    const [hovered, setHovered] = useState<Project | null>(null);
    const [preview, setPreview] = useState<Project | null>(null);
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const px = useSpring(mx, { stiffness: 350, damping: 30, mass: 0.4 });
    const py = useSpring(my, { stiffness: 350, damping: 30, mass: 0.4 });

    // Reset expansion when category changes
    useEffect(() => {
        setIsExpanded(false);
        setHovered(null);
    }, [activeCategory]);

    // Custom category change handler that preserves scroll position
    const handleCategoryChange = (category: 'AI' | 'Robotics' | 'Research') => {
        const scrollPos = window.scrollY;
        setActiveCategory(category);
        requestAnimationFrame(() => {
            window.scrollTo(0, scrollPos);
        });
    };

    const handleToggle = () => {
        if (isExpanded) {
            // Collapse FIRST, then jump back up to the "More in …" header. The
            // list shrinks a lot, so we hand Lenis the target ELEMENT (it computes
            // the position itself), resize() it so it knows the new page height,
            // and force the jump — plain window.scrollTo is overridden by Lenis.
            setIsExpanded(false);
            setTimeout(() => {
                const headerEl = projectsHeaderRef.current;
                const lenis = getLenis();
                if (lenis && headerEl) {
                    lenis.resize();
                    lenis.scrollTo(headerEl, { offset: -100, immediate: true, force: true });
                } else if (headerEl) {
                    window.scrollTo(0, headerEl.getBoundingClientRect().top + window.scrollY - 100);
                }
                setTimeout(() => ScrollTrigger.refresh(), 60);
            }, 120);
        } else {
            setIsExpanded(true);
        }
    };

    // Soft refresh for ScrollTrigger when content height changes
    useEffect(() => {
        const timer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 300);
        return () => clearTimeout(timer);
    }, [isExpanded, activeCategory]);

    const filteredProjects = projects.filter((p) => p.category === activeCategory);
    const featuredProject = filteredProjects.find((p) => p.featured) || filteredProjects[0];

    const remainingProjects = filteredProjects
        .filter((p) => p.id !== featuredProject.id)
        .sort((a, b) => {
            const priorities = PRIORITY_IDS[activeCategory] || [];
            const indexA = priorities.indexOf(a.id);
            const indexB = priorities.indexOf(b.id);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return 0;
        });

    // First six (featured first, then by priority) become the Highlights fan;
    // the rest fall through to the editorial list below it.
    const ordered = [featuredProject, ...remainingProjects];
    const highlights = ordered.slice(0, 6);
    const listProjects = ordered.slice(6);
    const visibleList = isExpanded ? listProjects : listProjects.slice(0, 6);

    const accent = CAT_COLOR[activeCategory];
    const story = STORY[activeCategory];
    const heroSrc =
        activeCategory === 'AI'
            ? '/images/projects/hero-ai.png'
            : activeCategory === 'Robotics'
                ? '/images/projects/hero-robotics.png'
                : '/images/projects/hero-research.png';

    const handleListMove = (e: React.MouseEvent) => {
        mx.set(e.clientX - 170);
        my.set(e.clientY - 115);
    };

    return (
        <div
            id="projects"
            ref={containerRef}
            className="relative bg-black text-white overflow-hidden pt-28 sm:pt-32 md:pt-36 pb-16 sm:pb-20 md:pb-24"
        >
            {/* Category backdrop image (crossfades on category change) + grid + glow */}
            <div className="absolute inset-0 pointer-events-none">
                <AnimatePresence mode="sync">
                    <motion.div
                        key={activeCategory}
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.12 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.9, ease: 'easeInOut' }}
                    >
                        <Image src={heroSrc} alt="" fill className="object-cover" priority />
                    </motion.div>
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black/85 to-black" />
                {/* background grid removed — distracting to read over in light mode */}
                <div
                    className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[150px] mix-blend-screen transition-colors duration-700"
                    style={{ backgroundColor: `${accent}22` }}
                />
            </div>

            {/* Cursor-following preview (desktop only) */}
            <motion.div
                className="hidden lg:block pointer-events-none fixed top-0 left-0 z-[60] w-[340px] h-[230px] rounded-2xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
                style={{ x: px, y: py }}
                animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.82 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
                {preview && (
                    <Image src={preview.image} alt="" fill className="object-cover" sizes="340px" />
                )}
                <div
                    className="absolute inset-0 rounded-2xl"
                    style={{ boxShadow: `inset 0 0 0 1.5px ${preview?.color || accent}99` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </motion.div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <Reveal className="mb-10 sm:mb-12 md:mb-16" amount={0.4}>
                    <div className="flex items-center gap-3 mb-5 sm:mb-6">
                        <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.3em]" style={{ color: accent }}>
                            ( Selected Work )
                        </span>
                        <span className="h-px flex-grow bg-white/10" />
                        <span className="font-mono text-[11px] sm:text-xs text-white/30 tabular-nums">
                            {String(filteredProjects.length).padStart(2, '0')} Projects
                        </span>
                    </div>
                    <h2 className="font-display text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-bold text-white tracking-[-0.03em] leading-[0.9]">
                        PROJECT<br className="sm:hidden" /> ARCHIVES
                    </h2>

                    {/* Per-category narrative */}
                    <div className="mt-4 sm:mt-5 min-h-[3.5rem] sm:min-h-[3rem] max-w-2xl">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={activeCategory}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.35, ease: 'easeOut' }}
                                className="text-base sm:text-lg text-text-secondary"
                            >
                                {story.line}
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    {/* Category tabs — editorial underline toggles */}
                    <div className="mt-7 sm:mt-9 flex items-center gap-6 sm:gap-10">
                        {categories.map((cat) => {
                            const isActive = activeCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryChange(cat)}
                                    className="relative group pb-2"
                                >
                                    <span
                                        className={cn(
                                            'font-display text-lg sm:text-2xl font-bold tracking-tight transition-colors duration-300',
                                            isActive ? 'text-white' : 'text-white/35 group-hover:text-white/70'
                                        )}
                                    >
                                        {cat}
                                    </span>
                                    {isActive && (
                                        <motion.span
                                            layoutId="cat-underline"
                                            className="absolute left-0 right-0 -bottom-px h-[2px]"
                                            style={{ backgroundColor: accent }}
                                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </Reveal>

                {/* Highlights — the first six projects as a fanned, themed gallery */}
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em]" style={{ color: accent }}>
                        {story.chapter}
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] sm:text-xs font-medium tracking-wider uppercase text-white/70">Highlights</span>
                    </span>
                </div>
                <HighlightsFan key={activeCategory} projects={highlights} accent={accent} onOpen={openModal} />

                {listProjects.length > 0 && (
                <>
                {/* List header */}
                <div
                    ref={projectsHeaderRef}
                    className="flex items-end justify-between mb-2 sm:mb-4 gap-4"
                >
                    <Reveal direction="right" amount={0.6}>
                        <p className="font-mono text-xs uppercase tracking-[0.25em] mb-2" style={{ color: accent }}>
                            {story.tagline}
                        </p>
                        <h3 className="text-2xl sm:text-3xl font-bold">The {activeCategory} index</h3>
                    </Reveal>
                    <span className="hidden sm:block font-mono text-xs text-white/30 pb-1">
                        Hover to preview · click to open
                    </span>
                </div>

                {/* Editorial hover-reveal list */}
                <div
                    className="relative"
                    onMouseMove={handleListMove}
                    onMouseLeave={() => setHovered(null)}
                >
                    {visibleList.map((project, i) => {
                        const pAccent = project.color || accent;
                        return (
                            <Reveal key={project.id} delay={Math.min(i, 6) * 0.04} amount={0.2}>
                                <button
                                    onClick={() => openModal(project)}
                                    onMouseEnter={() => { setHovered(project); setPreview(project); }}
                                    style={{ '--accent': pAccent } as React.CSSProperties}
                                    className="group relative w-full text-left border-t border-white/10 py-5 sm:py-7 flex items-center gap-3 sm:gap-6"
                                >
                                    {/* hover fill */}
                                    <span
                                        className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        style={{ background: `linear-gradient(90deg, ${pAccent}1f, transparent 70%)` }}
                                    />

                                    {/* index */}
                                    <span className="font-mono text-[11px] sm:text-sm text-white/30 w-7 sm:w-10 shrink-0 tabular-nums group-hover:[color:var(--accent)] transition-colors">
                                        {String(i + 7).padStart(2, '0')}
                                    </span>

                                    {/* mobile thumbnail (no hover on touch) */}
                                    <span className="lg:hidden relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-white/10">
                                        <Image src={project.image} alt={project.title} fill className="object-cover" sizes="56px" />
                                        {project.ongoing && (
                                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-black" />
                                        )}
                                    </span>

                                    {/* title + meta */}
                                    <span className="flex-grow min-w-0">
                                        <span className="flex items-center gap-2 sm:gap-3">
                                            <span className="block font-display font-bold text-xl sm:text-3xl lg:text-4xl xl:text-5xl leading-[1.05] tracking-tight truncate transition-all duration-300 group-hover:translate-x-1.5 sm:group-hover:translate-x-3 group-hover:[color:var(--accent)]">
                                                {project.title}
                                            </span>
                                            {project.ongoing && (
                                                <span className="hidden sm:inline-flex shrink-0 items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/40 text-[10px] font-semibold uppercase tracking-wider text-red-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                    Ongoing
                                                </span>
                                            )}
                                        </span>
                                        <span className="mt-1.5 sm:mt-2 flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-white/40 font-mono uppercase tracking-wider">
                                            <span>{project.category}</span>
                                            {project.year && (<><span className="text-white/20">/</span><span>{project.year}</span></>)}
                                            {project.metric && (<><span className="hidden sm:inline text-white/20">/</span><span className="hidden sm:inline truncate max-w-[16rem]">{project.metric}</span></>)}
                                        </span>
                                    </span>

                                    {/* tech (wide screens) */}
                                    <span className="hidden xl:flex gap-2 shrink-0">
                                        {project.tech.slice(0, 3).map((t) => (
                                            <span key={t} className="px-2.5 py-1 text-[11px] font-mono text-white/50 bg-white/[0.04] border border-white/10 rounded-md">
                                                {t}
                                            </span>
                                        ))}
                                    </span>

                                    {/* arrow */}
                                    <ArrowUpRight className="shrink-0 w-5 h-5 sm:w-7 sm:h-7 text-white/25 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:[color:var(--accent)]" />
                                </button>
                            </Reveal>
                        );
                    })}
                    {/* closing rule */}
                    <div className="border-t border-white/10" />
                </div>

                {/* See More / Show Less Button */}
                {listProjects.length > 6 && (
                    <div className="flex justify-center mt-8 sm:mt-10 md:mt-12">
                        <button
                            onClick={handleToggle}
                            className="group flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 border border-white/20 rounded-full text-white/70 hover:text-white hover:border-white/50 transition-colors active:scale-95 text-sm sm:text-base"
                        >
                            {isExpanded ? (
                                <>Show Less <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /></>
                            ) : (
                                <>See all {filteredProjects.length} projects <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" /></>
                            )}
                        </button>
                    </div>
                )}
                </>
                )}
            </div>

            {/* Project Modal */}
            <ProjectModal
                project={selectedProject}
                isOpen={isOpen}
                onClose={closeModal}
            />
        </div>
    );
}
