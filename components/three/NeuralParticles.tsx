'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface NeuralParticlesProps {
  count?: number;
  color?: string;
  size?: number;
  radius?: number;
}

export function NeuralParticles({
  count = 2000, // OPTIMIZED: Reduced from 5000 for performance
  color = '#6D64A3',
  size = 0.012,
  radius = 2,
}: NeuralParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const { mouse } = useThree();

  // Generate sphere distribution of particles
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Fibonacci sphere distribution for even coverage
      const phi = Math.acos(1 - 2 * (i + 0.5) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      // Add some variation to radius
      const r = radius + (Math.random() - 0.5) * 0.5;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }

    return pos;
  }, [count, radius]);

  // Create additional connections array for neural effect
  const connections = useMemo(() => {
    const linePositions: number[] = [];
    const numConnections = Math.floor(count * 0.1);

    for (let i = 0; i < numConnections; i++) {
      const idx1 = Math.floor(Math.random() * count);
      const idx2 = Math.floor(Math.random() * count);

      linePositions.push(
        positions[idx1 * 3],
        positions[idx1 * 3 + 1],
        positions[idx1 * 3 + 2],
        positions[idx2 * 3],
        positions[idx2 * 3 + 1],
        positions[idx2 * 3 + 2]
      );
    }

    return new Float32Array(linePositions);
  }, [positions, count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    // Slow rotation
    pointsRef.current.rotation.y += delta * 0.03;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;

    // Mouse influence
    pointsRef.current.rotation.y += mouse.x * 0.005;
    pointsRef.current.rotation.x += mouse.y * 0.003;
  });

  return (
    <group>
      {/* Main particle system */}
      <Points
        ref={pointsRef}
        positions={positions}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          color={color}
          size={size}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.8}
        />
      </Points>

      {/* Neural connection lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={connections.length / 3}
            array={connections}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}
