'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, History, LogOut, Users, MessageSquare, Settings, Cpu, FileText,
    Trash2, ChevronDown, ChevronUp, RefreshCw,
} from 'lucide-react';
import type { ResumeRequestLog } from '@/lib/resume-agents/types';

export default function AdminResumeHistoryPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [requests, setRequests] = useState<ResumeRequestLog[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [expanded, setExpanded] = useState<string | null>(null);

    const loadRequests = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/admin/resume-requests?page=${page}&limit=25`);
            if (response.status === 401) {
                router.push('/admin');
                return;
            }
            if (response.ok) {
                const data = await response.json();
                setRequests(data.requests || []);
                setTotalPages(data.totalPages || 1);
                setTotal(data.total || 0);
            }
        } catch (error) {
            console.error('Failed to load resume history:', error);
        } finally {
            setIsLoading(false);
        }
    }, [page, router]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const handleLogout = async () => {
        await fetch('/api/admin/auth', { method: 'DELETE' });
        router.push('/admin');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this request log entry?')) return;
        const res = await fetch(`/api/admin/resume-requests?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (res.ok) setRequests(prev => prev.filter(r => r.id !== id));
    };

    const scoreStyle = (score: number) => ({
        color: score >= 70 ? '#34D399' : score >= 45 ? '#FBBF24' : '#F87171',
        backgroundColor: score >= 70 ? '#34D39915' : score >= 45 ? '#FBBF2415' : '#F8717115',
    });

    return (
        <div className="min-h-screen bg-bg-base">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-bg-base/80 border-b border-white/10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/resume" className="flex items-center gap-2 text-text-muted hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-emerald-400" />
                            <h1 className="font-display text-lg font-bold text-white">
                                Resume History
                            </h1>
                            <span className="font-mono text-xs text-text-muted">({total})</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={loadRequests} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors">
                            <RefreshCw className="w-4 h-4" />
                            <span className="text-sm hidden sm:inline">Refresh</span>
                        </button>
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

            <main className="relative max-w-6xl mx-auto px-6 py-8">
                <p className="text-xs text-text-muted mb-6">
                    Every visitor who runs the Resume Gate fit-check lands here — role, company, the JD they pasted,
                    and the score they got. Treat high scores as warm leads.
                    <span className="block mt-1 text-amber-400/70">Note: on Vercel this log is per-instance (resets on cold start). For durable logging, a database is the Phase-2+ upgrade.</span>
                </p>

                {isLoading ? (
                    <div className="font-mono text-sm text-text-muted animate-pulse py-12 text-center">Loading…</div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-16 bg-bg-surface border border-white/10 rounded-2xl">
                        <History className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-40" />
                        <p className="text-sm text-text-muted">No resume requests logged yet.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {requests.map(r => (
                            <div key={r.id} className="rounded-xl border border-white/10 bg-bg-surface overflow-hidden">
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <span className="font-mono text-sm font-bold px-2.5 py-1 rounded" style={scoreStyle(r.fitScore)}>
                                        {r.fitScore}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">
                                            {r.role} <span className="text-text-muted">@ {r.company}</span>
                                        </p>
                                        <p className="font-mono text-[10px] text-text-muted">
                                            {new Date(r.timestamp).toLocaleString()} · {r.verdict}{r.gated ? ' · gated (no resume given)' : ' · resume delivered'} · {r.engine}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                                        className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted"
                                    >
                                        {expanded === r.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(r.id)}
                                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                {expanded === r.id && (
                                    <div className="px-4 pb-4 border-t border-white/5 pt-3">
                                        <h4 className="font-mono text-[10px] uppercase tracking-wider text-text-muted mb-2">Pasted requirements / JD</h4>
                                        <p className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">{r.requirements}</p>
                                        {(r.ip || r.userAgent) && (
                                            <p className="mt-3 font-mono text-[10px] text-text-muted border-t border-white/5 pt-2">{r.ip} · {r.userAgent}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-8">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-text-muted disabled:opacity-30"
                        >
                            ← Prev
                        </button>
                        <span className="font-mono text-xs text-text-muted">{page} / {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-text-muted disabled:opacity-30"
                        >
                            Next →
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
