/**
 * =============================================================================
 * RAG SERVICE - Retrieval-Augmented Generation Orchestrator
 * =============================================================================
 * 
 * 🎓 THE COMPLETE RAG PIPELINE
 * ----------------------------
 * This file ties together all the RAG components:
 * 
 * 1. INITIALIZATION (happens once on startup)
 *    ┌─────────────────────────────────────────────────────┐
 *    │  Load knowledge base documents (projects, skills)   │
 *    │              ↓                                      │
 *    │  Generate embeddings for each document              │
 *    │              ↓                                      │
 *    │  Store in vector store (with cache)                 │
 *    └─────────────────────────────────────────────────────┘
 * 
 * 2. QUERY TIME (happens for each user question)
 *    ┌─────────────────────────────────────────────────────┐
 *    │  User asks: "What YOLOv7 projects have you done?"   │
 *    │              ↓                                      │
 *    │  Generate embedding for the question                │
 *    │              ↓                                      │
 *    │  Search vector store for similar documents          │
 *    │              ↓                                      │
 *    │  Retrieve top 5 relevant documents                  │
 *    │              ↓                                      │
 *    │  Format as context for the LLM                      │
 *    │              ↓                                      │
 *    │  Send to Gemini: "Given this context: ... Answer:"  │
 *    │              ↓                                      │
 *    │  LLM generates accurate, grounded response          │
 *    └─────────────────────────────────────────────────────┘
 * 
 * 
 * 🎯 KEY BENEFIT: GROUNDED RESPONSES
 * -----------------------------------
 * Without RAG:
 *   "What's your experience with YOLOv7?"
 *   → Generic answer based on LLM's training data
 * 
 * With RAG:
 *   "What's your experience with YOLOv7?"
 *   → Retrieves: DRDO project, vehicle tracking, 89% mAP, Jetson deployment
 *   → Specific, accurate answer citing real portfolio work!
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';
import { buildKnowledgeBase, KnowledgeDocument } from './knowledge-base';
import { generateEmbedding, generateEmbeddings, EMBEDDING_MODEL } from './embeddings';
import { getVectorStore, SearchResult } from './vector-store';

// Tracks which embedding model produced the cache. Vectors from different
// models are NOT comparable — a model change invalidates everything.
const META_FILE = path.join(process.cwd(), 'data', 'embeddings-meta.json');

function readCacheModel(): string | null {
    try {
        return (JSON.parse(fs.readFileSync(META_FILE, 'utf-8')) as { model?: string }).model || null;
    } catch {
        return null;
    }
}

function writeCacheModel(): void {
    try {
        fs.writeFileSync(META_FILE, JSON.stringify({ model: EMBEDDING_MODEL, updatedAt: new Date().toISOString() }, null, 2));
    } catch (e) {
        console.warn('Could not write embeddings meta:', e instanceof Error ? e.message : e);
    }
}

// Track initialization state
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * 🚀 INITIALIZE THE RAG SYSTEM
 * 
 * This should be called once when the chat API starts.
 * It:
 * 1. Tries to load cached embeddings (fast path)
 * 2. If no cache, generates embeddings for all documents (slow path)
 * 
 * The slow path can take 30-60 seconds for ~100 documents.
 * That's why we cache!
 */
export async function initializeRAG(): Promise<void> {
    // Prevent double initialization
    if (isInitialized) {
        console.log('✅ RAG already initialized');
        return;
    }

    // If initialization is in progress, wait for it
    if (initializationPromise) {
        return initializationPromise;
    }

    initializationPromise = doInitialize();
    await initializationPromise;
    isInitialized = true;
}

