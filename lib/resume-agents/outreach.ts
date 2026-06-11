/**
 * OUTREACH AGENT (owner-only) — turns a pipeline run into application
 * collateral: a ≤400-character pitch message and a full hiring-team email.
 *
 * Only reachable from authenticated owner-mode runs (the public Resume Gate
 * never exposes it). Same truthfulness regime as the tailor agent: outputs
 * are validated against a corpus of real data — any numeric claim that
 * doesn't exist in the JD, the matched projects, or the verified career
 * facts causes that piece to fall back to the deterministic template.
 */

import { generateJSON } from '@/lib/ai-providers';
import type {
    FitResult, JobIntake, LLMBase, OutreachKit, ResumePreferences,
    RetrievalResult, TailoredResume,
} from './types';

const SHORT_MESSAGE_LIMIT = 400;
const EMAIL_BODY_LIMIT = 3500;

// Verified career facts the messages may cite (mirrors the tailor agent).
// Deliberately excludes unverified claims (no CGPA/backlog statements).
const VERIFIED_FACTS = `
- Freelance AI/ML engineer since Aug 2023; 40+ delivered projects
- DRDO-DRDL internship (Jan–Aug 2023): YOLOv7 on NVIDIA Jetson AGX Xavier — 89% mAP, 22 FPS, 95% field accuracy
- 9 enterprise MVPs incl. Clinical AI Copilot (95% accuracy) and a 38-agent Entrepreneurship Intelligence Platform
- B.E. Electronics & Communication Engineering, Thapar Institute (2019–2023)
- JEE Main 2019: 95 percentile
- IIIT Hyderabad Advanced Certification in Generative AI & Prompt Engineering (Feb–Jun 2026)`;

function numbersIn(text: string): string[] {
    return text.match(/\d+(?:\.\d+)?/g) || [];
}

function capAtSentence(text: string, max: number): string {
    if (text.length <= max) return text;
    const cut = text.slice(0, max);
    const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '));
    return lastStop > max * 0.6 ? cut.slice(0, lastStop + 1) : cut.slice(0, max - 1) + '…';
}

// =============================================================================
// DETERMINISTIC TEMPLATES (always available)
// =============================================================================

function deterministicOutreach(
    intake: JobIntake,
    retrieval: RetrievalResult,
    prefs: ResumePreferences,
): OutreachKit {
    const { header } = prefs;
    const skills = retrieval.matchedSkills.slice(0, 5).join(', ');
    const top = retrieval.matches.slice(0, 3);
    const portfolio = header.links.find(l => l.label.toLowerCase().includes('portfolio'))?.url || 'https://srujan-k.vercel.app';

    const shortMessage = capAtSentence(
        `${intake.role} applicant — AI/ML engineer, B.E. ECE Thapar (2023). ${skills ? `Hands-on with ${skills}. ` : ''}DRDO-DRDL intern (YOLOv7 on Jetson, 89% mAP) + 40+ shipped projects. Strongest match: ${top[0]?.title || 'see portfolio'}. Portfolio: ${portfolio} — keen to bring this to ${intake.company}!`,
        SHORT_MESSAGE_LIMIT,
    );

    const subject = `${intake.role} — Application from K Srujan (AI/ML Engineer, 40+ shipped projects)`;

    const projectLines = top.map(p =>
        `- ${p.title}: ${p.description}${p.links[0] ? ` (${p.links[0].url})` : ''}`,
    ).join('\n');

    const emailBody = `Dear ${intake.company} Recruiting Team,

I am writing to apply for the ${intake.role} position. My background sits directly on this role's requirements${intake.domain ? ` in ${intake.domain.toLowerCase()}` : ''}.

My alignment with your requirements:
${retrieval.matchedSkills.length ? `- Skills you listed that I work with daily: ${retrieval.matchedSkills.slice(0, 10).join(', ')}` : ''}
- Defence-grade deployment experience: DRDO-DRDL internship — YOLOv7 on NVIDIA Jetson AGX Xavier at 89% mAP / 22 FPS for real-time aerial detection
- Freelance AI/ML engineering since Aug 2023: 40+ delivered projects, including 9 enterprise MVPs

Most relevant work:
${projectLines}

Education:
B.E. Electronics & Communication Engineering, Thapar Institute of Engineering & Technology (2019–2023). JEE Main 2019: 95 percentile. Currently completing IIIT Hyderabad's Advanced Certification in Generative AI & Prompt Engineering.

A resume tailored to this exact role is attached. I would welcome the chance to discuss how this experience maps to your team's work.

Best regards,
${header.name === 'SRUJAN' ? 'K Srujan' : header.name}
Portfolio: ${portfolio}
Email: ${header.email}${header.phone ? `\nPhone: ${header.phone}` : ''}`;

    return { shortMessage, subject, emailBody: capAtSentence(emailBody, EMAIL_BODY_LIMIT) };
}

