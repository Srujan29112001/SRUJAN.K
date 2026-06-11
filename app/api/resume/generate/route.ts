/**
 * PUBLIC RESUME GATE API
 *
 * POST { role, company, requirements } →
 *   { result: ResumePipelineResult, html?: string }
 *
 * html is the print-ready tailored resume (only when the fit gate passes).
 * Rate-limited per IP; every request is logged for the admin dashboard.
 */

import { NextRequest, NextResponse } from 'next/server';
import { runResumePipeline, logResumeRequest } from '@/lib/resume-agents/orchestrator';
import { getResumePreferences } from '@/lib/resume-preferences';
import { renderResumeHTML } from '@/lib/resume-template';
import { hasAnyProvider, getProviderOrder, getProviderConfig, PROVIDER_LABELS } from '@/lib/ai-providers';

// Simple in-memory rate limiter: max 4 generations per IP per 5 minutes
const RATE_WINDOW_MS = 5 * 60 * 1000;
const RATE_MAX = 4;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
    const now = Date.now();
    const list = (hits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
    if (list.length >= RATE_MAX) { hits.set(ip, list); return true; }
    list.push(now);
    hits.set(ip, list);
    return false;
}

interface GenerateBody {
    role?: string;
    company?: string;
    requirements?: string;
}

export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    if (rateLimited(ip)) {
        return NextResponse.json(
            { error: 'Too many requests — please wait a few minutes and try again.' },
            { status: 429 },
        );
    }

    let body: GenerateBody;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const role = (body.role || '').trim();
    const company = (body.company || '').trim();
    const requirements = (body.requirements || '').trim();

    if (role.length < 3 || role.length > 120) {
        return NextResponse.json({ error: 'Job role must be 3–120 characters.' }, { status: 400 });
    }
    if (company.length < 2 || company.length > 120) {
        return NextResponse.json({ error: 'Company must be 2–120 characters.' }, { status: 400 });
    }
    if (requirements.length < 30 || requirements.length > 12000) {
        return NextResponse.json(
            { error: 'Please paste the job description or key requirements (at least 30 characters).' },
            { status: 400 },
        );
    }

    try {
        const result = await runResumePipeline({ role, company, requirements });

        // log for the admin dashboard (never throws)
        logResumeRequest(result, { role, company, requirements }, { ip, userAgent });

        let html: string | undefined;
        if (!result.gated && result.resume) {
            const prefs = getResumePreferences();
            html = renderResumeHTML(prefs, result.resume, {
                fileName: result.fileName,
                autoPrint: true,
            });
        }

        return NextResponse.json({ result, html });
    } catch (e) {
        console.error('Resume pipeline error:', e);
        return NextResponse.json(
            { error: 'Resume engine hit an error — please try again in a moment.' },
            { status: 500 },
        );
    }
}

// Lightweight status for the section UI — public transparency about which
// engine powers the resume tailoring (the OWNER's keys, never the visitor's).
export async function GET() {
    const ready = getProviderOrder()
        .map(id => ({ id, cfg: getProviderConfig(id) }))
        .filter(p => p.cfg.enabled && p.cfg.keys.length > 0);
    const current = ready[0]
        ? { provider: ready[0].id, label: PROVIDER_LABELS[ready[0].id], model: ready[0].cfg.model }
        : null;
    return NextResponse.json({
        status: 'ok',
        aiTailoring: hasAnyProvider(),
        activeProviders: ready.map(p => p.id),
        current,
        fallbacks: ready.slice(1).map(p => PROVIDER_LABELS[p.id]),
    });
}
