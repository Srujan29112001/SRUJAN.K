'use client';

import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/useMediaQuery';

// Realistic satellite component that orbits along a path
function OrbitingSatellite({
  orbitRadius,
  orbitTilt,
  speed,
  color,
  initialAngle = 0
}: {
  orbitRadius: number;
  orbitTilt: [number, number, number];
  speed: number;
  color: string;
  initialAngle?: number;
}) {
  const orbitRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!orbitRef.current) return;
    // Rotate the orbit group to make the satellite move along the circular path
    orbitRef.current.rotation.z = initialAngle + state.clock.elapsedTime * speed;
  });

  return (
    // This group defines the orbital plane tilt
    <group rotation={orbitTilt}>
      {/* This group rotates to move the satellite along the orbit */}
      <group ref={orbitRef}>
        {/* Satellite positioned at the orbit radius */}
        <group position={[orbitRadius, 0, 0]}>
          {/* Satellite body */}
          <mesh>
            <boxGeometry args={[0.04, 0.02, 0.02]} />
            <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Solar panel left */}
          <mesh position={[0, 0, -0.04]}>
            <boxGeometry args={[0.02, 0.003, 0.05]} />
            <meshStandardMaterial color="#1e40af" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Solar panel right */}
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[0.02, 0.003, 0.05]} />
            <meshStandardMaterial color="#1e40af" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Antenna */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.002, 0.002, 0.02, 8]} />
            <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Glow effect underneath the satellite */}
          <pointLight color={color} intensity={0.5} distance={0.5} position={[0, -0.03, 0]} />
        </group>
      </group>
    </group>
  );
}


