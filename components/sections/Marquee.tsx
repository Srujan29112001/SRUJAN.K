'use client';

import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';

interface MarqueeProps {
  texts: string[];
  speed?: number;
  direction?: 'left' | 'right';
  separator?: string;
  className?: string;
}

export function Marquee({
  texts,
  speed = 50,
  direction = 'left',
  separator = ' — ',
  className = '',
}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const width = track.offsetWidth / 2;
    const duration = width / speed;

    gsap.to(track, {
      x: direction === 'left' ? -width : width,
      duration,
      ease: 'none',
      repeat: -1,
    });
  }, [speed, direction]);

  const repeatedTexts = [...texts, ...texts, ...texts, ...texts];
  const content = repeatedTexts.join(separator) + separator;

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden whitespace-nowrap py-8 ${className}`}
    >
      <div ref={trackRef} className="inline-block">
        <span className="font-display text-6xl font-bold text-white/[0.03] md:text-8xl lg:text-9xl">
          {content}
        </span>
      </div>
    </div>
  );
}

// Marquee section between portfolio sections
export function MarqueeDivider({
  texts = ['AI/ML', 'ROBOTICS', 'DEFENSE', 'RESEARCH', 'INNOVATION'],
  className = '',
}: {
  texts?: string[];
  className?: string;
}) {
  return (
    <section className={`relative overflow-hidden bg-bg-base py-4 ${className}`}>
      {/* Top line */}
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Marquees in opposite directions */}
      <Marquee texts={texts} speed={40} direction="left" />
      <Marquee texts={texts} speed={30} direction="right" />

      {/* Bottom line */}
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}

// Skills marquee with icons
export function SkillsMarquee({
  skills = [
    { name: 'PyTorch', icon: '🔥' },
    { name: 'TensorFlow', icon: '🧠' },
    { name: 'ROS2', icon: '🤖' },
    { name: 'Computer Vision', icon: '👁️' },
    { name: 'NLP', icon: '💬' },
    { name: 'Edge AI', icon: '⚡' },
    { name: 'LangChain', icon: '🔗' },
    { name: 'Isaac Sim', icon: '🎮' },
  ],
  className = '',
}: {
  skills?: Array<{ name: string; icon: string }>;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const width = track.offsetWidth / 2;

    gsap.to(track, {
      x: -width,
      duration: width / 30,
      ease: 'none',
      repeat: -1,
    });
  }, []);

  const repeatedSkills = [...skills, ...skills, ...skills, ...skills];

  return (
    <div className={`overflow-hidden py-6 ${className}`}>
      <div ref={trackRef} className="flex gap-8">
        {repeatedSkills.map((skill, i) => (
          <div
            key={i}
            className="flex flex-shrink-0 items-center gap-3 rounded-full border border-white/10 bg-bg-surface/50 px-6 py-3 backdrop-blur-sm"
          >
            <span className="text-xl">{skill.icon}</span>
            <span className="font-mono text-sm text-white/70">{skill.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Stats counter marquee
export function StatsMarquee({
  stats = [
    { value: '40+', label: 'Projects' },
    { value: '98.75%', label: 'Accuracy' },
    { value: '38', label: 'AI Agents' },
    { value: '8mo', label: 'DRDO' },
    { value: '2yr', label: 'Research' },
  ],
  className = '',
}: {
  stats?: Array<{ value: string; label: string }>;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const width = track.offsetWidth / 2;

    gsap.to(track, {
      x: -width,
      duration: width / 25,
      ease: 'none',
      repeat: -1,
    });
  }, []);

  const repeatedStats = [...stats, ...stats, ...stats, ...stats];

  return (
    <div className={`overflow-hidden border-y border-white/5 py-8 ${className}`}>
      <div ref={trackRef} className="flex gap-16">
        {repeatedStats.map((stat, i) => (
          <div key={i} className="flex flex-shrink-0 items-baseline gap-3">
            <span className="font-display text-4xl font-bold text-primary md:text-5xl">
              {stat.value}
            </span>
            <span className="font-mono text-sm uppercase tracking-wider text-text-muted">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Big statement marquee (igloo-style large text)
export function StatementMarquee({
  statement = 'ENGINEERING INTELLIGENCE',
  className = '',
}: {
  statement?: string;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const width = track.offsetWidth / 2;

    gsap.to(track, {
      x: -width,
      duration: width / 80,
      ease: 'none',
      repeat: -1,
    });
  }, []);

  const repeatedText = `${statement} — `.repeat(6);

  return (
    <div className={`overflow-hidden py-16 ${className}`}>
      <div ref={trackRef} className="whitespace-nowrap">
        <span
          className="font-display font-bold uppercase tracking-tight text-white/[0.02]"
          style={{ fontSize: 'clamp(4rem, 20vw, 20rem)' }}
        >
          {repeatedText}
        </span>
      </div>
    </div>
  );
}
