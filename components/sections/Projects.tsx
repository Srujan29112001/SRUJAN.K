'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { projects, Project } from '@/data/projects';
import { cn } from '@/lib/utils';
import { ProjectModal, useProjectModal } from '@/components/ui/ProjectModal';
import { GlitchArrow } from '@/components/ui/AnimatedSVG';

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick: () => void;
}

function ProjectCard({ project, index, onClick }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      gsap.to(card, {
        rotateX,
        rotateY,
        transformPerspective: 1000,
        duration: 0.3,
        ease: 'power2.out',
      });

      gsap.to(card.querySelector('.project-image'), {
        scale: 1.1,
        duration: 0.5,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)',
      });

      gsap.to(card.querySelector('.project-image'), {
        scale: 1,
        duration: 0.5,
      });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={cn(
        'project-card group relative cursor-pointer overflow-hidden rounded-2xl bg-bg-surface transition-shadow duration-300 hover:shadow-2xl',
        index === 0 && 'md:col-span-2 md:row-span-2'
      )}
      style={{
        transformStyle: 'preserve-3d',
        boxShadow: `0 0 0 1px ${project.color}20`,
      }}
    >
      {/* Image */}
      <div
        className={cn(
          'project-image relative overflow-hidden',
          index === 0 ? 'aspect-[16/10]' : 'aspect-[4/3]'
        )}
      >
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-bg-surface via-bg-surface/50 to-transparent" />
        <div
          className="absolute inset-0 transition-transform duration-500"
          style={{
            background: `linear-gradient(135deg, ${project.color}40 0%, ${project.color}10 100%)`,
          }}
        />
        {/* Placeholder pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, ${project.color}40 0%, transparent 30%),
              radial-gradient(circle at 80% 80%, ${project.color}30 0%, transparent 30%)
            `,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 p-6">
        {/* Category */}
        <span
          className="mb-2 inline-block font-mono text-xs uppercase tracking-wider"
          style={{ color: project.color }}
        >
          {project.category}
        </span>

        {/* Title */}
        <h3
          className={cn(
            'mb-2 font-display font-bold text-white',
            index === 0 ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'
          )}
        >
          {project.title}
        </h3>

        {/* Metric */}
        <p className="mb-3 text-lg font-medium text-white/80">{project.metric}</p>

        {/* Description */}
        <p
          className={cn(
            'mb-4 text-text-muted',
            index === 0 ? 'text-base' : 'text-sm line-clamp-2'
          )}
        >
          {project.description}
        </p>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-2">
          {project.tech.slice(0, index === 0 ? 4 : 3).map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-white/5 px-3 py-1 text-xs text-text-secondary"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* View project button */}
        <div className="mt-4 flex items-center gap-2 font-mono text-sm text-text-muted opacity-0 transition-all duration-300 group-hover:opacity-100">
          <span>View Project</span>
          <GlitchArrow size={20} color="currentColor" direction="right" />
        </div>
      </div>

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at center, ${project.color}10 0%, transparent 70%)`,
        }}
      />

      {/* Corner decoration */}
      <div
        className="absolute right-0 top-0 h-20 w-20 opacity-20"
        style={{
          background: `linear-gradient(135deg, ${project.color} 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const { selectedProject, isOpen, openModal, closeModal } = useProjectModal();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section title animation
      gsap.from('.projects-header', {
        opacity: 0,
        y: 60,
        duration: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Cards stagger animation
      gsap.from('.project-card', {
        opacity: 0,
        y: 60,
        duration: 0.8,
        stagger: 0.15,
        scrollTrigger: {
          trigger: '.projects-grid',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative overflow-hidden bg-bg-elevated py-24 md:py-32"
    >
      <div className="container-custom">
        {/* Section header */}
        <div className="projects-header mb-16 flex flex-col justify-between gap-6 md:mb-20 md:flex-row md:items-end">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              Featured Work
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              Projects
            </h2>
            <p className="mt-4 max-w-xl text-lg text-text-secondary">
              From defense AI to healthcare systems — building intelligence that matters.
            </p>
          </div>

          <a
            href="https://github.com/srujan29112001"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 font-mono text-sm text-text-muted transition-colors hover:text-primary"
          >
            View all on GitHub
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>

        {/* Projects grid */}
        <div className="projects-grid grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              onClick={() => openModal(project)}
            />
          ))}
        </div>
      </div>

      {/* Background decoration */}
      <div
        className="absolute right-0 top-1/4 h-[600px] w-[600px] rounded-full opacity-5 blur-3xl"
        style={{ background: 'var(--gradient-primary)' }}
      />

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isOpen}
        onClose={closeModal}
      />
    </section>
  );
}
