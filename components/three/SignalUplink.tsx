'use client';

import { useRef, useMemo, MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * SignalUplink — scroll-scrubbed scene for the Neural Map -> Get in Touch
 * transition. A constellation of linked thoughts (echoing the knowledge graph
 * above) collapses into a single bright signal core, which then broadcasts
 * outward as expanding rings — a thought transmitted to your inbox.
 * Driven entirely by progressRef (mutated by GSAP ScrollTrigger).
 */

const NODE_COUNT = 130;
const PULSE_COUNT = 14;

const smoothstep = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

interface UplinkProps {
    progressRef: MutableRefObject<{ value: number }>;
}

function CameraRig({ progressRef }: UplinkProps) {
    const { camera } = useThree();
    useFrame(() => {
        const p = progressRef.current.value;
        const cam = camera as THREE.PerspectiveCamera;
        cam.position.z = THREE.MathUtils.lerp(cam.position.z, 11 - p * 3.4, 0.1);
        cam.rotation.z = THREE.MathUtils.lerp(cam.rotation.z, -p * 0.05, 0.05);
    });
    return null;
}

export function SignalUplink({ progressRef }: UplinkProps) {
    const groupRef = useRef<THREE.Group>(null);
    const nodeGeoRef = useRef<THREE.BufferGeometry>(null);
    const nodeMatRef = useRef<THREE.PointsMaterial>(null);
    const edgeGeoRef = useRef<THREE.BufferGeometry>(null);
    const edgeMatRef = useRef<THREE.LineBasicMaterial>(null);
    const pulseGeoRef = useRef<THREE.BufferGeometry>(null);
    const pulseMatRef = useRef<THREE.PointsMaterial>(null);
    const coreRef = useRef<THREE.Mesh>(null);
    const coreMatRef = useRef<THREE.MeshBasicMaterial>(null);
    const haloRef = useRef<THREE.Mesh>(null);
    const haloMatRef = useRef<THREE.MeshBasicMaterial>(null);
    const beamRef = useRef<THREE.Mesh>(null);
    const beamMatRef = useRef<THREE.MeshBasicMaterial>(null);
    const ringRefs = useRef<(THREE.Mesh | null)[]>([]);
    const ringMatsRef = useRef<(THREE.MeshBasicMaterial | null)[]>([]);

    // Base constellation: three loose clusters around the origin, like the
    // hub-and-spoke layout of the knowledge graph above this section.
    const { basePositions, edgePairs } = useMemo(() => {
        const centers = [
            new THREE.Vector3(-2.6, 1.2, -0.5),
            new THREE.Vector3(2.4, 1.6, 0.4),
            new THREE.Vector3(0.2, -2.2, -0.2),
        ];
        const base = new Float32Array(NODE_COUNT * 3);
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i < NODE_COUNT; i++) {
            const c = centers[i % centers.length];
            const v = new THREE.Vector3(
                c.x + (Math.random() - 0.5) * 4.4,
                c.y + (Math.random() - 0.5) * 3.4,
                c.z + (Math.random() - 0.5) * 3.0
            );
            pts.push(v);
            base[i * 3] = v.x;
            base[i * 3 + 1] = v.y;
            base[i * 3 + 2] = v.z;
        }
        // connect each node to its 2 nearest neighbours (deduped)
        const pairKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);
        const seen: Record<string, boolean> = {};
        const pairs: [number, number][] = [];
        for (let i = 0; i < NODE_COUNT; i++) {
            const dists: { j: number; d: number }[] = [];
            for (let j = 0; j < NODE_COUNT; j++) {
                if (i === j) continue;
                dists.push({ j, d: pts[i].distanceToSquared(pts[j]) });
            }
            dists.sort((a, b) => a.d - b.d);
            for (let k = 0; k < 2; k++) {
                const key = pairKey(i, dists[k].j);
                if (!seen[key]) {
                    seen[key] = true;
                    pairs.push([i, dists[k].j]);
                }
            }
        }
        return { basePositions: base, edgePairs: pairs };
    }, []);

    const nodePositions = useMemo(() => new Float32Array(basePositions), [basePositions]);
    const edgePositions = useMemo(() => new Float32Array(edgePairs.length * 6), [edgePairs]);
    const pulsePositions = useMemo(() => new Float32Array(PULSE_COUNT * 3), []);
    const pulses = useMemo(() => {
        const arr = [];
        for (let i = 0; i < PULSE_COUNT; i++) {
            arr.push({
                edge: Math.floor(Math.random() * edgePairs.length),
                speed: 0.25 + Math.random() * 0.5,
                offset: Math.random(),
            });
        }
        return arr;
    }, [edgePairs]);

    useFrame(({ clock }) => {
        const p = progressRef.current.value;
        const t = clock.getElapsedTime();
        const appear = Math.min(1, p * 7);
        // collapse of the constellation into the core
        const collapse = smoothstep(clamp01((p - 0.28) / 0.4));
        // transmission phase: core fires, rings broadcast
        const transmit = clamp01((p - 0.62) / 0.38);
        const exitFade = 1 - smoothstep(clamp01((p - 0.92) / 0.08));

        if (groupRef.current) {
            groupRef.current.rotation.y = t * 0.04 + p * 0.9;
        }

        // nodes spiral inward as the mind gathers the thought
        const shrink = 1 - collapse * 0.985;
        for (let i = 0; i < NODE_COUNT; i++) {
            const bx = basePositions[i * 3];
            const by = basePositions[i * 3 + 1];
            const bz = basePositions[i * 3 + 2];
            const wobble = (1 - collapse) * 0.12;
            nodePositions[i * 3] = bx * shrink + Math.sin(t * 0.9 + i) * wobble;
            nodePositions[i * 3 + 1] = by * shrink + Math.cos(t * 0.7 + i * 1.7) * wobble;
            nodePositions[i * 3 + 2] = bz * shrink;
        }
        if (nodeGeoRef.current) {
            (nodeGeoRef.current.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        }
        if (nodeMatRef.current) {
            nodeMatRef.current.opacity = appear * (1 - transmit) * 0.9 * exitFade;
        }

        // edges follow their endpoints
        for (let e = 0; e < edgePairs.length; e++) {
            const [a, b] = edgePairs[e];
            edgePositions[e * 6] = nodePositions[a * 3];
            edgePositions[e * 6 + 1] = nodePositions[a * 3 + 1];
            edgePositions[e * 6 + 2] = nodePositions[a * 3 + 2];
            edgePositions[e * 6 + 3] = nodePositions[b * 3];
            edgePositions[e * 6 + 4] = nodePositions[b * 3 + 1];
            edgePositions[e * 6 + 5] = nodePositions[b * 3 + 2];
        }
        if (edgeGeoRef.current) {
            (edgeGeoRef.current.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        }
        if (edgeMatRef.current) {
            edgeMatRef.current.opacity = appear * (1 - collapse) * 0.3 * exitFade;
        }

        // pulses race along edges while the network is alive
        for (let i = 0; i < PULSE_COUNT; i++) {
            const pl = pulses[i];
            const [a, b] = edgePairs[pl.edge];
            const u = (t * pl.speed + pl.offset) % 1;
            pulsePositions[i * 3] = nodePositions[a * 3] + (nodePositions[b * 3] - nodePositions[a * 3]) * u;
            pulsePositions[i * 3 + 1] = nodePositions[a * 3 + 1] + (nodePositions[b * 3 + 1] - nodePositions[a * 3 + 1]) * u;
            pulsePositions[i * 3 + 2] = nodePositions[a * 3 + 2] + (nodePositions[b * 3 + 2] - nodePositions[a * 3 + 2]) * u;
        }
        if (pulseGeoRef.current) {
            (pulseGeoRef.current.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        }
        if (pulseMatRef.current) {
            pulseMatRef.current.opacity = appear * (1 - collapse) * exitFade;
        }

        // the signal core charges with the collapse, throbs while transmitting
        if (coreRef.current) {
            const throb = 1 + Math.sin(t * 7) * 0.12 * transmit;
            const s = (0.02 + collapse * 1.1) * throb;
            coreRef.current.scale.set(s, s, s);
        }
        if (coreMatRef.current) coreMatRef.current.opacity = collapse * exitFade;
        if (haloRef.current) {
            const hs = (0.02 + collapse * 2.1) * (1 + Math.sin(t * 3.5) * 0.08);
            haloRef.current.scale.set(hs, hs, hs);
        }
        if (haloMatRef.current) haloMatRef.current.opacity = collapse * 0.3 * exitFade;

        // beam fires toward the viewer — the message leaving for your inbox
        if (beamRef.current && beamMatRef.current) {
            const len = smoothstep(transmit) * 11;
            beamRef.current.scale.set(1, Math.max(0.001, len), 1);
            beamRef.current.position.z = len / 2;
            beamMatRef.current.opacity = (transmit > 0 ? 0.75 : 0) * exitFade;
        }

        // broadcast rings ripple outward, staggered
        for (let i = 0; i < 4; i++) {
            const ring = ringRefs.current[i];
            const mat = ringMatsRef.current[i];
            if (!ring || !mat) continue;
            const tr = clamp01((p - 0.64 - i * 0.07) / 0.3);
            const eased = smoothstep(tr);
            const s = 0.4 + eased * 13;
            ring.scale.set(s, s, s);
            mat.opacity = tr > 0 ? (1 - eased) * 0.65 * exitFade : 0;
        }
    });

    return (
        <>
            <CameraRig progressRef={progressRef} />
            <fog attach="fog" args={['#000000', 14, 36]} />

            <group ref={groupRef}>
                {/* constellation nodes */}
                <points>
                    <bufferGeometry ref={nodeGeoRef}>
                        <bufferAttribute attach="attributes-position" count={NODE_COUNT} array={nodePositions} itemSize={3} />
                    </bufferGeometry>
                    <pointsMaterial
                        ref={nodeMatRef}
                        size={0.11}
                        color="#67E8F9"
                        transparent
                        opacity={0}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                        sizeAttenuation
                    />
                </points>

                {/* synapse edges */}
                <lineSegments>
                    <bufferGeometry ref={edgeGeoRef}>
                        <bufferAttribute attach="attributes-position" count={edgePairs.length * 2} array={edgePositions} itemSize={3} />
                    </bufferGeometry>
                    <lineBasicMaterial
                        ref={edgeMatRef}
                        color="#22D3EE"
                        transparent
                        opacity={0}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                    />
                </lineSegments>

                {/* firing pulses */}
                <points>
                    <bufferGeometry ref={pulseGeoRef}>
                        <bufferAttribute attach="attributes-position" count={PULSE_COUNT} array={pulsePositions} itemSize={3} />
                    </bufferGeometry>
                    <pointsMaterial
                        ref={pulseMatRef}
                        size={0.22}
                        color="#34D399"
                        transparent
                        opacity={0}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                        sizeAttenuation
                    />
                </points>
            </group>

            {/* the signal core (outside the rotating group, dead centre) */}
            <mesh ref={coreRef}>
                <sphereGeometry args={[0.22, 24, 24]} />
                <meshBasicMaterial ref={coreMatRef} color="#FFFFFF" toneMapped={false} transparent opacity={0} />
            </mesh>
            <mesh ref={haloRef}>
                <sphereGeometry args={[0.22, 16, 16]} />
                <meshBasicMaterial
                    ref={haloMatRef}
                    color="#34D399"
                    toneMapped={false}
                    transparent
                    opacity={0}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* transmission beam toward the viewer */}
            <mesh ref={beamRef} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.035, 0.035, 1, 8, 1, true]} />
                <meshBasicMaterial
                    ref={beamMatRef}
                    color="#A7F3D0"
                    toneMapped={false}
                    transparent
                    opacity={0}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* broadcast rings */}
            {[0, 1, 2, 3].map((i) => (
                <mesh
                    key={i}
                    ref={(el) => { ringRefs.current[i] = el; }}
                    position={[0, 0, 0.5 + i * 0.4]}
                >
                    <ringGeometry args={[0.94, 1, 48]} />
                    <meshBasicMaterial
                        ref={(el) => { ringMatsRef.current[i] = el; }}
                        color={i % 2 === 0 ? '#22D3EE' : '#34D399'}
                        toneMapped={false}
                        transparent
                        opacity={0}
                        side={THREE.DoubleSide}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </mesh>
            ))}
        </>
    );
}

export default SignalUplink;
