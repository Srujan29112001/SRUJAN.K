'use client';

import { motion } from 'framer-motion';
import { projectTypes, exampleProjects } from '@/data/project-estimates';
import { SectionHeading } from '@/components/ui/SectionHeading';

// id → readable label, for the example-engagement type chips
const TYPE_LABEL: Record<string, string> = Object.fromEntries(
    projectTypes.map((t) => [t.id, t.name])
);

/**
 * ServicesShowcase — the offerings under the Services hero. Lists what Srujan
 * builds (the project types) and a sample of example engagements. Pricing is
 * intentionally NOT shown anywhere here. Accent flips cyan→orange and the
 * surfaces flip dark→cream via the global light-mode tokens.
 */
export function ServicesShowcase({ onPrimaryCta }: { onPrimaryCta?: () => void } = {}) {
    const goTalk = () =>
        onPrimaryCta ? onPrimaryCta() : (window.location.href = '/#contact');

    return (
        <section id="services-list" className="relative bg-bg-base py-20 sm:py-24 md:py-28 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <SectionHeading
                    eyebrow="Services"
                    title="WHAT I BUILD"
                    subtitle="AI/ML systems, robotics, full-stack apps, and research — taken from idea to shipped, end to end."
                    meta={`${projectTypes.length} disciplines`}
                />

                {/* Offerings grid */}
                <div className="mt-12 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {projectTypes.map((s, i) => (
                        <motion.div
                            key={s.id}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
                            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-xl"
                        >
                            <div className="text-3xl mb-4">{s.icon}</div>
                            <h3 className="font-display text-lg font-bold text-text-primary mb-2">{s.name}</h3>
                            <p className="text-sm text-text-secondary leading-relaxed">{s.description}</p>
                            {/* accent underline grows on hover */}
                            <span className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-500 ease-out bg-cyan-400" />
                        </motion.div>
                    ))}
                </div>

                {/* Example engagements (no pricing — scope/timeline vary) */}
                <div className="mt-20 sm:mt-24">
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-text-primary text-center mb-3">
                        Example Engagements
                    </h3>
                    <p className="text-center text-text-muted text-sm sm:text-base mb-10 sm:mb-12 max-w-xl mx-auto">
                        A sample of the kinds of projects I deliver. Every engagement is scoped to your goals — reach out for a tailored plan.
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                        {exampleProjects.map((p, i) => (
                            <motion.div
                                key={p.name}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
                                className="flex flex-col rounded-2xl border border-white/10 bg-bg-surface p-6 transition-all duration-300 hover:border-cyan-400/30 hover:-translate-y-1"
                            >
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-cyan-400/30 text-cyan-400">
                                        {TYPE_LABEL[p.type] ?? p.type}
                                    </span>
                                    <span className="font-mono text-[10px] text-text-muted tabular-nums">{p.timeline}</span>
                                </div>
                                <h4 className="font-display text-lg font-bold text-text-primary mb-2">{p.name}</h4>
                                <p className="text-sm text-text-secondary leading-relaxed">{p.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-16 sm:mt-20 text-center">
                    <button
                        onClick={goTalk}
                        className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-display font-semibold text-sm uppercase tracking-wider text-black bg-[var(--accent)] hover:brightness-110 transition-all duration-300 active:scale-95"
                    >
                        Let&apos;s Talk About Your Project
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
