'use client';

import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Holographic Avatar Particles
function HologramParticles({ isThinking = false }: { isThinking?: boolean }) {
    const pointsRef = useRef<THREE.Points>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const { positions, colors, sizes, originalPositions } = useMemo(() => {
        const count = 3000;
        const positions = new Float32Array(count * 3);
        const originalPositions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        // Create a head-like shape using spherical coordinates
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Different distributions for head shape
            if (i < count * 0.6) {
                // Main head sphere
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const r = 1.2 + Math.random() * 0.3;

                positions[i3] = r * Math.sin(phi) * Math.cos(theta);
                positions[i3 + 1] = r * Math.cos(phi) * 0.9 + 0.3; // Slightly elongated
                positions[i3 + 2] = r * Math.sin(phi) * Math.sin(theta);
            } else if (i < count * 0.8) {
                // Neck/shoulders area
                const theta = Math.random() * Math.PI * 2;
                const r = 0.8 + Math.random() * 0.4;
                const y = -0.8 - Math.random() * 0.6;

                positions[i3] = r * Math.cos(theta);
                positions[i3 + 1] = y;
                positions[i3 + 2] = r * Math.sin(theta) * 0.6;
            } else {
                // Floating particles around
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const r = 1.8 + Math.random() * 0.8;

                positions[i3] = r * Math.sin(phi) * Math.cos(theta);
                positions[i3 + 1] = r * Math.cos(phi) * 0.7;
                positions[i3 + 2] = r * Math.sin(phi) * Math.sin(theta);
            }

            // Store original positions for animation
            originalPositions[i3] = positions[i3];
            originalPositions[i3 + 1] = positions[i3 + 1];
            originalPositions[i3 + 2] = positions[i3 + 2];

            // Holographic cyan/purple colors
            const colorChoice = Math.random();
            if (colorChoice < 0.5) {
                // Cyan
                colors[i3] = 0.1;
                colors[i3 + 1] = 0.8 + Math.random() * 0.2;
                colors[i3 + 2] = 1;
            } else if (colorChoice < 0.8) {
                // Purple
                colors[i3] = 0.5 + Math.random() * 0.2;
                colors[i3 + 1] = 0.3;
                colors[i3 + 2] = 0.9 + Math.random() * 0.1;
            } else {
                // White highlight
                colors[i3] = 0.9;
                colors[i3 + 1] = 0.9;
                colors[i3 + 2] = 1;
            }

            sizes[i] = Math.random() * 3 + 1;
        }

        return { positions, colors, sizes, originalPositions };
    }, []);

    useFrame((state) => {
        if (!pointsRef.current || !materialRef.current) return;

        const time = state.clock.elapsedTime;
        const geometry = pointsRef.current.geometry;
        const positionAttr = geometry.getAttribute('position') as THREE.BufferAttribute;

        // Animate particles
        for (let i = 0; i < positions.length / 3; i++) {
            const i3 = i * 3;

            // Breathing/pulsing effect
            const breathe = Math.sin(time * 0.5 + i * 0.01) * 0.05;

            // Glitch effect when thinking
            const glitch = isThinking
                ? (Math.random() > 0.95 ? (Math.random() - 0.5) * 0.3 : 0)
                : 0;

            // Wave distortion
            const wave = Math.sin(time * 2 + originalPositions[i3 + 1] * 3) * 0.02;

            positionAttr.array[i3] = originalPositions[i3] * (1 + breathe) + wave + glitch;
            positionAttr.array[i3 + 1] = originalPositions[i3 + 1] * (1 + breathe);
            positionAttr.array[i3 + 2] = originalPositions[i3 + 2] * (1 + breathe) + glitch;
        }

        positionAttr.needsUpdate = true;

        // Rotate slowly
        pointsRef.current.rotation.y = Math.sin(time * 0.2) * 0.1;

        // Update uniforms
        materialRef.current.uniforms.uTime.value = time;
        materialRef.current.uniforms.uThinking.value = isThinking ? 1.0 : 0.0;
    });

    const vertexShader = `
    attribute float size;
    varying vec3 vColor;
    uniform float uTime;
    uniform float uThinking;
    
    void main() {
      vColor = color;
      
      vec3 pos = position;
      
      // Add subtle movement
      float wave = sin(uTime * 2.0 + position.y * 5.0) * 0.02;
      pos.x += wave;
      pos.z += wave * 0.5;
      
      // Thinking pulse
      if (uThinking > 0.5) {
        float pulse = sin(uTime * 10.0 + position.y * 3.0) * 0.1;
        pos *= 1.0 + pulse * 0.05;
      }
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

    const fragmentShader = `
    varying vec3 vColor;
    uniform float uTime;
    
    void main() {
      // Circular point
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      if (dist > 0.5) discard;
      
      // Soft glow
      float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
      alpha *= 0.8;
      
      // Holographic flicker
      float flicker = sin(uTime * 20.0 + gl_FragCoord.y * 0.1) * 0.1 + 0.9;
      
      gl_FragColor = vec4(vColor * flicker, alpha);
    }
  `;

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
                <bufferAttribute
                    attach="attributes-size"
                    count={sizes.length}
                    array={sizes}
                    itemSize={1}
                />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={{
                    uTime: { value: 0 },
                    uThinking: { value: 0 },
                }}
                transparent
                vertexColors
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

// Holographic rings around the avatar
function HologramRings() {
    const ringsRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!ringsRef.current) return;
        const time = state.clock.elapsedTime;

        ringsRef.current.children.forEach((ring, i) => {
            ring.rotation.x = Math.sin(time * 0.3 + i) * 0.2;
            ring.rotation.z = Math.cos(time * 0.2 + i * 0.5) * 0.1;
        });
    });

    return (
        <group ref={ringsRef}>
            {[1.6, 2.0, 2.4].map((radius, i) => (
                <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.5 + i * 0.1, 0]}>
                    <torusGeometry args={[radius, 0.01, 16, 100]} />
                    <meshBasicMaterial
                        color={i % 2 === 0 ? '#00ffff' : '#8b7ec8'}
                        transparent
                        opacity={0.3 - i * 0.05}
                    />
                </mesh>
            ))}
        </group>
    );
}

// Scanline effect
function Scanlines() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        const material = meshRef.current.material as THREE.ShaderMaterial;
        material.uniforms.uTime.value = state.clock.elapsedTime;
    });

    const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

    const fragmentShader = `
    varying vec2 vUv;
    uniform float uTime;
    
    void main() {
      // Moving scanline
      float scanline = step(0.98, sin((vUv.y + uTime * 0.5) * 100.0));
      
      // Horizontal lines
      float lines = sin(vUv.y * 200.0) * 0.5 + 0.5;
      lines = step(0.8, lines);
      
      float alpha = scanline * 0.3 + lines * 0.02;
      
      gl_FragColor = vec4(0.0, 1.0, 1.0, alpha);
    }
  `;

    return (
        <mesh ref={meshRef} position={[0, 0, 1]}>
            <planeGeometry args={[6, 6]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={{ uTime: { value: 0 } }}
                transparent
                depthWrite={false}
            />
        </mesh>
    );
}

interface HolographicAvatarProps {
    isThinking?: boolean;
    className?: string;
}

export function HolographicAvatar({ isThinking = false, className = '' }: HolographicAvatarProps) {
    return (
        <div className={`relative ${className}`}>
            <Canvas
                camera={{ position: [0, 0, 4], fov: 50 }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.5} />
                <HologramParticles isThinking={isThinking} />
                <HologramRings />
                <Scanlines />
            </Canvas>

            {/* Glow effect overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(0, 255, 255, 0.1) 0%, transparent 60%)',
                }}
            />

            {/* Status indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <div
                    className={`w-2 h-2 rounded-full ${isThinking
                            ? 'bg-yellow-400 animate-pulse'
                            : 'bg-cyan-400'
                        }`}
                />
                <span className="text-xs font-mono text-cyan-400/80">
                    {isThinking ? 'PROCESSING...' : 'ONLINE'}
                </span>
            </div>
        </div>
    );
}

export default HolographicAvatar;
