'use client';

import { motion } from 'framer-motion';
import { projectTypes } from '@/data/project-estimates';
import { projects } from '@/data/projects';
import { SectionHeading } from '@/components/ui/SectionHeading';

/**
 * ServicesShowcase — a story-mode "Services" experience that sits under the
 * galaxy hero. It deliberately reads differently from the rest of the site:
 * a narrative process "trajectory" (Movement I), a capabilities ledger
 * (Movement II), and a Field Log of real, shipped work (Movement III).
 * No pricing anywhere. Themed via tokens: surfaces flip dark→cream and the
 * accent flips cyan→orange in light mode.
 */

// ── Movement I — the story arc (how a build unfolds) ────────────────────────
const STAGES = [
    {
        num: '01',
        label: 'Signal',
        title: 'You bring the spark',
        copy: 'A problem, a dataset, or a half-formed idea at 2am. We start with your goal — never my stack.',
    },
    {
        num: '02',
        label: 'Blueprint',
        title: 'I map the system',
        copy: 'Architecture end to end — data, models, agents, infra. You see the whole plan before a line of code.',
    },
    {
        num: '03',
        label: 'Forge',
        title: 'We build it live',
        copy: 'Code, train, integrate — in the open. You watch it take shape and steer as it grows.',
    },
    {
        num: '04',
        label: 'Launch',
        title: 'It ships for real',
        copy: 'Deployed, measured, documented, handed over. A system that works outside the demo.',
    },
];

// ── Movement III — Field Log: real, shipped engagements (no pricing) ─────────
const CASE_IDS = [
    'helix-data-agent',
    'clinical-ai-copilot',
    'neural-signal-time-freq',
    'vehicle-tracking',
    'lifi-comm',
    'space-debris',
];
const caseFiles = CASE_IDS.map((id) => projects.find((p) => p.id === id)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p)
);

