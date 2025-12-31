'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Matrix rain character stream
function MatrixStream({ position, speed, chars }: { position: [number, number, number]; speed: number; chars: string[] }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const count = 15;

    const { matrices, opacities } = useMemo(() => {
        const matrices: THREE.Matrix4[] = [];
        const opacities: number[] = [];

        for (let i = 0; i < count; i++) {
            const matrix = new THREE.Matrix4();
            matrix.setPosition(0, -i * 0.5, 0);
            matrix.scale(new THREE.Vector3(0.3, 0.3, 0.3));
            matrices.push(matrix);
            opacities.push(1 - (i / count) * 0.8);
        }

        return { matrices, opacities };
    }, []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.elapsedTime * speed;

        for (let i = 0; i < count; i++) {
            const matrix = new THREE.Matrix4();
            const yOffset = ((time + i * 0.1) % 8) - 4;
            matrix.setPosition(0, -yOffset, 0);
            matrix.scale(new THREE.Vector3(0.15, 0.15, 0.15));
            meshRef.current.setMatrixAt(i, matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group position={position}>
            <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial
                    color="#00ff88"
                    transparent
                    opacity={0.6}
                    side={THREE.DoubleSide}
                />
            </instancedMesh>
        </group>
    );
}

// Single falling character with glow
function FallingChar({
    position,
    speed,
    delay
}: {
    position: [number, number, number];
    speed: number;
    delay: number;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;

        const time = state.clock.elapsedTime * speed + delay;
        const y = ((time % 8) - 4) * -1;

        meshRef.current.position.y = y;

        // Brightness based on position (brighter at top)
        const brightness = Math.max(0.2, 1 - (y + 4) / 8);
        const material = meshRef.current.material as THREE.MeshBasicMaterial;
        material.opacity = brightness * 0.8;

        if (glowRef.current) {
            glowRef.current.position.y = y;
            const glowMaterial = glowRef.current.material as THREE.MeshBasicMaterial;
            glowMaterial.opacity = brightness * 0.3;
        }
    });

    return (
        <group position={position}>
            {/* Glow behind */}
            <mesh ref={glowRef}>
                <planeGeometry args={[0.3, 0.3]} />
                <meshBasicMaterial
                    color="#00ff88"
                    transparent
                    opacity={0.3}
                />
            </mesh>

            {/* Main character */}
            <mesh ref={meshRef}>
                <planeGeometry args={[0.15, 0.2]} />
                <meshBasicMaterial
                    color="#00ffaa"
                    transparent
                    opacity={0.8}
                />
            </mesh>
        </group>
    );
}

// Matrix rain particles
function MatrixRainParticles() {
    const pointsRef = useRef<THREE.Points>(null);

    const { positions, velocities, brightness } = useMemo(() => {
        const count = 500;
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count);
        const brightness = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 10;
            positions[i3 + 1] = (Math.random() - 0.5) * 10;
            positions[i3 + 2] = (Math.random() - 0.5) * 2;
            velocities[i] = 0.5 + Math.random() * 1.5;
            brightness[i] = Math.random();
        }

        return { positions, velocities, brightness };
    }, []);

    useFrame((state, delta) => {
        if (!pointsRef.current) return;

        const positionAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;

        for (let i = 0; i < positions.length / 3; i++) {
            const i3 = i * 3;

            // Move down
            positionAttr.array[i3 + 1] -= velocities[i] * delta * 2;

            // Reset when below view
            if (positionAttr.array[i3 + 1] < -5) {
                positionAttr.array[i3 + 1] = 5;
                positionAttr.array[i3] = (Math.random() - 0.5) * 10;
            }
        }

        positionAttr.needsUpdate = true;
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
            </bufferGeometry>
            <pointsMaterial
                color="#00ff88"
                size={0.05}
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

interface MatrixRainProps {
    className?: string;
    intensity?: 'light' | 'medium' | 'heavy';
}

export function MatrixRain({ className = '', intensity = 'medium' }: MatrixRainProps) {
    const particleMultiplier = intensity === 'light' ? 0.5 : intensity === 'heavy' ? 1.5 : 1;

    return (
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
            <Canvas
                camera={{ position: [0, 0, 5], fov: 60 }}
                style={{ background: 'transparent' }}
            >
                <MatrixRainParticles />

                {/* Create streams of falling characters */}
                {Array.from({ length: Math.floor(20 * particleMultiplier) }).map((_, i) => (
                    <FallingChar
                        key={i}
                        position={[
                            (Math.random() - 0.5) * 8,
                            0,
                            (Math.random() - 0.5) * 2
                        ]}
                        speed={0.3 + Math.random() * 0.5}
                        delay={Math.random() * 8}
                    />
                ))}
            </Canvas>

            {/* Gradient overlay for depth */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.5) 100%)',
                }}
            />
        </div>
    );
}

export default MatrixRain;