// Glowing node for city locations
function GlowingNode({ position, color = '#4FC3F7', size = 0.02 }: { position: THREE.Vector3; color?: string; size?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle pulse animation
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={position}>
      {/* Core bright dot */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Outer glow ring */}
      <mesh>
        <sphereGeometry args={[size * 1.5, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      {/* Point light for glow effect */}
      <pointLight color={color} intensity={0.3} distance={0.3} />
    </group>
  );
}

// Network connection arc between two points on the globe
function NetworkConnection({
  from,
  to,
  color = '#4FC3F7',
  speed = 1,
  arcHeight = 0.3,
  delay = 0,
  showNodes = true
}: {
  from: { lat: number; lon: number };
  to: { lat: number; lon: number };
  color?: string;
  speed?: number;
  arcHeight?: number;
  delay?: number;
  showNodes?: boolean;
}) {
  const packetRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(0);
  const globeRadius = 1.5;

  // Convert lat/lon to 3D position - matches Three.js SphereGeometry UV mapping
  const latLonTo3D = useCallback((lat: number, lon: number, radius: number) => {
    // phi = polar angle from top (0 = north pole, PI = south pole)
    // theta = azimuthal angle around Y axis
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    return new THREE.Vector3(
      -(radius * Math.sin(phi) * Math.cos(theta)),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }, []);

  const startPos = useMemo(() => latLonTo3D(from.lat, from.lon, globeRadius), [from, globeRadius, latLonTo3D]);
  const endPos = useMemo(() => latLonTo3D(to.lat, to.lon, globeRadius), [to, globeRadius, latLonTo3D]);

  // Create curved arc using QuadraticBezierCurve3
  const curve = useMemo(() => {
    const midPoint = new THREE.Vector3()
      .addVectors(startPos, endPos)
      .multiplyScalar(0.5);

    // Push the midpoint outward for the arc effect
    const distance = startPos.distanceTo(endPos);
    midPoint.normalize().multiplyScalar(globeRadius + arcHeight + distance * 0.15);

    return new THREE.QuadraticBezierCurve3(startPos, midPoint, endPos);
  }, [startPos, endPos, arcHeight, globeRadius]);

  // Create the line geometry with more points for smoother curve
  const lineGeometry = useMemo(() => {
    const points = curve.getPoints(80);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [curve]);

  // Create a dashed line material
  const lineMaterial = useMemo(() => {
    return new THREE.LineDashedMaterial({
      color,
      transparent: true,
      opacity: 0.6,
      dashSize: 0.05,
      gapSize: 0.02,
    });
  }, [color]);

  // Create the line with computed line distances for dashing
  const lineObject = useMemo(() => {
    const line = new THREE.Line(lineGeometry, lineMaterial);
    line.computeLineDistances();
    return line;
  }, [lineGeometry, lineMaterial]);

  // Animate the packet along the curve
  useFrame((state) => {
    if (!packetRef.current) return;

    const time = state.clock.elapsedTime * speed + delay;
    progressRef.current = (time % 4) / 4; // Complete cycle every 4 seconds

    const point = curve.getPoint(progressRef.current);
    packetRef.current.position.copy(point);

    // Pulse the packet size
    const pulse = 1 + Math.sin(time * 8) * 0.4;
    packetRef.current.scale.setScalar(pulse);

    // Trail follows slightly behind
    if (trailRef.current) {
      const trailProgress = Math.max(0, progressRef.current - 0.05);
      const trailPoint = curve.getPoint(trailProgress);
      trailRef.current.position.copy(trailPoint);
      trailRef.current.scale.setScalar(pulse * 0.7);
    }
  });

  return (
    <group>
      {/* Arc line with dashed effect */}
      <primitive object={lineObject} />

      {/* Glowing nodes at endpoints */}
      {showNodes && <GlowingNode position={startPos} color={color} size={0.03} />}
      {showNodes && <GlowingNode position={endPos} color={color} size={0.03} />}

      {/* Trail particle */}
      <mesh ref={trailRef}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>

      {/* Main animated packet/data traveling along the arc */}
      <mesh ref={packetRef}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Outer glow on packet */}
      <mesh ref={packetRef}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}


export function ContactGlobe() {
  const groupRef = useRef<THREE.Group>(null);
  const globeRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const { gl } = useThree();
  const isMobile = useIsMobile();

  // Load Earth texture
  const earthTexture = useLoader(THREE.TextureLoader, '/images/earth-texture.jpg');

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const previousMousePos = useRef({ x: 0, y: 0 });
  const rotationVelocity = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });

  // Mouse event handlers (desktop only)
  const handlePointerDown = useCallback((e: PointerEvent) => {
    if (isMobile) return; // Disable on mobile
    setIsDragging(true);
    previousMousePos.current = { x: e.clientX, y: e.clientY };
    rotationVelocity.current = { x: 0, y: 0 };
    gl.domElement.style.cursor = 'grabbing';
  }, [gl, isMobile]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (isMobile) return; // Disable on mobile
    if (!isDragging || !groupRef.current) return;

    const deltaX = e.clientX - previousMousePos.current.x;
    const deltaY = e.clientY - previousMousePos.current.y;

    const sensitivity = 0.008;

    rotationVelocity.current = {
      x: deltaY * sensitivity,
      y: deltaX * sensitivity,
    };

    targetRotation.current.x += deltaY * sensitivity;
    targetRotation.current.y += deltaX * sensitivity;

    // Free rotation - no clamping

    previousMousePos.current = { x: e.clientX, y: e.clientY };
  }, [isDragging, isMobile]);

  const handlePointerUp = useCallback(() => {
    if (isMobile) return; // Disable on mobile
    setIsDragging(false);
    gl.domElement.style.cursor = 'grab';
  }, [gl, isMobile]);

  useEffect(() => {
    // Skip interaction setup on mobile for better performance
    if (isMobile) return;

    const canvas = gl.domElement;
    canvas.style.cursor = 'grab';

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [gl, handlePointerDown, handlePointerMove, handlePointerUp, isMobile]);

  useFrame((state) => {
    if (!groupRef.current || !globeRef.current) return;

    if (isDragging) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotation.current.x,
        0.3
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation.current.y,
        0.3
      );
    } else {
      rotationVelocity.current.x *= 0.95;
      rotationVelocity.current.y *= 0.95;

      targetRotation.current.x += rotationVelocity.current.x;
      targetRotation.current.y += rotationVelocity.current.y;

      // Free rotation - no clamping

      if (Math.abs(rotationVelocity.current.y) < 0.001) {
        targetRotation.current.y += 0.002;
      }

      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotation.current.x,
        0.1
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation.current.y,
        0.1
      );
    }

    // Subtle atmosphere pulse
    if (atmosphereRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
      atmosphereRef.current.scale.setScalar(pulse);
    }
  });

  // Atmosphere shader for glow effect
  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
  }, []);

  return (
    <group ref={groupRef}>
      {/* Main Earth globe with texture */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef} scale={1.15}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <primitive object={atmosphereMaterial} attach="material" />
      </mesh>

      {/* Equator orbit - yellow/orange, horizontal around the middle */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.65, 0.008, 16, 100]} />
        <meshBasicMaterial color="#F59E0B" transparent opacity={0.6} />
      </mesh>

      {/* Satellite orbit - red, inclined/tilted */}
      <mesh rotation={[Math.PI / 2 - 0.4, 0.3, 0.2]}>
        <torusGeometry args={[1.8, 0.004, 16, 100]} />
        <meshBasicMaterial color="#EF4444" transparent opacity={0.4} />
      </mesh>

      {/* Animated Satellite 1 - orbiting on the red inclined path */}
      <OrbitingSatellite
        orbitRadius={1.8}
        orbitTilt={[Math.PI / 2 - 0.4, 0.3, 0.2]}
        speed={0.3}
        color="#EF4444"
        initialAngle={0}
      />

      {/* Animated Satellite 2 - orbiting on the equatorial path */}
      <OrbitingSatellite
        orbitRadius={1.65}
        orbitTilt={[Math.PI / 2, 0, 0]}
        speed={0.25}
        color="#4FD1C5"
        initialAngle={Math.PI}
      />

      {/* Purple orbits - radiating like longitude lines matching reference */}
      {/* Purple orbit 1 - vertical front */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[1.75, 0.004, 16, 100]} />
        <meshBasicMaterial color="#A855F7" transparent opacity={0.5} />
      </mesh>
      <OrbitingSatellite orbitRadius={1.75} orbitTilt={[0, 0, 0]} speed={0.35} color="#A855F7" initialAngle={0} />

      {/* Purple orbit 2 - rotated 30 degrees */}
      <mesh rotation={[0, Math.PI / 6, 0]}>
        <torusGeometry args={[1.75, 0.004, 16, 100]} />
        <meshBasicMaterial color="#9333EA" transparent opacity={0.45} />
      </mesh>
      <OrbitingSatellite orbitRadius={1.75} orbitTilt={[0, Math.PI / 6, 0]} speed={0.32} color="#9333EA" initialAngle={Math.PI / 4} />

      {/* Purple orbit 3 - rotated 60 degrees */}
      <mesh rotation={[0, Math.PI / 3, 0]}>
        <torusGeometry args={[1.75, 0.004, 16, 100]} />
        <meshBasicMaterial color="#C084FC" transparent opacity={0.45} />
      </mesh>
      <OrbitingSatellite orbitRadius={1.75} orbitTilt={[0, Math.PI / 3, 0]} speed={0.38} color="#C084FC" initialAngle={Math.PI / 2} />

      {/* Purple orbit 4 - rotated 90 degrees (side view) */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[1.75, 0.004, 16, 100]} />
        <meshBasicMaterial color="#A855F7" transparent opacity={0.45} />
      </mesh>
      <OrbitingSatellite orbitRadius={1.75} orbitTilt={[0, Math.PI / 2, 0]} speed={0.3} color="#A855F7" initialAngle={Math.PI * 0.75} />

      {/* Purple orbit 5 - rotated 120 degrees */}
      <mesh rotation={[0, Math.PI * 2 / 3, 0]}>
        <torusGeometry args={[1.75, 0.004, 16, 100]} />
        <meshBasicMaterial color="#9333EA" transparent opacity={0.45} />
      </mesh>
      <OrbitingSatellite orbitRadius={1.75} orbitTilt={[0, Math.PI * 2 / 3, 0]} speed={0.36} color="#9333EA" initialAngle={Math.PI} />

      {/* Purple orbit 6 - rotated 150 degrees */}
      <mesh rotation={[0, Math.PI * 5 / 6, 0]}>
        <torusGeometry args={[1.75, 0.004, 16, 100]} />
        <meshBasicMaterial color="#C084FC" transparent opacity={0.45} />
      </mesh>
      <OrbitingSatellite orbitRadius={1.75} orbitTilt={[0, Math.PI * 5 / 6, 0]} speed={0.34} color="#C084FC" initialAngle={Math.PI * 1.25} />

      {/* Purple orbit 7 - tilted polar */}
      <mesh rotation={[0.4, 0, Math.PI / 2]}>
        <torusGeometry args={[1.8, 0.004, 16, 100]} />
        <meshBasicMaterial color="#A855F7" transparent opacity={0.4} />
      </mesh>
      <OrbitingSatellite orbitRadius={1.8} orbitTilt={[0.4, 0, Math.PI / 2]} speed={0.28} color="#A855F7" initialAngle={Math.PI * 1.5} />

      {/* Purple orbit 8 - opposite tilted polar */}
      <mesh rotation={[-0.4, 0, Math.PI / 2]}>
        <torusGeometry args={[1.8, 0.004, 16, 100]} />
        <meshBasicMaterial color="#9333EA" transparent opacity={0.4} />
      </mesh>
      <OrbitingSatellite orbitRadius={1.8} orbitTilt={[-0.4, 0, Math.PI / 2]} speed={0.33} color="#9333EA" initialAngle={Math.PI * 1.75} />

      {/* Network Connection Lines - clean land-based connections */}

      {/* Core hub cities with visible nodes */}
      {/* India (Delhi) - central hub */}
      <NetworkConnection
        from={{ lat: 28.6139, lon: 77.2090 }}
        to={{ lat: 51.5074, lon: -0.1278 }}
        color="#4FC3F7"
        speed={0.8}
        delay={0}
      />
      {/* USA (NYC) to UK (London) */}
      <NetworkConnection
        from={{ lat: 40.7128, lon: -74.0060 }}
        to={{ lat: 51.5074, lon: -0.1278 }}
        color="#4FC3F7"
        speed={1}
        delay={1}
        showNodes={false}
      />
      {/* UK to Germany (Berlin) */}
      <NetworkConnection
        from={{ lat: 51.5074, lon: -0.1278 }}
        to={{ lat: 52.5200, lon: 13.4050 }}
        color="#06B6D4"
        speed={0.9}
        delay={0.5}
        showNodes={false}
      />
      {/* Germany to India */}
      <NetworkConnection
        from={{ lat: 52.5200, lon: 13.4050 }}
        to={{ lat: 28.6139, lon: 77.2090 }}
        color="#4FC3F7"
        speed={0.85}
        delay={1.5}
        showNodes={false}
      />
      {/* India to Singapore */}
      <NetworkConnection
        from={{ lat: 28.6139, lon: 77.2090 }}
        to={{ lat: 1.3521, lon: 103.8198 }}
        color="#06B6D4"
        speed={0.9}
        delay={0.3}
      />
      {/* Singapore to Japan (Tokyo) */}
      <NetworkConnection
        from={{ lat: 1.3521, lon: 103.8198 }}
        to={{ lat: 35.6762, lon: 139.6503 }}
        color="#4FC3F7"
        speed={1.0}
        delay={0.8}
        showNodes={false}
      />
      {/* Japan to Australia (Sydney) */}
      <NetworkConnection
        from={{ lat: 35.6762, lon: 139.6503 }}
        to={{ lat: -33.8688, lon: 151.2093 }}
        color="#06B6D4"
        speed={0.75}
        delay={1.2}
      />
      {/* Australia back to Singapore */}
      <NetworkConnection
        from={{ lat: -33.8688, lon: 151.2093 }}
        to={{ lat: 1.3521, lon: 103.8198 }}
        color="#4FC3F7"
        speed={0.85}
        delay={2.0}
        showNodes={false}
      />
      {/* USA (LA) to Japan */}
      <NetworkConnection
        from={{ lat: 34.0522, lon: -118.2437 }}
        to={{ lat: 35.6762, lon: 139.6503 }}
        color="#4FC3F7"
        speed={0.7}
        delay={1.8}
      />
      {/* Brazil (Sao Paulo) to UK */}
      <NetworkConnection
        from={{ lat: -23.5505, lon: -46.6333 }}
        to={{ lat: 51.5074, lon: -0.1278 }}
        color="#06B6D4"
        speed={0.8}
        delay={2.2}
      />
      {/* Dubai to India */}
      <NetworkConnection
        from={{ lat: 25.2048, lon: 55.2708 }}
        to={{ lat: 28.6139, lon: 77.2090 }}
        color="#4FC3F7"
        speed={1.1}
        delay={0.4}
      />
      {/* South Africa (Cape Town) to UK */}
      <NetworkConnection
        from={{ lat: -33.9249, lon: 18.4241 }}
        to={{ lat: 51.5074, lon: -0.1278 }}
        color="#06B6D4"
        speed={0.75}
        delay={1.6}
      />
      {/* USA NYC to LA */}
      <NetworkConnection
        from={{ lat: 40.7128, lon: -74.0060 }}
        to={{ lat: 34.0522, lon: -118.2437 }}
        color="#4FC3F7"
        speed={1.0}
        delay={0.6}
        showNodes={false}
      />
      {/* France (Paris) to Germany */}
      <NetworkConnection
        from={{ lat: 48.8566, lon: 2.3522 }}
        to={{ lat: 52.5200, lon: 13.4050 }}
        color="#06B6D4"
        speed={1.2}
        delay={0.2}
      />
      {/* Hong Kong to Tokyo */}
      <NetworkConnection
        from={{ lat: 22.3193, lon: 114.1694 }}
        to={{ lat: 35.6762, lon: 139.6503 }}
        color="#4FC3F7"
        speed={0.95}
        delay={0.9}
      />
      {/* India to Hong Kong */}
      <NetworkConnection
        from={{ lat: 28.6139, lon: 77.2090 }}
        to={{ lat: 22.3193, lon: 114.1694 }}
        color="#06B6D4"
        speed={0.85}
        delay={1.4}
        showNodes={false}
      />
      {/* Russia (Moscow) to Germany */}
      <NetworkConnection
        from={{ lat: 55.7558, lon: 37.6173 }}
        to={{ lat: 52.5200, lon: 13.4050 }}
        color="#4FC3F7"
        speed={0.9}
        delay={1.0}
      />
      {/* Egypt (Cairo) to Dubai */}
      <NetworkConnection
        from={{ lat: 30.0444, lon: 31.2357 }}
        to={{ lat: 25.2048, lon: 55.2708 }}
        color="#06B6D4"
        speed={1.0}
        delay={0.7}
      />

      {/* North America coverage */}
      <NetworkConnection from={{ lat: 49.2827, lon: -123.1207 }} to={{ lat: 34.0522, lon: -118.2437 }} color="#4FC3F7" speed={0.9} delay={0.3} />
      <NetworkConnection from={{ lat: 51.0447, lon: -114.0719 }} to={{ lat: 49.2827, lon: -123.1207 }} color="#06B6D4" speed={1.0} delay={1.1} />
      <NetworkConnection from={{ lat: 43.6532, lon: -79.3832 }} to={{ lat: 40.7128, lon: -74.0060 }} color="#4FC3F7" speed={0.85} delay={0.5} showNodes={false} />
      <NetworkConnection from={{ lat: 29.7604, lon: -95.3698 }} to={{ lat: 34.0522, lon: -118.2437 }} color="#06B6D4" speed={0.95} delay={1.5} />
      <NetworkConnection from={{ lat: 33.4484, lon: -112.0740 }} to={{ lat: 34.0522, lon: -118.2437 }} color="#4FC3F7" speed={1.1} delay={0.7} showNodes={false} />
      <NetworkConnection from={{ lat: 41.8781, lon: -87.6298 }} to={{ lat: 40.7128, lon: -74.0060 }} color="#06B6D4" speed={0.8} delay={1.3} />

      {/* South America coverage */}
      <NetworkConnection from={{ lat: -12.0464, lon: -77.0428 }} to={{ lat: -23.5505, lon: -46.6333 }} color="#4FC3F7" speed={0.85} delay={0.4} />
      <NetworkConnection from={{ lat: -33.4489, lon: -70.6693 }} to={{ lat: -34.6037, lon: -58.3816 }} color="#06B6D4" speed={0.9} delay={1.2} />
      <NetworkConnection from={{ lat: 4.7110, lon: -74.0721 }} to={{ lat: -12.0464, lon: -77.0428 }} color="#4FC3F7" speed={1.0} delay={0.8} />
      <NetworkConnection from={{ lat: -22.9068, lon: -43.1729 }} to={{ lat: -23.5505, lon: -46.6333 }} color="#06B6D4" speed={1.05} delay={1.6} showNodes={false} />

      {/* Africa coverage */}
      <NetworkConnection from={{ lat: -26.2041, lon: 28.0473 }} to={{ lat: -33.9249, lon: 18.4241 }} color="#4FC3F7" speed={0.9} delay={0.5} />
      <NetworkConnection from={{ lat: -1.2921, lon: 36.8219 }} to={{ lat: -26.2041, lon: 28.0473 }} color="#06B6D4" speed={0.85} delay={1.4} />
      <NetworkConnection from={{ lat: 6.5244, lon: 3.3792 }} to={{ lat: 30.0444, lon: 31.2357 }} color="#4FC3F7" speed={0.95} delay={0.6} />
      <NetworkConnection from={{ lat: 33.5731, lon: -7.5898 }} to={{ lat: 6.5244, lon: 3.3792 }} color="#06B6D4" speed={1.0} delay={1.8} />
      <NetworkConnection from={{ lat: 36.8065, lon: 10.1815 }} to={{ lat: 30.0444, lon: 31.2357 }} color="#4FC3F7" speed={0.9} delay={0.9} showNodes={false} />

      {/* Europe coverage */}
      <NetworkConnection from={{ lat: 59.9139, lon: 10.7522 }} to={{ lat: 59.3293, lon: 18.0686 }} color="#4FC3F7" speed={1.0} delay={0.3} />
      <NetworkConnection from={{ lat: 52.2297, lon: 21.0122 }} to={{ lat: 52.5200, lon: 13.4050 }} color="#06B6D4" speed={0.95} delay={1.1} />
      <NetworkConnection from={{ lat: 50.0755, lon: 14.4378 }} to={{ lat: 48.2082, lon: 16.3738 }} color="#4FC3F7" speed={0.85} delay={0.7} />
      <NetworkConnection from={{ lat: 41.9028, lon: 12.4964 }} to={{ lat: 48.8566, lon: 2.3522 }} color="#06B6D4" speed={1.1} delay={1.5} />
      <NetworkConnection from={{ lat: 40.4168, lon: -3.7038 }} to={{ lat: 41.3851, lon: 2.1734 }} color="#4FC3F7" speed={0.9} delay={0.4} />
      <NetworkConnection from={{ lat: 60.1699, lon: 24.9384 }} to={{ lat: 55.7558, lon: 37.6173 }} color="#06B6D4" speed={0.85} delay={1.9} />

      {/* Asia coverage */}
      <NetworkConnection from={{ lat: 39.9042, lon: 116.4074 }} to={{ lat: 31.2304, lon: 121.4737 }} color="#4FC3F7" speed={0.95} delay={0.5} />
      <NetworkConnection from={{ lat: 31.2304, lon: 121.4737 }} to={{ lat: 22.3193, lon: 114.1694 }} color="#06B6D4" speed={1.0} delay={1.3} showNodes={false} />
      <NetworkConnection from={{ lat: 13.0827, lon: 80.2707 }} to={{ lat: 28.6139, lon: 77.2090 }} color="#4FC3F7" speed={0.9} delay={0.6} />
      <NetworkConnection from={{ lat: 12.9716, lon: 77.5946 }} to={{ lat: 19.0760, lon: 72.8777 }} color="#06B6D4" speed={0.85} delay={1.7} />
      <NetworkConnection from={{ lat: 23.8103, lon: 90.4125 }} to={{ lat: 28.6139, lon: 77.2090 }} color="#4FC3F7" speed={1.05} delay={0.8} />
      <NetworkConnection from={{ lat: 14.5995, lon: 120.9842 }} to={{ lat: 22.3193, lon: 114.1694 }} color="#06B6D4" speed={0.95} delay={1.4} />
      <NetworkConnection from={{ lat: 3.1390, lon: 101.6869 }} to={{ lat: 1.3521, lon: 103.8198 }} color="#4FC3F7" speed={1.1} delay={0.4} showNodes={false} />
      <NetworkConnection from={{ lat: 41.0082, lon: 28.9784 }} to={{ lat: 55.7558, lon: 37.6173 }} color="#06B6D4" speed={0.9} delay={2.0} />

      {/* Australia coverage */}
      <NetworkConnection from={{ lat: -37.8136, lon: 144.9631 }} to={{ lat: -33.8688, lon: 151.2093 }} color="#4FC3F7" speed={0.95} delay={0.5} />
      <NetworkConnection from={{ lat: -27.4698, lon: 153.0251 }} to={{ lat: -33.8688, lon: 151.2093 }} color="#06B6D4" speed={1.0} delay={1.2} showNodes={false} />
      <NetworkConnection from={{ lat: -31.9505, lon: 115.8605 }} to={{ lat: -37.8136, lon: 144.9631 }} color="#4FC3F7" speed={0.85} delay={0.8} />


      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-5, -3, -5]} intensity={0.3} color="#4FC3F7" />
    </group>
  );
}
