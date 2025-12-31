'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// A single sphere in the cluster
function ClusterSphere({
    position,
    size,
    isGlowing,
    glowColor,
    isWireframe,
    delay = 0
}: {
    position: [number, number, number];
    size: number;
    isGlowing: boolean;
    glowColor: string;
    isWireframe: boolean;
    delay?: number;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const initialPosition = useRef(position);
    const randomOffset = useRef({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: Math.random() * 2 - 1,
        speed: 0.3 + Math.random() * 0.5,
        amplitude: 0.1 + Math.random() * 0.2,
    });

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.elapsedTime + delay;
        const offset = randomOffset.current;

        // Gentle floating animation
        meshRef.current.position.x = initialPosition.current[0] +
            Math.sin(time * offset.speed + offset.x) * offset.amplitude;
        meshRef.current.position.y = initialPosition.current[1] +
            Math.cos(time * offset.speed + offset.y) * offset.amplitude;
        meshRef.current.position.z = initialPosition.current[2] +
            Math.sin(time * offset.speed * 0.7 + offset.z) * offset.amplitude * 0.5;

        // Pulse glow spheres
        if (isGlowing) {
            const scale = 1 + Math.sin(time * 2) * 0.1;
            meshRef.current.scale.setScalar(scale);
        }
    });

    if (isWireframe) {
        return (
            <mesh ref={meshRef} position={position}>
                <sphereGeometry args={[size, 16, 16]} />
                <meshBasicMaterial
                    color="#0a3d3d"
                    wireframe
                    transparent
                    opacity={0.4}
                />
            </mesh>
        );
    }

    if (isGlowing) {
        return (
            <mesh ref={meshRef} position={position}>
                <sphereGeometry args={[size, 32, 32]} />
                <meshStandardMaterial
                    color={glowColor}
                    emissive={glowColor}
                    emissiveIntensity={0.8}
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>
        );
    }

    return (
        <mesh ref={meshRef} position={position}>
            <sphereGeometry args={[size, 32, 32]} />
            <meshStandardMaterial
                color="#0a2a2a"
                roughness={0.3}
                metalness={0.7}
            />
        </mesh>
    );
}

// Floating particles around the sphere
function FloatingParticles() {
    const pointsRef = useRef<THREE.Points>(null);

    const { positions, colors } = useMemo(() => {
        const count = 150;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const radius = 3 + Math.random() * 3;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            // Cyan/white particles
            const isCyan = Math.random() > 0.5;
            colors[i3] = isCyan ? 0.0 : 1.0;
            colors[i3 + 1] = isCyan ? 0.9 : 1.0;
            colors[i3 + 2] = isCyan ? 0.9 : 1.0;
        }

        return { positions, colors };
    }, []);

    useFrame((state) => {
        if (!pointsRef.current) return;
        pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
        pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={colors.length / 3}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.04}
                vertexColors
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

// Main sphere cluster
function SphereCluster({ mousePosition }: { mousePosition: React.MutableRefObject<{ x: number; y: number }> }) {
    const groupRef = useRef<THREE.Group>(null);

    // Generate sphere positions in a spherical arrangement
    const spheres = useMemo(() => {
        const result: {
            position: [number, number, number];
            size: number;
            isGlowing: boolean;
            glowColor: string;
            isWireframe: boolean;
        }[] = [];

        // Create layers of spheres
        const layers = [
            { radius: 0.6, count: 6, size: 0.25 },
            { radius: 1.2, count: 14, size: 0.22 },
            { radius: 1.8, count: 24, size: 0.18 },
            { radius: 2.2, count: 32, size: 0.15 },
        ];

        const glowColors = ['#00e5e5', '#ffffff', '#00ff88', '#44ffff'];

        layers.forEach((layer, layerIndex) => {
            for (let i = 0; i < layer.count; i++) {
                const phi = Math.acos(-1 + (2 * i) / layer.count);
                const theta = Math.sqrt(layer.count * Math.PI) * phi;

                const x = layer.radius * Math.cos(theta) * Math.sin(phi);
                const y = layer.radius * Math.sin(theta) * Math.sin(phi);
                const z = layer.radius * Math.cos(phi);

                const isGlowing = Math.random() > 0.75;
                const isWireframe = !isGlowing && Math.random() > 0.4 && layerIndex > 0;

                result.push({
                    position: [x, y, z],
                    size: layer.size + (Math.random() - 0.5) * 0.08,
                    isGlowing,
                    glowColor: glowColors[Math.floor(Math.random() * glowColors.length)],
                    isWireframe,
                });
            }
        });

        return result;
    }, []);

    useFrame((state) => {
        if (!groupRef.current) return;
        const time = state.clock.elapsedTime;

        // Slow rotation
        groupRef.current.rotation.y = time * 0.1;
        groupRef.current.rotation.x = Math.sin(time * 0.15) * 0.2;

        // Mouse influence
        groupRef.current.rotation.x += mousePosition.current.y * 0.3;
        groupRef.current.rotation.y += mousePosition.current.x * 0.3;
    });

    return (
        <group ref={groupRef}>
            {spheres.map((sphere, i) => (
                <ClusterSphere
                    key={i}
                    position={sphere.position}
                    size={sphere.size}
                    isGlowing={sphere.isGlowing}
                    glowColor={sphere.glowColor}
                    isWireframe={sphere.isWireframe}
                    delay={i * 0.1}
                />
            ))}
        </group>
    );
}

// Scene
function Scene({ mousePosition }: { mousePosition: React.MutableRefObject<{ x: number; y: number }> }) {
    return (
        <>
            <ambientLight intensity={0.2} />
            <pointLight position={[5, 5, 5]} intensity={1} color="#00e5e5" />
            <pointLight position={[-5, -5, 5]} intensity={0.5} color="#ffffff" />
            <pointLight position={[0, 3, -3]} intensity={0.3} color="#00ff88" />

            <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
                <SphereCluster mousePosition={mousePosition} />
            </Float>
            <FloatingParticles />
        </>
    );
}

interface MorphingSphereProps {
    className?: string;
}

export function MorphingSphere({ className = '' }: MorphingSphereProps) {
    const mousePosition = useRef({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        mousePosition.current = { x, y };
    };

    return (
        <div className={className} onMouseMove={handleMouseMove}>
            <Canvas
                camera={{ position: [0, 0, 6], fov: 45 }}
                style={{ background: 'transparent' }}
                gl={{ alpha: true, antialias: true }}
            >
                <Scene mousePosition={mousePosition} />
            </Canvas>
        </div>
    );
}

export default MorphingSphere;
