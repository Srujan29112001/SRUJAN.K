/**
 * TOOL ROUTER — deterministic intent routing for the chat's data tools.
 *
 * Replaces the old two-pass design (an LLM call to *decide* the tool, then a
 * second to answer) with instant code routing — the same trick the resume
 * retriever uses. One less round-trip per message ≈ halves tool-turn latency,
 * works identically across all 7 BYOK providers, and can't misroute to a
 * nonexistent tool.
 */

import { projects } from '@/data/projects';
import { executeTool, type ToolCall } from '@/lib/chat-tools';

export interface RoutedTool {
    tool: ToolCall['tool'];
    args: ToolCall['args'];
    result: string;
}

/** Fuzzy: does the message clearly reference one specific project? */
function matchProject(lower: string): string | null {
    let best: { title: string; score: number } | null = null;
    for (const p of projects) {
        const title = p.title.toLowerCase();
        let score = 0;
        // full title or distinctive fragment present in the message
        if (lower.includes(title)) score += 10;
        else {
            const words = title.split(/[\s—–-]+/).filter(w => w.length > 3);
            const hits = words.filter(w => lower.includes(w)).length;
            if (words.length > 0 && hits >= Math.min(2, words.length)) score += hits * 2;
        }
        if (p.metric && lower.includes(p.metric.toLowerCase())) score += 4;
        if (score > 0 && (!best || score > best.score)) best = { title: p.title, score };
    }
    return best && best.score >= 4 ? best.title : null;
}

/**
 * Route the message to a tool (or null) and execute it.
 * Pure code — never calls an LLM, never throws.
 */
export function routeAndExecute(message: string): RoutedTool | null {
    const lower = message.toLowerCase();

    const run = (tool: ToolCall['tool'], args: ToolCall['args'] = {}): RoutedTool => ({
        tool, args, result: executeTool({ tool, args }),
    });

    // 1) Booking / contact intent
    if (/\b(book|schedul\w*|meeting|call|consult\w*|appointment|hire you|reach you|contact (you|him))\b/.test(lower)) {
        return run('booking_info');
    }

    // 2) One specific project clearly referenced
    const projectQuery = matchProject(lower);
    if (projectQuery && /\b(tell|about|detail|explain|describe|how|what|link|github|demo|show)\b/.test(lower)) {
        return run('get_project', { query: projectQuery });
    }

    // 3) Listing projects (optionally by category)
    if (/\b(list|show|all|which|what)\b/.test(lower) && /\b(project|work|built|portfolio|things)\b/.test(lower)) {
        const category = /\brobot/.test(lower) ? 'Robotics'
            : /\bresearch|scien/.test(lower) ? 'Research'
            : /\bai\b|machine learning|\bml\b|deep learning/.test(lower) ? 'AI'
            : undefined;
        return run('list_projects', category ? { category } : {});
    }

    // 4) Skill matrix
    if (/\b(skills?|stack|technolog\w*|proficien\w*|tools?|languages?|frameworks?)\b/.test(lower)) {
        return run('get_skills');
    }

    // 5) Experience / education
    if (/\b(experience|intern\w*|education|degree|career|history|background|drdo|thapar|university|college)\b/.test(lower)) {
        return run('get_experience');
    }

    return null;
}
