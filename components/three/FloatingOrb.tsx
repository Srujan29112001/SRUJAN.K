'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Inner glowing orb
function GlowingOrb({ mousePosition }: { mousePosition: React.MutableRefObject<{ x: number; y: number }> }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.elapsedTime;

        // Subtle rotation
        meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.2;
        meshRef.current.rotation.y = time * 0.1;

        // Mouse-reactive tilt
        meshRef.current.rotation.x += mousePosition.current.y * 0.3;
        meshRef.current.rotation.z = mousePosition.current.x * 0.2;

        // Update shader uniforms
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = time;
        }
    });

    const vertexShader = `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        uniform float uTime;
        
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            vUv = uv;
            
            // Subtle vertex displacement
            vec3 pos = position;
            float displacement = sin(pos.x * 5.0 + uTime) * sin(pos.y * 5.0 + uTime) * 0.02;
            pos += normal * displacement;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `;

    const fragmentShader = `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        uniform float uTime;
        
        void main() {
            // Fresnel effect for edge glow
            vec3 viewDirection = normalize(cameraPosition - vPosition);
            float fresnel = pow(1.0 - dot(viewDirection, vNormal), 3.0);
            
            // Gradient colors - purple to cyan
            vec3 color1 = vec3(0.6, 0.2, 0.9); // Purple
            vec3 color2 = vec3(0.0, 0.9, 0.9); // Cyan
            
            // Animated gradient
            float gradient = sin(vUv.y * 3.14159 + uTime * 0.5) * 0.5 + 0.5;
            vec3 baseColor = mix(color1, color2, gradient);
            
            // Add fresnel glow
            vec3 finalColor = baseColor + fresnel * vec3(0.3, 0.5, 1.0);
            
            // Inner glow
            float innerGlow = pow(fresnel, 2.0) * 0.5;
            finalColor += innerGlow * color2;
            
            gl_FragColor = vec4(finalColor, 0.9 - fresnel * 0.3);
        }
    `;

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[1.5, 64, 64]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={{ uTime: { value: 0 } }}
                transparent
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

// Orbiting particles
function OrbitingParticles({ mousePosition }: { mousePosition: React.MutableRefObject<{ x: number; y: number }> }) {
    const pointsRef = useRef<THREE.Points>(null);

    const { positions, colors } = useMemo(() => {
        const count = 500;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const radius = 2 + Math.random() * 1.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            // Purple to cyan gradient
            const t = Math.random();
            colors[i3] = 0.4 + t * 0.2; // R
            colors[i3 + 1] = 0.2 + t * 0.7; // G
            colors[i3 + 2] = 0.9; // B
        }

        return { positions, colors };
    }, []);

    useFrame((state) => {
        if (!pointsRef.current) return;
        const time = state.clock.elapsedTime;

        // Rotate particles
        pointsRef.current.rotation.y = time * 0.1;
        pointsRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;

        // Mouse influence
        pointsRef.current.rotation.x += mousePosition.current.y * 0.2;
        pointsRef.current.rotation.z = mousePosition.current.x * 0.1;
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
                size={0.03}
                vertexColors
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

// Glowing rings
function OrbitalRings({ mousePosition }: { mousePosition: React.MutableRefObject<{ x: number; y: number }> }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        const time = state.clock.elapsedTime;

        groupRef.current.children.forEach((ring, i) => {
            ring.rotation.z = time * (0.1 + i * 0.05);
            ring.rotation.x = Math.sin(time * 0.3 + i) * 0.3 + mousePosition.current.y * 0.2;
        });
    });

    return (
        <group ref={groupRef}>
            {[1.8, 2.2, 2.6].map((radius, i) => (
                <mesh key={i} rotation={[Math.PI / 2 + i * 0.2, 0, i * 0.5]}>
                    <torusGeometry args={[radius, 0.008, 16, 100]} />
                    <meshBasicMaterial
                        color={i === 0 ? '#8b5cf6' : i === 1 ? '#06b6d4' : '#a855f7'}
                        transparent
                        opacity={0.4 - i * 0.1}
                    />
                </mesh>
            ))}
        </group>
    );
}

// Scene content
function Scene({ mousePosition }: { mousePosition: React.MutableRefObject<{ x: number; y: number }> }) {
    return (
        <>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />

            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <GlowingOrb mousePosition={mousePosition} />
            </Float>
            <OrbitingParticles mousePosition={mousePosition} />
            <OrbitalRings mousePosition={mousePosition} />
        </>
    );
}

interface FloatingOrbProps {
    className?: string;
}

export function FloatingOrb({ className = '' }: FloatingOrbProps) {
    const mousePosition = useRef({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        mousePosition.current = { x, y };
    };

    return (
        <div
            className={`${className}`}
            onMouseMove={handleMouseMove}
        >
            <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                style={{ background: 'transparent' }}
                gl={{ alpha: true, antialias: true }}
            >
                <Scene mousePosition={mousePosition} />
            </Canvas>
        </div>
    );
}

export default FloatingOrb;
