'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { getLenis } from '@/lib/lenis';

// Dynamic import for 3D background
const SpaceBackground = dynamic(() => import('@/components/three/SpaceBackground').then(m => m.SpaceBackground), {
    ssr: false,
    loading: () => (
        <div className="absolute inset-0 bg-gradient-to-b from-[#030305] via-[#050508] to-[#030305]" />
    ),
});

export function AIHero({ onPrimaryCta }: { onPrimaryCta?: () => void } = {}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const backgroundRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // The 3D SpaceBackground loads async (ssr:false); its WebGL canvas settles a
    // few hundred ms after mount and drifts scroll past the nav's page-change
    // reset. Re-assert top across that init window — but stop the moment the user
    // scrolls on purpose, so we never fight a real scroll.
    useEffect(() => {
        let cancelled = false;
        const toTop = () => {
            if (cancelled) return;
            const lenis = getLenis();
            if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
            window.scrollTo(0, 0);
        };
        const stop = () => { cancelled = true; };
        // A wheel / touch / key from the user = intentional scroll → back off.
        window.addEventListener('wheel', stop, { passive: true, once: true });
        window.addEventListener('touchmove', stop, { passive: true, once: true });
        window.addEventListener('keydown', stop, { once: true });

        toTop();
        const raf = requestAnimationFrame(toTop);
        const timers = [60, 150, 300, 500, 800, 1100, 1500].map((d) => setTimeout(toTop, d));
        return () => {
            cancelled = true;
            cancelAnimationFrame(raf);
            timers.forEach(clearTimeout);
            window.removeEventListener('wheel', stop);
            window.removeEventListener('touchmove', stop);
            window.removeEventListener('keydown', stop);
        };
    }, []);

    return (
        <section
            ref={containerRef}
            id="services"
            className="relative min-h-screen overflow-hidden"
        >
            {/* Space Background - Interactive! Click and drag to rotate */}
            <div ref={backgroundRef} className="absolute inset-0">
                <SpaceBackground className="w-full h-full" />
            </div>

            {/* Main Content - pointer-events-none allows background interaction */}
            <div ref={contentRef} className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pointer-events-none">
                {/* Main Title - SRUJAN.AI */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 0.5 }}
                    className="text-center mb-4 sm:mb-6 md:mb-8"
                >
                    <h1 className="font-display font-black leading-[0.85] sm:leading-[0.9] tracking-tight whitespace-nowrap">
                        <motion.span
                            className="inline text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50
                                       text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
                        >
                            SRUJAN
                        </motion.span>
                        <div className="block h-2 sm:h-4"></div>
                        <motion.span
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: "auto", opacity: 1 }}
                            transition={{ duration: 1, delay: 0.8 }}
                            className="inline-block overflow-hidden whitespace-nowrap"
                        >
                            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono tracking-widest text-cyan-400">
                                AT YOUR SERVICE
                            </span>
                        </motion.span>
                    </h1>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0 mb-12"
                >
                    <button
                        onClick={() => (onPrimaryCta ? onPrimaryCta() : (window.location.href = '/#contact'))}
                        className="group relative px-6 sm:px-8 py-3 sm:py-4 rounded-full overflow-hidden
                                  font-display font-semibold text-xs sm:text-sm uppercase tracking-wider
                                  w-full sm:w-auto pointer-events-auto"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-strong)] to-[var(--accent)] opacity-0
                                       group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%]
                                           transition-transform duration-700 bg-gradient-to-r from-transparent
                                           via-white/20 to-transparent" />
                        </div>
                        <span className="relative z-10 flex items-center justify-center gap-2 text-black">
                            <span>Let&apos;s Talk</span>
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </span>
                    </button>
                </motion.div>

            </div>

            {/* Bottom gradient fade */}
            <div
                className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
                style={{
                    background: 'linear-gradient(0deg, #030305 0%, transparent 100%)',
                }}
            />

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.5 }}
                className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 sm:gap-4"
            >
                <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex flex-col items-center gap-1 sm:gap-2"
                >
                    <span className="font-mono text-[8px] sm:text-[10px] text-white/30 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                        Explore
                    </span>
                    <div className="w-px h-6 sm:h-8 bg-gradient-to-b from-white/30 to-transparent" />
                </motion.div>
            </motion.div>
        </section>
    );
}

export default AIHero;
