'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Floating sphere with smooth individual animation
function FloatingSphere({
    position,
    color,
    size = 0.1,
    floatSpeed = 1,
    floatRange = 0.3
}: {
    position: [number, number, number];
    color: string;
    size?: number;
    floatSpeed?: number;
    floatRange?: number;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const initialPosition = useRef(new THREE.Vector3(...position));
    const randomOffset = useRef({
        x: Math.random() * Math.PI * 2,
        y: Math.random() * Math.PI * 2,
        z: Math.random() * Math.PI * 2,
    });

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.elapsedTime * floatSpeed;
        const offset = randomOffset.current;

        // Gentle floating animation
        meshRef.current.position.x = initialPosition.current.x +
            Math.sin(time + offset.x) * floatRange;
        meshRef.current.position.y = initialPosition.current.y +
            Math.cos(time * 0.8 + offset.y) * floatRange * 0.8;
        meshRef.current.position.z = initialPosition.current.z +
            Math.sin(time * 0.6 + offset.z) * floatRange * 0.5;

        // Gentle pulse
        const pulse = 1 + Math.sin(time * 1.5 + offset.x) * 0.15;
        meshRef.current.scale.setScalar(pulse);
    });

    return (
        <mesh ref={meshRef} position={position}>
            <sphereGeometry args={[size, 24, 24]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={1.5}
                roughness={0.2}
                metalness={0.8}
                toneMapped={false}
            />
        </mesh>
    );
}

