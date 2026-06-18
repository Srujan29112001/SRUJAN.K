/**
 * TAILOR AGENT — assembles the three swappable resume sections (role line,
 * summary, technical skills, key projects) for this specific job.
 *
 * TRUTHFULNESS IS A HARD CONSTRAINT (the owner's standing rule):
 *  - Projects can only be chosen from the retriever's real matches; their
 *    links always come from portfolio data, never from the LLM.
 *  - Every number in a generated bullet must exist in that project's source
 *    text — violating bullets are replaced with deterministic ones.
 *  - Skill tags must exist in the portfolio's actual skill/tech vocabulary.
 *  - The summary's only numeric claims must come from a whitelist of
 *    verified career facts.
 */

import { generateJSON } from '@/lib/ai-providers';
import { skillCategories } from '@/data/skills';
import type {
    JobIntake, LLMBase, MatchedProject, ResumePreferences, RetrievalResult,
    SkillRow, TailoredProject, TailoredResume,
} from './types';

// Verified career facts the summary may cite (kept in sync with staples)
const VERIFIED_NUMBERS = ['40', '89', '22', '95', '9', '30', '38', '2023', '2019', '5000', '18', '35', '98.75', '58', '500'];

function norm(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9+#.]/g, ' ').replace(/\s+/g, ' ').trim();
}

function wordCap(text: string, maxWords: number): string {
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text.trim();
    // cut at the last sentence end inside the cap, else hard cut
    const capped = words.slice(0, maxWords).join(' ');
    const lastStop = capped.lastIndexOf('.');
    return lastStop > capped.length * 0.5 ? capped.slice(0, lastStop + 1) : capped + '…';
}

function numbersIn(text: string): string[] {
    return (text.match(/\d+(?:\.\d+)?/g) || []);
}

/** Every number in `bullet` must appear in the project's source text. */
function bulletIsGrounded(bullet: string, source: MatchedProject): boolean {
    const sourceNums = new Set(numbersIn(`${source.title} ${source.description} ${source.metrics || ''} ${source.tech.join(' ')}`));
    return numbersIn(bullet).every(n => sourceNums.has(n));
}

function deterministicBullets(p: MatchedProject, count: number): string[] {
    const bullets: string[] = [];
    const desc = p.description.endsWith('.') ? p.description : p.description + '.';
    bullets.push(p.metrics ? `${desc} (${p.metrics})` : desc);
    if (p.tech.length) bullets.push(`Built with ${p.tech.slice(0, 6).join(', ')} — end-to-end from data preparation to working system.`);
    return bullets.slice(0, count);
}

/** Full vocabulary of real skills/tech for validating LLM-suggested tags. */
function skillVocabulary(): string[] {
    const vocab = new Set<string>();
    for (const cat of skillCategories) {
        for (const s of cat.skills) {
            vocab.add(s.name);
            // split compound names ("Python & C++" → Python, C++)
            s.name.split(/[&,/]/).map(x => x.replace(/\(.*\)/, '').trim()).filter(x => x.length > 1).forEach(x => vocab.add(x));
            if (s.details) s.details.split(/[,;]/).map(x => x.trim()).filter(x => x.length > 1).forEach(x => vocab.add(x));
        }
    }
    return Array.from(vocab);
}

/**
 * Word-boundary-aware match so "Java" can't sneak in via "JavaScript".
 * False negatives are safe (tag gets dropped); false positives are not.
 */
function boundaryMatch(a: string, b: string): boolean {
    const na = norm(a);
    const nb = norm(b);
    if (na === nb) return true;
    if (na.length < 3 || nb.length < 3) return false;
    if (na.replace(/\s+/g, '') === nb.replace(/\s+/g, '')) return true; // "ros2" === "ros 2"
    const [short, long] = na.length <= nb.length ? [na, nb] : [nb, na];
    const idx = long.indexOf(short);
    if (idx === -1) return false;
    const before = idx === 0 ? '' : long[idx - 1];
    const after = idx + short.length >= long.length ? '' : long.slice(idx + short.length);
    const boundaryBefore = before === '' || !/[a-z0-9]/.test(before);
    if (!boundaryBefore) return false;
    if (after === '' || !/^[a-z0-9]/.test(after)) return true;
    return /^v?\d/.test(after); // version suffix: "yolo" → "yolov8"
}

function inVocabulary(name: string, vocab: string[], projectTech: Set<string>): boolean {
    const n = norm(name);
    if (n.length < 2) return false;
    if (Array.from(projectTech).some(t => boundaryMatch(t, n))) return true;
    return vocab.some(v => boundaryMatch(v, n));
}

// =============================================================================
// DETERMINISTIC TAILOR (always works; also the repair path for LLM output)
// =============================================================================

