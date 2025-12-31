'use client';

import { useRef, useEffect, MutableRefObject } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';

// Dynamic import
const WormholeTunnel = dynamic(() => import('@/components/three/WormholeTunnel').then(m => m.WormholeTunnel), {
    ssr: false
});

gsap.registerPlugin(ScrollTrigger);

// Helper to animate camera and effects imperatively
function SceneController({ progressRef, bloomRef, chromaticRef }: {
    progressRef: MutableRefObject<{ value: number; speed: number }>;
    bloomRef: any;
    chromaticRef: any;
}) {
    const { camera } = useThree();

    useFrame(() => {
        const { value: progress, speed } = progressRef.current;

        // Camera FOV - expands as we enter the wormhole
        const targetFOV = 75 + (progress * 60);
        const cam = camera as THREE.PerspectiveCamera;
        cam.fov = THREE.MathUtils.lerp(cam.fov, targetFOV, 0.1);

        // Camera spiraling rotation for wormhole feel
        cam.rotation.z = THREE.MathUtils.lerp(cam.rotation.z, progress * 0.3, 0.05);
        cam.updateProjectionMatrix();

        // Effect Updates
        if (bloomRef.current) {
            bloomRef.current.intensity = 1 + (progress * 2.5);
        }
        if (chromaticRef.current) {
            const off = progress * 0.015;
            chromaticRef.current.offset.set(off, off * 0.5);
        }
    });

    return null;
}

export function WormholeTransition() {
    const containerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef({ value: 0, speed: 1 });

    // DOM Refs for imperative updates
    const textRef = useRef<HTMLHeadingElement>(null);
    const barRef = useRef<HTMLDivElement>(null);
    const speedRef = useRef<HTMLSpanElement>(null);

    // Effect Refs
    const bloomRef = useRef(null);
    const chromaticRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "+=2500",
                    pin: true,
                    scrub: 0.5,
                    onUpdate: (self) => {
                        const p = self.progress;

                        // Update Logic Ref
                        progressRef.current.value = p;
                        const targetSpeed = 1 + Math.pow(p, 2) * 30;
                        progressRef.current.speed = targetSpeed;

                        // Loading bar width (0% to 100% as alertness increases)
                        if (barRef.current) {
                            barRef.current.style.width = `${p * 100}%`;
                        }
                        if (speedRef.current) {
                            speedRef.current.innerText = `${Math.round(p * 100)}`;
                        }

                        // Text Logic - EXITING dream state theme
                        if (textRef.current) {
                            const newText = p < 0.15 ? "Stirring..." :
                                p < 0.4 ? "Waking up..." :
                                    p < 0.7 ? "Rising..." : "Awake!";
                            if (textRef.current.innerText !== newText) {
                                textRef.current.innerText = newText;
                            }
                        }
                    }
                }
            });

            // Timelines for HUD appearance
            tl.fromTo('.wormhole-hud', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.2 })
                .to('.wormhole-hud-text', { color: "#A78BFA", duration: 0.5 }, "+=0.5") // Violet-400
                .to('.wormhole-hud', { opacity: 0, scale: 1.5, filter: 'blur(20px)', duration: 0.4 }, ">0.3");

            // Flash to purple/white at portal peak
            tl.to('.flash-portal', { opacity: 1, duration: 0.25, ease: "power4.in" }, ">-0.1");

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="wormhole-transition"
            ref={containerRef}
            className="relative h-screen overflow-hidden z-10 bg-bg-base"
            style={{ marginTop: '-60px', paddingTop: '60px' }} // Larger overlap to hide pixel gaps
        >
            {/* Top gradient to blend with Blog section above */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-bg-base to-transparent z-20 pointer-events-none" />

            {/* 3D Scene */}
            <div className="absolute inset-0 z-0">
                <Canvas
                    gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
                    dpr={1}
                    performance={{ min: 0.5 }}
                    camera={{ position: [0, 0, 5], fov: 75 }}
                >
                    {/* Background matching Blog section */}
                    <color attach="background" args={['#030712']} />

                    <WormholeTunnel progressRef={progressRef} />

                    <SceneController
                        progressRef={progressRef}
                        bloomRef={bloomRef}
                        chromaticRef={chromaticRef}
                    />

                    {/* Post-processing */}
                    <EffectComposer enableNormalPass={false} multisampling={0}>
                        <Bloom
                            ref={bloomRef}
                            luminanceThreshold={0.2}
                            mipmapBlur
                            intensity={1}
                            radius={0.8}
                        />
                        <ChromaticAberration
                            ref={chromaticRef}
                            offset={new THREE.Vector2(0, 0)}
                            radialModulation={true}
                            modulationOffset={0.5}
                        />
                    </EffectComposer>
                </Canvas>
            </div>

            {/* Exit handled by Testimonials section overlap - no gradient needed */}

            {/* HUD Overlay - positioned at top center on mobile for better visibility, bottom left on desktop */}
            <div className="wormhole-hud absolute top-4 left-0 right-0 sm:top-auto sm:bottom-0 sm:right-auto z-10 flex justify-center sm:justify-start sm:pb-6 md:pb-8 px-4 sm:pl-6 md:pl-8 pointer-events-none">
                <div className="border border-cyan-500/20 bg-[#030712]/90 backdrop-blur-md px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-center relative overflow-hidden shadow-2xl max-w-full">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

                    <div className="font-mono text-cyan-400 text-[7px] sm:text-[8px] md:text-[9px] tracking-[0.3em] sm:tracking-[0.4em] mb-1">
                        EXITING DREAM STATE
                    </div>

                    <h2 ref={textRef} className="wormhole-hud-text font-display text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white tracking-tighter transition-all duration-300">
                        Stirring...
                    </h2>

                    {/* Loading Bar */}
                    <div className="mt-2 sm:mt-2.5 md:mt-3 w-full max-w-[160px] sm:max-w-[180px] md:max-w-[200px] mx-auto">
                        <div className="font-mono text-[7px] sm:text-[8px] text-zinc-500 mb-1 text-center">ALERTNESS</div>
                        <div className="relative h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                ref={barRef}
                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
                                style={{
                                    width: '0%',
                                    background: 'linear-gradient(90deg, #EC4899, #8B5CF6, #06B6D4)'
                                }}
                            />
                        </div>
                        <div className="font-mono text-[9px] sm:text-[10px] text-cyan-400/70 mt-1 text-center">
                            <span ref={speedRef}>0</span>%
                        </div>
                    </div>
                </div>
            </div>

            <div className="flash-portal absolute inset-0 bg-cyan-50 opacity-0 z-50 pointer-events-none" />

        </section>
    );
}