// =============================================================================
// LLM PASS with grounding validation
// =============================================================================

export async function generateOutreach(
    intake: JobIntake,
    retrieval: RetrievalResult,
    fit: FitResult,
    resume: TailoredResume | undefined,
    prefs: ResumePreferences,
    llmBase?: LLMBase | null,
    /** the raw requirements text — referral names/details live here */
    rawRequirements?: string,
): Promise<{ outreach: OutreachKit; usedLLM: boolean; llm?: string }> {
    const fallback = deterministicOutreach(intake, retrieval, prefs);
    if (!llmBase) return { outreach: fallback, usedLLM: false };

    // Grounding corpus: any number in the output must exist somewhere in here
    const corpus = [
        rawRequirements || '',
        VERIFIED_FACTS,
        retrieval.matches.map(m => `${m.title} ${m.description} ${m.metrics || ''} ${m.tech.join(' ')}`).join(' '),
        resume?.summary || '',
        prefs.currentStatus,
        String(SHORT_MESSAGE_LIMIT), '2019', '2023', '2026', // structural numbers
    ].join(' ');
    const corpusNumbers = new Set(numbersIn(corpus));
    const grounded = (text: string) => numbersIn(text).every(n => corpusNumbers.has(n));

    const top = retrieval.matches.slice(0, 4);
    const portfolio = prefs.header.links.find(l => l.label.toLowerCase().includes('portfolio'))?.url || 'https://srujan-k.vercel.app';

    try {
        const { data, provider, model } = await generateJSON<Partial<OutreachKit>>({
            ...llmBase,
            system: `You write job-application outreach for K Srujan (AI/ML engineer). ABSOLUTE RULES:
- Use ONLY the verified facts and project data provided. Never invent numbers, grades, certifications, or experience.
- If the job text mentions a referral or named contact, weave it in naturally (subject + opening).
- Confident, specific, human tone. No buzzword soup, no grovelling.`,
            prompt: `Write application outreach for this role.

ROLE: ${intake.role} at ${intake.company}
DOMAIN: ${intake.domain} | FIT: ${fit.score}/100
JOB TEXT (may contain referral info — use it if present):
"""
${(rawRequirements || '').slice(0, 3000)}
"""

VERIFIED CAREER FACTS (the ONLY permitted factual claims):${VERIFIED_FACTS}

MATCHED SKILLS (from the JD, evidenced by real work): ${retrieval.matchedSkills.join(', ') || '—'}
TOP RELEVANT PROJECTS:
${top.map(p => `- ${p.title}: ${p.description}${p.links[0] ? ` [${p.links[0].url}]` : ''}`).join('\n')}
${resume ? `TAILORED RESUME SUMMARY (consistent voice): ${resume.summary}` : ''}

CONTACT BLOCK to end the email with:
K Srujan | Portfolio: ${portfolio} | Email: ${prefs.header.email}

Return JSON:
{
  "shortMessage": "pitch of AT MOST 380 characters (hard limit) — role, 2-3 strongest matching credentials, portfolio link, enthusiasm for the company. Count characters carefully.",
  "subject": "email subject line — role + standout credential (+ referral name if the job text has one)",
  "emailBody": "complete plain-text email: greeting, 1-paragraph hook, 'My alignment with your requirements:' section with short labeled bullets mapped to THIS JD, 'Most relevant work:' with 2-3 projects + links, education line, closing + the contact block. Under 3000 characters. Line breaks as \\n."
}`,
            temperature: 0.5,
            maxTokens: 4096,
        });

        let shortMessage = (data.shortMessage || '').trim();
        let subject = (data.subject || '').trim().slice(0, 150);
        let emailBody = (data.emailBody || '').trim();

        // Validate + repair piecewise
        if (!shortMessage || shortMessage.length < 80 || !grounded(shortMessage)) shortMessage = fallback.shortMessage;
        else shortMessage = capAtSentence(shortMessage, SHORT_MESSAGE_LIMIT);

        if (!subject || subject.length < 10) subject = fallback.subject;

        if (!emailBody || emailBody.length < 300 || !grounded(emailBody)) emailBody = fallback.emailBody;
        else emailBody = capAtSentence(emailBody, EMAIL_BODY_LIMIT);

        return {
            outreach: { shortMessage, subject, emailBody },
            usedLLM: true,
            llm: `${provider}:${model}`,
        };
    } catch (e) {
        console.warn('Outreach LLM failed, using deterministic templates:', e instanceof Error ? e.message : e);
        return { outreach: fallback, usedLLM: false };
    }
}
