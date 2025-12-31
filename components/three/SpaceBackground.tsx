'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Multi-layer star field with realistic Andromeda-style colors
function StarField() {
    const starsRef = useRef<THREE.Points>(null);
    const brightStarsRef = useRef<THREE.Points>(null);
    const distantStarsRef = useRef<THREE.Points>(null);

    // Main stars with realistic color distribution
    const mainStars = useMemo(() => {
        const count = 4000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const radius = 25 + Math.random() * 80;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            // Realistic star colors matching Andromeda field
            const colorTemp = Math.random();
            if (colorTemp > 0.90) {
                // Bright blue-white stars
                colors[i3] = 0.7; colors[i3 + 1] = 0.85; colors[i3 + 2] = 1.0;
            } else if (colorTemp > 0.75) {
                // Cool white stars
                colors[i3] = 0.95; colors[i3 + 1] = 0.95; colors[i3 + 2] = 1.0;
            } else if (colorTemp > 0.50) {
                // Warm white/yellow stars
                colors[i3] = 1.0; colors[i3 + 1] = 0.95; colors[i3 + 2] = 0.85;
            } else if (colorTemp > 0.25) {
                // Orange-tinted stars
                colors[i3] = 1.0; colors[i3 + 1] = 0.8; colors[i3 + 2] = 0.55;
            } else if (colorTemp > 0.08) {
                // Deep orange/red stars
                colors[i3] = 1.0; colors[i3 + 1] = 0.55; colors[i3 + 2] = 0.35;
            } else {
                // Rare reddish stars
                colors[i3] = 1.0; colors[i3 + 1] = 0.4; colors[i3 + 2] = 0.3;
            }
        }

        return { positions, colors };
    }, []);

    // Bright prominent stars
    const brightStars = useMemo(() => {
        const count = 180;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const radius = 18 + Math.random() * 60;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            const starType = Math.random();
            if (starType > 0.90) {
                // Very bright blue-white stars
                colors[i3] = 0.85; colors[i3 + 1] = 0.92; colors[i3 + 2] = 1.0;
            } else if (starType > 0.80) {
                // Bright orange/red stars
                colors[i3] = 1.0; colors[i3 + 1] = 0.5; colors[i3 + 2] = 0.3;
            } else if (starType > 0.55) {
                // White stars
                colors[i3] = 1.0; colors[i3 + 1] = 1.0; colors[i3 + 2] = 0.98;
            } else {
                // Warm yellow/white stars
                colors[i3] = 1.0; colors[i3 + 1] = 0.9; colors[i3 + 2] = 0.7;
            }
        }

        return { positions, colors };
    }, []);

    // Very distant faint stars
    const distantStars = useMemo(() => {
        const count = 5000;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const radius = 50 + Math.random() * 60;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
        }

        return positions;
    }, []);

    useFrame((state) => {
        if (!starsRef.current) return;
        starsRef.current.rotation.y = state.clock.elapsedTime * 0.002;
        if (brightStarsRef.current) brightStarsRef.current.rotation.y = state.clock.elapsedTime * 0.001;
        if (distantStarsRef.current) distantStarsRef.current.rotation.y = state.clock.elapsedTime * 0.0005;
    });

    return (
        <>
            <points ref={starsRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={mainStars.positions.length / 3} array={mainStars.positions} itemSize={3} />
                    <bufferAttribute attach="attributes-color" count={mainStars.colors.length / 3} array={mainStars.colors} itemSize={3} />
                </bufferGeometry>
                <pointsMaterial size={0.08} vertexColors transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
            </points>

            <points ref={brightStarsRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={brightStars.positions.length / 3} array={brightStars.positions} itemSize={3} />
                    <bufferAttribute attach="attributes-color" count={brightStars.colors.length / 3} array={brightStars.colors} itemSize={3} />
                </bufferGeometry>
                <pointsMaterial size={0.22} vertexColors transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} />
            </points>

            <points ref={distantStarsRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={distantStars.length / 3} array={distantStars} itemSize={3} />
                </bufferGeometry>
                <pointsMaterial size={0.035} color="#e0dcd8" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
            </points>
        </>
    );
}

// Andromeda-style spiral galaxy with bright cream core and prominent dust lanes
function SpiralGalaxy() {
    const galaxyRef = useRef<THREE.Points>(null);
    const coreRef = useRef<THREE.Points>(null);
    const dustRef = useRef<THREE.Points>(null);
    const blueHazeRef = useRef<THREE.Points>(null);
    const redNebulaRef = useRef<THREE.Points>(null);

    // Main spiral arms - cream/white transitioning to blue outer regions
    const galaxyParticles = useMemo(() => {
        const count = 15000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const arms = 2;
        const spin = 2.0;
        const randomness = 0.32;
        const randomnessPower = 3.0;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const radius = Math.random() * 18;
            const spinAngle = radius * spin;
            const branchAngle = ((i % arms) / arms) * Math.PI * 2;

            const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * radius;
            const randomY = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * 0.1;
            const randomZ = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * radius;

            positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
            positions[i3 + 1] = randomY;
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

            // Color gradient: bright cream core -> peachy mid -> blue-white outer
            const mixRatio = radius / 18;

            if (mixRatio < 0.2) {
                // Bright cream/white core
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.95 - mixRatio * 0.15;
                colors[i3 + 2] = 0.85 - mixRatio * 0.3;
            } else if (mixRatio < 0.45) {
                // Peachy/cream transition zone
                const t = (mixRatio - 0.2) / 0.25;
                colors[i3] = 1.0 - t * 0.1;
                colors[i3 + 1] = 0.92 - t * 0.15;
                colors[i3 + 2] = 0.79 - t * 0.1;
            } else if (mixRatio < 0.7) {
                // Blue-white middle region
                const t = (mixRatio - 0.45) / 0.25;
                colors[i3] = 0.9 - t * 0.25;
                colors[i3 + 1] = 0.77 + t * 0.08;
                colors[i3 + 2] = 0.69 + t * 0.25;
            } else {
                // Blue outer edges
                const t = (mixRatio - 0.7) / 0.3;
                colors[i3] = 0.65 - t * 0.2;
                colors[i3 + 1] = 0.85 - t * 0.1;
                colors[i3 + 2] = 0.94;
            }
        }

        return { positions, colors };
    }, []);

    // Bright glowing core - cream/white like in reference
    const coreParticles = useMemo(() => {
        const count = 3500;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const radius = Math.pow(Math.random(), 2.0) * 4;
            const theta = Math.random() * Math.PI * 2;
            const height = (Math.random() - 0.5) * 0.2 * (1 - radius / 4);

            positions[i3] = Math.cos(theta) * radius;
            positions[i3 + 1] = height;
            positions[i3 + 2] = Math.sin(theta) * radius;

            // Bright cream/white core
            const brightness = 1 - (radius / 4) * 0.12;
            colors[i3] = brightness;
            colors[i3 + 1] = brightness * 0.94;
            colors[i3 + 2] = brightness * 0.8;
        }

        return { positions, colors };
    }, []);

    // Prominent dark brown/rust dust lanes
    const dustParticles = useMemo(() => {
        const count = 5000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const angle = Math.random() * Math.PI * 2;
            const radius = 1.5 + Math.random() * 14;
            const spiral = radius * 1.15;

            positions[i3] = Math.cos(angle + spiral) * radius + (Math.random() - 0.5) * 1.0;
            positions[i3 + 1] = (Math.random() - 0.5) * 0.12;
            positions[i3 + 2] = Math.sin(angle + spiral) * radius + (Math.random() - 0.5) * 1.0;

            // Dark brown/rust dust color like in reference
            const dustVariation = Math.random();
            if (dustVariation > 0.55) {
                // Darker rust
                colors[i3] = 0.28 + Math.random() * 0.1;
                colors[i3 + 1] = 0.14 + Math.random() * 0.06;
                colors[i3 + 2] = 0.08 + Math.random() * 0.04;
            } else {
                // Very dark brown
                colors[i3] = 0.18 + Math.random() * 0.08;
                colors[i3 + 1] = 0.09 + Math.random() * 0.04;
                colors[i3 + 2] = 0.05 + Math.random() * 0.03;
            }
        }

        return { positions, colors };
    }, []);

    // Blue nebulous haze on outer edges
    const blueHazeParticles = useMemo(() => {
        const count = 2500;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const angle = Math.random() * Math.PI * 2;
            const radius = 10 + Math.random() * 12;

            positions[i3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 5;
            positions[i3 + 1] = (Math.random() - 0.5) * 1.0;
            positions[i3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 5;

            // Blue nebulous glow
            colors[i3] = 0.28 + Math.random() * 0.12;
            colors[i3 + 1] = 0.45 + Math.random() * 0.2;
            colors[i3 + 2] = 0.8 + Math.random() * 0.2;
        }

        return { positions, colors };
    }, []);

    // Scattered red H-II nebula regions
    const redNebulaParticles = useMemo(() => {
        const count = 1200;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const angle = Math.random() * Math.PI * 2;
            const radius = 4 + Math.random() * 11;
            const spiral = radius * 2.0;

            positions[i3] = Math.cos(angle + spiral) * radius + (Math.random() - 0.5) * 2;
            positions[i3 + 1] = (Math.random() - 0.5) * 0.12;
            positions[i3 + 2] = Math.sin(angle + spiral) * radius + (Math.random() - 0.5) * 2;

            // Red/orange H-II regions like in reference
            colors[i3] = 0.88 + Math.random() * 0.12;
            colors[i3 + 1] = 0.22 + Math.random() * 0.15;
            colors[i3 + 2] = 0.12 + Math.random() * 0.1;
        }

        return { positions, colors };
    }, []);

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        if (galaxyRef.current) galaxyRef.current.rotation.y = time * 0.012;
        if (coreRef.current) coreRef.current.rotation.y = time * 0.015;
        if (dustRef.current) dustRef.current.rotation.y = time * 0.011;
        if (blueHazeRef.current) blueHazeRef.current.rotation.y = time * 0.008;
        if (redNebulaRef.current) redNebulaRef.current.rotation.y = time * 0.012;
    });

    return (
        <group position={[0, -2, 0]} rotation={[-0.55, 0.15, 0.1]}>
            {/* Blue outer haze */}
            <points ref={blueHazeRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={blueHazeParticles.positions.length / 3} array={blueHazeParticles.positions} itemSize={3} />
                    <bufferAttribute attach="attributes-color" count={blueHazeParticles.colors.length / 3} array={blueHazeParticles.colors} itemSize={3} />
                </bufferGeometry>
                <pointsMaterial size={0.15} vertexColors transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
            </points>

            {/* Dust lanes */}
            <points ref={dustRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={dustParticles.positions.length / 3} array={dustParticles.positions} itemSize={3} />
                    <bufferAttribute attach="attributes-color" count={dustParticles.colors.length / 3} array={dustParticles.colors} itemSize={3} />
                </bufferGeometry>
                <pointsMaterial size={0.1} vertexColors transparent opacity={0.65} blending={THREE.AdditiveBlending} depthWrite={false} />
            </points>

            {/* Main spiral */}
            <points ref={galaxyRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={galaxyParticles.positions.length / 3} array={galaxyParticles.positions} itemSize={3} />
                    <bufferAttribute attach="attributes-color" count={galaxyParticles.colors.length / 3} array={galaxyParticles.colors} itemSize={3} />
                </bufferGeometry>
                <pointsMaterial size={0.05} vertexColors transparent opacity={0.92} blending={THREE.AdditiveBlending} depthWrite={false} />
            </points>

            {/* Red nebula regions */}
            <points ref={redNebulaRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={redNebulaParticles.positions.length / 3} array={redNebulaParticles.positions} itemSize={3} />
                    <bufferAttribute attach="attributes-color" count={redNebulaParticles.colors.length / 3} array={redNebulaParticles.colors} itemSize={3} />
                </bufferGeometry>
                <pointsMaterial size={0.08} vertexColors transparent opacity={0.75} blending={THREE.AdditiveBlending} depthWrite={false} />
            </points>

            {/* Glowing core */}
            <points ref={coreRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={coreParticles.positions.length / 3} array={coreParticles.positions} itemSize={3} />
                    <bufferAttribute attach="attributes-color" count={coreParticles.colors.length / 3} array={coreParticles.colors} itemSize={3} />
                </bufferGeometry>
                <pointsMaterial size={0.1} vertexColors transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} />
            </points>
        </group>
    );
}

// Gyroscope-enabled camera controller
function GyroscopeController() {
    const groupRef = useRef<THREE.Group>(null);
    const targetRotation = useRef({ x: 0, y: 0 });
    const currentRotation = useRef({ x: 0, y: 0 });
    const isMobile = useRef(false);
    const hasGyroscope = useRef(false);
    const permissionRequested = useRef(false);

    useMemo(() => {
        if (typeof window !== 'undefined') {
            isMobile.current = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 2);
        }
    }, []);

    // Setup gyroscope on mount
    useMemo(() => {
        if (typeof window === 'undefined' || !isMobile.current) return;

        // Check if DeviceOrientationEvent exists (not available during SSR)
        if (typeof DeviceOrientationEvent === 'undefined') return;

        const handleOrientation = (event: DeviceOrientationEvent) => {
            if (event.gamma === null || event.beta === null) return;

            hasGyroscope.current = true;

            // gamma: left-right tilt (-90 to 90)
            // beta: front-back tilt (-180 to 180)
            const gamma = event.gamma || 0;
            const beta = event.beta || 0;

            // Normalize and limit the tilt values
            // Divide by larger values for subtler effect
            targetRotation.current.y = (gamma / 90) * 0.3; // Left-right
            targetRotation.current.x = ((beta - 45) / 90) * 0.2; // Front-back (offset by 45 for natural holding angle)
        };

        const requestPermission = async () => {
            if (permissionRequested.current) return;
            permissionRequested.current = true;

            // iOS 13+ requires permission request
            const deviceOrientationEvent = DeviceOrientationEvent as any;
            if (typeof deviceOrientationEvent.requestPermission === 'function') {
                try {
                    const permission = await deviceOrientationEvent.requestPermission();
                    if (permission === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation, true);
                    }
                } catch (error) {
                    console.log('Gyroscope permission denied');
                }
            } else {
                // Non-iOS devices
                window.addEventListener('deviceorientation', handleOrientation, true);
            }
        };

        // Request permission on first touch (iOS requirement)
        const handleFirstTouch = () => {
            requestPermission();
            window.removeEventListener('touchstart', handleFirstTouch);
        };

        window.addEventListener('touchstart', handleFirstTouch, { once: true });

        // Try immediately for non-iOS
        const deviceOrientationEvent = DeviceOrientationEvent as any;
        if (typeof deviceOrientationEvent.requestPermission !== 'function') {
            window.addEventListener('deviceorientation', handleOrientation, true);
        }

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
            window.removeEventListener('touchstart', handleFirstTouch);
        };
    }, []);

    // Smooth animation loop
    useFrame(() => {
        if (!groupRef.current) return;

        // Smooth interpolation (lerp)
        const lerpFactor = 0.05;
        currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * lerpFactor;
        currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * lerpFactor;

        // Apply rotation to the group
        groupRef.current.rotation.x = currentRotation.current.x;
        groupRef.current.rotation.y = currentRotation.current.y;
    });

    return <group ref={groupRef} />;
}

