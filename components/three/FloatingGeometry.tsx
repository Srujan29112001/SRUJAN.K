'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingGeometryProps {
  wireframe?: boolean;
  distort?: boolean;
}

export function FloatingGeometry({
  wireframe = true,
  distort = false,
}: FloatingGeometryProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;

    // Smooth mouse following
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      mouse.x * 0.3,
      0.05
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      mouse.y * 0.3,
      0.05
    );
  });

  return (
    <group ref={groupRef}>
      {/* Main icosahedron - wireframe */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh>
          <icosahedronGeometry args={[1, 1]} />
          {distort ? (
            <MeshDistortMaterial
              color="#6D64A3"
              wireframe={wireframe}
              transparent
              opacity={0.6}
              distort={0.3}
              speed={2}
            />
          ) : (
            <meshBasicMaterial
              color="#6D64A3"
              wireframe={wireframe}
              transparent
              opacity={0.6}
            />
          )}
        </mesh>
      </Float>

      {/* Outer ring - horizontal */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.8, 0.015, 16, 100]} />
          <meshBasicMaterial color="#06B6D4" transparent opacity={0.7} />
        </mesh>
      </Float>

      {/* Second ring - perpendicular */}
      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
        <mesh rotation={[0, Math.PI / 4, Math.PI / 2]}>
          <torusGeometry args={[1.5, 0.01, 16, 100]} />
          <meshBasicMaterial color="#8B7EC8" transparent opacity={0.5} />
        </mesh>
      </Float>

      {/* Third ring - tilted */}
      <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.4}>
        <mesh rotation={[Math.PI / 3, Math.PI / 6, 0]}>
          <torusGeometry args={[2.0, 0.008, 16, 100]} />
          <meshBasicMaterial color="#F59E0B" transparent opacity={0.4} />
        </mesh>
      </Float>

      {/* Orbiting dots */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Float key={i} speed={1 + i * 0.15} floatIntensity={0.8}>
          <mesh
            position={[
              Math.cos((i * Math.PI) / 3) * 2.2,
              Math.sin((i * Math.PI) / 3) * 2.2,
              (Math.random() - 0.5) * 0.5,
            ]}
          >
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshBasicMaterial color="#06B6D4" />
          </mesh>
        </Float>
      ))}

      {/* Inner core glow */}
      <Float speed={3} rotationIntensity={0.1} floatIntensity={0.3}>
        <mesh>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshBasicMaterial
            color="#6D64A3"
            transparent
            opacity={0.3}
          />
        </mesh>
      </Float>

      {/* Outer glow sphere */}
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial
          color="#6D64A3"
          transparent
          opacity={0.02}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
