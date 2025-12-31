'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Dynamic import for 3D background
const SpaceBackground = dynamic(() => import('@/components/three/SpaceBackground').then(m => m.SpaceBackground), {
    ssr: false,
    loading: () => (
        <div className="absolute inset-0 bg-gradient-to-b from-[#030305] via-[#050508] to-[#030305]" />
    ),
});

gsap.registerPlugin(ScrollTrigger);

export function AIHero() {
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

    // GSAP scroll-triggered zoom and blur effect
    useEffect(() => {
        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'top top',
                end: '+=100%',
                pin: true,
                scrub: true,
                animation: gsap.timeline()
                    // Zoom and blur out content
                    .to(contentRef.current, {
                        scale: 2,
                        opacity: 0,
                        filter: 'blur(10px)',
                        ease: 'power2.in',
                    })
                    // Also zoom the background slightly
                    .to(backgroundRef.current, {
                        scale: 1.3,
                        opacity: 0.5,
                        ease: 'power1.in',
                    }, 0)
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            id="hero"
            className="relative min-h-screen overflow-hidden"
        >
            {/* Space Background - Interactive! Click and drag to rotate */}
            <div ref={backgroundRef} className="absolute inset-0">
                <SpaceBackground className="w-full h-full" />
            </div>

            {/* Main Content - pointer-events-none allows background interaction */}
            <div ref={contentRef} className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pointer-events-none">
                {/* Top badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mb-4 sm:mb-6 md:mb-8"
                >
                    <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full
                                   bg-gradient-to-r from-cyan-500/10 to-teal-500/10
                                   border border-cyan-500/20 backdrop-blur-sm"
                    >
                        <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-full w-full bg-cyan-400" />
                        </span>
                        <span className="font-mono text-[10px] sm:text-xs text-cyan-300 uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                            AI Interface Active
                        </span>
                    </div>
                </motion.div>

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
                        onClick={() => document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' })}
                        className="group relative px-6 sm:px-8 py-3 sm:py-4 rounded-full overflow-hidden
                                  font-display font-semibold text-xs sm:text-sm uppercase tracking-wider
                                  w-full sm:w-auto pointer-events-auto"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500 opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400 opacity-0 
                                       group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] 
                                           transition-transform duration-700 bg-gradient-to-r from-transparent 
                                           via-white/20 to-transparent" />
                        </div>
                        <span className="relative z-10 flex items-center justify-center gap-2 text-black">
                            <span>Start Conversation</span>
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </span>
                    </button>

                    <button
                        onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
                        className="group px-6 sm:px-8 py-3 sm:py-4 rounded-full border border-white/20 
                                  font-display font-semibold text-xs sm:text-sm uppercase tracking-wider text-white/70
                                  hover:border-cyan-500/50 hover:text-white hover:bg-white/5
                                  transition-all duration-300 w-full sm:w-auto pointer-events-auto"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span>Get Estimate</span>
                        </span>
                    </button>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    className="flex gap-8 md:gap-12"
                >
                    <div className="text-center">
                        <div className="font-display font-bold text-2xl md:text-3xl text-white">24/7</div>
                        <div className="text-xs text-white/40 uppercase tracking-wider">Available</div>
                    </div>
                    <div className="text-center">
                        <div className="font-display font-bold text-2xl md:text-3xl text-white">&lt;2s</div>
                        <div className="text-xs text-white/40 uppercase tracking-wider">Response</div>
                    </div>
                    <div className="text-center">
                        <div className="font-display font-bold text-2xl md:text-3xl text-white">∞</div>
                        <div className="text-xs text-white/40 uppercase tracking-wider">Knowledge</div>
                    </div>
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