// Wrapper group that responds to gyroscope
function GyroscopeWrapper({ children }: { children: React.ReactNode }) {
    const groupRef = useRef<THREE.Group>(null);
    const targetRotation = useRef({ x: 0, y: 0 });
    const currentRotation = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 2);

        if (!isMobile) return;

        // Check if DeviceOrientationEvent exists (not available during SSR)
        if (typeof DeviceOrientationEvent === 'undefined') return;

        console.log('Gyroscope: Setting up event listeners for mobile device');

        const handleOrientation = (event: DeviceOrientationEvent) => {
            if (event.gamma === null || event.beta === null) return;

            const gamma = event.gamma || 0;
            const beta = event.beta || 0;

            // Normalize values for subtle parallax effect
            targetRotation.current.y = (gamma / 90) * 0.4;
            targetRotation.current.x = ((beta - 45) / 90) * 0.3;

            console.log('Gyroscope values:', { gamma, beta });
        };

        const requestPermission = async () => {
            // Check if requestPermission exists (iOS 13+)
            const deviceOrientationEvent = DeviceOrientationEvent as any;
            if (typeof deviceOrientationEvent.requestPermission === 'function') {
                try {
                    console.log('Gyroscope: Requesting iOS permission...');
                    const permission = await deviceOrientationEvent.requestPermission();
                    console.log('Gyroscope: Permission result:', permission);
                    if (permission === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation, true);
                    }
                } catch (error) {
                    console.log('Gyroscope permission denied:', error);
                }
            } else {
                console.log('Gyroscope: Non-iOS device, adding listener directly');
                window.addEventListener('deviceorientation', handleOrientation, true);
            }
        };

        const handleFirstTouch = () => {
            console.log('Gyroscope: First touch detected, requesting permission');
            requestPermission();
        };

        window.addEventListener('touchstart', handleFirstTouch, { once: true });

        // For non-iOS devices, start listening immediately
        const deviceOrientationEvent = DeviceOrientationEvent as any;
        if (typeof deviceOrientationEvent.requestPermission !== 'function') {
            console.log('Gyroscope: Starting listeners immediately (non-iOS)');
            window.addEventListener('deviceorientation', handleOrientation, true);
        }

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
            window.removeEventListener('touchstart', handleFirstTouch);
        };
    }, []);

    useFrame(() => {
        if (!groupRef.current) return;

        const lerpFactor = 0.03;
        currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * lerpFactor;
        currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * lerpFactor;

        groupRef.current.rotation.x = currentRotation.current.x;
        groupRef.current.rotation.y = currentRotation.current.y;
    });

    return <group ref={groupRef}>{children}</group>;
}

