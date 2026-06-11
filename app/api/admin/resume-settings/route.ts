import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getResumePreferences, saveResumePreferences } from '@/lib/resume-preferences';
import { projects } from '@/data/projects';
import type { ResumePreferences } from '@/lib/resume-agents/types';

const SESSION_NAME = 'admin_session';
const SESSION_VALUE = 'authenticated';

// Check if admin is authenticated
async function isAuthenticated(): Promise<boolean> {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get(SESSION_NAME);
        return session?.value === SESSION_VALUE;
    } catch {
        return false;
    }
}

// GET - current resume preferences + the project list (for the exclusion picker)
export async function GET() {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prefs = getResumePreferences();
    const projectOptions = projects.map(p => ({ id: p.id, title: p.title, category: p.category }));
    return NextResponse.json({ prefs, projectOptions });
}

// PUT - save resume preferences
export async function PUT(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json() as { prefs?: Partial<ResumePreferences> };
        if (!body.prefs || typeof body.prefs !== 'object') {
            return NextResponse.json({ error: 'prefs object required' }, { status: 400 });
        }

        const current = getResumePreferences();
        const incoming = body.prefs;

        // Merge over current so partial saves never wipe sections
        const next: ResumePreferences = {
            ...current,
            ...incoming,
            header: { ...current.header, ...(incoming.header || {}) },
            preferences: { ...current.preferences, ...(incoming.preferences || {}) },
            tailoringRules: { ...current.tailoringRules, ...(incoming.tailoringRules || {}) },
        };

        // Basic sanity checks
        if (!Array.isArray(next.experience) || !Array.isArray(next.education)) {
            return NextResponse.json({ error: 'experience and education must be arrays' }, { status: 400 });
        }
        next.minFitScore = Math.max(0, Math.min(100, Number(next.minFitScore) || 45));
        next.excludedProjectIds = (next.excludedProjectIds || []).filter(id => typeof id === 'string');

        saveResumePreferences(next);
        return NextResponse.json({ success: true, prefs: next });
    } catch (e) {
        console.error('Failed to save resume preferences:', e);
        return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
    }
}
