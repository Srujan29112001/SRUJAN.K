/**
 * FIT AGENT — scores how well the owner fits the parsed job, considering:
 *  - skill coverage (from the retriever)
 *  - strength of matched portfolio work
 *  - alignment with what the owner is actually looking for (preferences)
 *  - red flags vs the owner's non-negotiables
 *
 * The SCORE is always computed deterministically (reproducible, gameable by
 * no one); the LLM only writes the human-readable narrative on top. With no
 * API keys the narrative is assembled from the same signals.
 */

import { generateJSON } from '@/lib/ai-providers';
import type { FitResult, FitVerdict, JobIntake, LLMBase, RetrievalResult, ResumePreferences } from './types';

function deterministicScore(
    intake: JobIntake,
    retrieval: RetrievalResult,
    prefs: ResumePreferences,
): { score: number; alignedRole: boolean; alignedDomain: boolean; flaggedNonNegotiables: string[] } {
    // 1) Skill coverage → up to 55 points
    const coveragePts = (retrieval.coveragePct / 100) * 55;

    // 2) Strength of matched work → up to 25 points (avg relevance of top 3)
    const top3 = retrieval.matches.slice(0, 3);
    const avgRelevance = top3.length ? top3.reduce((s, m) => s + m.relevance, 0) / top3.length : 0;
    const projectPts = (avgRelevance / 100) * 25 * Math.min(top3.length / 3, 1);

    // 3) Alignment with targets → up to 20 points
    const roleNorm = intake.role.toLowerCase();
    const domainNorm = intake.domain.toLowerCase();
    const alignedRole = prefs.lookingFor.some(t => {
        const tn = t.toLowerCase();
        return roleNorm.includes(tn.split('(')[0].trim().split('/')[0].trim())
            || tn.includes(roleNorm)
            || tn.split(/[\s/]+/).filter(w => w.length > 3).some(w => roleNorm.includes(w));
    });
    const alignedDomain = prefs.preferences.domains.some(d => {
        const dn = d.toLowerCase();
        return domainNorm.includes(dn.split('/')[0].trim()) || dn.includes(domainNorm)
            || dn.split(/[\s/&]+/).filter(w => w.length > 3).some(w => domainNorm.includes(w));
    });
    const alignPts = (alignedRole ? 12 : 0) + (alignedDomain ? 8 : 0);

    // 4) Penalties: red flags that collide with non-negotiables
    const flaggedNonNegotiables: string[] = [];
    for (const flag of intake.redFlags) {
        const f = flag.toLowerCase();
        if (/bond|deposit|fee/.test(f) && prefs.nonNegotiables.some(n => /bond|deposit/.test(n.toLowerCase()))) {
            flaggedNonNegotiables.push(flag);
        }
    }
    const penalty = flaggedNonNegotiables.length * 15;

    // 5) Seniority mismatch: senior (7+ yrs) roles are a stretch
    const seniorityPenalty = intake.seniority === 'senior' ? 8 : 0;

    const score = Math.max(3, Math.min(100, Math.round(coveragePts + projectPts + alignPts - penalty - seniorityPenalty)));
    return { score, alignedRole, alignedDomain, flaggedNonNegotiables };
}

function verdictFor(score: number): FitVerdict {
    if (score >= 70) return 'strong';
    if (score >= 45) return 'partial';
    return 'weak';
}

