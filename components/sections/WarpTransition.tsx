'use client';

import { useRef, useEffect, MutableRefObject } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

// Dynamic import
const HyperspaceTunnel = dynamic(() => import('@/components/three/HyperspaceTunnel').then(m => m.HyperspaceTunnel), {
    ssr: false
});

gsap.registerPlugin(ScrollTrigger);

// Helper to animate camera and effects imperatively
function SceneController({ progressRef, bloomRef, noiseRef, chromaticRef }: {
    progressRef: MutableRefObject<{ value: number; speed: number }>;
    bloomRef: any;
    noiseRef: any;
    chromaticRef: any;
}) {
    const { camera } = useThree();

    useFrame(() => {
        const { value: progress, speed } = progressRef.current;

        // Camera FOV
        const targetFOV = 75 + (progress * 80);
        const cam = camera as THREE.PerspectiveCamera;
        cam.fov = THREE.MathUtils.lerp(cam.fov, targetFOV, 0.1);

        // Camera Roll
        cam.rotation.z = THREE.MathUtils.lerp(cam.rotation.z, progress * 0.2, 0.05);
        cam.updateProjectionMatrix();

        // Effect Updates
        if (bloomRef.current) {
            bloomRef.current.intensity = 1.5 + (progress * 2);
        }
        if (chromaticRef.current) {
            const off = progress * 0.02;
            chromaticRef.current.offset.set(off, off * 0.25);
        }
        if (noiseRef.current) {
            noiseRef.current.opacity = 0.1 + (progress * 0.2);
        }
    });

    return null;
}

export function WarpTransition() {
    const containerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef({ value: 0, speed: 1 });

    // DOM Refs for imperative updates
    const textRef = useRef<HTMLHeadingElement>(null);
    const barRef = useRef<HTMLDivElement>(null);
    const speedRef = useRef<HTMLSpanElement>(null);

    // Effect Refs
    const bloomRef = useRef(null);
    const chromaticRef = useRef(null);
    const noiseRef = useRef(null);

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
                        const targetSpeed = 1 + Math.pow(p, 3) * 50;
                        progressRef.current.speed = targetSpeed;

                        // Loading bar width (0% to 100%)
                        if (barRef.current) {
                            barRef.current.style.width = `${p * 100}%`;
                        }
                        if (speedRef.current) {
                            speedRef.current.innerText = `${Math.round(p * 100)}`;
                        }

                        // Text Logic - ENTERING dream state theme
                        if (textRef.current) {
                            const newText = p < 0.15 ? "Drifting off..." : p < 0.4 ? "Mind wandering..." : p < 0.7 ? "Deep in dreams..." : "zzz...";
                            if (textRef.current.innerText !== newText) {
                                textRef.current.innerText = newText;
                            }
                        }
                    }
                }
            });

            // Timelines for HUD appearance
            tl.fromTo('.warp-hud', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.2 })
                .to('.warp-hud-text', { color: "#22D3EE", duration: 0.5 }, "+=0.5") // Cyan-400
                .to('.warp-hud', { opacity: 0, scale: 1.5, filter: 'blur(20px)', duration: 0.4 }, ">0.3");

            // Flash to full white/cyan at warp peak - must reach 1.0 to match Skills light layer
            tl.to('.flash-white', { opacity: 1, duration: 0.25, ease: "power4.in" }, ">-0.1");

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            id="warp-transition"
            ref={containerRef}
            className="relative h-screen overflow-hidden z-10 bg-bg-elevated"
            style={{ marginTop: '-30px' }} // Small overlap to hide pixel gaps
        >
            {/* 3D Scene */}
            <div className="absolute inset-0 z-0">
                <Canvas
                    gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
                    dpr={1}
                    performance={{ min: 0.5 }}
                    camera={{ position: [0, 0, 5], fov: 75 }}
                >
                    {/* Same background color as About section */}
                    <color attach="background" args={['#0A0A12']} />

                    <HyperspaceTunnel progressRef={progressRef} />

                    <SceneController
                        progressRef={progressRef}
                        bloomRef={bloomRef}
                        noiseRef={noiseRef}
                        chromaticRef={chromaticRef}
                    />

                    {/* Restored Bloom for Cinematic Look, Noise Disabled for Performance */}
                    <EffectComposer disableNormalPass multisampling={0}>
                        <Bloom
                            ref={bloomRef}
                            luminanceThreshold={0.2}
                            mipmapBlur
                            intensity={1.5}
                            radius={0.8}
                        />
                        <ChromaticAberration
                            ref={chromaticRef}
                            offset={new THREE.Vector2(0, 0)}
                            radialModulation={true}
                            modulationOffset={0.5}
                        />
                        {/* Noise disabled for performance */}
                        {/* <Noise ref={noiseRef} opacity={0.1} blendFunction={BlendFunction.OVERLAY} /> */}
                    </EffectComposer>
                </Canvas>
            </div>

            {/* Minimal exit gradient - only at very bottom for seamless transition */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent z-10 pointer-events-none" />

            {/* HUD Overlay - positioned at top center on mobile for better visibility, bottom left on desktop */}
            <div className="warp-hud absolute top-4 left-0 right-0 sm:top-auto sm:bottom-0 sm:right-auto z-10 flex justify-center sm:justify-start sm:pb-6 md:pb-8 px-4 sm:pl-6 md:pl-8 pointer-events-none">
                <div className="border border-cyan-500/20 bg-[#0A0A12]/90 backdrop-blur-md px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-center relative overflow-hidden shadow-2xl max-w-full">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

                    <div className="font-mono text-cyan-400 text-[7px] sm:text-[8px] md:text-[9px] tracking-[0.3em] sm:tracking-[0.4em] mb-1">
                        ENTERING DREAM STATE
                    </div>

                    <h2 ref={textRef} className="warp-hud-text font-display text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white tracking-tighter transition-all duration-300">
                        Drifting off...
                    </h2>

                    {/* Loading Bar */}
                    <div className="mt-2 sm:mt-2.5 md:mt-3 w-full max-w-[160px] sm:max-w-[180px] md:max-w-[200px] mx-auto">
                        <div className="font-mono text-[7px] sm:text-[8px] text-zinc-500 mb-1 text-center">SLEEP DEPTH</div>
                        <div className="relative h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                ref={barRef}
                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
                                style={{
                                    width: '0%',
                                    background: 'linear-gradient(90deg, #06B6D4, #8B5CF6, #EC4899)'
                                }}
                            />
                        </div>
                        <div className="font-mono text-[9px] sm:text-[10px] text-cyan-400/70 mt-1 text-center">
                            <span ref={speedRef}>0</span>%
                        </div>
                    </div>
                </div>
            </div>

            <div className="flash-white absolute inset-0 bg-cyan-50 opacity-0 z-50 pointer-events-none" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] z-10 pointer-events-none opacity-40" />

        </section>
    );
}
