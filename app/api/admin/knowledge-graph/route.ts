import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { projects } from '@/data/projects';
import { skillCategories } from '@/data/skills';
import { getVectorStore } from '@/lib/vector-store';
import { retrieve } from '@/lib/resume-agents/retriever';
import { getResumePreferences } from '@/lib/resume-preferences';
import { readKnowledgeGaps } from '@/lib/chat-agents/knowledge';

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

// GET — the knowledge graph: projects, shared-tech hubs, category hubs
export async function GET() {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Category hubs
    const categories = ['AI', 'Robotics', 'Research'];
    for (const cat of categories) {
        nodes.push({ id: `cat:${cat}`, label: cat, type: 'category', color: CATEGORY_COLORS[cat], size: 22 });
    }

    // Tech tag frequency — only tags shared by 3+ projects become hub nodes
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

    // Project nodes + edges
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

    // Knowledge-base stats (from the embeddings cache, no API calls)
    const store = getVectorStore();
    if (store.getCount() === 0) store.loadFromCache();
    const docs = store.getAllDocuments();
    const byType = new Map<string, number>();
    for (const d of docs) {
        const t = (d.metadata as { type?: string }).type || 'other';
        byType.set(t, (byType.get(t) || 0) + 1);
    }

    return NextResponse.json({
        nodes,
        edges,
        stats: {
            projects: projects.length,
            techHubs: topTech.length,
            skillCategories: skillCategories.length,
            embeddedDocs: docs.length,
            docsByType: Object.fromEntries(byType),
        },
        // Self-improvement signal: chat questions the portfolio couldn't answer
        knowledgeGaps: readKnowledgeGaps().slice(0, 12),
    });
}

// POST { query } — run the same retriever the Resume Gate uses and return
// which graph nodes light up. Lets the admin see exactly what a recruiter
// query would match.
export async function POST(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json() as { query?: string };
        const query = (body.query || '').trim();
        if (query.length < 3) {
            return NextResponse.json({ error: 'Query too short' }, { status: 400 });
        }

        const prefs = getResumePreferences();
        // Pseudo-intake: treat the query terms as both skills and keywords
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
        }, { ...prefs, excludedProjectIds: [] }); // show everything in the graph view

        return NextResponse.json({
            matches: result.matches.map(m => ({ id: m.id, title: m.title, relevance: m.relevance, why: m.why })),
            matchedSkills: result.matchedSkills,
            missingSkills: result.missingSkills,
            coveragePct: result.coveragePct,
        });
    } catch (e) {
        console.error('Knowledge graph query failed:', e);
        return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }
}
