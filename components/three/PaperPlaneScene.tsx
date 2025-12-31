import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Instances, Instance, Float, Trail, Stars } from '@react-three/drei';

export function PaperPlaneScene({ progressRef }: { progressRef: any }) {
    const groupRef = useRef<THREE.Group>(null);
    const planeRef = useRef<THREE.Group>(null);
    const debrisRef = useRef<THREE.Group>(null);
    const tunnelRef = useRef<THREE.Group>(null);

    // Material Refs for Opacity Control
    const debrisMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
    const tunnelMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

    // --- WARP TUNNEL DATA ---
    const STREAK_COUNT = 600;
    const streaks = useMemo(() => {
        const items = [];
        for (let i = 0; i < STREAK_COUNT; i++) {
            const radius = 20 + Math.random() * 30;
            const theta = Math.random() * Math.PI * 2;
            const x = Math.cos(theta) * radius;
            const y = Math.sin(theta) * radius;
            const z = (Math.random() - 0.5) * 400;

            const colors = ['#22d3ee', '#3b82f6', '#a855f7', '#f97316'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            items.push({
                position: new THREE.Vector3(x, y, z),
                rotation: new THREE.Euler(Math.PI / 2, 0, 0),
                scale: new THREE.Vector3(0.1, 20 + Math.random() * 20, 0.1),
                color: color
            });
        }
        return items;
    }, []);

    // --- DEBRIS DATA (Asteroids) ---
    const DEBRIS_COUNT = 150;
    const debris = useMemo(() => {
        const items = [];
        for (let i = 0; i < DEBRIS_COUNT; i++) {
            // Scatter widely
            const x = (Math.random() - 0.5) * 100;
            const y = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 200;

            items.push({
                position: new THREE.Vector3(x, y, z),
                rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
                scale: Math.random() * 1.5 + 0.5,
            });
        }
        return items;
    }, []);

    useFrame((state) => {
        const progress = progressRef.current?.value || 0;
        const time = state.clock.getElapsedTime();

        // --- STAGE LOGIC ---
        // 0.0 - 0.3: Low Velocity (Debris Visible, Tunnel Hidden)
        // 0.3 - 0.7: Medium Velocity (Debris Blurring, Tunnel Fading In)
        // 0.7 - 1.0: High Velocity (Debris Gone, Tunnel Full)

        // 1. Plane Animation
        if (planeRef.current) {
            // Turbulence increases with progress
            const shake = 0.05 + progress * 0.2;
            planeRef.current.position.y = Math.sin(time * 2.5) * 0.15 + (Math.random() - 0.5) * shake * 0.1;
            planeRef.current.rotation.z = Math.sin(time) * 0.05 - (state.mouse.x * 0.3);
            planeRef.current.rotation.x = Math.sin(time * 0.8) * 0.05 - (state.mouse.y * 0.2);
            planeRef.current.rotation.z -= state.mouse.x * 0.2; // Banking
        }

        // 2. Environment Movement
        const speed = 1 + progress * 80; // Massive speed boost

        // Move Debris
        if (debrisRef.current) {
            // Debris moves, but slower than tunnel
            debrisRef.current.position.z = (time * 5 * (1 + progress * 5)) % 100;

            // Fade out debris in high speeds
            let debrisOpacity = 1;
            if (progress > 0.4) {
                debrisOpacity = 1 - ((progress - 0.4) * 2.5); // Fade out quicker
                debrisOpacity = Math.max(0, debrisOpacity);
            }

            if (debrisMaterialRef.current) {
                debrisMaterialRef.current.opacity = debrisOpacity;
                debrisMaterialRef.current.visible = debrisOpacity > 0.01;
            }
        }

        // Move Tunnel
        if (tunnelRef.current) {
            tunnelRef.current.position.z = (time * 20 * speed) % 200;

            // Fade in tunnel
            let tunnelOpacity = 0;
            if (progress > 0.2) {
                tunnelOpacity = (progress - 0.2) * 2; // Fade in faster
                tunnelOpacity = Math.min(0.8, tunnelOpacity); // Max opacity 0.8
            }

            if (tunnelMaterialRef.current) {
                tunnelMaterialRef.current.opacity = tunnelOpacity;
                tunnelMaterialRef.current.visible = tunnelOpacity > 0.01;
            }
        }

        // 3. Camera Shake ("High Speed" feel)
        const shakeIntensity = Math.max(0, progress - 0.3) * 0.2; // Only shake after starting
        state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.mouse.x * 0.5 + (Math.random() - 0.5) * shakeIntensity, 0.1);
        state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 1 + state.mouse.y * 0.3 + (Math.random() - 0.5) * shakeIntensity, 0.1);

        // FOV Boost
        const targetFOV = 60 + (progress * 40); // 60 -> 100
        const cam = state.camera as THREE.PerspectiveCamera;
        cam.fov = THREE.MathUtils.lerp(cam.fov, targetFOV, 0.1);
        cam.updateProjectionMatrix();
    });

    return (
        <>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 5]} intensity={1.5} color="#fbbf24" distance={50} />
            <pointLight position={[-10, -5, 10]} intensity={1} color="#f97316" distance={50} />

            {/* THE HERO */}
            <group ref={planeRef} position={[0, -1.5, -4]}>
                <GoldenPaperPlane />
                <AstronautPilot />
                <pointLight position={[0, 0.5, 0]} intensity={1} color="#fbbf24" distance={5} />
            </group>

            {/* STAGE 1: DEBRIS FIELD */}
            <group ref={debrisRef}>
                <Instances range={DEBRIS_COUNT}>
                    <dodecahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial
                        ref={debrisMaterialRef}
                        color="#64748b"
                        roughness={0.8}
                        metalness={0.2}
                        transparent
                        opacity={1}
                    />
                    {debris.map((d, i) => (
                        <Instance
                            key={i}
                            position={d.position}
                            rotation={d.rotation}
                            scale={d.scale}
                        />
                    ))}
                </Instances>
            </group>

            {/* STAGE 2 & 3: WARP TUNNEL */}
            <group ref={tunnelRef} visible={true}> {/* Always visible group, control material opacity */}
                <Instances range={STREAK_COUNT}>
                    <cylinderGeometry args={[1, 1, 1, 5]} />
                    <meshBasicMaterial
                        ref={tunnelMaterialRef}
                        toneMapped={false}
                        transparent
                        opacity={0}
                    />
                    {streaks.map((streak, i) => (
                        <Instance
                            key={i}
                            position={streak.position}
                            rotation={streak.rotation}
                            scale={streak.scale}
                            color={streak.color}
                        />
                    ))}
                </Instances>

                {/* High speed stars */}
                <Stars radius={50} depth={100} count={5000} factor={6} saturation={0} fade speed={5} />
            </group>
        </>
    );
}

