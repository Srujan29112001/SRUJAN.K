'use client';

import { useRef, useMemo, MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * VoiceConverge — scroll-scrubbed scene for the Testimonials -> AI Chat
 * transition. Scattered "voice" motes (the many client testimonials) spiral
 * inward and condense into one bright orb that then pulses outward in speech
 * rings — many voices becoming one AI that speaks. Driven by progressRef.
 */

const MOTE_COUNT = 260;
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

interface Props { progressRef: MutableRefObject<{ value: number }>; }

function CameraRig({ progressRef }: Props) {
    const { camera } = useThree();
    useFrame(() => {
        const p = progressRef.current.value;
        const cam = camera as THREE.PerspectiveCamera;
        cam.position.z = THREE.MathUtils.lerp(cam.position.z, 10 - p * 2.5, 0.1);
        cam.rotation.z = THREE.MathUtils.lerp(cam.rotation.z, p * 0.05, 0.05);
    });
    return null;
}

export function VoiceConverge({ progressRef }: Props) {
    const groupRef = useRef<THREE.Group>(null);
    const geoRef = useRef<THREE.BufferGeometry>(null);
    const matRef = useRef<THREE.PointsMaterial>(null);
    const coreRef = useRef<THREE.Mesh>(null);
    const coreMatRef = useRef<THREE.MeshBasicMaterial>(null);
    const ringRefs = useRef<(THREE.Mesh | null)[]>([]);
    const ringMatsRef = useRef<(THREE.MeshBasicMaterial | null)[]>([]);

    const motes = useMemo(() => {
        const start = new Float32Array(MOTE_COUNT * 3);
        const radius: number[] = [];
        const angle: number[] = [];
        const speed: number[] = [];
        for (let i = 0; i < MOTE_COUNT; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = 6 + Math.random() * 9;
            start[i * 3] = Math.cos(a) * r;
            start[i * 3 + 1] = (Math.random() - 0.5) * 12;
            start[i * 3 + 2] = Math.sin(a) * r;
            radius.push(r); angle.push(a); speed.push(0.5 + Math.random() * 0.8);
        }
        return { start, radius, angle, speed };
    }, []);

    const positions = useMemo(() => new Float32Array(motes.start), [motes]);

    useFrame(({ clock }) => {
        const p = progressRef.current.value;
        const t = clock.getElapsedTime();
        const converge = smoothstep(clamp01(p / 0.7)); // motes pull in over first 70%
        const speak = clamp01((p - 0.6) / 0.4);          // orb forms + speaks
        const exitFade = 1 - smoothstep(clamp01((p - 0.92) / 0.08));

        if (groupRef.current) groupRef.current.rotation.y = t * 0.05 + p * 0.6;

        for (let i = 0; i < MOTE_COUNT; i++) {
            // spiral inward: radius shrinks and angle winds as we converge
            const r = motes.radius[i] * (1 - converge) + 0.05 * converge;
            const a = motes.angle[i] + converge * motes.speed[i] * 4 + t * 0.2 * (1 - converge);
            positions[i * 3] = Math.cos(a) * r;
            positions[i * 3 + 1] = motes.start[i * 3 + 1] * (1 - converge);
            positions[i * 3 + 2] = Math.sin(a) * r;
        }
        if (geoRef.current) (geoRef.current.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        if (matRef.current) matRef.current.opacity = Math.min(1, p * 7) * (1 - speak * 0.7) * exitFade;

        if (coreRef.current) {
            const throb = 1 + Math.sin(t * 6) * 0.14 * speak;
            const s = (0.02 + converge * 0.9) * throb;
            coreRef.current.scale.set(s, s, s);
        }
        if (coreMatRef.current) coreMatRef.current.opacity = converge * exitFade;

        // speech rings emanate once the orb is "talking"
        for (let i = 0; i < 3; i++) {
            const ring = ringRefs.current[i];
            const mat = ringMatsRef.current[i];
            if (!ring || !mat) continue;
            const tr = clamp01((p - 0.66 - i * 0.08) / 0.26);
            const eased = smoothstep(tr);
            const s = 0.4 + eased * 9;
            ring.scale.set(s, s, s);
            mat.opacity = tr > 0 ? (1 - eased) * 0.6 * exitFade : 0;
        }
    });

    return (
        <>
            <CameraRig progressRef={progressRef} />
            <fog attach="fog" args={['#000000', 12, 30]} />

            <group ref={groupRef}>
                <points>
                    <bufferGeometry ref={geoRef}>
                        <bufferAttribute attach="attributes-position" count={MOTE_COUNT} array={positions} itemSize={3} />
                    </bufferGeometry>
                    <pointsMaterial
                        ref={matRef}
                        size={0.13}
                        color="#67E8F9"
                        transparent
                        opacity={0}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                        sizeAttenuation
                    />
                </points>
            </group>

            <mesh ref={coreRef}>
                <sphereGeometry args={[0.5, 28, 28]} />
                <meshBasicMaterial ref={coreMatRef} color="#FFFFFF" toneMapped={false} transparent opacity={0} />
            </mesh>

            {[0, 1, 2].map((i) => (
                <mesh key={i} ref={(el) => { ringRefs.current[i] = el; }} position={[0, 0, 0.3 + i * 0.3]}>
                    <ringGeometry args={[0.92, 1, 48]} />
                    <meshBasicMaterial
                        ref={(el) => { ringMatsRef.current[i] = el; }}
                        color="#22D3EE"
                        toneMapped={false}
                        transparent
                        opacity={0}
                        side={THREE.DoubleSide}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </mesh>
            ))}
        </>
    );
}

export default VoiceConverge;
