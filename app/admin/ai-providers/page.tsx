'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Cpu, Save, LogOut, Users, MessageSquare, Settings, FileText,
    ChevronUp, ChevronDown, CheckCircle, AlertCircle, Zap,
} from 'lucide-react';

interface ProviderStatus {
    id: string;
    label: string;
    enabled: boolean;
    model: string;
    keyCount: number;
    keySources: { admin: number; env: number };
    maskedKeys: string[];
    ready: boolean;
}

interface ProviderEdit {
    enabled: boolean;
    model: string;
    keysRaw: string;
}

export default function AdminAIProvidersPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [order, setOrder] = useState<string[]>([]);
    const [statuses, setStatuses] = useState<Record<string, ProviderStatus>>({});
    const [edits, setEdits] = useState<Record<string, ProviderEdit>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ ok: boolean; text: string } | null>(null);
    const [testResults, setTestResults] = useState<Record<string, { ok: boolean; detail: string; latencyMs?: number }>>({});
    const [testing, setTesting] = useState<string | null>(null);

    useEffect(() => {
        loadProviders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadProviders = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/admin/ai-providers');
            if (res.status === 401) {
                router.push('/admin');
                return;
            }
            if (res.ok) {
                const data = await res.json();
                const map: Record<string, ProviderStatus> = {};
                const editMap: Record<string, ProviderEdit> = {};
                for (const p of data.providers as ProviderStatus[]) {
                    map[p.id] = p;
                    editMap[p.id] = {
                        enabled: p.enabled,
                        model: p.model,
                        keysRaw: p.maskedKeys.join('\n'),
                    };
                }
                setStatuses(map);
                setEdits(editMap);
                setOrder(data.order || []);
            }
        } catch (error) {
            console.error('Failed to load providers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/admin/auth', { method: 'DELETE' });
        router.push('/admin');
    };

    const moveProvider = (id: string, dir: -1 | 1) => {
        setOrder(prev => {
            const idx = prev.indexOf(id);
            const next = [...prev];
            const swap = idx + dir;
            if (idx < 0 || swap < 0 || swap >= next.length) return prev;
            [next[idx], next[swap]] = [next[swap], next[idx]];
            return next;
        });
    };

    const handleSave = useCallback(async () => {
        try {
            setIsSaving(true);
            setSaveMessage(null);
            const providers: Record<string, ProviderEdit> = {};
            for (const id of Object.keys(edits)) providers[id] = edits[id];
            const res = await fetch('/api/admin/ai-providers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order, providers }),
            });
            if (res.status === 401) {
                router.push('/admin');
                return;
            }
            if (res.ok) {
                setSaveMessage({ ok: true, text: 'Provider config saved. Env-var keys always remain active as fallback. On Vercel, set keys via environment variables for durability.' });
                await loadProviders();
            } else {
                const data = await res.json().catch(() => ({}));
                setSaveMessage({ ok: false, text: data.error || 'Save failed' });
            }
        } catch {
            setSaveMessage({ ok: false, text: 'Save failed — network error' });
        } finally {
            setIsSaving(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [edits, order, router]);

    const handleTest = async (id: string) => {
        setTesting(id);
        setTestResults(prev => ({ ...prev, [id]: undefined as never }));
        try {
            const res = await fetch('/api/admin/ai-providers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider: id }),
            });
            const data = await res.json();
            setTestResults(prev => ({ ...prev, [id]: data }));
        } catch {
            setTestResults(prev => ({ ...prev, [id]: { ok: false, detail: 'Network error' } }));
        } finally {
            setTesting(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-bg-base flex items-center justify-center">
                <div className="font-mono text-sm text-text-muted animate-pulse">Loading AI providers…</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-base">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-bg-base/80 border-b border-white/10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/clients" className="flex items-center gap-2 text-text-muted hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-purple-400" />
                            <h1 className="font-display text-lg font-bold text-white">
                                AI Providers
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

            <main className="relative max-w-4xl mx-auto px-6 py-8 space-y-6">
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15">
                    <p className="text-xs text-text-secondary leading-relaxed">
                        The resume engine (and future AI features) walks providers <span className="text-white font-medium">top to bottom</span> until
                        one succeeds — failed/rate-limited keys rotate automatically. Keys entered here are stored in{' '}
                        <span className="font-mono text-cyan-400">data/ai-providers.json</span> (gitignored). Keys from environment
                        variables (<span className="font-mono text-cyan-400">OPENAI_API_KEYS</span>, <span className="font-mono text-cyan-400">GROQ_API_KEYS</span>, …)
                        are merged in automatically and survive deployments.
                    </p>
                </div>

                {order.map((id, idx) => {
                    const status = statuses[id];
                    const edit = edits[id];
                    if (!status || !edit) return null;
                    const test = testResults[id];
                    return (
                        <section key={id} className="bg-bg-surface border border-white/10 rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex flex-col">
                                    <button onClick={() => moveProvider(id, -1)} disabled={idx === 0}
                                        className="p-0.5 text-text-muted hover:text-white disabled:opacity-20">
                                        <ChevronUp className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => moveProvider(id, 1)} disabled={idx === order.length - 1}
                                        className="p-0.5 text-text-muted hover:text-white disabled:opacity-20">
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                </div>
                                <span className="font-mono text-xs text-text-muted w-6">#{idx + 1}</span>
                                <h2 className="font-display text-base font-bold text-white flex-1">{status.label}</h2>
                                <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-wider ${status.ready ? 'bg-green-500/15 text-green-400' : 'bg-white/5 text-text-muted'}`}>
                                    {status.ready ? `ready · ${status.keyCount} key${status.keyCount === 1 ? '' : 's'}` : 'no keys'}
                                </span>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={edit.enabled}
                                        onChange={e => setEdits(prev => ({ ...prev, [id]: { ...prev[id], enabled: e.target.checked } }))}
                                        className="accent-cyan-500"
                                    />
                                    <span className="text-xs text-text-muted">Enabled</span>
                                </label>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-text-muted mb-2">Model</label>
                                    <input
                                        value={edit.model}
                                        onChange={e => setEdits(prev => ({ ...prev, [id]: { ...prev[id], model: e.target.value } }))}
                                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-white/10 bg-bg-base text-white focus:border-cyan-500 transition-all font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-muted mb-2">
                                        API keys (one per line; masked lines keep the stored key)
                                        {status.keySources.env > 0 && (
                                            <span className="ml-2 text-cyan-400/70">+{status.keySources.env} from env</span>
                                        )}
                                    </label>
                                    <textarea
                                        value={edit.keysRaw}
                                        onChange={e => setEdits(prev => ({ ...prev, [id]: { ...prev[id], keysRaw: e.target.value } }))}
                                        rows={2}
                                        placeholder="sk-…"
                                        className="w-full px-4 py-2.5 text-xs rounded-xl border border-white/10 bg-bg-base text-white focus:border-cyan-500 transition-all font-mono"
                                    />
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-3">
                                <button
                                    onClick={() => handleTest(id)}
                                    disabled={testing === id}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white text-xs font-mono transition-colors disabled:opacity-50"
                                >
                                    <Zap className="w-3.5 h-3.5" />
                                    {testing === id ? 'Testing…' : 'Test'}
                                </button>
                                {test && (
                                    <span className={`flex items-center gap-1.5 text-xs ${test.ok ? 'text-green-400' : 'text-red-400'}`}>
                                        {test.ok ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                        {test.detail}{test.latencyMs ? ` (${test.latencyMs}ms)` : ''}
                                    </span>
                                )}
                            </div>
                        </section>
                    );
                })}

                {saveMessage && (
                    <div className={`flex items-start gap-2 p-3 rounded-xl border ${saveMessage.ok ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        {saveMessage.ok
                            ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                            : <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                        <p className={`text-xs ${saveMessage.ok ? 'text-green-300' : 'text-red-300'}`}>{saveMessage.text}</p>
                    </div>
                )}

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold transition-all hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving…' : 'Save Provider Config'}
                </button>
            </main>
        </div>
    );
}
