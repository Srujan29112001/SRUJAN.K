'use client';

import { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { gsap } from '@/lib/gsap';
import { usePinFriendlyRefresh } from '@/hooks/usePinFriendlyRefresh';

// 3D scene: the one-page resume blooms outward into the knowledge constellation
const MindBloom = dynamic(() => import('@/components/three/MindBloom').then(m => m.MindBloom), {
    ssr: false,
});

/**
 * BloomTransition — pinned scroll transition between the Resume engine
 * (#resume) and the Neural Map (#knowledge). The tailored one-page resume
 * unfolds into the full constellation of everything I know. Same idiom.
 */
export function BloomTransition() {
    const containerRef = useRef<HTMLDivElement>(null);
    const spacerRef = useRef<HTMLDivElement>(null); // React-owned pin spacer (dynamic neighbours)
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
                        if (barRef.current) barRef.current.style.width = `${p * 100}%`;
                        if (pctRef.current) pctRef.current.innerText = `${Math.round(p * 100)}`;
                        if (textRef.current) {
                            const newText =
                                p < 0.25 ? 'Reading the one-pager...'
                                : p < 0.6 ? 'Unfolding the connections...'
                                : p < 0.85 ? 'Mapping the whole mind...'
                                : 'The full picture.';
                            if (textRef.current.innerText !== newText) textRef.current.innerText = newText;
                        }
                    },
                },
            });
            tl.fromTo('.bloom-hud', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.2 })
                .to('.bloom-hud-text', { color: '#A78BFA', duration: 0.5 }, '+=0.5')
                .to('.bloom-hud', { opacity: 0, scale: 1.5, filter: 'blur(20px)', duration: 0.4 }, '>0.3');
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={spacerRef} className="bg-black">
        <section
            id="bloom-transition"
            ref={containerRef}
            className="relative h-screen overflow-hidden z-10 bg-black"
            style={{ marginTop: '-1px', marginBottom: '-1px' }}
        >
            <div className="absolute inset-0 z-0">
                <Canvas
                    gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
                    dpr={1}
                    performance={{ min: 0.5 }}
                    camera={{ position: [0, 0, 8], fov: 70 }}
                >
                    <color attach="background" args={['#000000']} />
                    <MindBloom progressRef={progressRef} />
                </Canvas>
            </div>

            <div className="bloom-hud absolute top-4 left-0 right-0 sm:top-auto sm:bottom-0 sm:right-auto z-10 flex justify-center sm:justify-start sm:pb-6 md:pb-8 px-4 sm:pl-6 md:pl-8 pointer-events-none">
                <div className="border border-violet-400/20 bg-black/90 backdrop-blur-md px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-center relative overflow-hidden shadow-2xl max-w-full">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-400 to-transparent opacity-50" />
                    <div className="font-mono text-violet-300 text-[7px] sm:text-[8px] md:text-[9px] tracking-[0.3em] sm:tracking-[0.4em] mb-1">
                        EXPANDING THE MIND
                    </div>
                    <h2 ref={textRef} className="bloom-hud-text font-display text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white tracking-tighter transition-all duration-300">
                        Reading the one-pager...
                    </h2>
                    <div className="mt-2 sm:mt-2.5 md:mt-3 w-full max-w-[170px] sm:max-w-[190px] md:max-w-[210px] mx-auto">
                        <div className="font-mono text-[7px] sm:text-[8px] text-zinc-500 mb-1 text-center">ONE PAGE → WHOLE MIND</div>
                        <div className="relative h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                            <div ref={barRef} className="absolute inset-y-0 left-0 rounded-full transition-all duration-100" style={{ width: '0%', background: 'linear-gradient(90deg, #3B82F6, #8B7EC8, #10B981)' }} />
                        </div>
                        <div className="font-mono text-[9px] sm:text-[10px] text-violet-300/70 mt-1 text-center"><span ref={pctRef}>0</span>%</div>
                    </div>
                </div>
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] z-10 pointer-events-none opacity-40" />
        </section>
        </div>
    );
}
