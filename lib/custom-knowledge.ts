/**
 * =============================================================================
 * CUSTOM KNOWLEDGE STORE — owner-fed documents for the knowledge base
 * =============================================================================
 * The owner can manually feed the AI's brain from the Knowledge Graph
 * section (password-gated): paste text or upload PDFs/DOCX. These docs join
 * the knowledge base — searched by the chat agent and rendered as "Field
 * Notes" nodes in the public 3D graph.
 *
 * Persistence mirrors the AI-providers config: Upstash KV when connected
 * (durable on Vercel), JSON file locally. A module-level snapshot gives the
 * SYNC knowledge-base code instant access; async entry points call
 * hydrateCustomKnowledge() to refresh it.
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';
import { kvGetJSON, kvSetJSON, kvConfigAvailable } from './ai-providers';
import type { KnowledgeDocument } from './knowledge-base';

const FILE = path.join(process.cwd(), 'data', 'custom-knowledge.json');
const KV_KEY = 'srujan:custom-knowledge';
const TTL_MS = 30_000;

export interface CustomDoc {
    id: string;
    title: string;
    content: string;
    tags: string[];
    sourceFile?: string;
    createdAt: string;
}

interface StoreShape { docs: CustomDoc[] }

let snapshot: CustomDoc[] = [];
let hydratedAt = 0;
let fileLoaded = false;

function readFileStore(): CustomDoc[] {
    try {
        return (JSON.parse(fs.readFileSync(FILE, 'utf-8')) as StoreShape).docs || [];
    } catch {
        return [];
    }
}

/** Refresh the in-memory snapshot (KV first, file fallback). Never throws. */
export async function hydrateCustomKnowledge(force = false): Promise<void> {
    if (!force && Date.now() - hydratedAt < TTL_MS && fileLoaded) return;
    if (kvConfigAvailable()) {
        const kv = await kvGetJSON<StoreShape>(KV_KEY);
        if (kv) {
            snapshot = kv.docs || [];
            hydratedAt = Date.now();
            fileLoaded = true;
            return;
        }
    }
    snapshot = readFileStore();
    hydratedAt = Date.now();
    fileLoaded = true;
}

/** Sync access to the current snapshot (call hydrate first in async paths). */
export function getCustomDocs(): CustomDoc[] {
    if (!fileLoaded) {
        snapshot = readFileStore();
        fileLoaded = true;
    }
    return snapshot;
}

/** As knowledge-base documents, ready for search + the graph. */
export function getCustomKnowledgeDocuments(): KnowledgeDocument[] {
    return getCustomDocs().map(d => ({
        id: `custom-${d.id}`,
        content: `${d.title}:\n${d.content}`,
        metadata: {
            title: d.title,
            type: 'custom' as const,
            tags: d.tags,
            source: d.sourceFile || 'owner-note',
        },
    }));
}

async function persist(docs: CustomDoc[]): Promise<'kv' | 'file'> {
    snapshot = docs;
    hydratedAt = Date.now();
    if (await kvSetJSON(KV_KEY, { docs })) {
        try { fs.writeFileSync(FILE, JSON.stringify({ docs }, null, 2)); } catch { /* read-only FS */ }
        return 'kv';
    }
    fs.writeFileSync(FILE, JSON.stringify({ docs }, null, 2)); // throws on read-only host without KV
    return 'file';
}

export async function addCustomDoc(input: {
    title: string; content: string; tags?: string[]; sourceFile?: string;
}): Promise<{ doc: CustomDoc; persistedTo: 'kv' | 'file' }> {
    await hydrateCustomKnowledge(true);
    const doc: CustomDoc = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: input.title.trim().slice(0, 120),
        content: input.content.trim().slice(0, 20_000),
        tags: (input.tags || []).map(t => t.trim()).filter(Boolean).slice(0, 10),
        ...(input.sourceFile ? { sourceFile: input.sourceFile.slice(0, 120) } : {}),
        createdAt: new Date().toISOString(),
    };
    const docs = [doc, ...getCustomDocs()].slice(0, 100); // bounded
    const persistedTo = await persist(docs);
    return { doc, persistedTo };
}

export async function deleteCustomDoc(id: string): Promise<boolean> {
    await hydrateCustomKnowledge(true);
    const docs = getCustomDocs();
    const next = docs.filter(d => d.id !== id);
    if (next.length === docs.length) return false;
    await persist(next);
    return true;
}
