/**
 * RETRIEVER AGENT — scans the portfolio for work relevant to the job and
 * collects the project links that will be carried into the tailored resume.
 *
 * Deliberately deterministic (no LLM): scoring over the structured project
 * data in data/projects.ts is stable, instant, free, and immune to
 * hallucination — the LLM stages downstream only ever see real projects.
 */

import { projects, type Project } from '@/data/projects';
import { skillCategories } from '@/data/skills';
import type { JobIntake, MatchedProject, ResumeLink, RetrievalResult, ResumePreferences } from './types';

function norm(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9+#.]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Word-boundary-aware containment over normalized strings.
 * "java" must NOT match "javascript" (would falsely report Java coverage),
 * but "ros2" should match "ROS 2", "yolo" should match "YOLOv8", and
 * "pytorch" should match "PyTorch".
 */
function fuzzyMatch(a: string, b: string): boolean {
    const na = norm(a);
    const nb = norm(b);
    if (na === nb) return true;
    if (na.length < 3 || nb.length < 3) return false;
    // space-insensitive equality: "ros2" === "ros 2"
    if (na.replace(/\s+/g, '') === nb.replace(/\s+/g, '')) return true;
    const [short, long] = na.length <= nb.length ? [na, nb] : [nb, na];
    const idx = long.indexOf(short);
    if (idx === -1) return false;
    const before = idx === 0 ? '' : long[idx - 1];
    const after = idx + short.length >= long.length ? '' : long.slice(idx + short.length);
    const boundaryBefore = before === '' || !/[a-z0-9]/.test(before);
    if (!boundaryBefore) return false;
    if (after === '' || !/^[a-z0-9]/.test(after)) return true;
    // version-suffix tolerance: "yolo" → "yolov8", "gpt" → "gpt4" (but not "java" → "javascript")
    return /^v?\d/.test(after);
}

function projectLinks(p: Project): ResumeLink[] {
    const links: ResumeLink[] = [];
    if (p.github && p.github !== '#') links.push({ label: 'GitHub', url: p.github });
    if (p.documentation && p.documentation !== '#' && p.documentation !== p.github) {
        links.push({ label: 'Docs', url: p.documentation });
    }
    if (p.link && p.link !== '#' && p.link !== p.github && p.link !== p.documentation) {
        links.push({ label: 'Demo', url: p.link });
    }
    // Always at least point to the portfolio
    if (links.length === 0) links.push({ label: 'Portfolio', url: 'https://srujan-k.vercel.app' });
    return links.slice(0, 2);
}

/** All searchable skill names across the portfolio (tech tags + skill matrix + details). */
function portfolioSkillNames(): string[] {
    const names = new Set<string>();
    for (const p of projects) p.tech.forEach(t => names.add(t));
    for (const cat of skillCategories) {
        cat.skills.forEach(s => {
            names.add(s.name);
            // details often carry the concrete tools: "Jetson AGX, TensorRT, DeepStream"
            if (s.details) s.details.split(/[,;]/).map(x => x.trim()).filter(x => x.length > 1).forEach(x => names.add(x));
        });
    }
    return Array.from(names);
}

export function retrieve(intake: JobIntake, prefs: ResumePreferences): RetrievalResult {
    const excluded = new Set(prefs.excludedProjectIds);

    // Terms to match against, weighted by origin
    const skillTerms = intake.requiredSkills.map(norm).filter(t => t.length >= 2);
    const keywordTerms = [...intake.keywords, intake.role, intake.domain]
        .map(norm)
        .filter(t => t.length >= 3);

    const scored = projects
        .filter(p => !excluded.has(p.id))
        .map(p => {
            const techNorm = p.tech.map(norm);
            const title = norm(p.title);
            const desc = norm(p.description + ' ' + (p.longDescription || ''));
            const metric = norm(p.metric || '');

            let score = 0;
            const why: string[] = [];

            for (const term of skillTerms) {
                if (techNorm.some(t => t.includes(term) || term.includes(t))) {
                    score += 3;
                    why.push(term);
                } else if (desc.includes(term)) {
                    score += 1;
                    why.push(term);
                }
            }
            for (const term of keywordTerms) {
                if (title.includes(term)) score += 2;
                else if (metric.includes(term)) score += 1.5;
                else if (desc.includes(term)) score += 0.75;
            }
            if (p.featured) score += 2;
            if (p.ongoing) score += 1;

            return { p, score, why: Array.from(new Set(why)) };
        })
        .filter(s => s.score > 2) // drop noise-level matches
        .sort((a, b) => b.score - a.score);

    const maxScore = scored[0]?.score || 1;
    const matches: MatchedProject[] = scored.slice(0, 8).map(({ p, score, why }) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        description: p.description,
        tech: p.tech,
        links: projectLinks(p),
        metrics: p.metric,
        relevance: Math.round((score / maxScore) * 100),
        why: why.length ? `Matches: ${why.slice(0, 5).join(', ')}` : 'Related portfolio work',
    }));

    // Skill coverage: which of the JD's required skills exist anywhere in the portfolio
    const allSkills = portfolioSkillNames();
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    for (const req of intake.requiredSkills) {
        if (allSkills.some(s => fuzzyMatch(s, req))) matchedSkills.push(req);
        else missingSkills.push(req);
    }
    const coveragePct = intake.requiredSkills.length === 0
        ? (matches.length > 0 ? 60 : 0) // no explicit skills given — fall back to project signal
        : Math.round((matchedSkills.length / intake.requiredSkills.length) * 100);

    return { matches, matchedSkills, missingSkills, coveragePct };
}
