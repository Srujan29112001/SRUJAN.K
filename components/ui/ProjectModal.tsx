'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { X, Github, ExternalLink, Play, FileText, ChevronRight, ChevronLeft } from 'lucide-react';
import { Project } from '@/data/projects';
import { cn } from '@/lib/utils';
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider';

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { lenis } = useSmoothScroll();

  useEffect(() => {
    if (isOpen && project) {
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();

      const ctx = gsap.context(() => {
        gsap.fromTo(
          modalRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: 'power2.out' }
        );

        gsap.fromTo(
          contentRef.current,
          { scale: 0.95, opacity: 0, y: 20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.2)', delay: 0.1 }
        );
      }, modalRef);

      return () => {
        ctx.revert();
        if (lenis) lenis.start();
      };
    } else {
      document.body.style.overflow = 'unset';
      if (lenis) lenis.start();
    }
  }, [isOpen, project, lenis]);

  if (!isOpen || !project) return null;

  // Combine main image and gallery for the carousel
  const slides = [
    { src: project.image, alt: project.title, caption: 'Project Preview' },
    ...(project.gallery || [])
  ];

  const nextSlide = () => {
    setCurrentImageIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentImageIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[100] overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md -z-10"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="min-h-screen flex items-start sm:items-center justify-center px-2 sm:px-4 md:px-6 pt-16 pb-48 sm:pt-4 sm:pb-12 md:py-0">
        <div
          ref={contentRef}
          data-lenis-prevent
          className="relative w-full max-w-6xl my-2 sm:my-auto bg-black/90 border border-cyan-500/30 rounded-lg sm:rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] custom-scrollbar"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="fixed top-4 right-4 sm:top-24 sm:right-8 md:right-12 z-[10000] p-3 sm:p-4 rounded-full bg-cyan-500 hover:bg-cyan-400 transition-all duration-300 border-2 border-white shadow-2xl hover:shadow-cyan-500/80 hover:scale-110 group"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:rotate-90 transition-transform duration-300 stroke-[3]" />
          </button>

          {/* Carousel Section */}
          <div className="relative w-full h-[30vh] sm:h-[40vh] md:h-[50vh] min-h-[250px] sm:min-h-[300px] md:min-h-[400px] overflow-hidden group bg-black">
            {/* Images */}
            {slides.map((slide, index) => (
              <div
                key={index}
                className={cn(
                  "absolute inset-0 transition-opacity duration-500 ease-in-out",
                  index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                )}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt || project.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              </div>
            ))}

            {/* Navigation Arrows */}
            {slides.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/50 border border-white/10 text-white hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all backdrop-blur-sm group/nav"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover/nav:-translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/50 border border-white/10 text-white hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all backdrop-blur-sm group/nav"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover/nav:translate-x-0.5 transition-transform" />
                </button>

                {/* Slide Indicators */}
                <div className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 z-30 flex gap-1.5 sm:gap-2">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                      className={cn(
                        "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300",
                        idx === currentImageIndex
                          ? "w-6 sm:w-8 bg-cyan-400"
                          : "bg-white/30 hover:bg-white/50"
                      )}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Project Title Overlay (Always visible) */}
            <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-8 w-full z-20 pointer-events-none">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 mb-2 sm:mb-4 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] sm:text-xs font-mono font-medium tracking-wider text-cyan-300 uppercase">
                  {project.category} System
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-white mb-1 sm:mb-2 leading-tight">
                {project.title}
              </h2>
              <div className="flex flex-col md:flex-row md:items-center gap-2 sm:gap-4">
                {project.metric && (
                  <p className="text-sm sm:text-base md:text-lg text-cyan-400 font-mono flex items-center gap-2">
                    <span className="w-4 sm:w-8 h-[1px] bg-cyan-500/50" />
                    {project.metric}
                  </p>
                )}
                {/* Current Slide Caption */}
                {slides[currentImageIndex].caption && (
                  <div className="flex items-center gap-2">
                    <span className="hidden md:block w-1 h-1 rounded-full bg-white/30" />
                    <p className="text-xs sm:text-sm text-white/60 font-mono bg-black/50 px-2 sm:px-3 py-0.5 sm:py-1 rounded border border-white/10 backdrop-blur-md">
                      {slides[currentImageIndex].caption}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8 lg:p-10 pb-8 sm:pb-6 md:pb-8 lg:pb-10 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8 lg:space-y-10">
              {/* Description */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                  Project Overview
                </h3>
                <p className="text-white/70 leading-relaxed text-sm sm:text-base lg:text-lg">
                  {project.longDescription || project.description}
                </p>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Actions Card */}
              <div className="p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <h3 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-white/50 mb-4 sm:mb-6">
                  Project Actions
                </h3>
                <div className="flex flex-col gap-2 sm:gap-3">
                  {project.link ? (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-cyan-500 text-black font-bold text-sm sm:text-base rounded-lg sm:rounded-xl hover:bg-cyan-400 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                    >
                      <div className="p-0.5 sm:p-1 bg-black/10 rounded-full">
                        <Play className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                      </div>
                      View Live Demo
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-white/5 text-white/30 font-bold text-sm sm:text-base rounded-lg sm:rounded-xl cursor-not-allowed border border-white/5"
                    >
                      <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                      Demo Unavailable
                    </button>
                  )}

                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-black/40 border border-white/10 text-white font-medium text-sm sm:text-base rounded-lg sm:rounded-xl hover:bg-white/5 transition-all hover:border-white/30"
                    >
                      <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                      View Source Code
                    </a>
                  )}

                  {project.documentation ? (
                    <a
                      href={project.documentation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-black/40 border border-white/10 text-white font-medium text-sm sm:text-base rounded-lg sm:rounded-xl hover:bg-white/5 transition-all hover:border-white/30"
                    >
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      View Documentation
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-white/5 text-white/30 font-medium text-sm sm:text-base rounded-lg sm:rounded-xl cursor-not-allowed border border-white/5"
                    >
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      Documentation
                    </button>
                  )}
                </div>
              </div>

              {/* Tech Stack */}
              <div className="p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
                <h4 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-white/50 mb-3 sm:mb-4">
                  Tech Stack
                </h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-black/50 border border-white/10 rounded-md sm:rounded-lg text-cyan-300/80 hover:border-cyan-500/30 transition-colors cursor-default"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Meta Info */}
              <div className="p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 space-y-3 sm:space-y-4">
                {project.year && (
                  <div className="flex justify-between items-center border-b border-white/5 pb-2 sm:pb-3">
                    <span className="text-xs sm:text-sm text-white/50">Year</span>
                    <span className="font-mono text-sm sm:text-base text-white">{project.year}</span>
                  </div>
                )}
                {project.role && (
                  <div className="flex justify-between items-center border-b border-white/5 pb-2 sm:pb-3">
                    <span className="text-xs sm:text-sm text-white/50">Role</span>
                    <span className="font-mono text-sm sm:text-base text-white">{project.role}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-white/50">Status</span>
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-medium border border-emerald-500/30">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export a hook for managing modal state
export function useProjectModal() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openModal = (project: Project) => {
    setSelectedProject(project);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => setSelectedProject(null), 300);
  };

  return {
    selectedProject,
    isOpen,
    openModal,
    closeModal,
  };
}
