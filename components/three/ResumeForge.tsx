'use client';

import { useRef, useMemo, useLayoutEffect, MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ResumeForge — scroll-scrubbed scene for the AI Chat -> Resume transition.
 * A stream of glowing "conversation tokens" flies from the viewer and lands on
 * a wireframe page that types itself out line by line — the agent pipeline
 * compiling a chat into a tailored document. Driven entirely by progressRef
 * (mutated by GSAP ScrollTrigger), zero React state per frame.
 */

const TOKEN_COUNT = 200;
const LINE_COUNT = 13;
const PAGE_W = 4.4;
const PAGE_H = 5.8;
const INNER_W = PAGE_W - 0.8;

const TOKEN_PALETTE = ['#22D3EE', '#67E8F9', '#FFFFFF', '#34D399', '#3B82F6'];

const smoothstep = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

interface ForgeProps {
    progressRef: MutableRefObject<{ value: number }>;
}

function CameraRig({ progressRef }: ForgeProps) {
    const { camera } = useThree();
    useFrame(() => {
        const p = progressRef.current.value;
        const cam = camera as THREE.PerspectiveCamera;
        cam.position.z = THREE.MathUtils.lerp(cam.position.z, 9 - p * 2.6, 0.1);
        cam.rotation.z = THREE.MathUtils.lerp(cam.rotation.z, p * 0.06, 0.05);
    });
    return null;
}

export function ResumeForge({ progressRef }: ForgeProps) {
    const tokensRef = useRef<THREE.InstancedMesh>(null);
    const tokenMatRef = useRef<THREE.MeshBasicMaterial>(null);
    const barsRef = useRef<THREE.InstancedMesh>(null);
    const barMatRef = useRef<THREE.MeshBasicMaterial>(null);
    const borderRef = useRef<THREE.Group>(null);
    const pageRef = useRef<THREE.Group>(null);
    const backingMatRef = useRef<THREE.MeshBasicMaterial>(null);
    const starMatRef = useRef<THREE.PointsMaterial>(null);

    const dummy = useMemo(() => new THREE.Object3D(), []);
    const color = useMemo(() => new THREE.Color(), []);

    // One material for all four page edges so they fade as a unit
    const borderMat = useMemo(
        () => new THREE.MeshBasicMaterial({ color: '#22D3EE', toneMapped: false, transparent: true, opacity: 0 }),
        []
    );

    // Each token: a scattered start position and a landing slot on the page
    const tokens = useMemo(() => {
        const arr = [];
        for (let i = 0; i < TOKEN_COUNT; i++) {
            const line = i % LINE_COUNT;
            const lineY = PAGE_H / 2 - 0.85 - line * 0.4;
            arr.push({
                start: new THREE.Vector3(
                    (Math.random() - 0.5) * 22,
                    (Math.random() - 0.5) * 14,
                    5 + Math.random() * 9
                ),
                target: new THREE.Vector3(
                    -INNER_W / 2 + Math.random() * INNER_W,
                    lineY + (Math.random() - 0.5) * 0.08,
                    0.06
                ),
                delay: Math.random() * 0.55,
                size: 0.06 + Math.random() * 0.1,
            });
        }
        return arr;
    }, []);

    // Text lines on the page: first is the "name" line, the rest are body copy
    const lines = useMemo(() => {
        const arr = [];
        for (let i = 0; i < LINE_COUNT; i++) {
            arr.push({
                width: i === 0 ? 2.1 : 1.7 + Math.random() * 1.7,
                height: i === 0 ? 0.17 : 0.085,
                y: PAGE_H / 2 - 0.85 - i * 0.4,
            });
        }
        return arr;
    }, []);

    const starPositions = useMemo(() => {
        const pos = new Float32Array(120 * 3);
        for (let i = 0; i < 120; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 30;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
            pos[i * 3 + 2] = -6 - Math.random() * 14;
        }
        return pos;
    }, []);

    useLayoutEffect(() => {
        if (tokensRef.current) {
            for (let i = 0; i < TOKEN_COUNT; i++) {
                color.set(TOKEN_PALETTE[i % TOKEN_PALETTE.length]);
                tokensRef.current.setColorAt(i, color);
            }
            if (tokensRef.current.instanceColor) tokensRef.current.instanceColor.needsUpdate = true;
        }
        if (barsRef.current) {
            for (let i = 0; i < LINE_COUNT; i++) {
                color.set(i === 0 ? '#34D399' : i % 3 === 0 ? '#FFFFFF' : '#22D3EE');
                barsRef.current.setColorAt(i, color);
            }
            if (barsRef.current.instanceColor) barsRef.current.instanceColor.needsUpdate = true;
        }
    }, [color]);

    useFrame(({ clock }) => {
        const p = progressRef.current.value;
        const t = clock.getElapsedTime();
        // Everything dissolves at the very end so the section exits on pure black
        const exitFade = 1 - smoothstep(clamp01((p - 0.9) / 0.1));

        // Token stream
        if (tokensRef.current) {
            for (let i = 0; i < TOKEN_COUNT; i++) {
                const tok = tokens[i];
                const travel = smoothstep(clamp01((p * 1.55 - tok.delay) / 0.6));
                dummy.position.lerpVectors(tok.start, tok.target, travel);
                // drift a little while in flight, settle when landing
                const drift = (1 - travel) * 0.35;
                dummy.position.x += Math.sin(t * 1.3 + i) * drift;
                dummy.position.y += Math.cos(t * 1.1 + i * 2) * drift;
                const s = tok.size * (travel >= 1 ? 0.001 : 1 - travel * 0.55);
                dummy.scale.set(s, s, s);
                dummy.rotation.set(0, 0, t * 0.6 + i);
                dummy.updateMatrix();
                tokensRef.current.setMatrixAt(i, dummy.matrix);
            }
            tokensRef.current.instanceMatrix.needsUpdate = true;
        }
        if (tokenMatRef.current) {
            tokenMatRef.current.opacity = Math.min(1, p * 9) * 0.95 * exitFade;
        }

        // Page assembly
        if (pageRef.current) {
            pageRef.current.rotation.y = (1 - smoothstep(clamp01(p * 1.6))) * -0.5;
            pageRef.current.rotation.x = (1 - smoothstep(clamp01(p * 1.6))) * 0.12;
            pageRef.current.position.y = Math.sin(t * 0.8) * 0.07;
            // at the very end the finished page glides up past the camera
            pageRef.current.position.z = smoothstep(clamp01((p - 0.85) / 0.15)) * 2.4;
        }
        if (barsRef.current) {
            for (let i = 0; i < LINE_COUNT; i++) {
                const ln = lines[i];
                const reveal = smoothstep(clamp01((p * 1.4 - 0.18 - i * 0.062) / 0.12));
                const w = Math.max(0.001, ln.width * reveal);
                dummy.position.set(-INNER_W / 2 + w / 2, ln.y, 0.03);
                dummy.scale.set(w, ln.height, 0.02);
                dummy.rotation.set(0, 0, 0);
                dummy.updateMatrix();
                barsRef.current.setMatrixAt(i, dummy.matrix);
            }
            barsRef.current.instanceMatrix.needsUpdate = true;
        }
        if (barMatRef.current) barMatRef.current.opacity = 0.95 * exitFade;
        borderMat.opacity = Math.min(1, p * 6) * 0.55 * exitFade;
        if (backingMatRef.current) backingMatRef.current.opacity = Math.min(1, p * 5) * 0.85 * exitFade;
        if (starMatRef.current) starMatRef.current.opacity = 0.45 * exitFade;
    });

    return (
        <>
            <CameraRig progressRef={progressRef} />
            <fog attach="fog" args={['#000000', 12, 34]} />

            {/* Distant idle stars for depth */}
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={120} array={starPositions} itemSize={3} />
                </bufferGeometry>
                <pointsMaterial
                    ref={starMatRef}
                    size={0.07}
                    color="#67E8F9"
                    transparent
                    opacity={0.45}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    sizeAttenuation
                />
            </points>

            {/* Conversation tokens in flight */}
            <instancedMesh ref={tokensRef} args={[undefined, undefined, TOKEN_COUNT]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial ref={tokenMatRef} color="#FFFFFF" toneMapped={false} transparent opacity={0} />
            </instancedMesh>

            {/* The document being forged */}
            <group ref={pageRef}>
                {/* page backing — barely lighter than the void so the sheet reads */}
                <mesh position={[0, 0, -0.02]}>
                    <planeGeometry args={[PAGE_W, PAGE_H]} />
                    <meshBasicMaterial ref={backingMatRef} color="#0A1118" transparent opacity={0} toneMapped={false} />
                </mesh>
                {/* page border */}
                <group ref={borderRef}>
                    <mesh position={[0, PAGE_H / 2, 0]} material={borderMat}>
                        <boxGeometry args={[PAGE_W, 0.035, 0.02]} />
                    </mesh>
                    <mesh position={[0, -PAGE_H / 2, 0]} material={borderMat}>
                        <boxGeometry args={[PAGE_W, 0.035, 0.02]} />
                    </mesh>
                    <mesh position={[-PAGE_W / 2, 0, 0]} material={borderMat}>
                        <boxGeometry args={[0.035, PAGE_H, 0.02]} />
                    </mesh>
                    <mesh position={[PAGE_W / 2, 0, 0]} material={borderMat}>
                        <boxGeometry args={[0.035, PAGE_H, 0.02]} />
                    </mesh>
                </group>
                {/* typed lines */}
                <instancedMesh ref={barsRef} args={[undefined, undefined, LINE_COUNT]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshBasicMaterial ref={barMatRef} color="#FFFFFF" toneMapped={false} transparent opacity={0.95} />
                </instancedMesh>
            </group>
        </>
    );
}

export default ResumeForge;