export async function assessFit(
    intake: JobIntake,
    retrieval: RetrievalResult,
    prefs: ResumePreferences,
    llmBase?: LLMBase | null,
): Promise<{ fit: FitResult; usedLLM: boolean; llm?: string }> {
    const { score, alignedRole, alignedDomain, flaggedNonNegotiables } = deterministicScore(intake, retrieval, prefs);
    const verdict = verdictFor(score);

    // Deterministic narrative (always available as fallback)
    const baseReasons: string[] = [];
    if (retrieval.coveragePct >= 60) baseReasons.push(`${retrieval.coveragePct}% of the listed skills are covered by shipped portfolio work.`);
    else if (retrieval.coveragePct > 0) baseReasons.push(`${retrieval.coveragePct}% skill coverage against the listed requirements.`);
    if (retrieval.matches.length > 0) baseReasons.push(`${retrieval.matches.length} relevant project(s) found — strongest: "${retrieval.matches[0].title}".`);
    if (alignedRole) baseReasons.push('This role type is on the active target list.');
    if (alignedDomain) baseReasons.push(`The domain (${intake.domain}) matches preferred working domains.`);

    const baseConcerns: string[] = [];
    if (retrieval.missingSkills.length > 0) baseConcerns.push(`Not evidenced in the portfolio: ${retrieval.missingSkills.slice(0, 6).join(', ')}.`);
    if (intake.seniority === 'senior') baseConcerns.push('Role appears senior (7+ years) — experience depth may not match.');
    for (const f of flaggedNonNegotiables) baseConcerns.push(`Non-negotiable conflict: ${f}.`);
    for (const f of intake.redFlags.filter(x => !flaggedNonNegotiables.includes(x))) baseConcerns.push(`Heads-up: ${f}.`);

    const baseAlignment: string[] = [
        prefs.currentStatus ? `Current status: ${prefs.currentStatus}` : '',
        alignedRole ? `"${intake.role}" aligns with targets: ${prefs.lookingFor.slice(0, 3).join(', ')}.`
            : `"${intake.role}" is outside the usual target list (${prefs.lookingFor.slice(0, 3).join(', ')}…).`,
    ].filter(Boolean);

    const deterministic: FitResult = {
        score,
        verdict,
        reasons: baseReasons.slice(0, 5),
        concerns: baseConcerns.slice(0, 5),
        alignmentNotes: baseAlignment.slice(0, 3),
    };

    if (!llmBase) return { fit: deterministic, usedLLM: false };

    // LLM narrative pass — score and verdict stay deterministic
    try {
        const { data, provider, model } = await generateJSON<{ reasons?: string[]; concerns?: string[]; alignmentNotes?: string[] }>({
            ...llmBase,
            system: 'You write honest, concise fit assessments for a candidate. Ground every statement in the provided data only. Never inflate; never invent skills or experience.',
            prompt: `A recruiter is evaluating Srujan (AI/ML engineer) for this role. The fit score was computed as ${score}/100 ("${verdict}").

JOB: ${intake.role} at ${intake.company} (${intake.domain}, seniority: ${intake.seniority})
REQUIRED SKILLS: ${intake.requiredSkills.join(', ') || 'not specified'}
SKILLS COVERED BY PORTFOLIO: ${retrieval.matchedSkills.join(', ') || 'none'}
SKILLS NOT EVIDENCED: ${retrieval.missingSkills.join(', ') || 'none'}
TOP MATCHED PROJECTS: ${retrieval.matches.slice(0, 4).map(m => `${m.title} (${m.relevance}% relevant — ${m.why})`).join(' | ') || 'none'}
CANDIDATE'S CURRENT STATUS: ${prefs.currentStatus}
CANDIDATE TARGETS: ${prefs.lookingFor.join(', ')}
RED FLAGS IN JD: ${intake.redFlags.join('; ') || 'none'}

Return JSON:
{
  "reasons": ["3-5 specific reasons supporting the fit, grounded in the data above"],
  "concerns": ["1-4 honest gaps or concerns — include missing skills and red flags"],
  "alignmentNotes": ["1-3 notes on whether this matches what the candidate is currently looking for"]
}`,
            temperature: 0.3,
            maxTokens: 2000,
        });

        return {
            fit: {
                score,
                verdict,
                reasons: (Array.isArray(data.reasons) && data.reasons.length ? data.reasons : deterministic.reasons).slice(0, 5).map(String),
                concerns: (Array.isArray(data.concerns) ? data.concerns : deterministic.concerns).slice(0, 5).map(String),
                alignmentNotes: (Array.isArray(data.alignmentNotes) && data.alignmentNotes.length
                    ? data.alignmentNotes : deterministic.alignmentNotes).slice(0, 3).map(String),
            },
            usedLLM: true,
            llm: `${provider}:${model}`,
        };
    } catch (e) {
        console.warn('Fit LLM failed, using deterministic narrative:', e instanceof Error ? e.message : e);
        return { fit: deterministic, usedLLM: false };
    }
}
