'use client';

import { useRef, useMemo, useLayoutEffect, MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HyperspaceTunnelProps {
    progressRef: MutableRefObject<{ value: number; speed: number }>;
}

// OPTIMIZATION: Very low count, relying on speed/stretch for effect
const COUNT = 150;
const TUNNEL_LENGTH = 1000;
const TUNNEL_RADIUS = 30;

export function HyperspaceTunnel({ progressRef }: HyperspaceTunnelProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const lightRef = useRef<THREE.PointLight>(null);
    const matRef = useRef<THREE.MeshBasicMaterial>(null);

    // Reusable objects to prevent GC
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const color = useMemo(() => new THREE.Color(), []);

    // Blue Palette
    const palette = useMemo(() => [
        '#2563EB', // Blue 600
        '#3B82F6', // Blue 500
        '#60A5FA', // Blue 400
        '#1D4ED8', // Blue 700
    ], []);

    useLayoutEffect(() => {
        if (!meshRef.current) return;

        // Initial setup
        for (let i = 0; i < COUNT; i++) {
            color.set(palette[Math.floor(Math.random() * palette.length)]);
            meshRef.current.setColorAt(i, color);
        }
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }, []);

    // Particles Data
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = TUNNEL_RADIUS + (Math.random() * 20);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const z = (Math.random() - 0.5) * TUNNEL_LENGTH;
            const speedOffset = Math.random() * 0.5 + 0.5;
            const length = Math.random() * 10 + 5;

            temp.push({ x, y, z, speedOffset, length });
        }
        return temp;
    }, []);

    useFrame((state) => {
        if (!meshRef.current) return;

        const { speed, value: progress } = progressRef.current;
        const time = state.clock.elapsedTime;

        // Opacity Logic (Fade In)
        if (matRef.current) {
            matRef.current.opacity = Math.min(1, progress * 10) * 0.8;
        }

        // Minimal Math Loop
        for (let i = 0; i < COUNT; i++) {
            const p = particles[i];

            // Move Z
            p.z += (10 * p.speedOffset) + (speed * p.speedOffset * 2);
            if (p.z > TUNNEL_LENGTH / 2) p.z = -TUNNEL_LENGTH / 2;

            // Positioning
            dummy.position.set(p.x, p.y, p.z);
            dummy.rotation.set(0, 0, 0);

            // Stretch based on speed for "Warp" look
            const stretch = 1 + (speed * 0.5);
            dummy.scale.set(1, 1, p.length * stretch);

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;

        // Light Pulse
        if (lightRef.current) {
            lightRef.current.intensity = (1 + (speed * 0.1)) * Math.min(1, progress * 10);
        }
    });

    return (
        <group>
            <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
                <boxGeometry args={[0.3, 0.3, 1]} />
                <meshBasicMaterial
                    ref={matRef}
                    color="#FFFFFF"
                    toneMapped={false}
                    transparent
                    opacity={0}
                />
            </instancedMesh>
            <pointLight ref={lightRef} distance={100} decay={2} position={[0, 0, -50]} color="#3B82F6" />
            {/* Fog matching BG */}
            <fog attach="fog" args={['#0A0A12', 10, TUNNEL_LENGTH / 2]} />
        </group>
    );
}
