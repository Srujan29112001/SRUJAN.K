'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { gsap } from 'gsap';
import { X, ArrowLeft, Github, ExternalLink, Play, FileText, ArrowUpRight, Clock } from 'lucide-react';
import { Project } from '@/data/projects';
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider';

// The draggable 3D image cluster is client-only (R3F) and only worth loading
// once a project is actually opened.
const ProjectGallery3D = dynamic(() => import('@/components/ui/ProjectGallery3D'), { ssr: false });

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { lenis } = useSmoothScroll();

  useEffect(() => {
    if (isOpen && project) {
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();

      const ctx = gsap.context(() => {
        gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        gsap.fromTo(
          contentRef.current,
          { y: 26, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.05 }
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

  // Esc to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  const accent = project.color || '#06b6d4';
  const images = Array.from(
    new Set(
      [project.image, project.architectureImage, ...((project.gallery || []).map((g) => g.src))].filter(Boolean)
    )
  ) as string[];

  const overview = (project.longDescription || project.description)
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div
      ref={modalRef}
      data-lenis-prevent
      className="fixed inset-0 z-[100000] overflow-y-auto bg-[#070708] custom-scrollbar"
    >
      {/* themed ambient glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: `radial-gradient(circle at 72% 38%, ${accent}24, transparent 58%)` }}
      />
      {/* faint grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(var(--accent-rgb),0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--accent-rgb),0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div ref={contentRef} className="relative min-h-screen flex flex-col text-white">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 sm:px-8 lg:px-12 py-5 sm:py-6">
          <button onClick={onClose} className="group inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-mono text-xs uppercase tracking-[0.22em]">Back</span>
          </button>

          <div
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full border"
            style={{ borderColor: `${accent}4d`, backgroundColor: `${accent}14` }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-wider" style={{ color: accent }}>
              {project.category} System
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2.5 rounded-full border border-white/15 text-white/70 hover:text-white hover:border-white/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 px-5 sm:px-8 lg:px-12 pb-10">
          {/* LEFT — text */}
          <div className="order-2 lg:order-1 max-w-xl lg:py-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] mb-3" style={{ color: accent }}>
              {project.category}{project.year ? ` · ${project.year}` : ''}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.03] tracking-tight mb-5">
              {project.title}
            </h1>

            {/* tag pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tech.slice(0, 6).map((t) => (
                <span
                  key={t}
                  className="px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-wider text-white/70 bg-white/[0.04] border border-white/10"
                >
                  {t}
                </span>
              ))}
            </div>

            {project.metric && (
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-mono mb-6"
                style={{ borderColor: `${accent}55`, backgroundColor: `${accent}14`, color: accent }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                {project.metric}
              </div>
            )}

            {/* overview */}
            <div className="space-y-4 mb-8">
              {overview.map((block, i) => {
                const m = block.match(/^([A-Za-z][A-Za-z0-9 &/'+-]{1,30}?)\s*([—–:])\s+([\s\S]+)$/);
                return (
                  <p key={i} className="text-white/70 leading-relaxed text-sm sm:text-base">
                    {m ? (
                      <>
                        <span className="font-semibold" style={{ color: accent }}>{m[1].trim()}</span>
                        <span className="text-white/40">{m[2] === ':' ? ': ' : ' — '}</span>
                        {m[3].trim()}
                      </>
                    ) : (
                      block
                    )}
                  </p>
                );
              })}
            </div>

            {/* actions */}
            <div className="flex flex-wrap items-center gap-3">
              {project.link ? (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm transition-all hover:brightness-110"
                  style={
                    project.liveApp
                      ? { backgroundColor: '#ef4444', color: '#fff', boxShadow: '0 0 20px rgba(239,68,68,0.4)' }
                      : { backgroundColor: accent, color: '#000', boxShadow: `0 0 20px ${accent}55` }
                  }
                >
                  {project.liveApp ? <ExternalLink className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  {project.liveApp ? 'Try it' : 'See Project'}
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              ) : project.tryItComingSoon ? (
                <span className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/10 text-text-muted font-medium text-sm cursor-default select-none">
                  <Clock className="w-4 h-4" /> Try it · Coming Soon
                </span>
              ) : null}
              {project.github ? (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/15 text-white font-medium text-sm hover:border-white/40 hover:bg-white/5 transition-all"
                >
                  <Github className="w-4 h-4" /> Source
                </a>
              ) : project.sourceComingSoon ? (
                <span className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/10 text-text-muted font-medium text-sm cursor-default select-none">
                  <Github className="w-4 h-4" /> Source · Coming Soon
                </span>
              ) : null}
              {project.documentation && (
                <a
                  href={project.documentation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/15 text-white font-medium text-sm hover:border-white/40 hover:bg-white/5 transition-all"
                >
                  <FileText className="w-4 h-4" /> Docs
                </a>
              )}
            </div>

            {/* meta */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-x-10 gap-y-3 text-sm">
              {project.year && (
                <div>
                  <span className="block text-white/40 text-xs font-mono uppercase tracking-wider mb-1">Year</span>
                  <span className="text-white">{project.year}</span>
                </div>
              )}
              {project.role && (
                <div>
                  <span className="block text-white/40 text-xs font-mono uppercase tracking-wider mb-1">Role</span>
                  <span className="text-white">{project.role}</span>
                </div>
              )}
              <div>
                <span className="block text-white/40 text-xs font-mono uppercase tracking-wider mb-1">Status</span>
                <span className="text-white inline-flex items-center gap-1.5">
                  {project.ongoing ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      Ongoing
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Completed
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT — 3D cluster (desktop) / tilted stack (mobile) */}
          <div className="order-1 lg:order-2 relative">
            {/* desktop: draggable 3D cluster */}
            <div className="hidden md:block lg:sticky lg:top-6 h-[58vh] lg:h-[calc(100vh-8rem)] relative">
              {images.length > 0 && <ProjectGallery3D images={images} color={accent} />}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 pointer-events-none">
                Drag to spin · up / down to tilt · ± to zoom
              </div>
            </div>
            {/* mobile: light tilted image stack */}
            <div className="md:hidden flex flex-col gap-4">
              {images.slice(0, 5).map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-video rounded-2xl overflow-hidden border shadow-xl"
                  style={{ borderColor: `${accent}40`, transform: `rotate(${i % 2 ? 1.4 : -1.4}deg)` }}
                >
                  <Image src={src} alt={project.title} fill className="object-cover" sizes="100vw" />
                </div>
              ))}
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