function deterministicSkillRows(intake: JobIntake, retrieval: RetrievalResult, maxRows: number): SkillRow[] {
    const jdSkills = new Set(intake.requiredSkills.map(norm));
    const isKey = (name: string) => {
        const n = norm(name);
        return Array.from(jdSkills).some(j => j.includes(n) || n.includes(j));
    };
    const mk = (names: string[]): { name: string; key?: boolean }[] =>
        names.map(name => ({ name, key: isKey(name) || undefined }));

    const matchedTech = new Set<string>();
    retrieval.matches.slice(0, 5).forEach(m => m.tech.forEach(t => matchedTech.add(t)));

    const rows: SkillRow[] = [
        { category: 'Programming', items: mk(['Python', 'C++', 'SQL', 'Bash']) },
        { category: 'AI/ML & Deep Learning', items: mk(['PyTorch', 'TensorFlow', 'CNNs', 'Transformers', 'Reinforcement Learning']) },
    ];

    const d = intake.domain.toLowerCase();
    if (/vision|edge/.test(d)) {
        rows.push({ category: 'Computer Vision & Edge AI', items: mk(['YOLOv7 / v8', 'Object Detection', 'OpenCV', 'NVIDIA Jetson', 'TensorRT']) });
    } else if (/robot|autonomous/.test(d)) {
        rows.push({ category: 'Robotics & Control', items: mk(['ROS / ROS 2', 'Gazebo', 'Sensor Fusion', 'NVIDIA Jetson', 'Control Systems']) });
    } else if (/llm|genai|agent/.test(d)) {
        rows.push({ category: 'LLMs & Agents', items: mk(['LLMs & RAG', 'LangChain', 'Multi-Agent Systems', 'Prompt Engineering', 'Vector DBs']) });
    } else {
        const extra = Array.from(matchedTech).slice(0, 5);
        rows.push({ category: 'Domain Tools', items: mk(extra.length ? extra : ['OpenCV', 'LangChain', 'ROS 2']) });
    }
    rows.push({ category: 'MLOps & Infrastructure', items: mk(['Docker', 'Kubernetes', 'FastAPI', 'Git / CI-CD', 'Linux']) });

    return rows.slice(0, maxRows);
}

function deterministicTailor(
    intake: JobIntake,
    retrieval: RetrievalResult,
    prefs: ResumePreferences,
): TailoredResume {
    const rules = prefs.tailoringRules;
    const top = retrieval.matches.slice(0, rules.projectCount);

    const domainLabel = intake.domain.replace(/General Engineering/, 'AI & Software Systems');
    // Avoid "CV Engineer / Computer Vision" duplication: only append the domain
    // when it adds information the role title doesn't already carry.
    const roleLower = intake.role.toLowerCase();
    const domainOverlaps = domainLabel.toLowerCase().split(/[\s/&]+/)
        .filter(w => w.length > 2)
        .some(w => roleLower.includes(w));
    const roleLine = (intake.role.length > 40 || domainOverlaps)
        ? intake.role
        : `${intake.role} / ${domainLabel}`;

    const summary = wordCap(
        `AI/ML Engineer focused on ${domainLabel.toLowerCase()} with hands-on experience deploying deep learning in production — including YOLOv7 on NVIDIA Jetson at 89% mAP / 22 FPS for real-time aerial detection at DRDO-DRDL. As a freelance engineer, delivered 40+ projects across ${retrieval.matchedSkills.slice(0, 3).join(', ') || 'computer vision, agents, and reinforcement learning'} — owning each from model training to optimized deployment.`,
        rules.summaryMaxWords,
    );

    const projects: TailoredProject[] = top.map(p => ({
        title: p.title,
        links: p.links,
        bullets: deterministicBullets(p, rules.bulletsPerProject),
    }));

    return {
        roleLine: roleLine.slice(0, 80),
        summary,
        skills: deterministicSkillRows(intake, retrieval, rules.maxSkillRows),
        projects,
    };
}

// =============================================================================
// LLM TAILOR with validation + repair
// =============================================================================

interface LLMTailorOut {
    roleLine?: string;
    summary?: string;
    skills?: Array<{ category?: string; items?: Array<{ name?: string; key?: boolean }> }>;
    projects?: Array<{ id?: string; title?: string; bullets?: string[] }>;
}

