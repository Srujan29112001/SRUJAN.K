'use client';

import { useRef, useEffect, MutableRefObject } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// Dynamic import
const PaperPlaneScene = dynamic(() => import('@/components/three/PaperPlaneScene').then(m => m.PaperPlaneScene), {
    ssr: false
});

gsap.registerPlugin(ScrollTrigger);

// Helper to animate camera and effects imperatively
function SceneController({ progressRef }: { progressRef: MutableRefObject<{ value: number }> }) {
    const { camera } = useThree();

    useFrame(() => {
        const progress = progressRef.current.value;

        // Gentle camera sway and follow logic is now mostly handled in the Scene component
        // But we can add global camera effects here if needed.

        // FOV widen slightly as we speed up
        const targetFOV = 60 + (progress * 15);
        const cam = camera as THREE.PerspectiveCamera;
        cam.fov = THREE.MathUtils.lerp(cam.fov, targetFOV, 0.1);
        cam.updateProjectionMatrix();
    });

    return null;
}

export function PaperPlaneTransition() {
    const containerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef({ value: 0 });
    const textRef = useRef<HTMLHeadingElement>(null);
    const subTextRef = useRef<HTMLDivElement>(null);
    const speedBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "+=2500", // Slightly longer flight
                    pin: true,
                    scrub: 1,
                    onUpdate: (self) => {
                        const p = self.progress;
                        progressRef.current.value = p;

                        // Update Text based on flight progress
                        // Stage 1: Low Velocity (0 - 0.3)
                        // Stage 2: Medium Velocity (0.3 - 0.7)
                        // Stage 3: High Velocity (0.7 - 1.0)
                        if (textRef.current && subTextRef.current) {
                            if (p < 0.3) {
                                textRef.current.innerText = "LOW VELOCITY";
                                subTextRef.current.innerText = "CLEARING DEBRIS FIELD";
                                subTextRef.current.style.color = "#94a3b8"; // Slate-400
                            } else if (p < 0.7) {
                                textRef.current.innerText = "MEDIUM VELOCITY";
                                subTextRef.current.innerText = "ENGAGING WARP DRIVE";
                                subTextRef.current.style.color = "#fbbf24"; // Amber-400
                            } else {
                                textRef.current.innerText = "HIGH VELOCITY";
                                subTextRef.current.innerText = "MAXIMUM OVERDRIVE";
                                subTextRef.current.style.color = "#06b6d4"; // Cyan-500
                            }
                        }

                        // Update Speed Bar
                        if (speedBarRef.current) {
                            speedBarRef.current.style.width = `${p * 100}%`;
                        }
                    }
                }
            });

            // Intro animation for the text
            tl.fromTo('.flight-hud', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="paper-plane-transition"
            ref={containerRef}
            className="relative h-screen overflow-hidden z-20 bg-black"
            style={{ marginTop: '-1px', marginBottom: '-1px' }}
        >
            {/* 3D Scene */}
            <div className="absolute inset-0 z-0">
                <Canvas
                    gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
                    dpr={[1, 1.5]} // Limit DPR for performance
                    camera={{ position: [0, 1, 6], fov: 60 }}
                >
                    <color attach="background" args={['#000000']} />

                    <PaperPlaneScene progressRef={progressRef} />

                    <SceneController progressRef={progressRef} />

                    <EffectComposer multisampling={0}>
                        <Bloom
                            luminanceThreshold={0.15} // Pick up the gold and neon colors 
                            mipmapBlur
                            intensity={1.5} // Strong glow for the "Artifact" feel
                            radius={0.8}
                        />
                        <ChromaticAberration
                            offset={new THREE.Vector2(0.005, 0.005)} // Stronger aberration for speed
                            radialModulation={true}
                            modulationOffset={0.5}
                        />
                        <Vignette eskil={false} offset={0.1} darkness={1.3} />
                    </EffectComposer>
                </Canvas>
            </div>

            {/* HUD Overlay */}
            <div className="flight-hud absolute bottom-12 left-6 md:left-12 z-10 pointer-events-none font-mono">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border border-cyan-500/50 flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping" />
                            <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan]" />
                        </div>
                        <div>
                            <div ref={subTextRef} className="text-xs tracking-widest text-cyan-500 mb-1">
                                INITIATING FLIGHT PROTOCOLS
                            </div>
                            <h2 ref={textRef} className="font-display text-2xl md:text-3xl font-bold text-white tracking-widest uppercase">
                                SYSTEM LAUNCH
                            </h2>
                        </div>
                    </div>

                    {/* Speed Bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-[10px] text-cyan-500/70 mb-1 tracking-widest">
                            <span>SPEED</span>
                            <span>VELOCITY INDEX</span>
                        </div>
                        <div className="w-64 h-2 bg-slate-800/50 border border-slate-700 relative overflow-hidden">
                            <div ref={speedBarRef} className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-0 transition-all duration-100 ease-out" />
                            {/* Grid overlay */}
                            <div className="absolute inset-0 bg-[url('/images/grid.png')] opacity-20" />
                            {/* Ticks */}
                            <div className="absolute top-0 bottom-0 left-[33%] w-[1px] bg-white/20" />
                            <div className="absolute top-0 bottom-0 left-[66%] w-[1px] bg-white/20" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Top gradient to blend with previous section (Skills) */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/80 to-transparent z-10 pointer-events-none" />

            {/* Bottom gradient to blend with next section (Projects) */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none" />

        </section>
    );
}
