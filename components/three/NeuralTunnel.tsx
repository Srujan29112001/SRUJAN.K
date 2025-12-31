'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const vertexShader = `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uScroll;
  
  attribute float aRandom;
  attribute float aSize;
  attribute vec3 aColor;
  
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    vColor = aColor;
    
    // Calculate position in tunnel
    vec3 pos = position;
    
    // Move particles towards camera (z-axis)
    // uTime * uSpeed creates the base flow
    // uScroll adds the "warp" acceleration
    float zOffset = (uTime * 5.0 * uSpeed) + (uScroll * 50.0);
    
    // Loop particles
    pos.z = mod(pos.z + zOffset, 100.0) - 50.0;
    
    // Spiral effect based on depth
    float angle = pos.z * 0.02;
    float x = pos.x * cos(angle) - pos.y * sin(angle);
    float y = pos.x * sin(angle) + pos.y * cos(angle);
    pos.x = x;
    pos.y = y;
    
    // Warp distortion at high speeds
    pos.z += sin(pos.x * 0.1 + uTime) * uSpeed;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = aSize * (20.0 / -mvPosition.z);
    
    // Fade out at ends
    float dist = abs(pos.z);
    vAlpha = 1.0 - smoothstep(20.0, 50.0, dist);
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    // Circular particle
    vec2 uv = gl_PointCoord.xy - 0.5;
    float r = length(uv);
    if (r > 0.5) discard;
    
    // Soft glow
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);
    
    gl_FragColor = vec4(vColor, vAlpha * glow);
  }
`;

export function NeuralTunnel() {
    const pointsRef = useRef<THREE.Points>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { viewport } = useThree();

    // Generate particles - OPTIMIZED: Reduced from 4000 to 1500 for performance
    const count = 1500;
    const [positions, colors, randoms, sizes] = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const randoms = new Float32Array(count);
        const sizes = new Float32Array(count);

        const color1 = new THREE.Color('#6D64A3'); // Primary Purple
        const color2 = new THREE.Color('#06B6D4'); // Secondary Cyan
        const color3 = new THREE.Color('#F59E0B'); // Accent Amber

        for (let i = 0; i < count; i++) {
            // Tunnel shape
            const angle = Math.random() * Math.PI * 2;
            // Radius varies to create a "cave" or "tunnel" feel
            const radius = 5 + Math.random() * 15;
            const z = (Math.random() - 0.5) * 100;

            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = Math.sin(angle) * radius;
            positions[i * 3 + 2] = z;

            // Random colors from palette
            const mixedColor = Math.random() > 0.5 ? color1 : (Math.random() > 0.5 ? color2 : color3);
            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;

            randoms[i] = Math.random();
            sizes[i] = Math.random() * 2.0;
        }

        return [positions, colors, randoms, sizes];
    }, []);

    // Animation Loop
    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

            // Get scroll progress (0 to 1)
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const scrollProgress = Math.min(scrollY / windowHeight, 1);

            // Update speed based on scroll
            // Base speed = 1.0, Max Warp Speed = 10.0
            const targetSpeed = 1.0 + (scrollProgress * 20.0);

            // Smooth interpolation for speed
            materialRef.current.uniforms.uSpeed.value += (targetSpeed - materialRef.current.uniforms.uSpeed.value) * 0.1;

            // Pass scroll position directly for position offset
            materialRef.current.uniforms.uScroll.value = scrollProgress * 10.0;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={colors}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aRandom"
                    count={count}
                    array={randoms}
                    itemSize={1}
                />
                <bufferAttribute
                    attach="attributes-aSize"
                    count={count}
                    array={sizes}
                    itemSize={1}
                />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                uniforms={{
                    uTime: { value: 0 },
                    uSpeed: { value: 1.0 },
                    uScroll: { value: 0 },
                }}
            />
        </points>
    );
}
