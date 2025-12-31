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

import { buildKnowledgeBase, KnowledgeDocument } from './knowledge-base';
import { generateEmbedding, generateEmbeddings } from './embeddings';
import { getVectorStore, SearchResult } from './vector-store';

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

    // Try to load from cache first
    if (vectorStore.loadFromCache()) {
        console.log(`✅ RAG initialized from cache in ${Date.now() - startTime}ms`);
        return;
    }

    // No cache - check if API key is available
    if (!process.env.GEMINI_API_KEY) {
        console.warn('⚠️ GEMINI_API_KEY not set - RAG will use fallback mode');
        return;
    }

    // Build knowledge base
    const documents = buildKnowledgeBase();

    // For first-time initialization, we'll do it in background
    // This prevents blocking the first chat request
    console.log(`📝 No cache found. Run 'npx ts-node scripts/generate-embeddings.ts' to pre-generate embeddings.`);
    console.log(`⚠️ RAG disabled until embeddings are cached.`);

    // Don't generate embeddings on-the-fly as it takes too long
    // User should run the script to generate embeddings
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
