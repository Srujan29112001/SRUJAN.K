'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { skillCategories } from '@/data/skills';

interface SkillNode {
  position: [number, number, number];
  label: string;
  color: string;
  category: string;
}

export function SkillsConstellation() {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  // Generate skill nodes in a constellation pattern
  const skillNodes = useMemo<SkillNode[]>(() => {
    const nodes: SkillNode[] = [];
    const categories = skillCategories;

    categories.forEach((category, catIndex) => {
      const categoryAngle = (catIndex / categories.length) * Math.PI * 2;
      const categoryRadius = 3;

      category.skills.forEach((skill, skillIndex) => {
        const skillAngle = categoryAngle + (skillIndex * 0.3 - (category.skills.length * 0.15));
        const radius = categoryRadius + (skillIndex % 2 === 0 ? 0.5 : -0.3);
        const z = (Math.random() - 0.5) * 2;

        nodes.push({
          position: [
            Math.cos(skillAngle) * radius,
            Math.sin(skillAngle) * radius,
            z,
          ],
          label: skill,
          color: category.color,
          category: category.name,
        });
      });
    });

    return nodes;
  }, []);

  // Generate connection lines between related skills
  const connections = useMemo(() => {
    const lines: number[] = [];
    const threshold = 2.5;

    for (let i = 0; i < skillNodes.length; i++) {
      for (let j = i + 1; j < skillNodes.length; j++) {
        const [x1, y1, z1] = skillNodes[i].position;
        const [x2, y2, z2] = skillNodes[j].position;
        const distance = Math.sqrt(
          Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2)
        );

        if (distance < threshold) {
          lines.push(x1, y1, z1, x2, y2, z2);
        }
      }
    }

    return new Float32Array(lines);
  }, [skillNodes]);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Slow auto-rotation
    groupRef.current.rotation.y += 0.001;

    // Mouse influence
    groupRef.current.rotation.y += mouse.x * 0.002;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      mouse.y * 0.2,
      0.05
    );
  });

  return (
    <group ref={groupRef}>
      {/* Connection lines */}
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
          color="#6D64A3"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Skill nodes */}
      {skillNodes.map((node, i) => (
        <Float
          key={i}
          speed={1 + Math.random()}
          rotationIntensity={0}
          floatIntensity={0.2}
        >
          <group position={node.position}>
            {/* Node sphere */}
            <mesh>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial
                color={node.color}
                transparent
                opacity={0.9}
              />
            </mesh>

            {/* Glow effect */}
            <mesh>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshBasicMaterial
                color={node.color}
                transparent
                opacity={0.3}
              />
            </mesh>

            {/* Label */}
            <Text
              position={[0, 0.2, 0]}
              fontSize={0.12}
              color="#ffffff"
              anchorX="center"
              anchorY="bottom"
              font="/fonts/SpaceGrotesk-Medium.ttf"
            >
              {node.label}
            </Text>
          </group>
        </Float>
      ))}

      {/* Central core */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial
          color="#6D64A3"
          transparent
          opacity={0.1}
        />
      </mesh>
    </group>
  );
}