// Central glowing core with smooth mouse interaction
function GlowingCore({ mousePosition, isMobile }: {
    mousePosition: React.MutableRefObject<{ x: number; y: number }>;
    isMobile: boolean;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const smoothMouse = useRef({ x: 0, y: 0 });

    useFrame((state) => {
        if (!meshRef.current) return;

        // Very slow base rotation
        meshRef.current.rotation.x = state.clock.elapsedTime * 0.05;
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;

        // Smooth mouse following with heavy lerping
        if (!isMobile) {
            smoothMouse.current.x = THREE.MathUtils.lerp(
                smoothMouse.current.x,
                mousePosition.current.x * 0.1,
                0.02
            );
            smoothMouse.current.y = THREE.MathUtils.lerp(
                smoothMouse.current.y,
                mousePosition.current.y * 0.1,
                0.02
            );
            meshRef.current.rotation.x += smoothMouse.current.y;
            meshRef.current.rotation.y += smoothMouse.current.x;
        }
    });

    return (
        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
            <Sphere ref={meshRef} args={[1.2, isMobile ? 32 : 64, isMobile ? 32 : 64]}>
                <MeshDistortMaterial
                    color="#00d4ff"
                    emissive="#004466"
                    emissiveIntensity={0.4}
                    roughness={0.15}
                    metalness={0.9}
                    distort={0.25}
                    speed={1.5}
                    transparent
                    opacity={0.8}
                />
            </Sphere>
        </Float>
    );
}

// Spread out sphere cluster with smooth group interaction
function SphereCluster({
    mousePosition,
    isMobile
}: {
    mousePosition: React.MutableRefObject<{ x: number; y: number }>;
    isMobile: boolean;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const smoothRotation = useRef({ x: 0, y: 0 });

    // Generate more spread out sphere positions
    const spheres = useMemo(() => {
        const result: {
            position: [number, number, number];
            size: number;
            color: string;
            floatSpeed: number;
            floatRange: number;
        }[] = [];

        const colors = ['#00d4ff', '#00ff88', '#ffffff', '#00ffcc', '#88ffff'];

        // Spread spheres in a wider area around the core
        const layers = isMobile ? [
            { radius: 2.5, count: 6, yRange: 0.5, sizeRange: [0.06, 0.12] },
            { radius: 3.5, count: 8, yRange: 0.8, sizeRange: [0.05, 0.10] },
        ] : [
            { radius: 2.2, count: 6, yRange: 0.4, sizeRange: [0.08, 0.15] },
            { radius: 3.0, count: 10, yRange: 0.6, sizeRange: [0.06, 0.12] },
            { radius: 3.8, count: 14, yRange: 0.8, sizeRange: [0.05, 0.10] },
            { radius: 4.5, count: 16, yRange: 1.0, sizeRange: [0.04, 0.08] },
        ];

        layers.forEach((layer) => {
            for (let i = 0; i < layer.count; i++) {
                const angle = (i / layer.count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
                const x = Math.cos(angle) * layer.radius;
                const z = Math.sin(angle) * layer.radius;
                const y = (Math.random() - 0.5) * layer.yRange * 2;

                result.push({
                    position: [x, y, z],
                    size: layer.sizeRange[0] + Math.random() * (layer.sizeRange[1] - layer.sizeRange[0]),
                    color: colors[Math.floor(Math.random() * colors.length)],
                    floatSpeed: 0.3 + Math.random() * 0.4,
                    floatRange: 0.15 + Math.random() * 0.2,
                });
            }
        });

        return result;
    }, [isMobile]);

    useFrame((state) => {
        if (!groupRef.current) return;

        // Very slow base rotation
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.03;

        // Smooth mouse influence with heavy damping
        if (!isMobile) {
            smoothRotation.current.x = THREE.MathUtils.lerp(
                smoothRotation.current.x,
                mousePosition.current.y * 0.05,
                0.015
            );
            smoothRotation.current.y = THREE.MathUtils.lerp(
                smoothRotation.current.y,
                mousePosition.current.x * 0.05,
                0.015
            );
            groupRef.current.rotation.x = smoothRotation.current.x;
            groupRef.current.rotation.y += smoothRotation.current.y * 0.5;
        }
    });

    return (
        <group ref={groupRef}>
            {spheres.map((sphere, i) => (
                <FloatingSphere
                    key={i}
                    position={sphere.position}
                    size={sphere.size}
                    color={sphere.color}
                    floatSpeed={sphere.floatSpeed}
                    floatRange={sphere.floatRange}
                />
            ))}
        </group>
    );
}

// Ambient particles
function AmbientParticles({ isMobile }: { isMobile: boolean }) {
    const pointsRef = useRef<THREE.Points>(null);

    const { positions, colors } = useMemo(() => {
        const count = isMobile ? 150 : 400;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const radius = 5 + Math.random() * 5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            const colorChoice = Math.random();
            if (colorChoice > 0.7) {
                colors[i3] = 0; colors[i3 + 1] = 0.83; colors[i3 + 2] = 1;
            } else if (colorChoice > 0.4) {
                colors[i3] = 0; colors[i3 + 1] = 1; colors[i3 + 2] = 0.53;
            } else {
                colors[i3] = 1; colors[i3 + 1] = 1; colors[i3 + 2] = 1;
            }
        }

        return { positions, colors };
    }, [isMobile]);

    useFrame((state) => {
        if (!pointsRef.current) return;
        pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
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
                size={0.025}
                vertexColors
                transparent
                opacity={0.5}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

// Smooth camera rig
function CameraRig({
    mousePosition,
    isMobile
}: {
    mousePosition: React.MutableRefObject<{ x: number; y: number }>;
    isMobile: boolean;
}) {
    const { camera } = useThree();
    const smoothCamera = useRef({ x: 0, y: 0 });

    useFrame(() => {
        if (isMobile) return;

        // Very smooth camera movement
        smoothCamera.current.x = THREE.MathUtils.lerp(
            smoothCamera.current.x,
            mousePosition.current.x * 0.3,
            0.01
        );
        smoothCamera.current.y = THREE.MathUtils.lerp(
            smoothCamera.current.y,
            mousePosition.current.y * 0.2,
            0.01
        );

        camera.position.x = smoothCamera.current.x;
        camera.position.y = smoothCamera.current.y;
        camera.lookAt(0, 0, 0);
    });

    return null;
}

// Main Scene
function Scene({
    mousePosition,
    isMobile
}: {
    mousePosition: React.MutableRefObject<{ x: number; y: number }>;
    isMobile: boolean;
}) {
    return (
        <>
            <color attach="background" args={['#030712']} />
            <fog attach="fog" args={['#030712', 6, 18]} />

            <ambientLight intensity={0.15} />
            <pointLight position={[5, 5, 5]} intensity={0.8} color="#00d4ff" />
            <pointLight position={[-5, -5, 5]} intensity={0.4} color="#00ff88" />

            <GlowingCore mousePosition={mousePosition} isMobile={isMobile} />
            <SphereCluster mousePosition={mousePosition} isMobile={isMobile} />
            <AmbientParticles isMobile={isMobile} />

            <CameraRig mousePosition={mousePosition} isMobile={isMobile} />
        </>
    );
}

interface NeuralCoreProps {
    className?: string;
}

export function NeuralCore({ className = '' }: NeuralCoreProps) {
    const mousePosition = useRef({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isMobile) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
        mousePosition.current = { x, y };
    };

    return (
        <div className={className} onMouseMove={handleMouseMove}>
            <Canvas
                camera={{ position: [0, 0, isMobile ? 10 : 8], fov: isMobile ? 55 : 45 }}
                gl={{ alpha: true, antialias: !isMobile, powerPreference: 'high-performance' }}
                dpr={isMobile ? 1 : [1, 2]}
            >
                <Scene mousePosition={mousePosition} isMobile={isMobile} />
            </Canvas>
        </div>
    );
}

export default NeuralCore;
