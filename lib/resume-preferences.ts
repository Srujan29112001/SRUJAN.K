/**
 * Loader/saver for the owner's resume preferences (data/resume-preferences.json).
 *
 * The committed JSON is the source of truth that ships with every deploy.
 * Admin edits rewrite the file — durable locally; on Vercel serverless the
 * write is ephemeral (lasts until the next cold start), so prod-default edits
 * should be made locally and committed.
 */

import fs from 'fs';
import path from 'path';
import type { ResumePreferences } from './resume-agents/types';

const PREFS_FILE = path.join(process.cwd(), 'data', 'resume-preferences.json');

const FALLBACK: ResumePreferences = {
    header: {
        name: 'SRUJAN',
        email: 'srujan.hardik@gmail.com',
        phone: '',
        location: 'Hyderabad, India',
        links: [],
    },
    experience: [],
    education: [],
    currentStatus: '',
    lookingFor: [],
    preferences: { workModes: [], locations: '', domains: [] },
    nonNegotiables: [],
    excludedProjectIds: [],
    minFitScore: 45,
    tailoringRules: { summaryMaxWords: 65, projectCount: 3, bulletsPerProject: 2, maxSkillRows: 4 },
};

export function getResumePreferences(): ResumePreferences {
    try {
        const raw = JSON.parse(fs.readFileSync(PREFS_FILE, 'utf-8')) as Partial<ResumePreferences>;
        // Shallow-merge over fallback so a partially-edited file never crashes the pipeline
        return {
            ...FALLBACK,
            ...raw,
            preferences: { ...FALLBACK.preferences, ...(raw.preferences || {}) },
            tailoringRules: { ...FALLBACK.tailoringRules, ...(raw.tailoringRules || {}) },
        };
    } catch {
        return FALLBACK;
    }
}

export function saveResumePreferences(prefs: ResumePreferences): void {
    fs.writeFileSync(PREFS_FILE, JSON.stringify(prefs, null, 2));
}