function GoldenPaperPlane() {
    const shape = useMemo(() => {
        const s = new THREE.Shape();
        s.moveTo(0, 0);
        s.lineTo(-1.8, -3.5);
        s.lineTo(0, -2.2);
        s.lineTo(1.8, -3.5);
        s.lineTo(0, 0);
        return s;
    }, []);

    const geometry = useMemo(() => new THREE.ShapeGeometry(shape), [shape]);

    return (
        <group rotation={[-Math.PI / 2, 0, Math.PI]} scale={[0.8, 0.8, 0.8]}>
            <Float speed={4} rotationIntensity={0.1} floatIntensity={0.1}>
                {/* Crystal Body */}
                <mesh geometry={geometry}>
                    <meshPhysicalMaterial
                        color="#fbbf24"
                        emissive="#d97706"
                        emissiveIntensity={0.5}
                        metalness={0.1}
                        roughness={0.1}
                        transmission={0.5}
                        thickness={2}
                        side={THREE.DoubleSide}
                    />
                </mesh>
                {/* Edges */}
                <mesh geometry={geometry} position={[0, 0, 0.02]}>
                    <meshBasicMaterial color="#fffbeb" wireframe transparent opacity={0.4} />
                </mesh>

                {/* Energy Trails */}
                <group position={[-1.8, -3.5, 0]}>
                    <Trail width={0.6} length={8} color={new THREE.Color("#f59e0b")} attenuation={(t) => t * t}>
                        <mesh visible={false} />
                    </Trail>
                </group>
                <group position={[1.8, -3.5, 0]}>
                    <Trail width={0.6} length={8} color={new THREE.Color("#f59e0b")} attenuation={(t) => t * t}>
                        <mesh visible={false} />
                    </Trail>
                </group>
            </Float>
        </group>
    );
}

function AstronautPilot() {
    return (
        <group position={[0, 0.2, 0]} scale={[0.25, 0.25, 0.25]}>
            {/* Simple but readable shapes */}
            <Float speed={2} rotationIntensity={0.05} floatIntensity={0.05}>
                {/* Suit uses white plastic look */}
                <mesh position={[0, 0.8, 0]}>
                    <cylinderGeometry args={[0.35, 0.35, 1.4, 16]} />
                    <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
                </mesh>
                <mesh position={[0, 1.85, 0]}>
                    <sphereGeometry args={[0.6, 32, 32]} />
                    <meshStandardMaterial color="#f1f5f9" roughness={0.2} />
                </mesh>
                {/* Gold Visor */}
                <mesh position={[0, 1.85, 0.25]} rotation={[-0.2, 0, 0]}>
                    <sphereGeometry args={[0.45, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.35]} />
                    <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
                </mesh>
                {/* Backpack */}
                <mesh position={[0, 1.0, -0.5]}>
                    <boxGeometry args={[0.7, 1.0, 0.4]} />
                    <meshStandardMaterial color="#cbd5e1" />
                </mesh>
                {/* Arms/Legs - simplified for distance reading */}
                <mesh position={[-0.4, 0.2, 0.4]} rotation={[0.5, 0, 0.2]}><capsuleGeometry args={[0.15, 1]} /><meshStandardMaterial color="#f1f5f9" /></mesh>
                <mesh position={[0.4, 0.2, 0.4]} rotation={[0.5, 0, -0.2]}><capsuleGeometry args={[0.15, 1]} /><meshStandardMaterial color="#f1f5f9" /></mesh>
            </Float>
        </group>
    )
}