async function doInitialize(): Promise<void> {
    console.log('🔧 Initializing RAG system...');
    const startTime = Date.now();

    const vectorStore = getVectorStore();

    // Load whatever cache exists (may be partial or stale — we diff below)
    vectorStore.loadFromCache();

    // Model-version check: if the cache was produced by a different embedding
    // model, every vector in it is incomparable garbage — drop them all so the
    // incremental sync below re-embeds from scratch.
    const cacheModel = readCacheModel();
    if (vectorStore.getCount() > 0 && cacheModel !== EMBEDDING_MODEL) {
        console.warn(`♻️ Embeddings cache was built with "${cacheModel || 'unknown'}", current model is "${EMBEDDING_MODEL}" — full re-embed required.`);
        vectorStore.clear();
    }

    // 🔄 INCREMENTAL AUTO-SYNC (Phase 3)
    // Rebuild the knowledge base from the live data files and embed only the
    // documents that are NEW or whose content CHANGED since the cache was
    // written. Adding a project to data/projects.ts therefore flows into the
    // chatbot's knowledge automatically on the next boot — no manual script.
    try {
        const documents = buildKnowledgeBase();
        const existing = new Map(vectorStore.getAllDocuments().map(d => [d.id, d.content]));
        const stale = documents.filter(doc => existing.get(doc.id) !== doc.content);

        if (stale.length === 0) {
            console.log(`✅ RAG up to date — ${vectorStore.getCount()} docs (${Date.now() - startTime}ms)`);
            return;
        }

        if (!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEYS) {
            console.warn(`⚠️ ${stale.length} knowledge doc(s) changed but no GEMINI key for embeddings — using cached docs + keyword fallback.`);
            return;
        }

        // Bounded batch so a serverless cold start never times out; the rest
        // syncs on subsequent boots. Locally, RAG_SYNC_BATCH can be raised to
        // regenerate the whole cache in one go (then commit the cache file).
        const BATCH_LIMIT = parseInt(process.env.RAG_SYNC_BATCH || '24');
        const toEmbed = stale.slice(0, BATCH_LIMIT);
        console.log(`🔄 Embedding ${toEmbed.length}/${stale.length} new/changed knowledge doc(s)…`);

        let embedded = 0;
        for (const doc of toEmbed) {
            try {
                const embedding = await generateEmbedding(doc.content);
                vectorStore.addDocument({
                    id: doc.id,
                    content: doc.content,
                    embedding,
                    metadata: doc.metadata,
                });
                embedded++;
                // ~100 RPM free-tier limit on the embedding API: big (local regen)
                // batches need ≥600ms gaps; small serverless syncs can go faster.
                await new Promise(r => setTimeout(r, toEmbed.length > 50 ? 650 : 150));
            } catch (e) {
                console.warn(`⚠️ Embedding failed for "${doc.id}" — stopping batch:`, e instanceof Error ? e.message : e);
                break; // likely rate-limited; keep what we got, retry next boot
            }
        }

        if (embedded > 0) {
            vectorStore.saveToCache();
            writeCacheModel();
            console.log(`✅ RAG synced: +${embedded} docs, ${vectorStore.getCount()} total (${Date.now() - startTime}ms)`);
        }
    } catch (e) {
        console.error('RAG auto-sync failed (continuing with cached docs):', e);
    }
}

/**
 * 🔍 RETRIEVE RELEVANT CONTEXT
 * 
 * Given a user query, find the most relevant documents.
 * 
 * @param query - The user's question
 * @param topK - Number of documents to retrieve (default: 5)
 * @returns Array of relevant documents with scores
 */
export async function retrieveContext(
    query: string,
    topK: number = 5
): Promise<SearchResult[]> {
    // Ensure RAG is initialized
    await initializeRAG();

    const vectorStore = getVectorStore();

    // If no documents loaded, return empty
    if (vectorStore.getCount() === 0) {
        console.warn('⚠️ Vector store is empty');
        return [];
    }

    try {
        // Generate embedding for the query
        // This might fail if API is offline
        const queryEmbedding = await generateEmbedding(query);

        // Search for similar documents
        const results = vectorStore.search(queryEmbedding, topK);

        // Log for debugging
        console.log(`🔍 Retrieved ${results.length} documents for: "${query.substring(0, 50)}..."`);
        results.forEach((r, i) => {
            console.log(`   ${i + 1}. [${r.score.toFixed(3)}] ${r.document.metadata.title}`);
        });

        // If vector search returned nothing (e.g. all filtered out), try keyword fallback
        if (results.length === 0) {
            console.log('⚠️ Vector search returned 0 results. Falling back to Keyword Search...');
            return vectorStore.searchByKeyword(query, topK);
        }

        return results;
    } catch (error) {
        console.warn('⚠️ Vector retrieval failed (likely API timeout). Falling back to Keyword Search...', error);
        // Fallback to keyword search if embedding generation fails
        return vectorStore.searchByKeyword(query, topK);
    }
}

/**
 * 📝 FORMAT CONTEXT FOR LLM PROMPT
 * 
 * Converts retrieved documents into a string that can be
 * injected into the LLM's system prompt.
 * 
 * Good formatting is crucial for RAG quality!
 */
export function formatContextForPrompt(results: SearchResult[]): string {
    if (results.length === 0) {
        return '';
    }

    // NO THRESHOLD for now - we want to force context to appear for debugging
    // This ensures fallback mode always has data to work with
    const relevantResults = results; // results.filter(r => r.score > 0.25);

    if (relevantResults.length === 0) {
        return '';
    }

    const contextParts = relevantResults.map((r, i) => {
        const doc = r.document;
        return `
[Source ${i + 1}: ${doc.metadata.title} (${doc.metadata.type})]
${doc.content}
`.trim();
    });

    return `
RELEVANT CONTEXT FROM PORTFOLIO:
================================
${contextParts.join('\n\n---\n\n')}
================================

Use the above context to provide accurate, specific answers about Srujan's work.
If the context doesn't contain relevant information, say so honestly.
`.trim();
}

/**
 * 🎯 COMPLETE RAG QUERY
 * 
 * Convenience function that does retrieval and formatting in one call.
 */
export async function getRAGContext(
    query: string,
    topK: number = 5
): Promise<string> {
    const results = await retrieveContext(query, topK);
    return formatContextForPrompt(results);
}

/**
 * Check RAG system status
 */
export function getRAGStatus(): {
    initialized: boolean;
    documentCount: number;
} {
    const vectorStore = getVectorStore();
    return {
        initialized: isInitialized,
        documentCount: vectorStore.getCount(),
    };
}

/**
 * Force re-initialization (useful for updating embeddings)
 */
export async function reinitializeRAG(): Promise<void> {
    isInitialized = false;
    initializationPromise = null;
    getVectorStore().clear();
    await initializeRAG();
}