// Scene with gyroscope support
function Scene() {
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile on client side
    useMemo(() => {
        if (typeof window !== 'undefined') {
            const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 2);
            setIsMobile(mobile);
        }
    }, []);

    return (
        <>
            <color attach="background" args={['#030305']} />
            <fog attach="fog" args={['#030305', 40, 130]} />

            {/* Wrap everything in gyroscope-responsive group */}
            <GyroscopeWrapper>
                <StarField />
                <SpiralGalaxy />
            </GyroscopeWrapper>

            {/* OrbitControls - disable rotation on mobile to let gyroscope take over */}
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                enableRotate={!isMobile}
                rotateSpeed={0.4}
                autoRotate={!isMobile}
                autoRotateSpeed={0.12}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 1.5}
                touches={{ ONE: isMobile ? undefined : THREE.TOUCH.ROTATE, TWO: undefined }}
            />
        </>
    );
}

interface SpaceBackgroundProps {
    className?: string;
}

export function SpaceBackground({ className = '' }: SpaceBackgroundProps) {
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile on client side
    useMemo(() => {
        if (typeof window !== 'undefined') {
            const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 2);
            setIsMobile(mobile);
        }
    }, []);

    return (
        <div
            className={className}
            style={{
                touchAction: 'pan-y', // Allow vertical scrolling
                pointerEvents: isMobile ? 'none' : 'auto' // Let touch events pass through on mobile
            }}
        >
            <Canvas
                camera={{ position: [0, 6, 20], fov: 50 }}
                gl={{
                    alpha: true,
                    antialias: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.3
                }}
                dpr={[1, 2]}
                style={{
                    touchAction: 'pan-y',
                    pointerEvents: isMobile ? 'none' : 'auto'
                }}
            >
                <Scene />
            </Canvas>
        </div>
    );
}

export default SpaceBackground;
