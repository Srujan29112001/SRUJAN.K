/**
 * =============================================================================
 * VECTOR STORE - In-Memory Search Engine
 * =============================================================================
 * 
 * 🎓 WHAT IS A VECTOR STORE?
 * --------------------------
 * A vector store is a database optimized for storing and searching vectors.
 * 
 * Traditional database: Search by exact match
 *   WHERE title = "YOLOv7"
 * 
 * Vector store: Search by semantic similarity
 *   "Find documents similar to 'object detection with deep learning'"
 *   → Returns YOLOv7 project even though exact words don't match!
 * 
 * 
 * 🏗️ ARCHITECTURE OPTIONS:
 * ------------------------
 * Production vector stores (not used here - require infrastructure):
 * - Pinecone, Weaviate, Milvus - Cloud-hosted, scalable
 * - Chroma, FAISS - Local, efficient for large datasets
 * 
 * Our approach (perfect for portfolios):
 * - In-memory array with JSON cache
 * - Zero infrastructure, zero cost
 * - Fast for <1000 documents
 * 
 * 
 * 🔍 SEARCH ALGORITHM:
 * -------------------
 * 1. Compute embedding of search query
 * 2. Calculate cosine similarity with ALL stored vectors
 * 3. Sort by similarity score
 * 4. Return top K results
 * 
 * This is "brute force" search - O(n) per query.
 * For large datasets, you'd use ANN (Approximate Nearest Neighbors).
 * =============================================================================
 */

import { cosineSimilarity } from './embeddings';
import { KnowledgeDocument } from './knowledge-base';
import * as fs from 'fs';
import * as path from 'path';

/**
 * A stored document with its embedding
 */
interface StoredDocument {
    id: string;
    content: string;
    embedding: number[];
    metadata: KnowledgeDocument['metadata'];
}

/**
 * Search result with similarity score
 */
export interface SearchResult {
    document: StoredDocument;
    score: number;  // 0-1, higher = more similar
}

/**
 * 📦 THE VECTOR STORE CLASS
 * 
 * Manages document storage and semantic search
 */
class VectorStore {
    private documents: StoredDocument[] = [];
    private cacheFile: string;

    constructor() {
        // Cache embeddings to avoid regenerating on every restart
        this.cacheFile = path.join(process.cwd(), 'data', 'embeddings-cache.json');
    }

    /**
     * Add a document to the store
     */
    addDocument(doc: StoredDocument): void {
        // Remove existing document with same ID (update)
        this.documents = this.documents.filter(d => d.id !== doc.id);
        this.documents.push(doc);
    }

    /**
     * Add multiple documents at once
     */
    addDocuments(docs: StoredDocument[]): void {
        for (const doc of docs) {
            this.addDocument(doc);
        }
    }

    /**
     * 🔍 SEMANTIC SEARCH
     * 
     * This is the core RAG functionality!
     * 
     * @param queryEmbedding - The vector representation of the search query
     * @param topK - Number of results to return (default: 5)
     * @param filter - Optional filter by document type
     */
    search(
        queryEmbedding: number[],
        topK: number = 5,
        filter?: { type?: string }
    ): SearchResult[] {
        let candidates = this.documents;

        // Apply type filter if specified
        if (filter?.type) {
            candidates = candidates.filter(d => d.metadata.type === filter.type);
        }

        // Calculate similarity for all candidates
        const results: SearchResult[] = candidates.map(doc => ({
            document: doc,
            score: cosineSimilarity(queryEmbedding, doc.embedding),
        }));

        // Sort by score (highest first) and take top K
        results.sort((a, b) => b.score - a.score);

        return results.slice(0, topK);
    }

    /**
     * 🔍 KEYWORD SEARCH (FALLBACK)
     * 
     * Used when embedding generation fails (offline mode).
     * Simple text matching against document content.
     */
    searchByKeyword(query: string, topK: number = 5): SearchResult[] {
        const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 3); // Only significant words

        if (terms.length === 0) return [];

        let candidates = this.documents.map(doc => {
            const contentLower = doc.content.toLowerCase();
            const metadataLower = JSON.stringify(doc.metadata).toLowerCase();
            let score = 0;

            // Simple scoring: +1 for each term found in content or metadata
            for (const term of terms) {
                if (contentLower.includes(term)) score += 1;
                if (metadataLower.includes(term)) score += 0.5;
            }

            return { document: doc, score: score > 0 ? 0.5 + (score * 0.1) : 0 }; // Base score 0.5 to pass filters
        });

        // Filter out zero scores
        const results = candidates.filter(r => r.score > 0);

        // Sort by score
        results.sort((a, b) => b.score - a.score);

        return results.slice(0, topK);
    }

    /**
     * Get all documents (for debugging)
     */
    getAllDocuments(): StoredDocument[] {
        return this.documents;
    }

    /**
     * Get document count
     */
    getCount(): number {
        return this.documents.length;
    }

    /**
     * 💾 SAVE TO CACHE
     * 
     * Embeddings are expensive to generate (API calls).
     * We cache them to JSON so they persist across restarts.
     */
    saveToCache(): void {
        try {
            const cacheDir = path.dirname(this.cacheFile);
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir, { recursive: true });
            }

            fs.writeFileSync(
                this.cacheFile,
                JSON.stringify(this.documents, null, 2)
            );
            console.log(`💾 Saved ${this.documents.length} documents to cache`);
        } catch (error) {
            console.error('Failed to save cache:', error);
        }
    }

    /**
     * 📂 LOAD FROM CACHE
     * 
     * On startup, load pre-computed embeddings if available.
     * Returns true if cache was loaded, false if no cache exists.
     */
    loadFromCache(): boolean {
        try {
            console.log(`📂 Looking for cache at: ${this.cacheFile}`);
            console.log(`📂 Current working directory: ${process.cwd()}`);

            if (fs.existsSync(this.cacheFile)) {
                const data = fs.readFileSync(this.cacheFile, 'utf-8');
                this.documents = JSON.parse(data);
                console.log(`📂 ✅ Loaded ${this.documents.length} documents from cache`);
                return true;
            } else {
                console.log(`📂 ⚠️ Cache file not found at: ${this.cacheFile}`);
            }
        } catch (error) {
            console.error('📂 ❌ Failed to load cache:', error);
        }
        return false;
    }

    /**
     * Clear all documents
     */
    clear(): void {
        this.documents = [];
    }

    /**
     * Check if a document exists
     */
    hasDocument(id: string): boolean {
        return this.documents.some(d => d.id === id);
    }
}

// 🌍 SINGLETON INSTANCE
// We use a single instance across the app for consistency
let vectorStoreInstance: VectorStore | null = null;

/**
 * Get the global vector store instance
 */
export function getVectorStore(): VectorStore {
    if (!vectorStoreInstance) {
        vectorStoreInstance = new VectorStore();
    }
    return vectorStoreInstance;
}

/**
 * Reset the vector store (for testing)
 */
export function resetVectorStore(): void {
    vectorStoreInstance = null;
}
