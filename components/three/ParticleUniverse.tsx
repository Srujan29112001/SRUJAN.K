'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface ParticleUniverseProps {
  count?: number;
  scrollProgress?: number;
}

export function ParticleUniverse({ count = 3000, scrollProgress = 0 }: ParticleUniverseProps) { // OPTIMIZED: Reduced from 8000
  const pointsRef = useRef<THREE.Points>(null);
  const pointsRef2 = useRef<THREE.Points>(null);
  const pointsRef3 = useRef<THREE.Points>(null);
  const { camera } = useThree();

  // Layer 1: Distant stars (background)
  const positions1 = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 15 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, [count]);

  // Layer 2: Mid-distance particles (nebula)
  const positions2 = useMemo(() => {
    const pos = new Float32Array((count / 2) * 3);
    for (let i = 0; i < count / 2; i++) {
      const radius = 5 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, [count]);

  // Layer 3: Close particles (streaks when zooming)
  const positions3 = useMemo(() => {
    const pos = new Float32Array((count / 4) * 3);
    for (let i = 0; i < count / 4; i++) {
      // Create a tunnel/cylinder of particles
      const radius = 1 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const z = -10 + Math.random() * 25;
      pos[i * 3] = radius * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(theta);
      pos[i * 3 + 2] = z;
    }
    return pos;
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current || !pointsRef2.current || !pointsRef3.current) return;

    // Slow continuous rotation for distant stars
    pointsRef.current.rotation.y += delta * 0.02;
    pointsRef.current.rotation.x += delta * 0.01;

    // Faster rotation for mid layer
    pointsRef2.current.rotation.y -= delta * 0.03;
    pointsRef2.current.rotation.z += delta * 0.015;

    // Hyperspace effect - particles rush past based on scroll
    const zoomSpeed = scrollProgress * 20;
    pointsRef3.current.position.z = scrollProgress * 15;
    pointsRef3.current.rotation.z += delta * 0.5 * scrollProgress;

    // Parallax effect based on scroll
    pointsRef.current.position.z = scrollProgress * 5;
    pointsRef2.current.position.z = scrollProgress * 10;
  });

  return (
    <group>
      {/* Layer 1: Distant stars */}
      <Points ref={pointsRef} positions={positions1} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.015}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.6}
        />
      </Points>

      {/* Layer 2: Nebula particles */}
      <Points ref={pointsRef2} positions={positions2} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#6D64A3"
          size={0.025}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.5}
        />
      </Points>

      {/* Layer 3: Hyperspace streaks */}
      <Points ref={pointsRef3} positions={positions3} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#06B6D4"
          size={0.04 + scrollProgress * 0.1}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.3 + scrollProgress * 0.5}
        />
      </Points>
    </group>
  );
}

// Central Energy Core - the focal point
export function EnergyCore({ scrollProgress = 0 }: { scrollProgress?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current || !ringRef.current || !ring2Ref.current) return;

    const time = state.clock.elapsedTime;

    // Pulsing core
    const pulse = 1 + Math.sin(time * 2) * 0.1;
    meshRef.current.scale.setScalar(pulse * (1 - scrollProgress * 0.8));

    // Rotating rings
    ringRef.current.rotation.x = time * 0.5;
    ringRef.current.rotation.y = time * 0.3;
    ring2Ref.current.rotation.x = -time * 0.3;
    ring2Ref.current.rotation.z = time * 0.4;

    // Fade out core as we scroll
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = 0.8 - scrollProgress * 0.6;
  });

  return (
    <group>
      {/* Central glowing sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshBasicMaterial
          color="#6D64A3"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Orbital ring 1 */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.8, 0.02, 16, 100]} />
        <meshBasicMaterial
          color="#06B6D4"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Orbital ring 2 */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.2, 0.015, 16, 100]} />
        <meshBasicMaterial
          color="#8B7EC8"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// Grid floor that extends to infinity
export function InfiniteGrid({ scrollProgress = 0 }: { scrollProgress?: number }) {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame((state) => {
    if (!gridRef.current) return;
    // Move grid based on scroll to create motion effect
    gridRef.current.position.z = (state.clock.elapsedTime * 0.5 + scrollProgress * 5) % 10;
  });

  return (
    <group position={[0, -3, 0]}>
      <gridHelper
        ref={gridRef}
        args={[100, 50, '#6D64A3', '#1a1a2e']}
        rotation={[0, 0, 0]}
      />
    </group>
  );
}
