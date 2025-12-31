import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects, Project } from '@/data/projects';
import { cn } from '@/lib/utils';
import { ArrowUpRight, Github, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { ProjectModal, useProjectModal } from '@/components/ui/ProjectModal';

gsap.registerPlugin(ScrollTrigger);

type Category = 'AI' | 'Robotics' | 'Research';

const categories: Category[] = ['AI', 'Robotics', 'Research'];

// Define priority projects to be shown first in the grid
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
    const heroRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const projectsHeaderRef = useRef<HTMLDivElement>(null);

    // State to toggle "See More"
    const [isExpanded, setIsExpanded] = useState(false);

    // Reset expansion when category changes
    useEffect(() => {
        setIsExpanded(false);
    }, [activeCategory]);

    // Custom category change handler that preserves scroll position
    const handleCategoryChange = (category: 'AI' | 'Robotics' | 'Research') => {
        const scrollPos = window.scrollY;
        setActiveCategory(category);
        // Restore scroll position after React re-render
        requestAnimationFrame(() => {
            window.scrollTo(0, scrollPos);
        });
    };

    const handleToggle = () => {
        if (isExpanded) {
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
                let scrollTarget = 0;

                if (activeCategory === 'AI') {
                    // AI has more projects, scroll to main Projects header
                    const container = document.getElementById('projects');
                    if (container) {
                        scrollTarget = container.getBoundingClientRect().top + window.scrollY;
                    }
                } else {
                    // Robotics and Research - scroll to sub-header
                    if (projectsHeaderRef.current) {
                        scrollTarget = projectsHeaderRef.current.getBoundingClientRect().top + window.scrollY - 100;
                    }
                }

                // Scroll first
                window.scrollTo({ top: scrollTarget, behavior: 'instant' });

                // Collapse after scroll with slightly longer delay for reliability
                setTimeout(() => {
                    setIsExpanded(false);
                }, 100);
            });
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

    // Process remaining projects: Sort by priority, then filter out the featured one
    const remainingProjects = filteredProjects
        .filter((p) => p.id !== featuredProject.id)
        .sort((a, b) => {
            const priorities = PRIORITY_IDS[activeCategory] || [];
            const indexA = priorities.indexOf(a.id);
            const indexB = priorities.indexOf(b.id);

            // If both are in priority list, sort by index
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            // If only A is in list, it comes first
            if (indexA !== -1) return -1;
            // If only B is in list, it comes first
            if (indexB !== -1) return 1;
            // Otherwise maintain original order
            return 0;
        });

    const visibleProjects = isExpanded ? remainingProjects : remainingProjects.slice(0, 6);

    // Initial mount animation only (no re-run on category change to avoid scroll jumps)
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero Animation
            gsap.from(heroRef.current, {
                opacity: 0,
                y: 50,
                duration: 1.5,
                ease: "power3.out"
            });
        }, containerRef);

        return () => ctx.revert();
    }, []); // Only run once on mount

    return (
        <div id="projects" ref={containerRef} className="relative min-h-screen bg-black text-white overflow-hidden">
            {/* Header & Navigation (Sci-Fi HUD Style) */}
            <div className="absolute top-6 sm:top-8 left-0 right-0 z-50 text-center pointer-events-none px-4">
                {/* Blue Glow Effect behind entire header area */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[300px] sm:h-[400px] bg-blue-600/20 blur-[120px] rounded-full -z-10 pointer-events-none" />

                {/* Centered header content */}
                <div className="flex flex-col items-center">
                    <div className="inline-block bg-black/50 px-4 sm:px-6 py-2 border border-cyan-500/30 rounded-full backdrop-blur-md pointer-events-auto">
                        <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-cyan-400">
                            Innovation Lab
                        </span>
                    </div>

                    <h2 className="mt-4 sm:mt-5 md:mt-6 font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight pointer-events-auto px-2">
                        PROJECT ARCHIVES
                    </h2>

                    <div className="mt-6 sm:mt-7 md:mt-8 pointer-events-auto flex flex-wrap justify-center gap-3 sm:gap-4">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={cn(
                                    "group relative px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 overflow-hidden rounded-none skew-x-[-10deg] border border-white/10 transition-all duration-300 backdrop-blur-md active:scale-95",
                                    activeCategory === cat
                                        ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
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
            </div>

            {/* Featured Hero Section */}
            <div ref={heroRef} className="relative min-h-screen flex justify-center overflow-hidden pb-6 sm:pb-8 pt-48 sm:pt-40 md:pt-48">
                {/* Background Image with Parallax */}
                <div className="absolute inset-0 hero-bg">
                    <Image
                        src={
                            activeCategory === 'AI'
                                ? '/images/projects/hero-ai.png'
                                : activeCategory === 'Robotics'
                                    ? '/images/projects/hero-robotics.png'
                                    : '/images/projects/hero-research.png'
                        }
                        alt={`${activeCategory} Hero`}
                        fill
                        className="object-cover opacity-40"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-black" />
                </div>

                {/* Featured Project Content */}
                <div className="relative z-10 container mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center mt-8 sm:mt-10 md:mt-12">
                    <div className="space-y-4 sm:space-y-5 md:space-y-6">
                        <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] sm:text-xs font-medium tracking-wider uppercase">Featured Project</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight">
                            {featuredProject.title}
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/70 max-w-xl leading-relaxed">
                            {featuredProject.longDescription || featuredProject.description}
                        </p>

                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {featuredProject.tech.map((t) => (
                                <span key={t} className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-white/10 border border-white/10 rounded-md">
                                    {t}
                                </span>
                            ))}
                        </div>

                        <div className="flex gap-3 sm:gap-4 pt-2 sm:pt-4">
                            <button
                                onClick={() => openModal(featuredProject)}
                                className="group flex items-center gap-2 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors active:scale-95 text-sm sm:text-base"
                            >
                                View Details <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Architecture/Visual Display */}
                    <div
                        className="relative aspect-video rounded-lg sm:rounded-xl overflow-hidden border border-white/10 shadow-2xl group cursor-pointer"
                        onClick={() => openModal(featuredProject)}
                    >
                        <Image
                            src={featuredProject.architectureImage || featuredProject.image}
                            alt={featuredProject.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                        {/* Hover Hint */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-xs sm:text-sm border border-white/20">
                                Click to Expand
                            </span>
                        </div>

                        {/* Floating Stats/Metrics if available */}
                        {featuredProject.metric && (
                            <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-3 sm:left-4 md:left-6 right-3 sm:right-4 md:right-6 p-3 sm:p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg">
                                <p className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wider">Key Metric</p>
                                <p className="text-base sm:text-lg md:text-xl font-semibold text-white">{featuredProject.metric}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 sm:gap-2 opacity-50 animate-bounce z-20">
                    <span className="text-[10px] sm:text-xs uppercase tracking-widest">Scroll to Explore</span>
                    <div className="w-[1px] h-8 sm:h-10 md:h-12 bg-gradient-to-b from-white to-transparent" />
                </div>
            </div>

            {/* Project Grid */}
            <div className="container mx-auto px-4 sm:px-6 pt-0 pb-16 sm:pb-20 md:pb-24">
                <div ref={projectsHeaderRef} className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 sm:mb-10 md:mb-12 gap-4 sm:gap-0">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">More in {activeCategory}</h2>
                        <p className="text-sm sm:text-base text-white/50">Exploring the frontiers of {activeCategory.toLowerCase()}</p>
                    </div>
                    <div className="text-left sm:text-right">
                        <span className="text-3xl sm:text-4xl font-bold text-white/10">{remainingProjects.length}</span>
                        <span className="text-xs sm:text-sm text-white/30 block uppercase tracking-wider">Projects</span>
                    </div>
                </div>

                <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                    {visibleProjects.map((project) => {
                        // 3D Tilt card with cursor tracking
                        return (
                            <div
                                key={project.id}
                                className="group relative perspective-1000 h-full"
                                onClick={() => openModal(project)}
                            >
                                <div
                                    className="relative h-full flex flex-col bg-white/5 border border-white/5 rounded-xl overflow-hidden hover:border-white/20 cursor-pointer transform-gpu"
                                    style={{ transformStyle: 'preserve-3d', transition: 'transform 0.1s ease-out, border-color 0.3s' }}
                                    onMouseMove={(e) => {
                                        const card = e.currentTarget;
                                        const rect = card.getBoundingClientRect();
                                        const x = e.clientX - rect.left;
                                        const y = e.clientY - rect.top;
                                        const centerX = rect.width / 2;
                                        const centerY = rect.height / 2;
                                        const rotateX = ((y - centerY) / centerY) * -15;
                                        const rotateY = ((x - centerX) / centerX) * 15;
                                        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                                        // Update shine position
                                        const shine = card.querySelector('.card-shine') as HTMLElement;
                                        if (shine) {
                                            shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15) 0%, transparent 60%)`;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        const card = e.currentTarget;
                                        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
                                        const shine = card.querySelector('.card-shine') as HTMLElement;
                                        if (shine) {
                                            shine.style.background = 'transparent';
                                        }
                                    }}
                                >
                                    {/* Shine overlay */}
                                    <div className="card-shine absolute inset-0 z-20 pointer-events-none transition-all duration-150" />

                                    <div className="relative h-40 sm:h-44 md:h-48 flex-shrink-0 overflow-hidden">
                                        <Image
                                            src={project.image}
                                            alt={project.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    </div>
                                    <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-grow">
                                        <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors line-clamp-1">{project.title}</h3>
                                        <p className="text-white/50 text-xs sm:text-sm line-clamp-2 flex-grow">{project.description}</p>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                                            {project.tech.slice(0, 3).map((t) => (
                                                <span key={t} className="px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs bg-white/5 border border-white/10 rounded">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* See More / Show Less Button */}
                {remainingProjects.length > 3 && (
                    <div className="flex justify-center mt-8 sm:mt-10 md:mt-12">
                        <button
                            onClick={handleToggle}
                            className="group flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 border border-white/20 rounded-full text-white/70 hover:text-white hover:border-white/50 transition-colors active:scale-95 text-sm sm:text-base"
                        >
                            {isExpanded ? (
                                <>
                                    Show Less <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                </>
                            ) : (
                                <>
                                    See More Projects <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                                </>
                            )}
                        </button>
                    </div>
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
