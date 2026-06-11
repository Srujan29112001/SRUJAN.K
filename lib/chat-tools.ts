/**
 * =============================================================================
 * CHAT TOOL LAYER (Phase 2)
 * =============================================================================
 * Provider-agnostic "function calling" for the AI chat: a fast intent pass
 * decides whether the question needs structured data; if so, the tool runs
 * against the real data files and its result is injected into the final
 * answer prompt. Works identically across all six BYOK providers because it
 * uses plain JSON prompting, not native function-call APIs.
 *
 * Tools are read-only views over data/*.ts — the model can never see or say
 * anything that isn't actually in the portfolio.
 * =============================================================================
 */

import { projects } from '@/data/projects';
import { skillCategories } from '@/data/skills';
import { experiences } from '@/data/experience';
import { generateJSON, type LLMRequest } from './ai-providers';

export interface ToolCall {
    tool: 'list_projects' | 'get_project' | 'get_skills' | 'get_experience' | 'booking_info';
    args: { category?: string; query?: string };
}

export const TOOL_DESCRIPTIONS = `
- list_projects: list portfolio projects. args: {category?: "AI" | "Robotics" | "Research"} (omit for featured)
- get_project: full details + links for ONE project. args: {query: "name or keywords"}
- get_skills: the full skill matrix with proficiency levels. args: {}
- get_experience: work/education/research history. args: {}
- booking_info: how to book a call / get in contact. args: {}`;

/** Quick heuristic: does this message plausibly need a data lookup? */
export function mightNeedTool(message: string): boolean {
    return /\b(project|portfolio|built|build|work|skill|stack|tech|experience|intern|job|education|degree|book|meeting|call|schedul|hire|contact|list|show me|tell me about|github|link|demo)\b/i.test(message);
}

function fmtLinks(p: { link?: string; github?: string; documentation?: string }): string {
    const links: string[] = [];
    if (p.github && p.github !== '#') links.push(`GitHub: ${p.github}`);
    if (p.documentation && p.documentation !== '#') links.push(`Docs: ${p.documentation}`);
    if (p.link && p.link !== '#' && p.link !== p.github) links.push(`Demo: ${p.link}`);
    return links.join(' | ') || 'on the portfolio site';
}

export function executeTool(call: ToolCall): string {
    switch (call.tool) {
        case 'list_projects': {
            const cat = call.args.category;
            const pool = cat
                ? projects.filter(p => p.category.toLowerCase() === cat.toLowerCase())
                : projects.filter(p => p.featured);
            const label = cat ? `${cat} projects (${pool.length})` : `Featured projects (${pool.length})`;
            return `${label}:\n` + pool.slice(0, 18).map(p =>
                `- ${p.title}${p.metric ? ` [${p.metric}]` : ''}${p.ongoing ? ' (ongoing)' : ''}: ${p.description}`
            ).join('\n') + (pool.length > 18 ? `\n…and ${pool.length - 18} more.` : '');
        }
        case 'get_project': {
            const q = (call.args.query || '').toLowerCase();
            if (!q) return 'No project specified.';
            const terms = q.split(/\s+/).filter(t => t.length > 2);
            const scored = projects.map(p => {
                const hay = `${p.title} ${p.metric || ''} ${p.tech.join(' ')} ${p.description}`.toLowerCase();
                return { p, score: terms.filter(t => hay.includes(t)).length };
            }).sort((a, b) => b.score - a.score);
            const best = scored[0];
            if (!best || best.score === 0) return `No project found matching "${call.args.query}".`;
            const p = best.p;
            return `${p.title} (${p.category}${p.year ? `, ${p.year}` : ''})${p.ongoing ? ' — ONGOING' : ''}
${p.longDescription || p.description}
Tech: ${p.tech.join(', ')}
Links: ${fmtLinks(p)}`;
        }
        case 'get_skills': {
            return skillCategories.map(cat =>
                `${cat.title}:\n` + cat.skills.map(s =>
                    `  - ${s.name} (${s.proficiency}%)${s.details ? ` — ${s.details}` : ''}`
                ).join('\n')
            ).join('\n');
        }
        case 'get_experience': {
            return experiences.map(e =>
                `${e.title} @ ${e.organization} (${e.period}, ${e.type}):\n  ${e.description}\n` +
                e.highlights.map(h => `  - ${h}`).join('\n')
            ).join('\n\n');
        }
        case 'booking_info': {
            return `Booking options (all on the portfolio page, "Schedule a Meeting" section — the visitor can scroll down or use the navbar):
- 15-min Discovery Call (quick intro)
- 30-min Project Discussion
- 60-min Deep Dive
Direct email: srujan.hardik@gmail.com. The contact form in "Let's Connect" also works.`;
        }
        default:
            return 'Unknown tool.';
    }
}

/**
 * Intent pass: ask the model (with the user's own key) whether a tool is
 * needed. Returns null on any failure — the chat then just answers from
 * RAG context like before, so the tool layer can never break the chat.
 */
export async function decideTool(
    message: string,
    llmBase: Pick<LLMRequest, 'provider' | 'overrideKey' | 'overrideModel'>,
): Promise<ToolCall | null> {
    try {
        const { data } = await generateJSON<{ tool?: string | null; args?: ToolCall['args'] }>({
            ...llmBase,
            system: 'You route user questions to data tools. Output JSON only.',
            prompt: `Available tools:${TOOL_DESCRIPTIONS}

User message: "${message.slice(0, 500)}"

If the message needs CONCRETE portfolio data (project lists, one project's details/links, the skill matrix, work history, or booking info), pick the ONE best tool. Otherwise tool is null.

Return JSON: {"tool": "name-or-null", "args": {}}`,
            temperature: 0,
            maxTokens: 1500,
        });
        const valid = ['list_projects', 'get_project', 'get_skills', 'get_experience', 'booking_info'];
        if (data.tool && valid.includes(data.tool)) {
            return { tool: data.tool as ToolCall['tool'], args: data.args || {} };
        }
        return null;
    } catch {
        return null;
    }
}
