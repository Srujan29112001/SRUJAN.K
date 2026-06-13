'use client';

import { useRef, useMemo, MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * MindBloom — scroll-scrubbed scene for the Resume -> Neural Map transition.
 * A tight, page-shaped cluster of nodes (the one-page resume) blooms outward
 * into a sprawling, edge-linked constellation (the knowledge graph that
 * follows) — "one page → the whole mind." Driven by progressRef.
 */

const NODE_COUNT = 150;
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const PALETTE = ['#3B82F6', '#8B7EC8', '#10B981', '#22D3EE', '#F472B6'];

interface Props { progressRef: MutableRefObject<{ value: number }>; }

function CameraRig({ progressRef }: Props) {
    const { camera } = useThree();
    useFrame(() => {
        const p = progressRef.current.value;
        const cam = camera as THREE.PerspectiveCamera;
        // pull back as the mind expands
        cam.position.z = THREE.MathUtils.lerp(cam.position.z, 8 + p * 5, 0.1);
        cam.rotation.z = THREE.MathUtils.lerp(cam.rotation.z, -p * 0.05, 0.05);
    });
    return null;
}

export function MindBloom({ progressRef }: Props) {
    const groupRef = useRef<THREE.Group>(null);
    const nodeGeoRef = useRef<THREE.BufferGeometry>(null);
    const nodeMatRef = useRef<THREE.PointsMaterial>(null);
    const edgeGeoRef = useRef<THREE.BufferGeometry>(null);
    const edgeMatRef = useRef<THREE.LineBasicMaterial>(null);

    // start: nodes packed into a thin "page" rectangle; target: scattered web
    const { startPos, targetPos, edgePairs } = useMemo(() => {
        const start = new Float32Array(NODE_COUNT * 3);
        const target = new Float32Array(NODE_COUNT * 3);
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i < NODE_COUNT; i++) {
            // page: narrow in x, tall in y, flat in z
            start[i * 3] = (Math.random() - 0.5) * 3.2;
            start[i * 3 + 1] = (Math.random() - 0.5) * 4.6;
            start[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
            // bloom target: roomy sphere-ish cloud
            const a = Math.random() * Math.PI * 2;
            const e = Math.acos(2 * Math.random() - 1);
            const r = 4 + Math.random() * 5;
            const tx = r * Math.sin(e) * Math.cos(a);
            const ty = r * Math.cos(e) * 0.7;
            const tz = r * Math.sin(e) * Math.sin(a);
            target[i * 3] = tx; target[i * 3 + 1] = ty; target[i * 3 + 2] = tz;
            pts.push(new THREE.Vector3(tx, ty, tz));
        }
        // edges between near neighbours in the bloomed layout
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
                const j = dists[k].j;
                const key = i < j ? `${i}-${j}` : `${j}-${i}`;
                if (!seen[key]) { seen[key] = true; pairs.push([i, j]); }
            }
        }
        return { startPos: start, targetPos: target, edgePairs: pairs };
    }, []);

    const positions = useMemo(() => new Float32Array(startPos), [startPos]);
    const colors = useMemo(() => {
        const c = new Float32Array(NODE_COUNT * 3);
        const col = new THREE.Color();
        for (let i = 0; i < NODE_COUNT; i++) {
            col.set(PALETTE[i % PALETTE.length]);
            c[i * 3] = col.r; c[i * 3 + 1] = col.g; c[i * 3 + 2] = col.b;
        }
        return c;
    }, []);
    const edgePositions = useMemo(() => new Float32Array(edgePairs.length * 6), [edgePairs]);

    useFrame(({ clock }) => {
        const p = progressRef.current.value;
        const t = clock.getElapsedTime();
        const bloom = smoothstep(clamp01((p - 0.1) / 0.7));
        const exitFade = 1 - smoothstep(clamp01((p - 0.92) / 0.08));

        if (groupRef.current) groupRef.current.rotation.y = t * 0.05 + p * 0.7;

        for (let i = 0; i < NODE_COUNT; i++) {
            const jitter = Math.sin(t * 0.8 + i) * 0.06 * bloom;
            positions[i * 3] = startPos[i * 3] + (targetPos[i * 3] - startPos[i * 3]) * bloom + jitter;
            positions[i * 3 + 1] = startPos[i * 3 + 1] + (targetPos[i * 3 + 1] - startPos[i * 3 + 1]) * bloom;
            positions[i * 3 + 2] = startPos[i * 3 + 2] + (targetPos[i * 3 + 2] - startPos[i * 3 + 2]) * bloom + jitter;
        }
        if (nodeGeoRef.current) (nodeGeoRef.current.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        if (nodeMatRef.current) nodeMatRef.current.opacity = Math.min(1, p * 7) * exitFade;

        for (let e = 0; e < edgePairs.length; e++) {
            const [a, b] = edgePairs[e];
            edgePositions[e * 6] = positions[a * 3];
            edgePositions[e * 6 + 1] = positions[a * 3 + 1];
            edgePositions[e * 6 + 2] = positions[a * 3 + 2];
            edgePositions[e * 6 + 3] = positions[b * 3];
            edgePositions[e * 6 + 4] = positions[b * 3 + 1];
            edgePositions[e * 6 + 5] = positions[b * 3 + 2];
        }
        if (edgeGeoRef.current) (edgeGeoRef.current.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        // edges only appear as the web forms
        if (edgeMatRef.current) edgeMatRef.current.opacity = bloom * 0.28 * exitFade;
    });

    return (
        <>
            <CameraRig progressRef={progressRef} />
            <fog attach="fog" args={['#000000', 14, 38]} />

            <group ref={groupRef}>
                <lineSegments>
                    <bufferGeometry ref={edgeGeoRef}>
                        <bufferAttribute attach="attributes-position" count={edgePairs.length * 2} array={edgePositions} itemSize={3} />
                    </bufferGeometry>
                    <lineBasicMaterial ref={edgeMatRef} color="#22D3EE" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
                </lineSegments>

                <points>
                    <bufferGeometry ref={nodeGeoRef}>
                        <bufferAttribute attach="attributes-position" count={NODE_COUNT} array={positions} itemSize={3} />
                        <bufferAttribute attach="attributes-color" count={NODE_COUNT} array={colors} itemSize={3} />
                    </bufferGeometry>
                    <pointsMaterial
                        ref={nodeMatRef}
                        size={0.16}
                        vertexColors
                        transparent
                        opacity={0}
                        depthWrite={false}
                        blending={THREE.AdditiveBlending}
                        sizeAttenuation
                    />
                </points>
            </group>
        </>
    );
}

export default MindBloom;
