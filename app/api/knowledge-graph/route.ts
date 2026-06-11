/**
 * PUBLIC knowledge-graph API — powers the interactive 3D graph section on the
 * portfolio. Read-only views over public portfolio data (projects + tech).
 * The admin-only signals (knowledge gaps, request logs) are NOT exposed here.
 */

import { NextResponse } from 'next/server';
import { projects } from '@/data/projects';
import { retrieve } from '@/lib/resume-agents/retriever';
import { getResumePreferences } from '@/lib/resume-preferences';

const CATEGORY_COLORS: Record<string, string> = {
    AI: '#3B82F6',
    Robotics: '#F59E0B',
    Research: '#8B7EC8',
};

export interface GraphNode {
    id: string;
    label: string;
    type: 'project' | 'tech' | 'category';
    color: string;
    size: number;
    detail?: {
        description: string;
        tech: string[];
        year?: string;
        metric?: string;
        featured: boolean;
        ongoing: boolean;
        links: Array<{ label: string; url: string }>;
    };
}

export interface GraphEdge {
    source: string;
    target: string;
}

// GET — nodes + edges for the 3D graph
export async function GET() {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    const categories = ['AI', 'Robotics', 'Research'];
    for (const cat of categories) {
        nodes.push({ id: `cat:${cat}`, label: cat, type: 'category', color: CATEGORY_COLORS[cat], size: 22 });
    }

    // Tech tag frequency — tags shared by 3+ projects become hub nodes
    const techCount = new Map<string, number>();
    for (const p of projects) {
        for (const t of p.tech) techCount.set(t, (techCount.get(t) || 0) + 1);
    }
    const topTech = Array.from(techCount.entries())
        .filter(([, n]) => n >= 3)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 24);
    const topTechSet = new Set(topTech.map(([t]) => t));
    for (const [tech, n] of topTech) {
        nodes.push({ id: `tech:${tech}`, label: tech, type: 'tech', color: '#06B6D4', size: 6 + Math.min(n, 12) });
    }

    for (const p of projects) {
        nodes.push({
            id: p.id,
            label: p.title.length > 34 ? p.title.slice(0, 32) + '…' : p.title,
            type: 'project',
            color: CATEGORY_COLORS[p.category] || '#64748B',
            size: p.featured ? 12 : 8,
            detail: {
                description: p.description,
                tech: p.tech,
                year: p.year,
                metric: p.metric,
                featured: p.featured,
                ongoing: !!p.ongoing,
                links: [
                    ...(p.github && p.github !== '#' ? [{ label: 'GitHub', url: p.github }] : []),
                    ...(p.documentation && p.documentation !== '#' ? [{ label: 'Docs', url: p.documentation }] : []),
                ],
            },
        });
        edges.push({ source: p.id, target: `cat:${p.category}` });
        for (const t of p.tech) {
            if (topTechSet.has(t)) edges.push({ source: p.id, target: `tech:${t}` });
        }
    }

    return NextResponse.json({
        nodes,
        edges,
        stats: {
            projects: projects.length,
            techHubs: topTech.length,
        },
    });
}

// POST { query } — the same matcher the Resume Gate runs: returns which
// projects light up for a JD-like query. Deterministic and cheap.
export async function POST(request: Request) {
    try {
        const body = await request.json() as { query?: string };
        const query = (body.query || '').trim();
        if (query.length < 3 || query.length > 500) {
            return NextResponse.json({ error: 'Query must be 3–500 characters' }, { status: 400 });
        }

        const prefs = getResumePreferences();
        const terms = query.split(/[,;\n]+|\s{2,}/).map(s => s.trim()).filter(Boolean);
        const result = retrieve({
            role: query.slice(0, 80),
            company: '',
            seniority: 'unspecified',
            domain: query.slice(0, 60),
            requiredSkills: terms.length > 1 ? terms : query.split(/\s+/).filter(w => w.length > 2),
            responsibilities: [],
            keywords: query.split(/\s+/).filter(w => w.length > 2).slice(0, 10),
            redFlags: [],
        }, { ...prefs, excludedProjectIds: [] });

        return NextResponse.json({
            matches: result.matches.map(m => ({ id: m.id, title: m.title, relevance: m.relevance })),
            matchedSkills: result.matchedSkills.slice(0, 10),
            missingSkills: result.missingSkills.slice(0, 6),
            coveragePct: result.coveragePct,
        });
    } catch (e) {
        console.error('Knowledge graph query failed:', e);
        return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }
}