export async function tailorResume(
    intake: JobIntake,
    retrieval: RetrievalResult,
    prefs: ResumePreferences,
    llmBase?: LLMBase | null,
): Promise<{ resume: TailoredResume; usedLLM: boolean; llm?: string }> {
    const fallback = deterministicTailor(intake, retrieval, prefs);
    if (!llmBase || retrieval.matches.length === 0) return { resume: fallback, usedLLM: false };

    const rules = prefs.tailoringRules;
    const candidates = retrieval.matches.slice(0, 6);

    try {
        const { data, provider, model } = await generateJSON<LLMTailorOut>({
            ...llmBase,
            system: `You tailor one resume for a specific job. ABSOLUTE RULES:
- NEVER invent facts, numbers, metrics, or technologies. Use ONLY what is provided.
- Any number you write in a project bullet MUST literally appear in that project's provided data.
- Choose projects ONLY from the provided candidate list, by their "id".
- Concise, recruiter-grade language. No buzzword soup.`,
            prompt: `Tailor resume sections for this job.

JOB: ${intake.role} at ${intake.company}
DOMAIN: ${intake.domain} | SENIORITY: ${intake.seniority}
JD REQUIRED SKILLS: ${intake.requiredSkills.join(', ')}
JD RESPONSIBILITIES: ${intake.responsibilities.join('; ') || '—'}

CANDIDATE PROJECTS (choose exactly ${rules.projectCount}, by id):
${candidates.map(p => `- id: ${p.id} | ${p.title} | tech: ${p.tech.join(', ')} | metric: ${p.metrics || '—'} | ${p.description}`).join('\n')}

VERIFIED CAREER FACTS for the summary (only numeric claims allowed): freelance AI/ML & Robotics engineer since Aug 2023; 40+ delivered projects; DRDO-DRDL internship — YOLOv7 on NVIDIA Jetson AGX Xavier, 89% mAP, 22 FPS, 95% field accuracy; 9 enterprise MVPs; 38-agent platform; B.E. ECE, Thapar (2019–2023).

CURRENT STATUS: ${prefs.currentStatus}

Return JSON:
{
  "roleLine": "header subtitle, format 'Role / Specialization', max 70 chars",
  "summary": "max ${rules.summaryMaxWords} words, third-person-implied resume voice ('AI/ML & Robotics Engineer focused on…'), angled at this JD, only verified numeric facts",
  "skills": [up to ${rules.maxSkillRows} rows: {"category": "row label", "items": [{"name": "skill", "key": true-if-JD-critical}]} — 4-6 items per row, only real skills from the projects/facts above],
  "projects": [exactly ${rules.projectCount}: {"id": "candidate id", "title": "title (may sharpen wording, same meaning)", "bullets": [${rules.bulletsPerProject} bullets, each ≤ 30 words, grounded in that project's data]}]
}`,
            temperature: 0.4,
            maxTokens: 4096,
        });

        // ---- VALIDATE + REPAIR ----
        const byId = new Map(candidates.map(c => [c.id, c]));
        const vocab = skillVocabulary();
        const allTech = new Set<string>(candidates.flatMap(c => c.tech));

        // Projects: ids must be real; links from OUR data; bullets grounded
        let projects: TailoredProject[] = (data.projects || [])
            .filter(p => p.id && byId.has(p.id))
            .slice(0, rules.projectCount)
            .map(p => {
                const src = byId.get(p.id!)!;
                let bullets = (p.bullets || []).map(String).slice(0, rules.bulletsPerProject);
                bullets = bullets.map(b => bulletIsGrounded(b, src) ? b : deterministicBullets(src, 1)[0]);
                if (bullets.length < rules.bulletsPerProject) {
                    bullets = [...bullets, ...deterministicBullets(src, rules.bulletsPerProject)].slice(0, rules.bulletsPerProject);
                }
                return { title: (p.title || src.title).slice(0, 90), links: src.links, bullets };
            });
        // top-up if LLM under-delivered
        if (projects.length < Math.min(rules.projectCount, candidates.length)) {
            const used = new Set((data.projects || []).map(p => p.id));
            for (const c of candidates) {
                if (projects.length >= rules.projectCount) break;
                if (!used.has(c.id)) projects.push({ title: c.title, links: c.links, bullets: deterministicBullets(c, rules.bulletsPerProject) });
            }
        }

        // Skills: every tag must exist in the real vocabulary
        let skills: SkillRow[] = (data.skills || [])
            .map(row => ({
                category: String(row.category || '').slice(0, 40) || 'Skills',
                items: (row.items || [])
                    .filter(i => i.name && inVocabulary(String(i.name), vocab, allTech))
                    .map(i => ({ name: String(i.name).slice(0, 40), key: i.key === true || undefined }))
                    .slice(0, 7),
            }))
            .filter(row => row.items.length >= 2)
            .slice(0, rules.maxSkillRows);
        if (skills.length < 2) skills = fallback.skills;

        // Summary: word cap + numeric whitelist
        let summary = wordCap(String(data.summary || ''), rules.summaryMaxWords);
        const badNumber = numbersIn(summary).some(n => !VERIFIED_NUMBERS.includes(n));
        if (!summary || summary.split(/\s+/).length < 15 || badNumber) summary = fallback.summary;

        const roleLine = (String(data.roleLine || '').trim() || fallback.roleLine).slice(0, 80);

        if (projects.length === 0) return { resume: fallback, usedLLM: false };

        return { resume: { roleLine, summary, skills, projects }, usedLLM: true, llm: `${provider}:${model}` };
    } catch (e) {
        console.warn('Tailor LLM failed, using deterministic tailor:', e instanceof Error ? e.message : e);
        return { resume: fallback, usedLLM: false };
    }
}
