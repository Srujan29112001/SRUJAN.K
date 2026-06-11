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
import { getResumePreferences } from '@/lib/resume-preferences';
import type { ResumePipelineResult, ResumeRequestLog } from './types';

const REQUESTS_FILE = path.join(process.cwd(), 'data', 'resume-requests.json');

function sanitizeNamePart(s: string): string {
    return s.replace(/[^a-zA-Z0-9 &.\-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40) || 'Unknown';
}

export async function runResumePipeline(input: IntakeInput): Promise<ResumePipelineResult> {
    const prefs = getResumePreferences();

    // 1) Parse the job
    const { intake, usedLLM: intakeLLM, llm: intakeLlm } = await parseIntake(input);

    // 2) Scan the portfolio (deterministic — always real projects)
    const retrieval = retrieve(intake, prefs);

    // 3) Score the fit
    const { fit, usedLLM: fitLLM, llm: fitLlm } = await assessFit(intake, retrieval, prefs);

    // 4) Gate
    const gated = fit.score < prefs.minFitScore;

    // 5) Tailor (only when the gate passes)
    let resume;
    let tailorLLM = false;
    let tailorLlm: string | undefined;
    if (!gated) {
        const out = await tailorResume(intake, retrieval, prefs);
        resume = out.resume;
        tailorLLM = out.usedLLM;
        tailorLlm = out.llm;
    }

    const fileName = `Srujan - ${sanitizeNamePart(intake.company)} - ${sanitizeNamePart(intake.role)}`;
    const anyLLM = intakeLLM || fitLLM || tailorLLM;

    return {
        ok: true,
        engine: anyLLM ? 'llm' : 'deterministic',
        // Which provider ACTUALLY generated (tailor is the authoritative stage).
        // This is the ground truth — if a top-priority provider failed and the
        // pipeline fell back, it shows here.
        providerUsed: tailorLlm || fitLlm || intakeLlm,
        intake,
        retrieval,
        fit,
        gated,
        resume,
        fileName,
    };
}

// =============================================================================
// REQUEST LOG
// =============================================================================

interface RequestsFile {
    requests: ResumeRequestLog[];
}

export function readResumeRequests(): RequestsFile {
    try {
        return JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf-8')) as RequestsFile;
    } catch {
        return { requests: [] };
    }
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
        fs.writeFileSync(REQUESTS_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        // Logging must never break the pipeline (read-only FS on Vercel etc.)
        console.warn('Resume request log skipped:', e instanceof Error ? e.message : e);
    }
}

export function deleteResumeRequest(id: string): boolean {
    try {
        const data = readResumeRequests();
        const before = data.requests.length;
        data.requests = data.requests.filter(r => r.id !== id);
        fs.writeFileSync(REQUESTS_FILE, JSON.stringify(data, null, 2));
        return data.requests.length < before;
    } catch {
        return false;
    }
}
