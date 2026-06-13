/**
 * ORCHESTRATOR — runs the resume pipeline end to end and applies the gate.
 *
 *   intake (parse JD) → retrieve (portfolio match + links) → fit (score)
 *        → gate (minFitScore) → tailor (3 swappable sections)
 *
 * Every stage degrades gracefully to a deterministic path, so the pipeline
 * works with zero AI keys configured. The request is logged for the admin
 * dashboard — every recruiter interaction is a signal worth keeping.
 */

import fs from 'fs';
import path from 'path';
import { parseIntake, type IntakeInput } from './intake';
import { retrieve } from './retriever';
import { assessFit } from './fit';
import { tailorResume } from './tailor';
import { generateOutreach } from './outreach';
import { getResumePreferences } from '@/lib/resume-preferences';
import { kvConfigAvailable, kvGetJSON, kvSetJSON } from '@/lib/ai-providers';
import type { LLMBase, OutreachKit, ResumePipelineResult, ResumeRequestLog } from './types';

export interface PipelineOptions {
    /**
     * Authenticated owner run: bypasses the fit gate (the owner applies where
     * they choose) and generates the outreach kit (pitch + hiring email).
     */
    ownerMode?: boolean;
}

const REQUESTS_FILE = path.join(process.cwd(), 'data', 'resume-requests.json');

function sanitizeNamePart(s: string): string {
    return s.replace(/[^a-zA-Z0-9 &.\-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40) || 'Unknown';
}

export async function runResumePipeline(
    input: IntakeInput,
    llmBase?: LLMBase | null,
    opts?: PipelineOptions,
): Promise<ResumePipelineResult> {
    const prefs = getResumePreferences();
    const ownerMode = opts?.ownerMode === true;

    // 1) Parse the job (visitor's key when provided, deterministic otherwise)
    const { intake, usedLLM: intakeLLM, llm: intakeLlm } = await parseIntake(input, llmBase);

    // 2) Scan the portfolio (deterministic — always real projects)
    const retrieval = retrieve(intake, prefs);

    // 3) Score the fit
    const { fit, usedLLM: fitLLM, llm: fitLlm } = await assessFit(intake, retrieval, prefs, llmBase);

    // 4) Gate — the owner applies wherever they choose, so owner runs bypass it
    const gated = !ownerMode && fit.score < prefs.minFitScore;

    // 5) Tailor (only when the gate passes)
    let resume;
    let tailorLLM = false;
    let tailorLlm: string | undefined;
    if (!gated) {
        const out = await tailorResume(intake, retrieval, prefs, llmBase);
        resume = out.resume;
        tailorLLM = out.usedLLM;
        tailorLlm = out.llm;
    }

    // 6) Outreach kit (owner-only): pitch message + hiring-team email
    let outreach: OutreachKit | undefined;
    let outreachLLM = false;
    let outreachLlm: string | undefined;
    if (ownerMode) {
        const out = await generateOutreach(intake, retrieval, fit, resume, prefs, llmBase, input.requirements);
        outreach = out.outreach;
        outreachLLM = out.usedLLM;
        outreachLlm = out.llm;
    }

    const fileName = `Srujan - ${sanitizeNamePart(intake.company)} - ${sanitizeNamePart(intake.role)}`;
    const anyLLM = intakeLLM || fitLLM || tailorLLM || outreachLLM;

    return {
        ok: true,
        engine: anyLLM ? 'llm' : 'deterministic',
        // Which provider ACTUALLY generated (tailor is the authoritative stage).
        // This is the ground truth — if a top-priority provider failed and the
        // pipeline fell back, it shows here.
        providerUsed: tailorLlm || outreachLlm || fitLlm || intakeLlm,
        intake,
        retrieval,
        fit,
        gated,
        resume,
        outreach,
        fileName,
    };
}

// =============================================================================
// REQUEST LOG
// =============================================================================

interface RequestsFile {
    requests: ResumeRequestLog[];
}

const REQUESTS_KV_KEY = 'srujan:resume-requests';

// Vercel's filesystem is read-only, so the JSON file write fails there and the
// admin dashboard never sees new requests. When Upstash KV is connected we
// write through to it (durable + shared across instances); the file stays the
// local-dev store. A module snapshot keeps the sync API; hydrateResumeRequests()
// refreshes it from KV at async entry points (generate + admin routes).
let requestsSnapshot: RequestsFile | null = null;

function readRequestsFile(): RequestsFile {
    try {
        return JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf-8')) as RequestsFile;
    } catch {
        return { requests: [] };
    }
}

export function readResumeRequests(): RequestsFile {
    if (!requestsSnapshot) requestsSnapshot = readRequestsFile();
    return requestsSnapshot;
}

/** Refresh the snapshot from the durable store. Call at async entry points. */
export async function hydrateResumeRequests(): Promise<void> {
    if (kvConfigAvailable()) {
        const kv = await kvGetJSON<RequestsFile>(REQUESTS_KV_KEY);
        if (kv) { requestsSnapshot = kv; return; }
    }
    if (!requestsSnapshot) requestsSnapshot = readRequestsFile();
}

function persistResumeRequests(data: RequestsFile): void {
    requestsSnapshot = data;
    if (kvConfigAvailable()) void kvSetJSON(REQUESTS_KV_KEY, data);
    try { fs.writeFileSync(REQUESTS_FILE, JSON.stringify(data, null, 2)); } catch { /* read-only FS */ }
}

export function logResumeRequest(
    result: ResumePipelineResult,
    input: IntakeInput,
    meta: { ip?: string; userAgent?: string },
): void {
    try {
        const data = readResumeRequests();
        data.requests.unshift({
            id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: new Date().toISOString(),
            role: input.role.slice(0, 120),
            company: input.company.slice(0, 120),
            requirements: input.requirements.slice(0, 2000),
            fitScore: result.fit.score,
            verdict: result.fit.verdict,
            gated: result.gated,
            engine: result.engine,
            ip: meta.ip,
            userAgent: meta.userAgent,
        });
        // keep the log bounded
        data.requests = data.requests.slice(0, 500);
        persistResumeRequests(data);
    } catch (e) {
        // Logging must never break the pipeline (read-only FS on Vercel etc.)
        console.warn('Resume request log skipped:', e instanceof Error ? e.message : e);
    }
}

export function deleteResumeRequest(id: string): boolean {
    try {
        const data = readResumeRequests();
        const before = data.requests.length;
        const next: RequestsFile = { requests: data.requests.filter(r => r.id !== id) };
        persistResumeRequests(next);
        return next.requests.length < before;
    } catch {
        return false;
    }
}
