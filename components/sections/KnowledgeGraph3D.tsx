'use client';

/**
 * KNOWLEDGE GRAPH 3D — public, cursor-interactive map of the portfolio.
 *
 * 63 projects orbit their category hubs (AI / Robotics / Research) and the
 * shared-tech hubs they use, laid out by a live 3D force simulation. Drag to
 * rotate, hover for names, click a project for details. The query box runs
 * the exact same matcher as the Resume Gate and lights up matching work.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/useMediaQuery';

interface GNode {
    id: string;
    label: string;
    type: 'project' | 'tech' | 'category' | 'doc';
    color: string;
    size: number;
    hub?: string;
    detail?: {
        description: string;
        tech?: string[];
        year?: string;
        metric?: string;
        featured?: boolean;
        ongoing?: boolean;
        links?: Array<{ label: string; url: string }>;
        kind?: string;
    };
}

interface GEdge { source: string; target: string }
interface QueryMatch { id: string; title: string; relevance: number; kind?: string }

// ---------------------------------------------------------------------------
// Force-simulated node cloud (runs inside the R3F canvas)
// ---------------------------------------------------------------------------
function GraphScene({
    nodes, edges, highlights, onSelect,
}: {
    nodes: GNode[];
    edges: GEdge[];
    highlights: Map<string, number>;
    onSelect: (node: GNode | null) => void;
}) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const linesRef = useRef<THREE.LineSegments>(null);
    const [hovered, setHovered] = useState<number | null>(null);
    const frameCount = useRef(0);
    const { invalidate } = useThree();

    // physics state lives in refs — no react re-renders per frame
    const sim = useMemo(() => {
        const pos = new Float32Array(nodes.length * 3);
        const vel = new Float32Array(nodes.length * 3);
        const indexById = new Map(nodes.map((n, i) => [n.id, i]));
        // seed: SRUJAN at the core, hubs inner shell, tech mid, members outer
        nodes.forEach((n, i) => {
            const r = n.id === 'center' ? 0.1 : n.type === 'category' ? 6 : n.type === 'tech' ? 10 : 16;
            const theta = (i * 2.399963) % (Math.PI * 2); // golden angle
            const phi = Math.acos(1 - 2 * ((i + 0.5) / nodes.length));
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = r * Math.cos(phi);
        });
        const edgeIdx = edges
            .map(e => [indexById.get(e.source), indexById.get(e.target)])
            .filter((p): p is [number, number] => p[0] !== undefined && p[1] !== undefined);
        return { pos, vel, edgeIdx };
    }, [nodes, edges]);

    const dummy = useMemo(() => new THREE.Object3D(), []);
    const baseColors = useMemo(() => nodes.map(n => new THREE.Color(n.color)), [nodes]);
    const dimColor = useMemo(() => new THREE.Color('#1e293b'), []);
    const litColor = useMemo(() => new THREE.Color('#34D399'), []);

    useFrame(() => {
        const { pos, vel, edgeIdx } = sim;
        const n = nodes.length;
        frameCount.current++;
        const alpha = Math.max(0, 1 - frameCount.current / 420); // settle ~7s

        if (alpha > 0) {
            // pairwise repulsion
            for (let i = 0; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                    let dx = pos[i * 3] - pos[j * 3];
                    let dy = pos[i * 3 + 1] - pos[j * 3 + 1];
                    let dz = pos[i * 3 + 2] - pos[j * 3 + 2];
                    let d2 = dx * dx + dy * dy + dz * dz;
                    if (d2 < 0.01) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; dz = Math.random() - 0.5; d2 = 0.5; }
                    const f = (6 / d2) * alpha * 0.016;
                    const d = Math.sqrt(d2);
                    vel[i * 3] += (dx / d) * f; vel[i * 3 + 1] += (dy / d) * f; vel[i * 3 + 2] += (dz / d) * f;
                    vel[j * 3] -= (dx / d) * f; vel[j * 3 + 1] -= (dy / d) * f; vel[j * 3 + 2] -= (dz / d) * f;
                }
            }
            // springs along edges
            for (const [a, b] of edgeIdx) {
                const dx = pos[b * 3] - pos[a * 3];
                const dy = pos[b * 3 + 1] - pos[a * 3 + 1];
                const dz = pos[b * 3 + 2] - pos[a * 3 + 2];
                const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
                const rest = nodes[b].type === 'category' ? 7 : 4.5;
                const f = (d - rest) * 0.02 * alpha;
                vel[a * 3] += (dx / d) * f; vel[a * 3 + 1] += (dy / d) * f; vel[a * 3 + 2] += (dz / d) * f;
                vel[b * 3] -= (dx / d) * f; vel[b * 3 + 1] -= (dy / d) * f; vel[b * 3 + 2] -= (dz / d) * f;
            }
            // gravity + integrate
            for (let i = 0; i < n; i++) {
                vel[i * 3] -= pos[i * 3] * 0.002 * alpha;
                vel[i * 3 + 1] -= pos[i * 3 + 1] * 0.002 * alpha;
                vel[i * 3 + 2] -= pos[i * 3 + 2] * 0.002 * alpha;
                vel[i * 3] *= 0.88; vel[i * 3 + 1] *= 0.88; vel[i * 3 + 2] *= 0.88;
                pos[i * 3] += vel[i * 3]; pos[i * 3 + 1] += vel[i * 3 + 1]; pos[i * 3 + 2] += vel[i * 3 + 2];
            }
        }

        // write instances
        const mesh = meshRef.current;
        if (mesh) {
            const hasHighlights = highlights.size > 0;
            for (let i = 0; i < n; i++) {
                const node = nodes[i];
                const lit = highlights.has(node.id);
                const dimmable = node.type === 'project' || node.type === 'doc';
                const scale = (node.size / 9) * (hovered === i ? 1.5 : 1) * (lit ? 1.35 : 1);
                dummy.position.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
                dummy.scale.setScalar(scale);
                dummy.updateMatrix();
                mesh.setMatrixAt(i, dummy.matrix);
                const color = lit ? litColor
                    : hasHighlights && dimmable ? dimColor
                    : baseColors[i];
                mesh.setColorAt(i, color);
            }
            mesh.instanceMatrix.needsUpdate = true;
            if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        }

        // write edge lines
        const lines = linesRef.current;
        if (lines) {
            const geo = lines.geometry;
            const arr = geo.attributes.position.array as Float32Array;
            sim.edgeIdx.forEach(([a, b], k) => {
                arr[k * 6] = pos[a * 3]; arr[k * 6 + 1] = pos[a * 3 + 1]; arr[k * 6 + 2] = pos[a * 3 + 2];
                arr[k * 6 + 3] = pos[b * 3]; arr[k * 6 + 4] = pos[b * 3 + 1]; arr[k * 6 + 5] = pos[b * 3 + 2];
            });
            geo.attributes.position.needsUpdate = true;
        }
        invalidate();
    });

    const linePositions = useMemo(() => new Float32Array(sim.edgeIdx.length * 6), [sim.edgeIdx.length]);
    const hoveredNode = hovered !== null ? nodes[hovered] : null;

    return (
        <>
            <ambientLight intensity={0.6} />
            <pointLight position={[20, 20, 20]} intensity={900} color="#67e8f9" />
            <pointLight position={[-20, -10, -20]} intensity={500} color="#a78bfa" />

            <lineSegments ref={linesRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
                </bufferGeometry>
                <lineBasicMaterial color="#22d3ee" transparent opacity={0.12} />
            </lineSegments>

            <instancedMesh
                ref={meshRef}
                args={[undefined, undefined, nodes.length]}
                onPointerMove={(e) => { e.stopPropagation(); setHovered(e.instanceId ?? null); }}
                onPointerOut={() => setHovered(null)}
                onClick={(e) => {
                    e.stopPropagation();
                    const node = e.instanceId !== undefined ? nodes[e.instanceId] : null;
                    onSelect(node && node.detail ? node : null);
                }}
            >
                <sphereGeometry args={[0.55, 20, 20]} />
                <meshStandardMaterial roughness={0.35} metalness={0.25} emissiveIntensity={0.35} />
            </instancedMesh>

            {/* hub labels — always visible */}
            {nodes.map((node, i) =>
                node.type === 'category' ? (
                    <Html
                        key={node.id}
                        position={[sim.pos[i * 3], sim.pos[i * 3 + 1] + 1.6, sim.pos[i * 3 + 2]]}
                        center
                        style={{ pointerEvents: 'none' }}
                    >
                        <span className="font-mono text-[11px] font-bold tracking-widest whitespace-nowrap" style={{ color: node.color }}>
                            {node.label.toUpperCase()}
                        </span>
                    </Html>
                ) : null,
            )}

            {/* hover tooltip */}
            {hoveredNode && hovered !== null && (
                <Html
                    position={[sim.pos[hovered * 3], sim.pos[hovered * 3 + 1] + 1.3, sim.pos[hovered * 3 + 2]]}
                    center
                    style={{ pointerEvents: 'none' }}
                >
                    <span className="px-2 py-1 rounded bg-black/85 border border-cyan-500/30 font-mono text-[10px] text-cyan-300 whitespace-nowrap">
                        {hoveredNode.label}{highlights.has(hoveredNode.id) ? ` · ${highlights.get(hoveredNode.id)}%` : ''}
                    </span>
                </Html>
            )}
        </>
    );
}

