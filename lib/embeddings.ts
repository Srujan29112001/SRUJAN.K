/**
 * =============================================================================
 * EMBEDDING SERVICE - Convert Text to Vectors
 * =============================================================================
 * 
 * 🎓 WHAT ARE EMBEDDINGS?
 * -----------------------
 * Embeddings are numerical representations of text that capture semantic meaning.
 * 
 * How it works:
 * 1. Text goes into a neural network (embedding model)
 * 2. The network outputs a fixed-size vector (array of numbers)
 * 3. Similar texts produce similar vectors
 * 
 * Example visualization (simplified to 2D):
 * 
 *     "Python programming"  •
 *                              \
 *                               \  "Coding in Python"
 *                                •
 *                           
 *     "Machine learning"  •----• "AI and ML"
 *     
 *     
 *                    • "Best pizza recipes"
 *                    (far away - different topic!)
 * 
 * 
 * 🔢 VECTOR DIMENSIONS
 * --------------------
 * Google's text-embedding-004 produces 768-dimensional vectors.
 * Each dimension captures some aspect of meaning.
 * 
 * 
 * 📊 COSINE SIMILARITY
 * --------------------
 * We compare vectors using "cosine similarity":
 * - 1.0 = Identical meaning
 * - 0.0 = Completely unrelated
 * - -1.0 = Opposite meaning
 * 
 * Formula: cos(θ) = (A · B) / (|A| × |B|)
 * 
 * It measures the angle between vectors, not the distance.
 * This makes it robust to text length differences.
 * =============================================================================
 */

// Google's embedding model endpoint
const EMBEDDING_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent';

/**
 * Generate embedding for a single text using Google's API
 * 
 * @param text - The text to embed
 * @returns A 768-dimensional vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is required for embeddings');
    }

    const response = await fetch(`${EMBEDDING_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'models/text-embedding-004',
            content: {
                parts: [{ text }],
            },
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('Embedding API error:', error);
        throw new Error(`Embedding API failed: ${response.status}`);
    }

    const data = await response.json();

    // The embedding is in data.embedding.values
    const embedding = data.embedding?.values;

    if (!embedding || !Array.isArray(embedding)) {
        throw new Error('Invalid embedding response');
    }

    return embedding;
}

/**
 * Generate embeddings for multiple texts (batch processing)
 * 
 * 🎓 WHY BATCH?
 * - More efficient API usage
 * - Reduces total request count
 * - Maintains rate limits
 * 
 * @param texts - Array of texts to embed
 * @returns Array of embeddings in same order
 */
export async function generateEmbeddings(
    texts: string[]
): Promise<number[][]> {
    // Process in parallel with rate limiting
    const batchSize = 5; // Google allows ~60 RPM, so be conservative
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);

        // Process batch in parallel
        const batchResults = await Promise.all(
            batch.map(text => generateEmbedding(text))
        );

        results.push(...batchResults);

        // Small delay between batches to respect rate limits
        if (i + batchSize < texts.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    return results;
}

/**
 * 🧮 COSINE SIMILARITY FUNCTION
 * 
 * This is the math that makes vector search work!
 * 
 * Given two vectors A and B:
 * similarity = (A · B) / (|A| × |B|)
 * 
 * Where:
 * - (A · B) is the dot product (sum of element-wise multiplication)
 * - |A| is the magnitude (sqrt of sum of squares)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
        throw new Error('Vectors must have same dimensions');
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        magnitudeA += a[i] * a[i];
        magnitudeB += b[i] * b[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Check if embedding API is available
 */
export async function checkEmbeddingHealth(): Promise<{
    available: boolean;
    message: string;
}> {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return {
                available: false,
                message: 'GEMINI_API_KEY not configured',
            };
        }

        // Test with a simple embedding
        await generateEmbedding('test');

        return {
            available: true,
            message: 'Embedding API is working',
        };
    } catch (error) {
        return {
            available: false,
            message: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