export function ServicesShowcase({ onPrimaryCta }: { onPrimaryCta?: () => void } = {}) {
    const goTalk = () =>
        onPrimaryCta ? onPrimaryCta() : (window.location.href = '/#contact');

    return (
        <section id="services-list" className="relative bg-bg-base overflow-hidden">
            {/* atmosphere — a single soft accent glow, no grid */}
            <div
                className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[520px] rounded-full blur-[160px] opacity-40"
                style={{ background: 'radial-gradient(circle, rgba(var(--accent-rgb),0.18) 0%, transparent 70%)' }}
            />

            <div className="container mx-auto px-4 sm:px-6 relative z-10 py-20 sm:py-24 md:py-28">
                <SectionHeading
                    eyebrow="Services"
                    title={<>FROM&nbsp;SIGNAL<br className="hidden sm:block" /> TO&nbsp;SYSTEM</>}
                    subtitle="I don't sell hours — I take an idea from its first messy sentence to a system that thinks, moves, and ships. Here's how the story goes."
                    meta="The studio"
                />

                {/* ── MOVEMENT I — THE PROCESS (story arc) ──────────────────── */}
                <div className="mt-16 sm:mt-20">
                    <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.3em] text-cyan-400 mb-10 sm:mb-14">
                        ( The Process )
                    </p>
                    <div className="relative">
                        {/* trajectory connector — desktop horizontal, runs through node centers */}
                        <div className="hidden md:block absolute top-[34px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
                        {/* trajectory connector — mobile vertical */}
                        <div className="md:hidden absolute top-[34px] bottom-[34px] left-[33px] w-px bg-gradient-to-b from-cyan-400/40 via-cyan-400/20 to-transparent" />

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
                            {STAGES.map((s, i) => (
                                <motion.div
                                    key={s.num}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.4 }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className="relative flex items-start md:flex-col md:items-center gap-5 md:gap-0 md:text-center"
                                >
                                    <div className="relative z-10 flex-shrink-0 w-[68px] h-[68px] rounded-full border border-cyan-400/40 bg-bg-surface flex items-center justify-center font-display text-xl font-bold text-cyan-400 shadow-[0_0_30px_rgba(var(--accent-rgb),0.25)]">
                                        {s.num}
                                    </div>
                                    <div className="md:mt-5">
                                        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan-400">{s.label}</span>
                                        <h4 className="mt-1.5 font-display text-xl font-bold text-text-primary">{s.title}</h4>
                                        <p className="mt-2 text-sm text-text-secondary leading-relaxed md:max-w-[15rem] md:mx-auto">{s.copy}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── MOVEMENT II — CAPABILITIES LEDGER ─────────────────────── */}
                <div className="mt-24 sm:mt-28">
                    <div className="flex items-end justify-between flex-wrap gap-3 mb-8 sm:mb-10">
                        <div>
                            <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.3em] text-cyan-400 mb-2">( Capabilities )</p>
                            <h3 className="font-display text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">What I can build</h3>
                        </div>
                        <span className="font-mono text-[11px] sm:text-xs text-text-muted tabular-nums">{String(projectTypes.length).padStart(2, '0')} disciplines</span>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-t border-white/10">
                        {projectTypes.map((s, i) => (
                            <motion.div
                                key={s.id}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: (i % 3) * 0.05 }}
                                className="group relative flex gap-4 p-5 sm:p-6 border-b border-r border-white/10 transition-colors duration-300 hover:bg-bg-surface"
                            >
                                {/* left accent rule grows on hover */}
                                <span className="absolute left-0 top-0 h-full w-[2px] scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-300 bg-cyan-400" />
                                <span className="font-mono text-[11px] text-text-muted tabular-nums pt-1">{String(i + 1).padStart(2, '0')}</span>
                                <div className="text-2xl leading-none pt-0.5">{s.icon}</div>
                                <div className="min-w-0">
                                    <h4 className="font-display text-base font-bold text-text-primary group-hover:text-cyan-400 transition-colors">{s.name}</h4>
                                    <p className="mt-1 text-xs sm:text-sm text-text-secondary leading-relaxed">{s.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* ── MOVEMENT III — FIELD LOG (real shipped work) ──────────── */}
                <div className="mt-24 sm:mt-28">
                    <div className="mb-8 sm:mb-10">
                        <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.3em] text-cyan-400 mb-2">( Field Log )</p>
                        <h3 className="font-display text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">Selected builds</h3>
                        <p className="mt-3 text-text-secondary max-w-xl text-sm sm:text-base">
                            Real systems I&apos;ve designed and shipped across AI, vision, robotics and research — the proof the process works.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                        {caseFiles.map((p, i) => {
                            const live = Boolean(p.liveApp && p.link && p.link !== '#');
                            const href = p.link && p.link !== '#' ? p.link : undefined;
                            return (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
                                >
                                    <a
                                        href={href}
                                        {...(href ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                        className="group block rounded-2xl overflow-hidden border border-white/10 bg-bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-xl"
                                    >
                                        <div className="relative aspect-video overflow-hidden bg-bg-elevated">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={p.image}
                                                alt={p.title}
                                                loading="lazy"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                                            {/* status badge */}
                                            {live ? (
                                                <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/90 text-white font-mono text-[10px] uppercase tracking-wider backdrop-blur-sm">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live
                                                </span>
                                            ) : p.ongoing ? (
                                                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-cyan-500/80 text-white font-mono text-[10px] uppercase tracking-wider backdrop-blur-sm">
                                                    Ongoing
                                                </span>
                                            ) : null}
                                            {/* category · metric */}
                                            <span className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-wider text-white/90">
                                                {p.category}{p.metric ? ` · ${p.metric}` : ''}
                                            </span>
                                        </div>
                                        <div className="p-5">
                                            <h4 className="font-display text-lg font-bold text-text-primary group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                                                <span className="truncate">{p.title}</span>
                                                {href && (
                                                    <svg className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H8M17 7V16" />
                                                    </svg>
                                                )}
                                            </h4>
                                            <p className="mt-2 text-sm text-text-secondary leading-relaxed line-clamp-3">{p.description}</p>
                                        </div>
                                    </a>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* ── CTA — close the story ─────────────────────────────────── */}
                <div className="mt-20 sm:mt-24 text-center">
                    <p className="font-display text-2xl sm:text-3xl font-bold text-text-primary mb-6 max-w-2xl mx-auto leading-tight">
                        Your idea is the only thing missing from this list.
                    </p>
                    <button
                        onClick={goTalk}
                        className="group inline-flex items-center gap-2 px-8 py-4 rounded-full font-display font-semibold text-sm uppercase tracking-wider text-black bg-[var(--accent)] hover:brightness-110 transition-all duration-300 active:scale-95 shadow-[0_0_30px_rgba(var(--accent-rgb),0.35)]"
                    >
                        Start your build
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
}

export default ServicesShowcase;
