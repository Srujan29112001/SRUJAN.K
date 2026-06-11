/**
 * PUBLIC knowledge-graph API v2 — the FULL mind-map.
 *
 * Built from the exact same knowledge base the AI chat searches
 * (lib/knowledge-base.ts), so the graph shows work AND life: projects,
 * tech, skills, journey, writing, life & mind, interests, client voices,
 * and current status — all orbiting a central SRUJAN node. Anything added
 * to the data files appears here automatically on the next deploy
 * (status updates flow in live).
 *
 * Internal-only docs (RAG guidelines) are excluded. Knowledge gaps and
 * request logs remain admin-only.
 */

import { NextResponse } from 'next/server';
import { projects } from '@/data/projects';
import { buildKnowledgeBase } from '@/lib/knowledge-base';
import { searchKnowledgePublic } from '@/lib/chat-agents/knowledge';
import { getCustomKnowledgeDocuments, hydrateCustomKnowledge } from '@/lib/custom-knowledge';

const COLORS = {
    center: '#F8FAFC',
    AI: '#3B82F6',
    Robotics: '#F59E0B',
    Research: '#8B7EC8',
    tech: '#06B6D4',
    skills: '#10B981',
    journey: '#F472B6',
    writing: '#818CF8',
    life: '#E879F9',
    interests: '#FB7185',
    clients: '#FACC15',
    now: '#34D399',
    notes: '#94A3B8',
};

export interface GraphNode {
    id: string;
    label: string;
    /** 'category' nodes always show their label (hubs + center) */
    type: 'project' | 'tech' | 'category' | 'doc';
    color: string;
    size: number;
    /** which hub this node belongs to (for seeding the layout) */
    hub?: string;
    detail?: {
        description: string;
        tech?: string[];
        year?: string;
        metric?: string;
        featured?: boolean;
        ongoing?: boolean;
        links?: Array<{ label: string; url: string }>;
        kind?: string;
    };
}

export interface GraphEdge {
    source: string;
    target: string;
}

function excerpt(content: string, max = 300): string {
    const clean = content.replace(/\s+/g, ' ').trim();
    return clean.length > max ? clean.slice(0, max) + '…' : clean;
}

