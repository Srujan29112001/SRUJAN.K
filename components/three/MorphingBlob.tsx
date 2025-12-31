'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, GradientTexture, useCursor } from '@react-three/drei';
import * as THREE from 'three';

interface MorphingBlobProps {
  position?: [number, number, number];
  scale?: number;
  color1?: string;
  color2?: string;
  speed?: number;
  distort?: number;
}

export function MorphingBlob({
  position = [0, 0, 0],
  scale = 2,
  color1 = '#6D64A3',
  color2 = '#06B6D4',
  speed = 2,
  distort = 0.4,
}: MorphingBlobProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { mouse, viewport } = useThree();
  const targetRotation = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (!meshRef.current) return;

    // Smooth mouse tracking
    targetRotation.current.x = mouse.y * 0.3;
    targetRotation.current.y = mouse.x * 0.5;

    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      targetRotation.current.x,
      0.02
    );
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetRotation.current.y,
      0.02
    );

    // Subtle floating animation
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} /> {/* OPTIMIZED: Reduced from 64x64 segments */}
      <MeshDistortMaterial
        distort={distort}
        speed={speed}
        roughness={0.2}
        metalness={0.8}
      >
        <GradientTexture
          stops={[0, 0.5, 1]}
          colors={[color1, color2, color1]}
        />
      </MeshDistortMaterial>
    </mesh>
  );
}

// Igloo-style fluid mesh background
export function FluidMesh({
  color = '#6D64A3',
  wireframe = true,
  segments = 25, // OPTIMIZED: Reduced from 50 for performance
}: {
  color?: string;
  wireframe?: boolean;
  segments?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.PlaneGeometry>(null);

  const originalPositions = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(10, 10, segments, segments);
    return Float32Array.from(geometry.attributes.position.array);
  }, [segments]);

  useFrame((state) => {
    if (!meshRef.current || !geometryRef.current) return;

    const positions = geometryRef.current.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < positions.length; i += 3) {
      const x = originalPositions[i];
      const y = originalPositions[i + 1];

      // Wave effect
      positions[i + 2] =
        Math.sin(x * 0.5 + time) * 0.3 +
        Math.sin(y * 0.5 + time * 0.8) * 0.3 +
        Math.sin((x + y) * 0.3 + time * 0.5) * 0.2;
    }

    geometryRef.current.attributes.position.needsUpdate = true;
    geometryRef.current.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -2, -5]}>
      <planeGeometry ref={geometryRef} args={[10, 10, segments, segments]} />
      <meshBasicMaterial
        color={color}
        wireframe={wireframe}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

// Igloo-style orbiting particles
export function OrbitingParticles({
  count = 100,
  radius = 3,
  color = '#06B6D4',
}: {
  count?: number;
  radius?: number;
  color?: string;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.8 + Math.random() * 0.4);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      vel[i * 3] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    return [pos, vel];
  }, [count, radius]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Orbital motion
      const x = positions[i3];
      const z = positions[i3 + 2];
      const angle = 0.002 + (i % 10) * 0.0002;

      positions[i3] = x * Math.cos(angle) - z * Math.sin(angle);
      positions[i3 + 2] = x * Math.sin(angle) + z * Math.cos(angle);

      // Subtle wave
      positions[i3 + 1] += Math.sin(time + i) * 0.001;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y = time * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// Igloo-style glass sphere with refraction
export function GlassSphere({
  position = [0, 0, 0] as [number, number, number],
  scale = 1.5,
}: {
  position?: [number, number, number];
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current || !innerRef.current) return;

    meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;

    innerRef.current.rotation.y = -state.clock.elapsedTime * 0.15;
    innerRef.current.rotation.z = state.clock.elapsedTime * 0.1;
  });

  return (
    <group position={position}>
      {/* Outer glass shell */}
      <mesh ref={meshRef} scale={scale}>
        <icosahedronGeometry args={[1, 2]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.9}
          thickness={0.5}
          roughness={0.1}
          metalness={0}
          ior={1.5}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Inner core */}
      <mesh ref={innerRef} scale={scale * 0.4}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          color="#6D64A3"
          wireframe
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Glow */}
      <mesh scale={scale * 1.2}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#6D64A3"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// Connecting lines between particles (igloo network effect)
export function NetworkLines({
  particleCount = 30,
  maxDistance = 2,
  color = '#6D64A3',
}: {
  particleCount?: number;
  maxDistance?: number;
  color?: string;
}) {
  const linesRef = useRef<THREE.LineSegments>(null);
  const particlesRef = useRef<Float32Array>();

  const [particles, linePositions] = useMemo(() => {
    const pts = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pts[i * 3] = (Math.random() - 0.5) * 5;
      pts[i * 3 + 1] = (Math.random() - 0.5) * 5;
      pts[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    // Pre-allocate for maximum possible lines
    const maxLines = (particleCount * (particleCount - 1)) / 2;
    return [pts, new Float32Array(maxLines * 6)];
  }, [particleCount]);

  useFrame((state) => {
    if (!linesRef.current) return;

    const time = state.clock.elapsedTime;
    let lineIndex = 0;

    // Update particle positions
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particles[i3] += Math.sin(time + i) * 0.002;
      particles[i3 + 1] += Math.cos(time * 0.8 + i) * 0.002;
      particles[i3 + 2] += Math.sin(time * 0.6 + i * 0.5) * 0.002;

      // Keep in bounds
      if (Math.abs(particles[i3]) > 3) particles[i3] *= -0.95;
      if (Math.abs(particles[i3 + 1]) > 3) particles[i3 + 1] *= -0.95;
      if (Math.abs(particles[i3 + 2]) > 3) particles[i3 + 2] *= -0.95;
    }

    // Calculate lines between close particles
    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = particles[i * 3] - particles[j * 3];
        const dy = particles[i * 3 + 1] - particles[j * 3 + 1];
        const dz = particles[i * 3 + 2] - particles[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDistance) {
          linePositions[lineIndex++] = particles[i * 3];
          linePositions[lineIndex++] = particles[i * 3 + 1];
          linePositions[lineIndex++] = particles[i * 3 + 2];
          linePositions[lineIndex++] = particles[j * 3];
          linePositions[lineIndex++] = particles[j * 3 + 1];
          linePositions[lineIndex++] = particles[j * 3 + 2];
        }
      }
    }

    // Update geometry
    const geometry = linesRef.current.geometry;
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(linePositions.slice(0, lineIndex), 3)
    );
    geometry.attributes.position.needsUpdate = true;
    geometry.setDrawRange(0, lineIndex / 3);
  });

  particlesRef.current = particles;

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[linePositions, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0.3} />
    </lineSegments>
  );
}
