'use client';

import { useRef, useMemo, useLayoutEffect, MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WormholeTunnelProps {
    progressRef: MutableRefObject<{ value: number; speed: number }>;
}

// Same optimized approach as HyperspaceTunnel - proven to work well
const COUNT = 200;
const TUNNEL_LENGTH = 1000;
const TUNNEL_RADIUS = 35;

export function WormholeTunnel({ progressRef }: WormholeTunnelProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const lightRef = useRef<THREE.PointLight>(null);
    const matRef = useRef<THREE.MeshBasicMaterial>(null);

    // Reusable objects to prevent GC
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const color = useMemo(() => new THREE.Color(), []);

    // Blue Palette (same as HyperspaceTunnel for visual consistency)
    const palette = useMemo(() => [
        '#2563EB', // Blue 600
        '#3B82F6', // Blue 500
        '#60A5FA', // Blue 400
        '#1D4ED8', // Blue 700
        '#93C5FD', // Blue 300
        '#1E40AF', // Blue 800
    ], []);

    useLayoutEffect(() => {
        if (!meshRef.current) return;

        // Initial setup - assign colors
        for (let i = 0; i < COUNT; i++) {
            color.set(palette[Math.floor(Math.random() * palette.length)]);
            meshRef.current.setColorAt(i, color);
        }
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }, [palette, color]);

    // Particles Data - same structure as HyperspaceTunnel
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = TUNNEL_RADIUS + (Math.random() * 25);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const z = (Math.random() - 0.5) * TUNNEL_LENGTH;
            const speedOffset = Math.random() * 0.5 + 0.5;
            const length = Math.random() * 12 + 5;

            temp.push({ x, y, z, speedOffset, length, angle });
        }
        return temp;
    }, []);

    useFrame((state) => {
        if (!meshRef.current) return;

        const { speed, value: progress } = progressRef.current;
        const time = state.clock.elapsedTime;

        // Opacity Logic (Fade In)
        if (matRef.current) {
            matRef.current.opacity = Math.min(1, progress * 10) * 0.85;
        }

        // Particle animation loop - EXITING tunnel (moving AWAY from camera)
        for (let i = 0; i < COUNT; i++) {
            const p = particles[i];

            // Move Z AWAY from camera (negative direction) - EXITING effect
            p.z -= (10 * p.speedOffset) + (speed * p.speedOffset * 2);
            if (p.z < -TUNNEL_LENGTH / 2) p.z = TUNNEL_LENGTH / 2;

            // Slight spiral rotation (opposite direction for exit feel)
            p.angle -= 0.001 * (1 + speed * 0.01);
            const x = Math.cos(p.angle) * (TUNNEL_RADIUS + 10);
            const y = Math.sin(p.angle) * (TUNNEL_RADIUS + 10);

            // Positioning
            dummy.position.set(x, y, p.z);
            dummy.rotation.set(0, 0, 0);

            // Stretch based on speed for "Warp" look - key effect!
            const stretch = 1 + (speed * 0.5);
            dummy.scale.set(1, 1, p.length * stretch);

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;

        // Light Pulse
        if (lightRef.current) {
            lightRef.current.intensity = (1.5 + (speed * 0.15)) * Math.min(1, progress * 10);
        }
    });

    return (
        <group>
            <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
                <boxGeometry args={[0.4, 0.4, 1]} />
                <meshBasicMaterial
                    ref={matRef}
                    color="#FFFFFF"
                    toneMapped={false}
                    transparent
                    opacity={0}
                />
            </instancedMesh>
            <pointLight ref={lightRef} distance={120} decay={2} position={[0, 0, -50]} color="#3B82F6" />
            {/* Secondary lights for more depth */}
            <pointLight distance={80} decay={2} position={[30, 0, 0]} color="#60A5FA" intensity={0.5} />
            <pointLight distance={80} decay={2} position={[-30, 0, 0]} color="#2563EB" intensity={0.5} />
            {/* Fog matching BG */}
            <fog attach="fog" args={['#030712', 10, TUNNEL_LENGTH / 2]} />
        </group>
    );
}