// GET — the full mind-map
export async function GET() {
    await hydrateCustomKnowledge(); // owner-fed docs (Field Notes)
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // ----- center -----
    nodes.push({ id: 'center', label: 'SRUJAN', type: 'category', color: COLORS.center, size: 26 });

    // ----- hubs -----
    const hubs: Array<{ id: string; label: string; color: string }> = [
        { id: 'cat:AI', label: 'AI', color: COLORS.AI },
        { id: 'cat:Robotics', label: 'Robotics', color: COLORS.Robotics },
        { id: 'cat:Research', label: 'Research', color: COLORS.Research },
        { id: 'hub:skills', label: 'Skills', color: COLORS.skills },
        { id: 'hub:journey', label: 'Journey', color: COLORS.journey },
        { id: 'hub:writing', label: 'Writing', color: COLORS.writing },
        { id: 'hub:life', label: 'Life & Mind', color: COLORS.life },
        { id: 'hub:interests', label: 'Interests', color: COLORS.interests },
        { id: 'hub:clients', label: 'Client Voices', color: COLORS.clients },
    ];
    for (const h of hubs) {
        nodes.push({ id: h.id, label: h.label, type: 'category', color: h.color, size: 18 });
        edges.push({ source: h.id, target: 'center' });
    }

    // ----- tech hubs (shared by 3+ projects) -----
    const techCount = new Map<string, number>();
    for (const p of projects) for (const t of p.tech) techCount.set(t, (techCount.get(t) || 0) + 1);
    const topTech = Array.from(techCount.entries())
        .filter(([, n]) => n >= 3)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);
    const topTechSet = new Set(topTech.map(([t]) => t));
    for (const [tech, n] of topTech) {
        nodes.push({ id: `tech:${tech}`, label: tech, type: 'tech', color: COLORS.tech, size: 6 + Math.min(n, 10), hub: 'cat:AI' });
    }

    // ----- projects (rich details from projects.ts) -----
    for (const p of projects) {
        nodes.push({
            id: p.id,
            label: p.title.length > 34 ? p.title.slice(0, 32) + '…' : p.title,
            type: 'project',
            color: COLORS[p.category] || '#64748B',
            size: p.featured ? 11 : 7.5,
            hub: `cat:${p.category}`,
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
                kind: 'project',
            },
        });
        edges.push({ source: p.id, target: `cat:${p.category}` });
        for (const t of p.tech) {
            if (topTechSet.has(t)) edges.push({ source: p.id, target: `tech:${t}` });
        }
    }

    // ----- everything else from the chat's knowledge base -----
    const docs = buildKnowledgeBase();
    const hubFor: Record<string, { hub: string; color: string; kind: string }> = {
        skill: { hub: 'hub:skills', color: COLORS.skills, kind: 'skill area' },
        experience: { hub: 'hub:journey', color: COLORS.journey, kind: 'journey' },
        blog: { hub: 'hub:writing', color: COLORS.writing, kind: 'article' },
        persona: { hub: 'hub:life', color: COLORS.life, kind: 'life & mind' },
        testimonial: { hub: 'hub:clients', color: COLORS.clients, kind: 'client voice' },
        interest: { hub: 'hub:interests', color: COLORS.interests, kind: 'interest' },
    };

    for (const doc of docs) {
        const t = doc.metadata.type;
        if (t === 'project') continue; // already added with richer details
        if (doc.id === 'profile-rag-guidelines') continue; // internal instructions
        if (t === 'skill' && !doc.id.startsWith('skills-')) continue; // per-skill docs too granular — keep the 4 category docs

        if (t === 'status') {
            nodes.push({
                id: doc.id,
                label: 'Now — Status & Targets',
                type: 'doc',
                color: COLORS.now,
                size: 11,
                hub: 'center',
                detail: { description: excerpt(doc.content, 420), tech: doc.metadata.tags, kind: 'current status' },
            });
            edges.push({ source: doc.id, target: 'center' });
            continue;
        }

        const map = hubFor[t];
        if (!map) continue;
        const label = doc.metadata.title.replace(/^(Blog|Testimonial|Interest): /, '');
        nodes.push({
            id: doc.id,
            label: label.length > 32 ? label.slice(0, 30) + '…' : label,
            type: 'doc',
            color: map.color,
            size: 7.5,
            hub: map.hub,
            detail: {
                description: excerpt(doc.content),
                tech: (doc.metadata.tags || []).slice(0, 6),
                kind: map.kind,
            },
        });
        edges.push({ source: doc.id, target: map.hub });
    }

    // ----- owner-fed Field Notes (custom knowledge) -----
    const customDocs = getCustomKnowledgeDocuments();
    if (customDocs.length > 0) {
        nodes.push({ id: 'hub:notes', label: 'Field Notes', type: 'category', color: COLORS.notes, size: 16 });
        edges.push({ source: 'hub:notes', target: 'center' });
        for (const doc of customDocs) {
            nodes.push({
                id: doc.id,
                label: doc.metadata.title.length > 32 ? doc.metadata.title.slice(0, 30) + '…' : doc.metadata.title,
                type: 'doc',
                color: COLORS.notes,
                size: 7.5,
                hub: 'hub:notes',
                detail: {
                    description: excerpt(doc.content),
                    tech: (doc.metadata.tags || []).slice(0, 6),
                    kind: 'field note',
                },
            });
            edges.push({ source: doc.id, target: 'hub:notes' });
        }
    }

    return NextResponse.json({
        nodes,
        edges,
        stats: {
            projects: projects.length,
            techHubs: topTech.length,
            knowledgeDocs: nodes.filter(n => n.type === 'doc').length,
        },
    });
}

// POST { query } — light up the SAME knowledge the chat agent would retrieve.
export async function POST(request: Request) {
    try {
        const body = await request.json() as { query?: string };
        const query = (body.query || '').trim();
        if (query.length < 3 || query.length > 500) {
            return NextResponse.json({ error: 'Query must be 3–500 characters' }, { status: 400 });
        }

        await hydrateCustomKnowledge();
        const hits = searchKnowledgePublic(query, 14)
            // per-skill micro-docs aren't graph nodes; their category doc is
            .filter(h => !(h.type === 'skill' && !h.id.startsWith('skills-')))
            .filter(h => h.id !== 'profile-rag-guidelines');
        const top = hits[0]?.score || 1;

        return NextResponse.json({
            matches: hits.map(h => ({
                // project docs are graph nodes under their bare project id
                id: h.id.startsWith('project-') ? h.id.slice('project-'.length) : h.id,
                title: h.title,
                relevance: Math.max(5, Math.round((h.score / top) * 100)),
                kind: h.type,
            })),
        });
    } catch (e) {
        console.error('Knowledge graph query failed:', e);
        return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }
}