// ---------------------------------------------------------------------------
// Section wrapper (header, canvas, side panel, query box)
// ---------------------------------------------------------------------------
export function KnowledgeGraph3D() {
    const isMobile = useIsMobile();
    const [nodes, setNodes] = useState<GNode[]>([]);
    const [edges, setEdges] = useState<GEdge[]>([]);
    const [stats, setStats] = useState<{ projects: number; techHubs: number; knowledgeDocs: number } | null>(null);
    const [selected, setSelected] = useState<GNode | null>(null);
    const [query, setQuery] = useState('');
    const [isQuerying, setIsQuerying] = useState(false);
    const [queryResult, setQueryResult] = useState<{ matches: QueryMatch[] } | null>(null);
    const [highlights, setHighlights] = useState<Map<string, number>>(new Map());
    // Owner knowledge feed (password-gated, reuses the admin session)
    const [ownerOpen, setOwnerOpen] = useState(false);
    const [ownerAuthed, setOwnerAuthed] = useState(false);
    const [ownerPassword, setOwnerPassword] = useState('');
    const [ownerBusy, setOwnerBusy] = useState(false);
    const [ownerMsg, setOwnerMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const [customDocs, setCustomDocs] = useState<Array<{ id: string; title: string; chars: number; sourceFile?: string; createdAt: string }>>([]);
    const [feedTitle, setFeedTitle] = useState('');
    const [feedTags, setFeedTags] = useState('');
    const [feedText, setFeedText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadGraph = useCallback(() => {
        fetch('/api/knowledge-graph')
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (!d) return;
                setNodes(d.nodes);
                setEdges(d.edges);
                setStats(d.stats);
            })
            .catch(() => { /* section just stays empty */ });
    }, []);

    useEffect(() => { loadGraph(); }, [loadGraph]);

    useEffect(() => {
        fetch('/api/admin/auth').then(r => { if (r.ok) setOwnerAuthed(true); }).catch(() => {});
    }, []);

    const loadCustomDocs = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/custom-knowledge');
            if (res.ok) {
                const d = await res.json();
                setCustomDocs(d.docs || []);
            }
        } catch { /* stays empty */ }
    }, []);

    useEffect(() => { if (ownerAuthed && ownerOpen) loadCustomDocs(); }, [ownerAuthed, ownerOpen, loadCustomDocs]);

    const ownerUnlock = useCallback(async () => {
        if (!ownerPassword.trim() || ownerBusy) return;
        setOwnerBusy(true);
        setOwnerMsg(null);
        try {
            const res = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: ownerPassword }),
            });
            if (res.ok) { setOwnerAuthed(true); setOwnerPassword(''); }
            else setOwnerMsg({ ok: false, text: 'Wrong password.' });
        } catch {
            setOwnerMsg({ ok: false, text: 'Could not reach the server.' });
        } finally { setOwnerBusy(false); }
    }, [ownerPassword, ownerBusy]);

    const feedSubmit = useCallback(async () => {
        if (ownerBusy) return;
        const file = fileInputRef.current?.files?.[0];
        if (!file && (feedTitle.trim().length < 3 || feedText.trim().length < 20)) {
            setOwnerMsg({ ok: false, text: 'Give it a title + at least 20 characters of text, or pick a file.' });
            return;
        }
        setOwnerBusy(true);
        setOwnerMsg(null);
        try {
            let res: Response;
            if (file) {
                const form = new FormData();
                form.append('file', file);
                if (feedTitle.trim()) form.append('title', feedTitle.trim());
                if (feedTags.trim()) form.append('tags', feedTags.trim());
                res = await fetch('/api/admin/custom-knowledge', { method: 'POST', body: form });
            } else {
                res = await fetch('/api/admin/custom-knowledge', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: feedTitle.trim(),
                        content: feedText.trim(),
                        tags: feedTags.split(',').map(t => t.trim()).filter(Boolean),
                    }),
                });
            }
            const d = await res.json();
            if (res.ok) {
                setOwnerMsg({ ok: true, text: `Added "${d.doc.title}" (${d.doc.chars} chars, saved to ${d.persistedTo}). The AI knows it now.` });
                setFeedTitle(''); setFeedTags(''); setFeedText('');
                if (fileInputRef.current) fileInputRef.current.value = '';
                await loadCustomDocs();
                loadGraph(); // new Field Note node appears
            } else {
                setOwnerMsg({ ok: false, text: d.error || 'Failed to add.' });
            }
        } catch {
            setOwnerMsg({ ok: false, text: 'Upload failed — network error.' });
        } finally { setOwnerBusy(false); }
    }, [feedTitle, feedTags, feedText, ownerBusy, loadCustomDocs, loadGraph]);

    const feedDelete = useCallback(async (id: string) => {
        const res = await fetch(`/api/admin/custom-knowledge?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (res.ok) { await loadCustomDocs(); loadGraph(); }
    }, [loadCustomDocs, loadGraph]);

    const runQuery = useCallback(async () => {
        const q = query.trim();
        if (q.length < 3 || isQuerying) return;
        setIsQuerying(true);
        try {
            const res = await fetch('/api/knowledge-graph', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: q }),
            });
            if (res.ok) {
                const data = await res.json();
                setQueryResult(data);
                setHighlights(new Map((data.matches as QueryMatch[]).map(m => [m.id, m.relevance])));
            }
        } catch { /* keep current view */ }
        finally { setIsQuerying(false); }
    }, [query, isQuerying]);

    const clearQuery = useCallback(() => {
        setQuery('');
        setQueryResult(null);
        setHighlights(new Map());
    }, []);

    return (
        <section id="knowledge" className="relative py-20 px-4 overflow-hidden bg-black">
            <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                    backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.5) 1px, transparent 1px)
            `,
                    backgroundSize: '100px 100px',
                }}
            />

            {/* Section header — canonical pattern */}
            <div className="max-w-6xl mx-auto mb-10 sm:mb-14 text-center relative z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[300px] sm:h-[400px] bg-blue-600/20 blur-[120px] rounded-full -z-20 pointer-events-none mix-blend-screen" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="inline-block bg-black/50 px-4 sm:px-6 py-2 border border-cyan-500/30 rounded-full backdrop-blur-md"
                >
                    <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-cyan-400">
                        Neural Map
                    </span>
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="mt-4 sm:mt-5 md:mt-6 font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight px-2"
                >
                    KNOWLEDGE GRAPH
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mx-auto mt-3 sm:mt-4 max-w-xl text-sm sm:text-base md:text-lg text-text-secondary px-4"
                >
                    Everything my AI twin knows — projects, skills, journey, writing, interests, even
                    life beyond the code — orbiting one mind. Drag to explore, click any node, or ask it a question.
                </motion.p>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Query bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="flex-1 flex items-center gap-2 bg-bg-base/80 border border-cyan-900/30 rounded-xl px-4">
                        <svg className="w-4 h-4 text-text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                        </svg>
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') runQuery(); }}
                            placeholder='Try "computer vision YOLO" or "meditation philosophy" — see what lights up'
                            className="flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-text-muted/50"
                        />
                        {queryResult && (
                            <button onClick={clearQuery} className="p-1 text-text-muted hover:text-white" aria-label="Clear query">✕</button>
                        )}
                    </div>
                    <button
                        onClick={runQuery}
                        disabled={isQuerying || query.trim().length < 3}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold disabled:opacity-40 hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                    >
                        {isQuerying ? 'Matching…' : 'Light it up'}
                    </button>
                </div>

                <div className="grid lg:grid-cols-[1fr_300px] gap-4">
                    {/* 3D canvas */}
                    <div className="relative h-[420px] sm:h-[520px] bg-bg-base/60 border border-cyan-900/30 rounded-2xl overflow-hidden">
                        {nodes.length > 0 ? (
                            <Canvas
                                frameloop="demand"
                                camera={{ position: [0, 4, 30], fov: 50 }}
                                dpr={[1, 1.75]}
                            >
                                <GraphScene nodes={nodes} edges={edges} highlights={highlights} onSelect={setSelected} />
                                <OrbitControls
                                    enablePan={false}
                                    enableZoom={false}
                                    enableRotate={!isMobile}
                                    autoRotate
                                    autoRotateSpeed={0.6}
                                    makeDefault
                                />
                            </Canvas>
                        ) : (
                            <div className="h-full flex items-center justify-center font-mono text-sm text-text-muted animate-pulse">
                                Mapping the portfolio…
                            </div>
                        )}
                        {stats && (
                            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5 font-mono text-[10px] pointer-events-none">
                                <span className="px-2 py-1 rounded bg-black/70 border border-white/10 text-text-muted">
                                    {stats.projects} projects · {stats.knowledgeDocs} life &amp; mind docs
                                </span>
                                <span className="px-2 py-1 rounded bg-black/70 border border-white/10">
                                    <span style={{ color: '#3B82F6' }}>● AI</span>{' '}
                                    <span style={{ color: '#F59E0B' }}>● Robotics</span>{' '}
                                    <span style={{ color: '#8B7EC8' }}>● Research</span>{' '}
                                    <span style={{ color: '#06B6D4' }}>● tech</span>{' '}
                                    <span style={{ color: '#10B981' }}>● skills</span>
                                </span>
                                <span className="px-2 py-1 rounded bg-black/70 border border-white/10">
                                    <span style={{ color: '#F472B6' }}>● journey</span>{' '}
                                    <span style={{ color: '#818CF8' }}>● writing</span>{' '}
                                    <span style={{ color: '#E879F9' }}>● life</span>{' '}
                                    <span style={{ color: '#FB7185' }}>● interests</span>{' '}
                                    <span style={{ color: '#FACC15' }}>● clients</span>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Side panel */}
                    <div className="space-y-4">
                        {selected?.detail ? (
                            <div className="bg-bg-base/80 border border-cyan-900/30 rounded-2xl p-5">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-display text-sm font-bold text-white leading-snug">{selected.label}</h3>
                                    <button onClick={() => setSelected(null)} className="p-1 text-text-muted hover:text-white flex-shrink-0" aria-label="Close details">✕</button>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {selected.detail.kind && selected.detail.kind !== 'project' && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-white/15 text-text-secondary">{selected.detail.kind}</span>
                                    )}
                                    {selected.detail.featured && <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/15 text-cyan-400">featured</span>}
                                    {selected.detail.ongoing && <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/15 text-red-400">ongoing</span>}
                                    {selected.detail.year && <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-text-muted">{selected.detail.year}</span>}
                                    {selected.detail.metric && <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-text-muted">{selected.detail.metric}</span>}
                                </div>
                                <p className="text-xs text-text-secondary leading-relaxed mb-3 max-h-44 overflow-y-auto pr-1">{selected.detail.description}</p>
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {(selected.detail.tech || []).slice(0, 8).map(t => (
                                        <span key={t} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-bg-surface border border-white/10 text-text-muted">{t}</span>
                                    ))}
                                </div>
                                {(selected.detail.links || []).map(l => (
                                    <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                                        className="inline-block mr-3 text-xs font-mono text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                                        {l.label} ↗
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-bg-base/80 border border-cyan-900/30 rounded-2xl p-5">
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    <span className="text-white font-medium">Drag</span> to orbit ·{' '}
                                    <span className="text-white font-medium">hover</span> for names ·{' '}
                                    <span className="text-white font-medium">click</span> a project node for details and links.
                                    The query box runs the same engine that tailors my resume.
                                </p>
                            </div>
                        )}

                        {queryResult && (
                            <div className="bg-bg-base/80 border border-emerald-500/25 rounded-2xl p-5">
                                <h3 className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 mb-3">
                                    {queryResult.matches.length} matches across work &amp; life
                                </h3>
                                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                                    {queryResult.matches.map(m => (
                                        <div key={m.id} className="flex items-center gap-2 text-xs">
                                            <span className="font-mono text-emerald-400 w-9 flex-shrink-0">{m.relevance}%</span>
                                            <span className="text-text-secondary truncate">{m.title}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-3 pt-2 border-t border-white/5 text-[10px] text-text-muted">
                                    Exactly what my AI chat retrieves for this question.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ===== Owner-only knowledge feed (password-gated) ===== */}
                <div className="mt-6">
                    {!ownerOpen ? (
                        <button
                            onClick={() => setOwnerOpen(true)}
                            className="mx-auto flex items-center gap-1.5 font-mono text-[10px] text-text-muted/40 hover:text-text-muted transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                            owner
                        </button>
                    ) : !ownerAuthed ? (
                        <div className="max-w-sm mx-auto space-y-2">
                            <p className="text-center font-mono text-[10px] text-amber-400/80">Feed the knowledge base — enter the admin password</p>
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    value={ownerPassword}
                                    onChange={e => setOwnerPassword(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') ownerUnlock(); }}
                                    placeholder="Admin password"
                                    className="flex-1 rounded-lg border border-amber-500/30 bg-bg-surface px-3 py-2 text-xs text-white placeholder-text-muted focus:border-amber-400 focus:outline-none"
                                />
                                <button
                                    onClick={ownerUnlock}
                                    disabled={ownerBusy || !ownerPassword.trim()}
                                    className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono text-xs hover:bg-amber-500/30 disabled:opacity-40"
                                >
                                    {ownerBusy ? '…' : 'Unlock'}
                                </button>
                            </div>
                            {ownerMsg && <p className="text-center text-[10px] text-red-400">{ownerMsg.text}</p>}
                        </div>
                    ) : (
                        <div className="bg-bg-base/80 border border-amber-500/25 rounded-2xl p-5 sm:p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <h3 className="font-display text-base font-bold text-white">Feed the knowledge base</h3>
                                <span className="px-2 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">owner only</span>
                                <button onClick={() => setOwnerOpen(false)} className="ml-auto p-1 text-text-muted hover:text-white" aria-label="Close">✕</button>
                            </div>
                            <p className="text-xs text-text-muted mb-4">
                                Paste text or upload a PDF / DOCX / TXT / MD. It joins the AI&apos;s brain instantly — searched by
                                the chat, shown here as a <span className="text-slate-300">Field Notes</span> node.
                                Images aren&apos;t OCR&apos;d yet — describe them in text instead.
                            </p>
                            <div className="grid lg:grid-cols-2 gap-5">
                                <div className="space-y-2.5">
                                    <div className="grid sm:grid-cols-2 gap-2.5">
                                        <input
                                            value={feedTitle}
                                            onChange={e => setFeedTitle(e.target.value)}
                                            placeholder="Title *"
                                            className="rounded-lg border border-white/10 bg-bg-surface px-3 py-2.5 text-xs text-white placeholder-text-muted focus:border-cyan-500 focus:outline-none"
                                        />
                                        <input
                                            value={feedTags}
                                            onChange={e => setFeedTags(e.target.value)}
                                            placeholder="Tags (comma-separated)"
                                            className="rounded-lg border border-white/10 bg-bg-surface px-3 py-2.5 text-xs text-white placeholder-text-muted focus:border-cyan-500 focus:outline-none"
                                        />
                                    </div>
                                    <textarea
                                        value={feedText}
                                        onChange={e => setFeedText(e.target.value)}
                                        rows={5}
                                        placeholder="Paste knowledge as text… (or use the file picker instead)"
                                        className="w-full rounded-lg border border-white/10 bg-bg-surface px-3 py-2.5 text-xs text-white placeholder-text-muted focus:border-cyan-500 focus:outline-none resize-none"
                                    />
                                    <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf,.docx,.doc,.txt,.md"
                                            className="flex-1 text-[11px] text-text-muted file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:text-xs file:font-mono file:cursor-pointer"
                                        />
                                        <button
                                            onClick={feedSubmit}
                                            disabled={ownerBusy}
                                            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs disabled:opacity-50 whitespace-nowrap"
                                        >
                                            {ownerBusy ? 'Feeding…' : 'Add to knowledge base'}
                                        </button>
                                    </div>
                                    {ownerMsg && (
                                        <p className={`text-[11px] ${ownerMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{ownerMsg.text}</p>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-mono text-[10px] uppercase tracking-wider text-text-muted mb-2">
                                        Field notes in the brain ({customDocs.length})
                                    </h4>
                                    {customDocs.length === 0 ? (
                                        <p className="text-xs text-text-muted/60">Nothing fed yet.</p>
                                    ) : (
                                        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                                            {customDocs.map(d => (
                                                <div key={d.id} className="flex items-center gap-2 p-2 rounded-lg bg-bg-surface border border-white/5">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-white truncate">{d.title}</p>
                                                        <p className="font-mono text-[10px] text-text-muted">
                                                            {d.chars.toLocaleString()} chars{d.sourceFile ? ` · ${d.sourceFile}` : ''} · {new Date(d.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => feedDelete(d.id)}
                                                        className="p-1 text-text-muted hover:text-red-400 flex-shrink-0"
                                                        aria-label={`Delete ${d.title}`}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default KnowledgeGraph3D;
