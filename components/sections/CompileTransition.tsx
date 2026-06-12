'use client';

import { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { gsap } from '@/lib/gsap';
import { usePinFriendlyRefresh } from '@/hooks/usePinFriendlyRefresh';

// 3D scene: conversation tokens forge themselves into a tailored document
const ResumeForge = dynamic(() => import('@/components/three/ResumeForge').then(m => m.ResumeForge), {
    ssr: false,
});

/**
 * CompileTransition — pinned scroll transition between AI Chat (#chat) and the
 * Resume engine (#resume). The chat you just had streams into the agent
 * pipeline and comes out as a typed, tailored document. Same idiom as
 * WarpTransition: pin + scrub, progressRef into R3F, HUD card, zero React
 * state per frame.
 */
export function CompileTransition() {
    const containerRef = useRef<HTMLDivElement>(null);
    // React-owned pin spacer: the neighbours (#chat/#resume) mount via
    // next/dynamic AFTER this pin is created. If GSAP wrapped the section in
    // its own generated spacer, React's later insertBefore for those chunks
    // would use a reference node that is no longer a child of <main> and the
    // whole app crashes (NotFoundError). Supplying the spacer keeps the DOM
    // tree exactly as React rendered it.
    const spacerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef({ value: 0 });
    const pinActiveRef = useRef(false);

    const textRef = useRef<HTMLHeadingElement>(null);
    const barRef = useRef<HTMLDivElement>(null);
    const pctRef = useRef<HTMLSpanElement>(null);

    usePinFriendlyRefresh(() => pinActiveRef.current);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: '+=1800',
                    pin: true,
                    pinSpacer: spacerRef.current || undefined,
                    scrub: 0.5,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onToggle: (self) => { pinActiveRef.current = self.isActive; },
                    onUpdate: (self) => {
                        const p = self.progress;
                        progressRef.current.value = p;

                        if (barRef.current) {
                            barRef.current.style.width = `${p * 100}%`;
                        }
                        if (pctRef.current) {
                            pctRef.current.innerText = `${Math.round(p * 100)}`;
                        }
                        // Stage text mirrors the real resume agent pipeline
                        if (textRef.current) {
                            const newText =
                                p < 0.2 ? 'Reading the conversation...'
                                : p < 0.45 ? 'Scanning 60+ projects...'
                                : p < 0.72 ? 'Scoring the fit...'
                                : 'Tailoring the resume...';
                            if (textRef.current.innerText !== newText) {
                                textRef.current.innerText = newText;
                            }
                        }
                    },
                },
            });

            tl.fromTo('.forge-hud', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.2 })
                .to('.forge-hud-text', { color: '#34D399', duration: 0.5 }, '+=0.5')
                .to('.forge-hud', { opacity: 0, scale: 1.5, filter: 'blur(20px)', duration: 0.4 }, '>0.3');
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={spacerRef} className="bg-black">
        <section
            id="compile-transition"
            ref={containerRef}
            className="relative h-screen overflow-hidden z-10 bg-black"
            style={{ marginTop: '-1px', marginBottom: '-1px' }} // black-on-black neighbours, hide pixel gaps
        >
            {/* 3D Scene */}
            <div className="absolute inset-0 z-0">
                <Canvas
                    gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
                    dpr={1}
                    performance={{ min: 0.5 }}
                    camera={{ position: [0, 0, 9], fov: 70 }}
                >
                    <color attach="background" args={['#000000']} />
                    <ResumeForge progressRef={progressRef} />
                </Canvas>
            </div>

            {/* Continue the faint cyan grid that both neighbours share */}
            <div
                className="absolute inset-0 z-[1] opacity-5 pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)',
                    backgroundSize: '100px 100px',
                }}
            />

            {/* HUD — canonical transition card */}
            <div className="forge-hud absolute top-4 left-0 right-0 sm:top-auto sm:bottom-0 sm:right-auto z-10 flex justify-center sm:justify-start sm:pb-6 md:pb-8 px-4 sm:pl-6 md:pl-8 pointer-events-none">
                <div className="border border-cyan-500/20 bg-black/90 backdrop-blur-md px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-center relative overflow-hidden shadow-2xl max-w-full">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

                    <div className="font-mono text-cyan-400 text-[7px] sm:text-[8px] md:text-[9px] tracking-[0.3em] sm:tracking-[0.4em] mb-1">
                        AGENT PIPELINE ENGAGED
                    </div>

                    <h2 ref={textRef} className="forge-hud-text font-display text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white tracking-tighter transition-all duration-300">
                        Reading the conversation...
                    </h2>

                    <div className="mt-2 sm:mt-2.5 md:mt-3 w-full max-w-[180px] sm:max-w-[200px] md:max-w-[220px] mx-auto">
                        <div className="font-mono text-[7px] sm:text-[8px] text-zinc-500 mb-1 text-center">
                            INTAKE → RETRIEVE → FIT → TAILOR
                        </div>
                        <div className="relative h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                ref={barRef}
                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
                                style={{
                                    width: '0%',
                                    background: 'linear-gradient(90deg, #06B6D4, #3B82F6, #34D399)',
                                }}
                            />
                        </div>
                        <div className="font-mono text-[9px] sm:text-[10px] text-cyan-400/70 mt-1 text-center">
                            <span ref={pctRef}>0</span>%
                        </div>
                    </div>
                </div>
            </div>

            {/* Edge vignette, same as the other tunnels */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] z-10 pointer-events-none opacity-40" />
        </section>
        </div>
    );
}
