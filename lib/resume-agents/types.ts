/**
 * Shared types for the resume agent pipeline (Resume Gate feature).
 *
 * Flow: visitor supplies role/company/requirements → intake parses the JD →
 * retriever matches portfolio work and collects links → fit scores coverage +
 * alignment with the owner's preferences → gate → tailor assembles the three
 * swappable sections → template renders a print-ready A4 page.
 *
 * KEY POLICY: the LLM stages run on the VISITOR's own API key (the same 🔑
 * config as the AI chat). Without a key, every stage uses its deterministic
 * path — the pipeline always works.
 */

import type { ProviderId } from '@/lib/ai-providers';

/** The visitor's BYOK credentials, threaded through every LLM stage. */
export interface LLMBase {
    provider: ProviderId;
    overrideKey: string;
    overrideModel?: string;
}

// =============================================================================
// OWNER PREFERENCES (admin-editable; staples never tailored by the LLM)
// =============================================================================

export interface ResumeLink {
    label: string;
    url: string;
}

export interface ResumeHeader {
    name: string;
    email: string;
    phone: string;
    location: string;
    links: ResumeLink[];
}

export interface ExperienceEntry {
    title: string;
    org: string;
    location?: string;
    dates: string;
    bullets: string[];
}

export interface EducationEntry {
    title: string;
    org: string;
    location?: string;
    dates: string;
    note?: string;
}

export interface TailoringRules {
    summaryMaxWords: number;
    projectCount: number;
    bulletsPerProject: number;
    maxSkillRows: number;
}

export interface ResumePreferences {
    header: ResumeHeader;
    /** Stable sections — rendered verbatim, never touched by the tailor agent */
    experience: ExperienceEntry[];
    education: EducationEntry[];
    /** What the owner is doing right now (the fit agent reads this) */
    currentStatus: string;
    /** Target roles/areas the owner actually wants */
    lookingFor: string[];
    preferences: {
        workModes: string[];
        locations: string;
        domains: string[];
        notes?: string;
    };
    /** Hard constraints — violations push fit down and surface as concerns */
    nonNegotiables: string[];
    /** Project ids never to use in the Key Projects section */
    excludedProjectIds: string[];
    /** Fit score below this → no tailored resume, honest message instead */
    minFitScore: number;
    tailoringRules: TailoringRules;
}

// =============================================================================
// PIPELINE STAGES
// =============================================================================

export interface JobIntake {
    role: string;
    company: string;
    seniority: string;
    domain: string;
    requiredSkills: string[];
    responsibilities: string[];
    keywords: string[];
    workMode?: string;
    location?: string;
    /** Things the owner should know before engaging (bonds, odd shifts, etc.) */
    redFlags: string[];
}

export interface MatchedProject {
    id: string;
    title: string;
    category: string;
    description: string;
    tech: string[];
    links: ResumeLink[];
    metrics?: string;
    /** 0–100 relevance to this JD */
    relevance: number;
    why: string;
}

export interface RetrievalResult {
    matches: MatchedProject[];
    matchedSkills: string[];
    missingSkills: string[];
    /** % of required skills covered by the portfolio */
    coveragePct: number;
}

export type FitVerdict = 'strong' | 'partial' | 'weak';

export interface FitResult {
    score: number; // 0–100
    verdict: FitVerdict;
    reasons: string[];
    concerns: string[];
    alignmentNotes: string[];
}

export interface SkillItem {
    name: string;
    key?: boolean;
}

export interface SkillRow {
    category: string;
    items: SkillItem[];
}

export interface TailoredProject {
    title: string;
    links: ResumeLink[];
    bullets: string[];
}

export interface TailoredResume {
    /** header subtitle, e.g. "AI/ML Engineer / Computer Vision & Edge AI" */
    roleLine: string;
    summary: string;
    skills: SkillRow[];
    projects: TailoredProject[];
}

export interface ResumePipelineResult {
    ok: boolean;
    engine: 'llm' | 'deterministic';
    providerUsed?: string;
    intake: JobIntake;
    retrieval: RetrievalResult;
    fit: FitResult;
    /** true → fit below threshold; no tailored resume produced */
    gated: boolean;
    resume?: TailoredResume;
    /** "Srujan - {Company} - {Role}" */
    fileName: string;
}

// =============================================================================
// REQUEST LOG (admin views these — every recruiter interaction is a signal)
// =============================================================================

export interface ResumeRequestLog {
    id: string;
    timestamp: string;
    role: string;
    company: string;
    requirements: string;
    fitScore: number;
    verdict: FitVerdict;
    gated: boolean;
    engine: string;
    ip?: string;
    userAgent?: string;
}
