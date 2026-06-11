'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, FileText, Save, LogOut, Users, MessageSquare, Settings, Cpu,
    Trash2, ChevronDown, ChevronUp, CheckCircle, AlertCircle,
} from 'lucide-react';
import type { ResumePreferences, ResumeRequestLog } from '@/lib/resume-agents/types';

interface ProjectOption {
    id: string;
    title: string;
    category: string;
}

export default function AdminResumePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [prefs, setPrefs] = useState<ResumePreferences | null>(null);
    const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
    const [requests, setRequests] = useState<ResumeRequestLog[]>([]);
    const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ ok: boolean; text: string } | null>(null);

    // JSON textareas for the structured staples
    const [experienceJson, setExperienceJson] = useState('');
    const [educationJson, setEducationJson] = useState('');
    const [linksJson, setLinksJson] = useState('');
    const [jsonError, setJsonError] = useState<string | null>(null);

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadAll = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/admin/resume-settings');
            if (res.status === 401) {
                router.push('/admin');
                return;
            }
            if (res.ok) {
                const data = await res.json();
                setPrefs(data.prefs);
                setProjectOptions(data.projectOptions || []);
                setExperienceJson(JSON.stringify(data.prefs.experience, null, 2));
                setEducationJson(JSON.stringify(data.prefs.education, null, 2));
                setLinksJson(JSON.stringify(data.prefs.header.links, null, 2));
            }
            const reqRes = await fetch('/api/admin/resume-requests?limit=50');
            if (reqRes.ok) {
                const reqData = await reqRes.json();
                setRequests(reqData.requests || []);
            }
        } catch (error) {
            console.error('Failed to load resume settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/admin/auth', { method: 'DELETE' });
        router.push('/admin');
    };

    const handleSave = useCallback(async () => {
        if (!prefs) return;
        setJsonError(null);

        // Validate the JSON staples before sending
        let experience, education, links;
        try {
            experience = JSON.parse(experienceJson);
            if (!Array.isArray(experience)) throw new Error('Experience must be a JSON array');
        } catch (e) {
            setJsonError(`Experience JSON invalid: ${e instanceof Error ? e.message : 'parse error'}`);
            return;
        }
        try {
            education = JSON.parse(educationJson);
            if (!Array.isArray(education)) throw new Error('Education must be a JSON array');
        } catch (e) {
            setJsonError(`Education JSON invalid: ${e instanceof Error ? e.message : 'parse error'}`);
            return;
        }
        try {
            links = JSON.parse(linksJson);
            if (!Array.isArray(links)) throw new Error('Links must be a JSON array');
        } catch (e) {
            setJsonError(`Links JSON invalid: ${e instanceof Error ? e.message : 'parse error'}`);
            return;
        }

        try {
            setIsSaving(true);
            setSaveMessage(null);
            const res = await fetch('/api/admin/resume-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prefs: {
                        ...prefs,
                        experience,
                        education,
                        header: { ...prefs.header, links },
                    },
                }),
            });
            if (res.status === 401) {
                router.push('/admin');
                return;
            }
            if (res.ok) {
                setSaveMessage({ ok: true, text: 'Preferences saved. On Vercel, commit data/resume-preferences.json for durable changes.' });
            } else {
                const data = await res.json().catch(() => ({}));
                setSaveMessage({ ok: false, text: data.error || 'Save failed' });
            }
        } catch {
            setSaveMessage({ ok: false, text: 'Save failed — network error' });
        } finally {
            setIsSaving(false);
        }
    }, [prefs, experienceJson, educationJson, linksJson, router]);

    const handleDeleteRequest = async (id: string) => {
        if (!confirm('Delete this request log entry?')) return;
        const res = await fetch(`/api/admin/resume-requests?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (res.ok) setRequests(prev => prev.filter(r => r.id !== id));
    };

    const toggleExcluded = (id: string) => {
        if (!prefs) return;
        const set = new Set(prefs.excludedProjectIds);
        if (set.has(id)) set.delete(id);
        else set.add(id);
        setPrefs({ ...prefs, excludedProjectIds: Array.from(set) });
    };

    const listToText = (arr: string[]) => arr.join('\n');
    const textToList = (text: string) => text.split('\n').map(s => s.trim()).filter(Boolean);

    if (isLoading || !prefs) {
        return (
            <div className="min-h-screen bg-bg-base flex items-center justify-center">
                <div className="font-mono text-sm text-text-muted animate-pulse">Loading resume engine…</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-base">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-bg-base/80 border-b border-white/10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/clients" className="flex items-center gap-2 text-text-muted hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-emerald-400" />
                            <h1 className="font-display text-lg font-bold text-white">
                                Resume Engine
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
                        <Link href="/admin/ai-providers" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors">
                            <Cpu className="w-4 h-4" />
                            <span className="text-sm hidden sm:inline">AI Providers</span>
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

            <main className="relative max-w-6xl mx-auto px-6 py-8 space-y-8">
                {/* ===== Status & Targets ===== */}
                <section className="bg-bg-surface border border-white/10 rounded-2xl p-6">
                    <h2 className="font-display text-base font-bold text-white mb-4">My Status & Targets</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-2">Current status (the fit agent reads this)</label>
                            <textarea
                                value={prefs.currentStatus}
                                onChange={e => setPrefs({ ...prefs, currentStatus: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-bg-base text-white focus:border-cyan-500 transition-all"
                            />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-2">Looking for (one role per line)</label>
                                <textarea
                                    value={listToText(prefs.lookingFor)}
                                    onChange={e => setPrefs({ ...prefs, lookingFor: textToList(e.target.value) })}
                                    rows={6}
                                    className="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-bg-base text-white focus:border-cyan-500 transition-all font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-2">Preferred domains (one per line)</label>
                                <textarea
                                    value={listToText(prefs.preferences.domains)}
                                    onChange={e => setPrefs({ ...prefs, preferences: { ...prefs.preferences, domains: textToList(e.target.value) } })}
                                    rows={6}
                                    className="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-bg-base text-white focus:border-cyan-500 transition-all font-mono"
                                />
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-2">Work modes (one per line)</label>
                                <textarea
                                    value={listToText(prefs.preferences.workModes)}
                                    onChange={e => setPrefs({ ...prefs, preferences: { ...prefs.preferences, workModes: textToList(e.target.value) } })}
                                    rows={3}
                                    className="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-bg-base text-white focus:border-cyan-500 transition-all font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-2">Locations</label>
                                <textarea
                                    value={prefs.preferences.locations}
                                    onChange={e => setPrefs({ ...prefs, preferences: { ...prefs.preferences, locations: e.target.value } })}
                                    rows={3}
                                    className="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-bg-base text-white focus:border-cyan-500 transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-2">Non-negotiables (one per line — JD red flags that match these tank the fit score)</label>
                            <textarea
                                value={listToText(prefs.nonNegotiables)}
                                onChange={e => setPrefs({ ...prefs, nonNegotiables: textToList(e.target.value) })}
                                rows={4}
                                className="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-bg-base text-white focus:border-cyan-500 transition-all font-mono"
                            />
                        </div>
                    </div>
                </section>

                {/* ===== Gate & Tailoring ===== */}
                <section className="bg-bg-surface border border-white/10 rounded-2xl p-6">
                    <h2 className="font-display text-base font-bold text-white mb-4">Gate & Tailoring Rules</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-2">Min fit score</label>
                            <input
                                type="number" min={0} max={100}
                                value={prefs.minFitScore}
                                onChange={e => setPrefs({ ...prefs, minFitScore: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-bg-base text-white focus:border-cyan-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-2">Summary max words</label>
                            <input
                                type="number" min={20} max={150}
                                value={prefs.tailoringRules.summaryMaxWords}
                                onChange={e => setPrefs({ ...prefs, tailoringRules: { ...prefs.tailoringRules, summaryMaxWords: parseInt(e.target.value) || 65 } })}
                                className="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-bg-base text-white focus:border-cyan-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-2"># Projects</label>
                            <input
                                type="number" min={1} max={5}
                                value={prefs.tailoringRules.projectCount}
                                onChange={e => setPrefs({ ...prefs, tailoringRules: { ...prefs.tailoringRules, projectCount: parseInt(e.target.value) || 3 } })}
                                className="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-bg-base text-white focus:border-cyan-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-2">Bullets / project</label>
                            <input
                                type="number" min={1} max={4}
                                value={prefs.tailoringRules.bulletsPerProject}
                                onChange={e => setPrefs({ ...prefs, tailoringRules: { ...prefs.tailoringRules, bulletsPerProject: parseInt(e.target.value) || 2 } })}
                                className="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-bg-base text-white focus:border-cyan-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-2">Max skill rows</label>
                            <input
                                type="number" min={2} max={6}
                                value={prefs.tailoringRules.maxSkillRows}
                                onChange={e => setPrefs({ ...prefs, tailoringRules: { ...prefs.tailoringRules, maxSkillRows: parseInt(e.target.value) || 4 } })}
                                className="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-bg-base text-white focus:border-cyan-500 transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-text-muted mb-2">
                            Excluded projects ({prefs.excludedProjectIds.length}) — never used in the Key Projects section
                        </label>
                        <div className="max-h-56 overflow-y-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-1.5 p-3 rounded-xl border border-white/10 bg-bg-base">
                            {projectOptions.map(p => (
                                <label key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={prefs.excludedProjectIds.includes(p.id)}
                                        onChange={() => toggleExcluded(p.id)}
                                        className="accent-cyan-500"
                                    />
                                    <span className="text-xs text-text-secondary truncate" title={p.title}>
                                        {p.title} <span className="text-text-muted">({p.category})</span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ===== Header & Staples ===== */}
                <section className="bg-bg-surface border border-white/10 rounded-2xl p-6">
                    <h2 className="font-display text-base font-bold text-white mb-1">Resume Header & Staples</h2>
                    <p className="text-xs text-text-muted mb-4">Experience and Education render verbatim on every tailored resume — the agents never touch them.</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-2">Name</label>
                            <input
                                value={prefs.header.name}
                                onChange={e => setPrefs({ ...prefs, header: { ...prefs.header, name: e.target.value } })}
                                className="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-bg-base text-white focus:border-cyan-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-2">Email</label>
                            <input
                                value={prefs.header.email}
                                onChange={e => setPrefs({ ...prefs, header: { ...prefs.header, email: e.target.value } })}
                                className="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-bg-base text-white focus:border-cyan-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-2">Phone</label>
                            <input
                                value={prefs.header.phone}
                                onChange={e => setPrefs({ ...prefs, header: { ...prefs.header, phone: e.target.value } })}
                                className="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-bg-base text-white focus:border-cyan-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-2">Location</label>
                            <input
                                value={prefs.header.location}
                                onChange={e => setPrefs({ ...prefs, header: { ...prefs.header, location: e.target.value } })}
                                className="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-bg-base text-white focus:border-cyan-500 transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-2">Header links (JSON: {`[{"label","url"}]`})</label>
                            <textarea
                                value={linksJson}
                                onChange={e => setLinksJson(e.target.value)}
                                rows={5}
                                className="w-full px-4 py-3 text-xs rounded-xl border border-white/10 bg-bg-base text-white focus:border-cyan-500 transition-all font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-2">Experience staples (JSON: {`[{"title","org","location","dates","bullets":[]}]`})</label>
                            <textarea
                                value={experienceJson}
                                onChange={e => setExperienceJson(e.target.value)}
                                rows={12}
                                className="w-full px-4 py-3 text-xs rounded-xl border border-white/10 bg-bg-base text-white focus:border-cyan-500 transition-all font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-text-muted mb-2">Education staples (JSON: {`[{"title","org","location","dates","note"}]`})</label>
                            <textarea
                                value={educationJson}
                                onChange={e => setEducationJson(e.target.value)}
                                rows={8}
                                className="w-full px-4 py-3 text-xs rounded-xl border border-white/10 bg-bg-base text-white focus:border-cyan-500 transition-all font-mono"
                            />
                        </div>
                    </div>
                </section>

                {/* Save */}
                <div className="sticky bottom-4 z-30">
                    {jsonError && (
                        <div className="flex items-start gap-2 p-3 mb-3 rounded-xl bg-red-500/10 border border-red-500/20">
                            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-300">{jsonError}</p>
                        </div>
                    )}
                    {saveMessage && (
                        <div className={`flex items-start gap-2 p-3 mb-3 rounded-xl border ${saveMessage.ok ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                            {saveMessage.ok
                                ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                : <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                            <p className={`text-xs ${saveMessage.ok ? 'text-green-300' : 'text-red-300'}`}>{saveMessage.text}</p>
                        </div>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold transition-all hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Saving…' : 'Save Resume Preferences'}
                    </button>
                </div>

                {/* ===== Requests log ===== */}
                <section className="bg-bg-surface border border-white/10 rounded-2xl p-6">
                    <h2 className="font-display text-base font-bold text-white mb-4">
                        Resume Gate Requests <span className="text-text-muted font-normal text-sm">({requests.length})</span>
                    </h2>
                    {requests.length === 0 ? (
                        <p className="text-sm text-text-muted">No requests logged yet. Every recruiter who runs the fit check shows up here.</p>
                    ) : (
                        <div className="space-y-2">
                            {requests.map(r => (
                                <div key={r.id} className="rounded-xl border border-white/10 bg-bg-base overflow-hidden">
                                    <div className="flex items-center gap-3 px-4 py-3">
                                        <span
                                            className="font-mono text-xs font-bold px-2 py-0.5 rounded"
                                            style={{
                                                color: r.fitScore >= 70 ? '#34D399' : r.fitScore >= 45 ? '#FBBF24' : '#F87171',
                                                backgroundColor: r.fitScore >= 70 ? '#34D39915' : r.fitScore >= 45 ? '#FBBF2415' : '#F8717115',
                                            }}
                                        >
                                            {r.fitScore}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{r.role} <span className="text-text-muted">@ {r.company}</span></p>
                                            <p className="font-mono text-[10px] text-text-muted">
                                                {new Date(r.timestamp).toLocaleString()} · {r.verdict}{r.gated ? ' · gated' : ''} · {r.engine}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setExpandedRequest(expandedRequest === r.id ? null : r.id)}
                                            className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted"
                                        >
                                            {expandedRequest === r.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRequest(r.id)}
                                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {expandedRequest === r.id && (
                                        <div className="px-4 pb-4 border-t border-white/5 pt-3">
                                            <p className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">{r.requirements}</p>
                                            {(r.ip || r.userAgent) && (
                                                <p className="mt-2 font-mono text-[10px] text-text-muted">{r.ip} · {r.userAgent}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
