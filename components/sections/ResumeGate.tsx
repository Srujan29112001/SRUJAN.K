'use client';

/**
 * RESUME GATE — "Get my resume, tailored to your role."
 *
 * Recruiters/clients answer three questions (role, company, requirements).
 * The agent pipeline scans the entire portfolio, scores the fit honestly,
 * and — if the gate passes — assembles a one-page ATS resume tailored to
 * that exact job, named "Srujan - Company - Role".
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ResumePipelineResult } from '@/lib/resume-agents/types';
import { getByokConfig, BYOK_PROVIDERS, type ByokConfig } from '@/components/ui/TerminalChat';

const STAGES = [
    'Parsing the job description…',
    'Scanning 60+ portfolio projects…',
    'Scoring fit & alignment…',
    'Tailoring the resume…',
];

interface ApiResponse {
    result?: ResumePipelineResult;
    html?: string;
    error?: string;
}

export function ResumeGate() {
    const [role, setRole] = useState('');
    const [company, setCompany] = useState('');
    const [requirements, setRequirements] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [stageIndex, setStageIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ResumePipelineResult | null>(null);
    const [resumeHtml, setResumeHtml] = useState<string | null>(null);
    const [byok, setByok] = useState<ByokConfig | null>(null);
    const blobUrlRef = useRef<string | null>(null);
    // Owner mode (password-gated): bypasses the fit gate + generates outreach kit
    const [ownerAuthed, setOwnerAuthed] = useState(false);
    const [ownerMode, setOwnerMode] = useState(false);
    const [ownerPanelOpen, setOwnerPanelOpen] = useState(false);
    const [ownerPassword, setOwnerPassword] = useState('');
    const [ownerAuthError, setOwnerAuthError] = useState<string | null>(null);
    const [ownerAuthBusy, setOwnerAuthBusy] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    // The resume engine runs on the SAME key the visitor set in the chat's 🔑
    // panel. Re-read it whenever this tab regains focus so changes apply.
    useEffect(() => {
        const refresh = () => setByok(getByokConfig());
        refresh();
        window.addEventListener('focus', refresh);
        document.addEventListener('visibilitychange', refresh);
        return () => {
            window.removeEventListener('focus', refresh);
            document.removeEventListener('visibilitychange', refresh);
        };
    }, []);

    // Already logged in as admin? Owner mode unlocks without re-entering the password.
    useEffect(() => {
        fetch('/api/admin/auth')
            .then(res => { if (res.ok) setOwnerAuthed(true); })
            .catch(() => { /* stays locked */ });
    }, []);

    const handleOwnerUnlock = useCallback(async () => {
        if (!ownerPassword.trim() || ownerAuthBusy) return;
        setOwnerAuthBusy(true);
        setOwnerAuthError(null);
        try {
            const res = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: ownerPassword }),
            });
            if (res.ok) {
                setOwnerAuthed(true);
                setOwnerMode(true);
                setOwnerPassword('');
            } else {
                setOwnerAuthError('Wrong password.');
            }
        } catch {
            setOwnerAuthError('Could not reach the server.');
        } finally {
            setOwnerAuthBusy(false);
        }
    }, [ownerPassword, ownerAuthBusy]);

    const handleCopy = useCallback(async (label: string, text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(label);
            setTimeout(() => setCopied(null), 1500);
        } catch { /* clipboard blocked */ }
    }, []);

    // Cycle the stage label while the pipeline runs
    useEffect(() => {
        if (!isRunning) return;
        setStageIndex(0);
        const t = setInterval(() => {
            setStageIndex(prev => Math.min(prev + 1, STAGES.length - 1));
        }, 2200);
        return () => clearInterval(t);
    }, [isRunning]);

    // Clean up blob URLs
    useEffect(() => () => {
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (isRunning) return;
        setError(null);
        setResult(null);
        setResumeHtml(null);
        setIsRunning(true);

        try {
            // Send the visitor's key (read fresh — they may have just set it in the chat panel)
            const liveByok = getByokConfig();
            setByok(liveByok);
            const res = await fetch('/api/resume/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role, company, requirements,
                    ...(liveByok ? { byok: liveByok } : {}),
                    ...(ownerMode && ownerAuthed ? { ownerMode: true } : {}),
                }),
            });
            const data: ApiResponse = await res.json();
            if (!res.ok || !data.result) {
                setError(data.error || 'Something went wrong — try again in a moment.');
                return;
            }
            setResult(data.result);
            setResumeHtml(data.html || null);
        } catch {
            setError('Could not reach the resume engine. Try again in a moment.');
        } finally {
            setIsRunning(false);
        }
    }, [role, company, requirements, isRunning, ownerMode, ownerAuthed]);

    const handleDownload = useCallback(() => {
        if (!resumeHtml) return;
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        const blob = new Blob([resumeHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        window.open(url, '_blank');
    }, [resumeHtml]);

    const handleReset = useCallback(() => {
        setResult(null);
        setResumeHtml(null);
        setError(null);
    }, []);

    const scoreColor = (s: number) => (s >= 70 ? '#34D399' : s >= 45 ? '#FBBF24' : '#F87171');

    return (
        <section id="resume" className="relative py-20 px-4 overflow-hidden bg-black">
            {/* Grid pattern background (matches AI Chat section) */}
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

            {/* Section header — canonical portfolio pattern */}
            <div className="max-w-6xl mx-auto mb-12 sm:mb-16 md:mb-20 text-center relative z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[300px] sm:h-[400px] bg-blue-600/20 blur-[120px] rounded-full -z-20 pointer-events-none mix-blend-screen" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="inline-block bg-black/50 px-4 sm:px-6 py-2 border border-cyan-500/30 rounded-full backdrop-blur-md"
                >
                    <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-cyan-400">
                        AI Resume Engine
                    </span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="mt-4 sm:mt-5 md:mt-6 font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight px-2"
                >
                    HIRING? GET MY RESUME
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mx-auto mt-3 sm:mt-4 max-w-xl text-sm sm:text-base md:text-lg text-text-secondary px-4"
                >
                    Tell my agents about your role. They&apos;ll scan everything I&apos;ve built, score the
                    fit honestly, and assemble a one-page resume tailored to your exact requirements.
                </motion.p>

                {/* Engine transparency badge — driven by the visitor's own 🔑 key */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10"
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${byok ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    <span className="font-mono text-[10px] text-text-muted tracking-wider">
                        {byok ? (
                            <>ENGINE: <span className="text-emerald-400">your {BYOK_PROVIDERS.find(p => p.id === byok.provider)?.label || byok.provider} key</span>{byok.model ? <span className="text-text-secondary"> · {byok.model}</span> : ''} — AI tailoring on</>
                        ) : (
                            <>ENGINE: deterministic matching — add your API key in the <a href="#chat" className="text-cyan-400 hover:underline">AI Chat 🔑 panel</a> for AI-tailored output</>
                        )}
                    </span>
                </motion.div>
            </div>

            <div className="max-w-3xl mx-auto relative z-10">
                <AnimatePresence mode="wait">
                    {!result ? (
                        /* ============ FORM ============ */
                        <motion.form
                            key="form"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            onSubmit={handleSubmit}
                            className="bg-bg-base/80 backdrop-blur-sm border border-cyan-900/30 rounded-2xl p-6 sm:p-8 space-y-5"
                        >
                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="rg-role" className="mb-2 block font-mono text-[10px] sm:text-xs uppercase tracking-wider text-text-muted">
                                        Job Role *
                                    </label>
                                    <input
                                        id="rg-role"
                                        type="text"
                                        value={role}
                                        onChange={e => setRole(e.target.value)}
                                        required
                                        minLength={3}
                                        maxLength={120}
                                        placeholder="e.g. Computer Vision Engineer"
                                        className="w-full rounded-lg border border-white/10 bg-bg-surface px-4 py-3 text-sm text-white placeholder-text-muted transition-all duration-300 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="rg-company" className="mb-2 block font-mono text-[10px] sm:text-xs uppercase tracking-wider text-text-muted">
                                        Company *
                                    </label>
                                    <input
                                        id="rg-company"
                                        type="text"
                                        value={company}
                                        onChange={e => setCompany(e.target.value)}
                                        required
                                        minLength={2}
                                        maxLength={120}
                                        placeholder="e.g. Bosch"
                                        className="w-full rounded-lg border border-white/10 bg-bg-surface px-4 py-3 text-sm text-white placeholder-text-muted transition-all duration-300 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="rg-req" className="mb-2 block font-mono text-[10px] sm:text-xs uppercase tracking-wider text-text-muted">
                                    Job Description / Key Requirements *
                                </label>
                                <textarea
                                    id="rg-req"
                                    value={requirements}
                                    onChange={e => setRequirements(e.target.value)}
                                    required
                                    minLength={30}
                                    maxLength={12000}
                                    rows={6}
                                    placeholder="Paste the job description, or list the key skills and responsibilities you're hiring for…"
                                    className="w-full resize-none rounded-lg border border-white/10 bg-bg-surface px-4 py-3 text-sm text-white placeholder-text-muted transition-all duration-300 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                />
                                <p className="mt-1.5 font-mono text-[10px] text-text-muted/60">
                                    {requirements.length}/12000 — the more detail, the sharper the tailoring
                                </p>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-300">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isRunning}
                                className="w-full py-3.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm sm:text-base transition-all hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-60 active:scale-[0.99]"
                            >
                                {isRunning ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        <span className="font-mono text-xs sm:text-sm">{STAGES[stageIndex]}</span>
                                    </span>
                                ) : (
                                    'Run Fit Check → Get Tailored Resume'
                                )}
                            </button>

                            <p className="text-center font-mono text-[10px] text-text-muted/50">
                                Fit is scored against real shipped work — the answer is honest, even when it&apos;s &quot;not a match&quot;.
                            </p>

                            {/* Owner mode (password-gated): pitch + hiring email generation */}
                            <div className="pt-2 border-t border-white/5">
                                {!ownerPanelOpen && !ownerMode ? (
                                    <button
                                        type="button"
                                        onClick={() => setOwnerPanelOpen(true)}
                                        className="mx-auto flex items-center gap-1.5 font-mono text-[10px] text-text-muted/40 hover:text-text-muted transition-colors"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                        owner
                                    </button>
                                ) : !ownerAuthed ? (
                                    <div className="max-w-sm mx-auto space-y-2">
                                        <p className="text-center font-mono text-[10px] text-amber-400/80">Owner mode — enter the admin password</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="password"
                                                value={ownerPassword}
                                                onChange={e => setOwnerPassword(e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleOwnerUnlock(); } }}
                                                placeholder="Admin password"
                                                className="flex-1 rounded-lg border border-amber-500/30 bg-bg-surface px-3 py-2 text-xs text-white placeholder-text-muted focus:border-amber-400 focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleOwnerUnlock}
                                                disabled={ownerAuthBusy || !ownerPassword.trim()}
                                                className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono text-xs hover:bg-amber-500/30 disabled:opacity-40"
                                            >
                                                {ownerAuthBusy ? '…' : 'Unlock'}
                                            </button>
                                        </div>
                                        {ownerAuthError && <p className="text-center text-[10px] text-red-400">{ownerAuthError}</p>}
                                    </div>
                                ) : (
                                    <label className="mx-auto w-fit flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={ownerMode}
                                            onChange={e => setOwnerMode(e.target.checked)}
                                            className="accent-emerald-500"
                                        />
                                        <span className="font-mono text-[10px] text-emerald-400">
                                            Owner mode — bypass gate + generate pitch &amp; hiring email
                                        </span>
                                    </label>
                                )}
                            </div>
                        </motion.form>
                    ) : (
                        /* ============ RESULT ============ */
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-5"
                        >
                            {/* Score card */}
                            <div className="bg-bg-base/80 backdrop-blur-sm border border-cyan-900/30 rounded-2xl p-6 sm:p-8">
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    {/* Score arc */}
                                    <div className="relative w-32 h-32 flex-shrink-0">
                                        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                                            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                                            <circle
                                                cx="60" cy="60" r="52" fill="none"
                                                stroke={scoreColor(result.fit.score)}
                                                strokeWidth="10" strokeLinecap="round"
                                                strokeDasharray={`${(result.fit.score / 100) * 326.7} 326.7`}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="font-display text-3xl font-bold text-white">{result.fit.score}</span>
                                            <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted">Fit Score</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 text-center sm:text-left">
                                        <div className="inline-block px-3 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider mb-2"
                                            style={{ color: scoreColor(result.fit.score), backgroundColor: `${scoreColor(result.fit.score)}1a`, border: `1px solid ${scoreColor(result.fit.score)}40` }}>
                                            {result.fit.verdict === 'strong' ? '✦ Strong Fit' : result.fit.verdict === 'partial' ? '◈ Partial Fit' : '○ Weak Fit'}
                                        </div>
                                        <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                                            {result.intake.role} <span className="text-text-muted font-normal">at</span> {result.intake.company}
                                        </h3>
                                        <p className="mt-1 text-xs text-text-muted font-mono">
                                            {result.retrieval.coveragePct}% skill coverage · {result.retrieval.matches.length} relevant projects · engine: {result.providerUsed || result.engine}
                                        </p>
                                    </div>
                                </div>

                                {/* Reasons / concerns */}
                                <div className="mt-6 grid sm:grid-cols-2 gap-4 text-left">
                                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                                        <h4 className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 mb-2">Why it works</h4>
                                        <ul className="space-y-1.5">
                                            {result.fit.reasons.map((r, i) => (
                                                <li key={i} className="text-xs text-text-secondary leading-relaxed">• {r}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                                        <h4 className="font-mono text-[10px] uppercase tracking-wider text-amber-400 mb-2">Honest gaps</h4>
                                        <ul className="space-y-1.5">
                                            {(result.fit.concerns.length ? result.fit.concerns : ['No significant gaps found.']).map((c, i) => (
                                                <li key={i} className="text-xs text-text-secondary leading-relaxed">• {c}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Matched projects */}
                                {result.retrieval.matches.length > 0 && (
                                    <div className="mt-4 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/15 text-left">
                                        <h4 className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 mb-2">
                                            Relevant work found in the portfolio
                                        </h4>
                                        <div className="space-y-2">
                                            {result.retrieval.matches.slice(0, 5).map(m => (
                                                <div key={m.id} className="flex flex-wrap items-center gap-2 text-xs">
                                                    <span className="text-white font-medium">{m.title}</span>
                                                    <span className="font-mono text-[10px] text-text-muted">({m.relevance}%)</span>
                                                    {m.links.map(l => (
                                                        <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                                                            className="font-mono text-[10px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                                                            {l.label} ↗
                                                        </a>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Download or gated message */}
                            {!result.gated && resumeHtml ? (
                                <div className="bg-bg-base/80 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6 text-center">
                                    <h3 className="font-display text-lg font-bold text-white mb-1">
                                        Your tailored resume is ready
                                    </h3>
                                    <p className="text-xs text-text-muted mb-4 font-mono">{result.fileName}.pdf</p>
                                    <button
                                        onClick={handleDownload}
                                        className="px-8 py-3.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-sm transition-all hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]"
                                    >
                                        Open Tailored Resume ↗
                                    </button>
                                    <p className="mt-3 text-[11px] text-text-muted">
                                        Opens print-ready — choose <span className="text-text-secondary font-medium">&quot;Save as PDF&quot;</span> in the dialog. Summary, skills and key projects are tailored to your JD; experience and education are standard.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-bg-base/80 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-6 text-center">
                                    <h3 className="font-display text-lg font-bold text-white mb-2">
                                        Honestly? Not the right match.
                                    </h3>
                                    <p className="text-sm text-text-secondary max-w-md mx-auto">
                                        The fit score is below my threshold for this one, so I won&apos;t hand you a stretched resume.
                                        If you think the agents missed something, {' '}
                                        <a href="#chat" className="text-cyan-400 hover:underline">ask my AI twin</a> or {' '}
                                        <a href="#contact" className="text-cyan-400 hover:underline">reach out directly</a> — the real me might disagree with them.
                                    </p>
                                </div>
                            )}

                            {/* Owner-only outreach kit */}
                            {result.outreach && (
                                <div className="bg-bg-base/80 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-6 space-y-5">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-display text-lg font-bold text-white">Outreach kit</h3>
                                        <span className="px-2 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                            owner only
                                        </span>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                                                Short pitch · {result.outreach.shortMessage.length}/400 chars
                                            </h4>
                                            <button
                                                onClick={() => handleCopy('pitch', result.outreach!.shortMessage)}
                                                className="px-2.5 py-1 rounded font-mono text-[10px] border border-white/15 text-text-muted hover:text-white hover:border-white/30 transition-colors"
                                            >
                                                {copied === 'pitch' ? '✓ copied' : 'copy'}
                                            </button>
                                        </div>
                                        <p className="p-3 rounded-lg bg-bg-surface border border-white/10 text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                                            {result.outreach.shortMessage}
                                        </p>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                                                Email for the hiring team
                                            </h4>
                                            <button
                                                onClick={() => handleCopy('email', `Subject: ${result.outreach!.subject}\n\n${result.outreach!.emailBody}`)}
                                                className="px-2.5 py-1 rounded font-mono text-[10px] border border-white/15 text-text-muted hover:text-white hover:border-white/30 transition-colors"
                                            >
                                                {copied === 'email' ? '✓ copied' : 'copy'}
                                            </button>
                                        </div>
                                        <p className="p-3 rounded-lg bg-bg-surface border border-white/10 text-xs text-cyan-300/90 font-medium mb-2">
                                            Subject: {result.outreach.subject}
                                        </p>
                                        <p className="p-3 rounded-lg bg-bg-surface border border-white/10 text-xs text-text-secondary leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
                                            {result.outreach.emailBody}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleReset}
                                className="w-full py-3 rounded-lg border border-white/10 text-text-muted hover:text-white hover:border-white/25 font-mono text-xs uppercase tracking-wider transition-all"
                            >
                                ← Check another role
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}

export default ResumeGate;
