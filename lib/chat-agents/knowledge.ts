/**
 * =============================================================================
 * KNOWLEDGE AGENT — real-time, self-improving retrieval for the AI chat
 * =============================================================================
 * Works like the resume retriever: scores the LIVE portfolio knowledge base
 * deterministically on every message — instant (~1ms), needs no API key, and
 * always reflects the current data files. Vector (embedding) search runs in
 * parallel as a time-boxed enhancement when a server embedding key exists;
 * whatever arrives in time gets merged.
 *
 * Self-improvement loop:
 *  - the knowledge base is rebuilt from live data on boot (new projects flow
 *    in automatically; embeddings sync in the background, see lib/rag.ts)
 *  - weak retrievals are logged as KNOWLEDGE GAPS (data/knowledge-gaps.json)
 *    and surfaced in the admin knowledge-graph page, so the owner can see
 *    exactly which questions the portfolio can't answer yet.
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';
import { buildKnowledgeBase, type KnowledgeDocument } from '@/lib/knowledge-base';
import { generateEmbedding } from '@/lib/embeddings';
import { getVectorStore } from '@/lib/vector-store';

const GAPS_FILE = path.join(process.cwd(), 'data', 'knowledge-gaps.json');
const VECTOR_TIMEOUT_MS = 900; // never let embeddings slow the chat down

// The knowledge base is pure in-memory assembly from imported data — cheap,
// but no need to redo it per message within one server instance.
let kbCache: KnowledgeDocument[] | null = null;
function knowledgeDocs(): KnowledgeDocument[] {
    if (!kbCache) kbCache = buildKnowledgeBase();
    return kbCache;
}

const STOPWORDS = new Set([
    'the', 'and', 'for', 'are', 'you', 'your', 'what', 'with', 'have', 'has', 'had',
    'about', 'tell', 'can', 'could', 'would', 'how', 'who', 'whats', 'did', 'does',
    'this', 'that', 'they', 'them', 'then', 'than', 'were', 'was', 'will', 'his',
    'her', 'its', 'any', 'all', 'out', 'not', 'but', 'into', 'over', 'more', 'some',
]);

function terms(message: string): string[] {
    return Array.from(new Set(
        message.toLowerCase()
            .replace(/[^a-z0-9+#.\s]/g, ' ')
            .split(/\s+/)
            .filter(t => t.length > 2 && !STOPWORDS.has(t)),
    )).slice(0, 16);
}

export interface KnowledgeHit {
    id: string;
    title: string;
    type: string;
    content: string;
    score: number;
}

/** Deterministic pass — instant, key-free, always-current. */
function deterministicSearch(message: string, topK: number): KnowledgeHit[] {
    const queryTerms = terms(message);
    if (queryTerms.length === 0) return [];

    const scored = knowledgeDocs().map(doc => {
        const content = doc.content.toLowerCase();
        const title = (doc.metadata.title || '').toLowerCase();
        let score = 0;
        for (const t of queryTerms) {
            if (title.includes(t)) score += 3;
            // cap per-term content contribution so one repeated word can't dominate
            const hits = content.split(t).length - 1;
            score += Math.min(hits, 4);
        }
        return { doc, score };
    }).filter(s => s.score >= 2)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);

    return scored.map(({ doc, score }) => ({
        id: doc.id,
        title: doc.metadata.title || doc.id,
        type: (doc.metadata as { type?: string }).type || 'doc',
        content: doc.content,
        score,
    }));
}

/** Vector pass — only contributes if it returns within the time box. */
async function vectorSearch(message: string, topK: number): Promise<KnowledgeHit[]> {
    const store = getVectorStore();
    if (store.getCount() === 0) return [];
    const embedding = await generateEmbedding(message); // throws without a key
    return store.search(embedding, topK).map(r => ({
        id: r.document.id,
        title: r.document.metadata.title || r.document.id,
        type: (r.document.metadata as { type?: string }).type || 'doc',
        content: r.document.content,
        score: r.score * 10, // scale to roughly match deterministic scores
    }));
}

export interface KnowledgeResult {
    hits: KnowledgeHit[];
    /** formatted block for the system prompt ('' when nothing relevant) */
    context: string;
    /** true → the portfolio had nothing solid for this question */
    weak: boolean;
}

/**
 * Run deterministic + vector retrieval in parallel and merge.
 * Never throws, never blocks longer than the vector time box.
 */
export async function retrieveKnowledge(message: string, topK = 5): Promise<KnowledgeResult> {
    const det = deterministicSearch(message, topK);

    let vec: KnowledgeHit[] = [];
    try {
        vec = await Promise.race([
            vectorSearch(message, topK),
            new Promise<KnowledgeHit[]>(resolve => setTimeout(() => resolve([]), VECTOR_TIMEOUT_MS)),
        ]);
    } catch { /* no embedding key / API hiccup — deterministic carries it */ }

    // Cosine similarity never approaches zero in high dimensions — even alien
    // queries score ~0.3-0.45 against everything. Treat sub-0.45 vector hits
    // as noise so they can't fake relevance for questions we can't answer.
    const vecSignal = vec.filter(h => h.score >= 4.5); // cosine ≥ 0.45 (scaled ×10)

    // Merge: dedupe by id, deterministic hits first (they're exact-term matches),
    // then meaningful vector hits fill remaining slots.
    const seen = new Set(det.map(h => h.id));
    const merged = [...det, ...vecSignal.filter(h => !seen.has(h.id))].slice(0, topK);

    // Weak = neither retrieval mode found real signal:
    // no strong exact-term match AND no vector hit above the relevance band.
    const weak = (det[0]?.score ?? 0) < 4 && (vec[0]?.score ?? 0) < 5.5;

    const context = merged.length === 0 ? '' : `
RELEVANT CONTEXT FROM PORTFOLIO:
================================
${merged.map((h, i) => `[Source ${i + 1}: ${h.title} (${h.type})]\n${h.content}`).join('\n\n---\n\n')}
================================

Use the above context to provide accurate, specific answers about Srujan's work.
If the context doesn't contain relevant information, say so honestly.`.trim();

    return { hits: merged, context, weak };
}

// =============================================================================
// KNOWLEDGE GAPS — the self-improvement signal
// =============================================================================

interface GapEntry {
    query: string;
    timestamp: string;
}

export function readKnowledgeGaps(): GapEntry[] {
    try {
        return (JSON.parse(fs.readFileSync(GAPS_FILE, 'utf-8')) as { gaps: GapEntry[] }).gaps || [];
    } catch {
        return [];
    }
}

/** Best-effort, never throws (read-only FS on Vercel just skips it). */
export function logKnowledgeGap(query: string): void {
    try {
        const gaps = readKnowledgeGaps();
        // skip near-duplicates of recent gaps
        const q = query.trim().slice(0, 200);
        if (gaps.slice(0, 20).some(g => g.query.toLowerCase() === q.toLowerCase())) return;
        gaps.unshift({ query: q, timestamp: new Date().toISOString() });
        fs.writeFileSync(GAPS_FILE, JSON.stringify({ gaps: gaps.slice(0, 200) }, null, 2));
    } catch { /* ephemeral host — fine */ }
}
