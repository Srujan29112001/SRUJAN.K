'use client';

/**
 * INTERACTIVE KNOWLEDGE GRAPH (Phase 4)
 *
 * Force-directed canvas visualization of the portfolio knowledge base:
 * project nodes cluster around their category and shared-tech hubs. The
 * query tester runs the SAME retriever the Resume Gate uses, so the admin
 * can see exactly which work lights up for any recruiter query.
 * Dependency-free: plain canvas + a small physics loop.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Network, LogOut, Users, MessageSquare, Settings, Cpu, FileText,
    Search, X,
} from 'lucide-react';

interface GNode {
    id: string;
    label: string;
    type: 'project' | 'tech' | 'category';
    color: string;
    size: number;
    detail?: {
        description: string;
        tech: string[];
        year?: string;
        metric?: string;
        featured: boolean;
        ongoing: boolean;
        links: Array<{ label: string; url: string }>;
    };
    // physics
    x: number; y: number; vx: number; vy: number;
}

interface GEdge { source: string; target: string }

interface QueryMatch { id: string; title: string; relevance: number; why: string }

export default function KnowledgeGraphPage() {
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const nodesRef = useRef<GNode[]>([]);
    const edgesRef = useRef<GEdge[]>([]);
    const animRef = useRef<number>(0);
    const hoverRef = useRef<GNode | null>(null);
    const highlightRef = useRef<Map<string, number>>(new Map());

    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<Record<string, unknown> | null>(null);
    const [selected, setSelected] = useState<GNode | null>(null);
    const [query, setQuery] = useState('');
    const [queryResult, setQueryResult] = useState<{ matches: QueryMatch[]; matchedSkills: string[]; missingSkills: string[]; coveragePct: number } | null>(null);
    const [isQuerying, setIsQuerying] = useState(false);

    // ------- data load -------
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/admin/knowledge-graph');
                if (res.status === 401) { router.push('/admin'); return; }
                if (!res.ok) return;
                const data = await res.json();
                const W = 1100, H = 720;
                nodesRef.current = (data.nodes as Omit<GNode, 'x' | 'y' | 'vx' | 'vy'>[]).map((n, i) => ({
                    ...n,
                    x: W / 2 + Math.cos(i * 2.399) * (n.type === 'category' ? 80 : 280) + (i % 7) * 8,
                    y: H / 2 + Math.sin(i * 2.399) * (n.type === 'category' ? 60 : 220) + (i % 5) * 8,
                    vx: 0, vy: 0,
                }));
                edgesRef.current = data.edges;
                setStats(data.stats);
            } catch (e) {
                console.error('Graph load failed:', e);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [router]);

    // ------- physics + render loop -------
    useEffect(() => {
        if (isLoading) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const W = canvas.width, H = canvas.height;
        const nodeById = () => new Map(nodesRef.current.map(n => [n.id, n]));
        let frame = 0;

        const tick = () => {
            const nodes = nodesRef.current;
            const byId = nodeById();
            const alpha = Math.max(0.02, 1 - frame / 360); // cool down over ~6s

            // repulsion
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = nodes[i], b = nodes[j];
                    let dx = a.x - b.x, dy = a.y - b.y;
                    let d2 = dx * dx + dy * dy;
                    if (d2 < 1) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; d2 = 1; }
                    const d = Math.sqrt(d2);
                    const minDist = (a.size + b.size) * 1.6 + 14;
                    const force = d < 160 ? (1600 / d2) * alpha : 0;
                    const extra = d < minDist ? 0.6 * alpha : 0;
                    const f = force + extra;
                    a.vx += (dx / d) * f; a.vy += (dy / d) * f;
                    b.vx -= (dx / d) * f; b.vy -= (dy / d) * f;
                }
            }
            // springs
            for (const e of edgesRef.current) {
                const a = byId.get(e.source), b = byId.get(e.target);
                if (!a || !b) continue;
                const dx = b.x - a.x, dy = b.y - a.y;
                const d = Math.sqrt(dx * dx + dy * dy) || 1;
                const rest = b.type === 'category' ? 130 : 90;
                const f = (d - rest) * 0.004 * alpha * 8;
                a.vx += (dx / d) * f; a.vy += (dy / d) * f;
                b.vx -= (dx / d) * f; b.vy -= (dy / d) * f;
            }
            // gravity to center + integrate
            for (const n of nodes) {
                n.vx += (W / 2 - n.x) * 0.0006 * alpha * 8;
                n.vy += (H / 2 - n.y) * 0.0006 * alpha * 8;
                n.vx *= 0.86; n.vy *= 0.86;
                n.x = Math.max(20, Math.min(W - 20, n.x + n.vx));
                n.y = Math.max(20, Math.min(H - 20, n.y + n.vy));
            }

            // ------- draw -------
            ctx.clearRect(0, 0, W, H);
            const highlights = highlightRef.current;
            const hasHighlights = highlights.size > 0;

            ctx.lineWidth = 0.6;
            for (const e of edgesRef.current) {
                const a = byId.get(e.source), b = byId.get(e.target);
                if (!a || !b) continue;
                const lit = hasHighlights && (highlights.has(a.id) || highlights.has(b.id));
                ctx.strokeStyle = lit ? 'rgba(52, 211, 153, 0.35)' : hasHighlights ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)';
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }

            for (const n of nodes) {
                const hl = highlights.get(n.id);
                const dim = hasHighlights && hl === undefined && n.type === 'project';
                ctx.globalAlpha = dim ? 0.18 : 1;

                if (hl !== undefined) {
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, n.size + 6, 0, Math.PI * 2);
                    ctx.strokeStyle = '#34D399';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }

                ctx.beginPath();
                ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
                ctx.fillStyle = n.color;
                ctx.fill();
                if (n.detail?.ongoing) {
                    ctx.beginPath();
                    ctx.arc(n.x + n.size * 0.7, n.y - n.size * 0.7, 3, 0, Math.PI * 2);
                    ctx.fillStyle = '#EF4444';
                    ctx.fill();
                }

                // labels: hubs always; projects when hovered/highlighted/large
                const showLabel = n.type !== 'project' || hoverRef.current?.id === n.id || hl !== undefined || n.size >= 12;
                if (showLabel) {
                    ctx.font = n.type === 'project' ? '10px monospace' : 'bold 11px monospace';
                    ctx.fillStyle = n.type === 'tech' ? 'rgba(103, 232, 249, 0.9)' : 'rgba(248, 250, 252, 0.92)';
                    ctx.textAlign = 'center';
                    ctx.fillText(n.label, n.x, n.y - n.size - 5);
                    if (hl !== undefined) {
                        ctx.fillStyle = '#34D399';
                        ctx.fillText(`${hl}%`, n.x, n.y + n.size + 13);
                    }
                }
                ctx.globalAlpha = 1;
            }

            frame++;
            animRef.current = requestAnimationFrame(tick);
        };

        animRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animRef.current);
    }, [isLoading]);

    // ------- interactions -------
    const canvasPoint = (e: React.MouseEvent) => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvas.width / rect.width),
            y: (e.clientY - rect.top) * (canvas.height / rect.height),
        };
    };

    const nodeAt = (x: number, y: number): GNode | null => {
        // iterate in reverse so top-drawn nodes win
        const nodes = nodesRef.current;
        for (let i = nodes.length - 1; i >= 0; i--) {
            const n = nodes[i];
            const dx = n.x - x, dy = n.y - y;
            if (dx * dx + dy * dy <= (n.size + 4) * (n.size + 4)) return n;
        }
        return null;
    };

    const handleMove = useCallback((e: React.MouseEvent) => {
        const { x, y } = canvasPoint(e);
        hoverRef.current = nodeAt(x, y);
        if (canvasRef.current) canvasRef.current.style.cursor = hoverRef.current ? 'pointer' : 'default';
    }, []);

    const handleClick = useCallback((e: React.MouseEvent) => {
        const { x, y } = canvasPoint(e);
        const n = nodeAt(x, y);
        setSelected(n && n.type === 'project' ? n : null);
    }, []);

    const runQuery = useCallback(async () => {
        const q = query.trim();
        if (q.length < 3 || isQuerying) return;
        setIsQuerying(true);
        try {
            const res = await fetch('/api/admin/knowledge-graph', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: q }),
            });
            if (res.ok) {
                const data = await res.json();
                setQueryResult(data);
                highlightRef.current = new Map((data.matches as QueryMatch[]).map(m => [m.id, m.relevance]));
            }
        } catch { /* leave graph as is */ }
        finally { setIsQuerying(false); }
    }, [query, isQuerying]);

    const clearQuery = useCallback(() => {
        setQuery('');
        setQueryResult(null);
        highlightRef.current = new Map();
    }, []);

    const handleLogout = async () => {
        await fetch('/api/admin/auth', { method: 'DELETE' });
        router.push('/admin');
    };

    return (
        <div className="min-h-screen bg-bg-base">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-bg-base/80 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/chat-history" className="flex items-center gap-2 text-text-muted hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Network className="w-5 h-5 text-blue-400" />
                            <h1 className="font-display text-lg font-bold text-white">
                                Knowledge Graph
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/admin/clients" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors">
                            <Users className="w-4 h-4" />
                            <span className="text-sm hidden sm:inline">Clients</span>
                        </Link>
                        <Link href="/admin/chat-history" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors">
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-sm hidden sm:inline">Chats</span>
                        </Link>
                        <Link href="/admin/resume" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm hidden sm:inline">Resume</span>
                        </Link>
                        <Link href="/admin/ai-providers" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors">
                            <Cpu className="w-4 h-4" />
                            <span className="text-sm hidden sm:inline">AI</span>
                        </Link>
                        <Link href="/admin/settings" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors">
                            <Settings className="w-4 h-4" />
                            <span className="text-sm hidden sm:inline">Settings</span>
                        </Link>
                        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative max-w-7xl mx-auto px-6 py-6">
                {/* Query tester */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="flex-1 flex items-center gap-2 bg-bg-surface border border-white/10 rounded-xl px-4">
                        <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') runQuery(); }}
                            placeholder='Test a recruiter query — e.g. "computer vision edge deployment YOLO Jetson"'
                            className="flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-text-muted/50"
                        />
                        {queryResult && (
                            <button onClick={clearQuery} className="p-1 text-text-muted hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={runQuery}
                        disabled={isQuerying || query.trim().length < 3}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold disabled:opacity-40 hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                    >
                        {isQuerying ? 'Matching…' : 'Light it up'}
                    </button>
                </div>

                {/* Stats bar */}
                {stats && (
                    <div className="flex flex-wrap gap-2 mb-4 font-mono text-[11px]">
                        <span className="px-3 py-1.5 rounded-lg bg-bg-surface border border-white/10 text-text-secondary">{String(stats.projects)} projects</span>
                        <span className="px-3 py-1.5 rounded-lg bg-bg-surface border border-white/10 text-text-secondary">{String(stats.techHubs)} tech hubs</span>
                        <span className="px-3 py-1.5 rounded-lg bg-bg-surface border border-white/10 text-text-secondary">{String(stats.embeddedDocs)} embedded knowledge docs</span>
                        {queryResult && (
                            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                                {queryResult.matches.length} matches · {queryResult.coveragePct}% skill coverage
                            </span>
                        )}
                        <span className="ml-auto px-3 py-1.5 rounded-lg bg-bg-surface border border-white/10">
                            <span className="text-blue-400">● AI</span>{' '}
                            <span className="text-amber-400">● Robotics</span>{' '}
                            <span className="text-primary-light">● Research</span>{' '}
                            <span className="text-cyan-400">● tech</span>{' '}
                            <span className="text-red-400">● ongoing</span>
                        </span>
                    </div>
                )}

                <div className="grid lg:grid-cols-[1fr_320px] gap-4">
                    {/* Graph canvas */}
                    <div className="bg-bg-surface/60 border border-white/10 rounded-2xl overflow-hidden relative">
                        {isLoading ? (
                            <div className="h-[600px] flex items-center justify-center font-mono text-sm text-text-muted animate-pulse">
                                Building graph…
                            </div>
                        ) : (
                            <canvas
                                ref={canvasRef}
                                width={1100}
                                height={720}
                                onMouseMove={handleMove}
                                onClick={handleClick}
                                className="w-full h-auto"
                            />
                        )}
                    </div>

                    {/* Side panel */}
                    <div className="space-y-4">
                        {selected?.detail ? (
                            <div className="bg-bg-surface border border-white/10 rounded-2xl p-5">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-display text-sm font-bold text-white leading-snug">{selected.label}</h3>
                                    <button onClick={() => setSelected(null)} className="p-1 text-text-muted hover:text-white flex-shrink-0">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {selected.detail.featured && <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/15 text-cyan-400">featured</span>}
                                    {selected.detail.ongoing && <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/15 text-red-400">ongoing</span>}
                                    {selected.detail.year && <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-text-muted">{selected.detail.year}</span>}
                                    {selected.detail.metric && <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-text-muted">{selected.detail.metric}</span>}
                                </div>
                                <p className="text-xs text-text-secondary leading-relaxed mb-3">{selected.detail.description}</p>
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {selected.detail.tech.map(t => (
                                        <span key={t} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-bg-base border border-white/10 text-text-muted">{t}</span>
                                    ))}
                                </div>
                                {selected.detail.links.map(l => (
                                    <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                                        className="inline-block mr-3 text-xs font-mono text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                                        {l.label} ↗
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-bg-surface border border-white/10 rounded-2xl p-5">
                                <p className="text-xs text-text-muted leading-relaxed">
                                    <span className="text-white font-medium">Click a project node</span> for details.
                                    Hover to see names. Run a query above to light up the work that matches —
                                    this uses the exact same matcher the public Resume Gate runs.
                                </p>
                            </div>
                        )}

                        {queryResult && (
                            <div className="bg-bg-surface border border-white/10 rounded-2xl p-5">
                                <h3 className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 mb-3">Top matches</h3>
                                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                    {queryResult.matches.map(m => (
                                        <div key={m.id} className="flex items-center gap-2 text-xs">
                                            <span className="font-mono text-emerald-400 w-9 flex-shrink-0">{m.relevance}%</span>
                                            <span className="text-text-secondary truncate" title={m.why}>{m.title}</span>
                                        </div>
                                    ))}
                                </div>
                                {queryResult.missingSkills.length > 0 && (
                                    <p className="mt-3 pt-3 border-t border-white/5 text-[11px] text-amber-400/80">
                                        Not covered: {queryResult.missingSkills.slice(0, 6).join(', ')}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
