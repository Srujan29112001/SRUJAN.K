/**
 * =============================================================================
 * CHAT API WITH RAG INTEGRATION
 * =============================================================================
 *
 * This API endpoint now uses Retrieval-Augmented Generation!
 *
 * Flow:
 * 1. Receive user message
 * 2. Retrieve relevant context from knowledge base (RAG)
 * 3. Inject context into system prompt
 * 4. Send to Gemini LLM (with retry logic for rate limits)
 * 5. Return grounded response
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiPersona, quickResponses } from '@/data/ai-persona';
import { getRAGContext, getRAGStatus, initializeRAG } from '@/lib/rag';
import { addMessageToSession } from '@/app/api/admin/chat-history/route';

// =============================================================================
// GEMINI API CONFIGURATION WITH MULTI-KEY ROTATION
// =============================================================================
// Model options (in order of preference for free tier):
// - gemini-2.0-flash: 15 RPM free tier, very fast
// - gemini-1.5-flash: 15 RPM free tier, good balance
// - gemini-2.5-flash: 20 RPM but can hit limits quickly
//
// For production with paid tier, gemini-2.5-flash or gemini-1.5-pro recommended
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Get all API keys (supports multiple keys for rotation)
function getApiKeys(): string[] {
    // First check for multiple keys
    const multipleKeys = process.env.GEMINI_API_KEYS;
    if (multipleKeys) {
        return multipleKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
    }
    // Fall back to single key
    const singleKey = process.env.GEMINI_API_KEY;
    return singleKey ? [singleKey] : [];
}

// Track rate-limited keys with cooldown timestamps
interface KeyStatus {
    rateLimitedUntil: number; // timestamp when key becomes available again
    failureCount: number;
}
const keyStatusMap = new Map<string, KeyStatus>();

// Rate limiting configuration
const MAX_RETRIES_PER_KEY = 1; // Try once per key before moving to next
const KEY_COOLDOWN_MS = 60000; // 60 second cooldown when rate limited
const INITIAL_RETRY_DELAY_MS = 2000; // Start with 2 seconds

// Simple in-memory rate limiter (per-instance, resets on restart)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 2000; // 2 seconds between requests (more aggressive with rotation)

// Get next available API key (skipping rate-limited ones)
function getNextAvailableKey(): { key: string; index: number } | null {
    const keys = getApiKeys();
    const now = Date.now();

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const status = keyStatusMap.get(key);

        // Check if key is available (not rate limited or cooldown expired)
        if (!status || status.rateLimitedUntil < now) {
            return { key, index: i };
        }
    }

    // All keys are rate limited - find the one that will be available soonest
    let soonestKey: { key: string; index: number; availableAt: number } | null = null;
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const status = keyStatusMap.get(key);
        const availableAt = status?.rateLimitedUntil || 0;

        if (!soonestKey || availableAt < soonestKey.availableAt) {
            soonestKey = { key, index: i, availableAt };
        }
    }

    return soonestKey ? { key: soonestKey.key, index: soonestKey.index } : null;
}

// Mark a key as rate limited
function markKeyRateLimited(key: string, retryAfterMs?: number) {
    const cooldown = retryAfterMs || KEY_COOLDOWN_MS;
    const status = keyStatusMap.get(key) || { rateLimitedUntil: 0, failureCount: 0 };
    status.rateLimitedUntil = Date.now() + cooldown;
    status.failureCount++;
    keyStatusMap.set(key, status);
    console.log(`🔑 Key ...${key.slice(-4)} rate limited for ${cooldown}ms (failures: ${status.failureCount})`);
}

// Reset key status on success
function markKeySuccess(key: string) {
    keyStatusMap.delete(key);
}

interface ChatRequest {
    message: string;
    history?: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
    offlineMode?: boolean; // When true, skip Gemini API and use RAG-only fallback
    sessionId?: string; // Optional session ID for tracking conversations
}

/**
 * Helper to wait for a specified time
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract retry delay from Gemini error response
 */
function extractRetryDelay(errorMessage: string): number {
    // Look for patterns like "retry in 2.915062078s" or "retry after 3 seconds"
    const match = errorMessage.match(/retry\s+(?:in|after)\s+([\d.]+)\s*s/i);
    if (match) {
        return Math.ceil(parseFloat(match[1]) * 1000) + 500; // Add 500ms buffer
    }
    return INITIAL_RETRY_DELAY_MS;
}

/**
 * Call Gemini API with automatic key rotation on rate limit errors
 * Tries all available keys before giving up
 */
async function callGeminiWithKeyRotation(
    requestBody: object
): Promise<{ success: boolean; data?: unknown; error?: string; keyUsed?: string }> {
    const keys = getApiKeys();

    if (keys.length === 0) {
        return { success: false, error: 'No API keys configured' };
    }

    let lastError = '';
    const triedKeys = new Set<string>();

    // Try up to keys.length * 2 times (allow retrying keys after cooldown)
    // With 12 keys, this gives 24 attempts max
    const maxAttempts = Math.min(keys.length * 2, 24);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const keyInfo = getNextAvailableKey();
        if (!keyInfo) {
            // No keys available, wait a bit and try again
            await sleep(INITIAL_RETRY_DELAY_MS);
            continue;
        }

        const { key, index } = keyInfo;

        // Rate limiting: ensure minimum interval between requests
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;
        if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
            await sleep(MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest);
        }
        lastRequestTime = Date.now();

        console.log(`🔑 Trying key ${index + 1}/${keys.length} (...${key.slice(-4)})`);

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                const data = await response.json();
                markKeySuccess(key);
                console.log(`✅ Success with key ${index + 1} (...${key.slice(-4)})`);
                return { success: true, data, keyUsed: `key${index + 1}` };
            }

            // Handle rate limit errors (429)
            if (response.status === 429) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = errorData.error?.message || 'Rate limit exceeded';
                lastError = errorMsg;

                // Extract retry delay from error message
                const retryDelay = extractRetryDelay(errorMsg);
                markKeyRateLimited(key, retryDelay);

                triedKeys.add(key);

                // If we haven't tried all keys yet, continue to next key immediately
                if (triedKeys.size < keys.length) {
                    console.log(`🔄 Switching to next available key...`);
                    continue;
                }

                // All keys tried, wait before retrying
                console.log(`⏳ All ${keys.length} keys rate limited. Waiting ${INITIAL_RETRY_DELAY_MS}ms...`);
                await sleep(INITIAL_RETRY_DELAY_MS);
                continue;
            }

            // Other errors - don't retry with different keys
            const errorData = await response.json().catch(() => ({ error: response.statusText }));
            return {
                success: false,
                error: errorData.error?.message || errorData.error || response.statusText,
            };
        } catch (fetchError) {
            lastError = fetchError instanceof Error ? fetchError.message : 'Network error';
            console.error(`Network error with key ${index + 1}:`, lastError);
            markKeyRateLimited(key, INITIAL_RETRY_DELAY_MS * 2); // Short cooldown for network errors
        }
    }

    return {
        success: false,
        error: `All ${keys.length} API keys exhausted. ${lastError}`,
    };
}

export async function POST(request: NextRequest) {
    let message = '';
    let ragContext = '';
    let sessionId = '';
    let userAgent = '';
    let ipAddress = '';

    try {
        const body: ChatRequest = await request.json();
        message = body.message;
        const history = body.history || [];
        const offlineMode = body.offlineMode || false; // ASA mode forces offline
        sessionId = body.sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Extract user info for logging
        userAgent = request.headers.get('user-agent') || 'Unknown';
        ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') ||
            'Unknown';

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // 🔍 RETRIEVE RELEVANT CONTEXT (RAG) - Always do this first
        try {
            // Initialize RAG system (loads from cache if available)
            await initializeRAG();

            // Get relevant context for this query
            ragContext = await getRAGContext(message, 5);
            console.log(`📚 RAG context length: ${ragContext.length} chars`);
        } catch (error) {
            console.error('RAG retrieval failed:', error);
            // Continue without RAG context
        }

        // 🔌 OFFLINE MODE (ASA Mode): Skip Gemini API, use RAG-only fallback
        if (offlineMode) {
            console.log('🔌 Offline mode enabled (ASA ON) - using RAG-only response');
            const offlineResponse = getFallbackResponse(message, ragContext, 'ASA Mode: Running offline with cached knowledge.');

            // 📝 Log to chat history
            try {
                addMessageToSession(sessionId, message, offlineResponse, 'offline', userAgent, ipAddress);
            } catch (e) {
                console.error('Failed to log chat history:', e);
            }

            return NextResponse.json({
                response: offlineResponse,
                source: 'offline',
                rag: ragContext.length > 0,
                mode: 'asa-offline',
                sessionId,
            });
        }

        // Check for API keys
        const apiKeys = getApiKeys();

        if (apiKeys.length === 0) {
            // Fallback to local responses if no API keys
            const localResponse = getFallbackResponse(message, ragContext);

            // 📝 Log to chat history
            try {
                addMessageToSession(sessionId, message, localResponse, 'local', userAgent, ipAddress);
            } catch (e) {
                console.error('Failed to log chat history:', e);
            }

            return NextResponse.json({
                response: localResponse,
                source: 'local',
                rag: ragContext.length > 0,
                sessionId,
            });
        }

        console.log(`🔐 ${apiKeys.length} API key(s) available for rotation`);

        // 🤖 BUILD ENHANCED SYSTEM PROMPT
        const systemPrompt = ragContext
            ? `${aiPersona.systemPrompt}\n\n${ragContext}`
            : aiPersona.systemPrompt;

        // Build request body for Gemini
        const requestBody = {
            contents: [
                // System instruction with optional RAG context
                {
                    role: 'user',
                    parts: [{ text: `SYSTEM INSTRUCTIONS:\n${systemPrompt}\n\nNow respond to messages as Srujan AI.` }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'Understood. I am Srujan AI, ready to assist visitors and represent K Srujan professionally. I will use the provided context to give accurate, specific answers.' }],
                },
                // Previous conversation history
                ...history,
                // Current message
                {
                    role: 'user',
                    parts: [{ text: message }],
                },
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
            safetySettings: [
                {
                    category: 'HARM_CATEGORY_HARASSMENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                },
                {
                    category: 'HARM_CATEGORY_HATE_SPEECH',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                },
                {
                    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                },
                {
                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                },
            ],
        };

        // 🚀 Call Gemini API with automatic key rotation on rate limits
        const result = await callGeminiWithKeyRotation(requestBody);

        if (!result.success) {
            // All retries failed - use fallback but with cleaner error message
            const userFriendlyError = result.error?.includes('quota')
                ? 'AI service is temporarily busy. Showing cached knowledge instead.'
                : 'AI service unavailable. Showing cached knowledge instead.';

            const fallbackResponse = getFallbackResponse(message, ragContext, userFriendlyError);

            // 📝 Log to chat history
            try {
                addMessageToSession(sessionId, message, fallbackResponse, 'local-fallback', userAgent, ipAddress);
            } catch (e) {
                console.error('Failed to log chat history:', e);
            }

            return NextResponse.json({
                response: fallbackResponse,
                source: 'local',
                apiError: true,
                rag: ragContext.length > 0,
                sessionId,
            });
        }

        // Extract the response text
        const data = result.data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiResponse) {
            const noResponseFallback = getFallbackResponse(message, ragContext);

            // 📝 Log to chat history
            try {
                addMessageToSession(sessionId, message, noResponseFallback, 'local-no-response', userAgent, ipAddress);
            } catch (e) {
                console.error('Failed to log chat history:', e);
            }

            return NextResponse.json({
                response: noResponseFallback,
                source: 'local',
                rag: ragContext.length > 0,
                sessionId,
            });
        }

        // 📝 Log successful Gemini response to chat history
        try {
            addMessageToSession(sessionId, message, aiResponse, 'gemini', userAgent, ipAddress);
        } catch (e) {
            console.error('Failed to log chat history:', e);
        }

        return NextResponse.json({
            response: aiResponse,
            source: 'gemini',
            model: GEMINI_MODEL,
            rag: ragContext.length > 0,
            sessionId,
        });

    } catch (error) {
        console.error('Chat API error:', error);

        const errorResponse = getFallbackResponse(message, ragContext, error instanceof Error ? error.message : String(error));

        // 📝 Log error response to chat history
        try {
            if (sessionId) {
                addMessageToSession(sessionId, message, errorResponse, 'error', userAgent, ipAddress);
            }
        } catch (e) {
            console.error('Failed to log chat history:', e);
        }

        return NextResponse.json(
            {
                error: 'Failed to process message',
                response: errorResponse,
                rag: false,
                sessionId,
            },
            { status: 500 }
        );
    }
}

// Fallback response generator when API is not available
function getFallbackResponse(message: string, context?: string, errorDetails?: string): string {
    const lowerMessage = message.toLowerCase();
    const errorInfo = errorDetails ? `\n\n(⚠️ Offline Mode: ${errorDetails})` : '';

    // PRIORITY 1: If we have RAG context, ALWAYS use it first
    // This ensures the rich knowledge base data is shown even when Gemini is offline
    if (context && context.length > 100) {
        // Extract the content between the header and footer
        const contentMatch = context.match(/={32}\n([\s\S]*?)\n={32}/);
        const mainContent = contentMatch ? contentMatch[1] : context;

        // Parse individual sources for better formatting
        const sourceBlocks = mainContent.split(/\n\n---\n\n/);
        const formattedSources: string[] = [];

        for (const block of sourceBlocks.slice(0, 3)) { // Limit to 3 sources
            const titleMatch = block.match(/\[Source \d+: ([^\]]+)\]/);
            const title = titleMatch ? titleMatch[1] : 'Knowledge Base';

            // Extract content after the title line
            const contentStart = block.indexOf('\n');
            if (contentStart !== -1) {
                const sourceContent = block.substring(contentStart + 1).trim();
                // Truncate if too long
                const truncated = sourceContent.length > 600
                    ? sourceContent.substring(0, 600) + '...'
                    : sourceContent;
                formattedSources.push(`**${title}**\n${truncated}`);
            }
        }

        if (formattedSources.length > 0) {
            return `I'm currently running in offline mode, but I found this relevant information from my knowledge base:\n\n${formattedSources.join('\n\n---\n\n')}${errorInfo}`;
        }

        // Fallback: Just show raw context if parsing fails
        const truncatedContext = mainContent.length > 1500
            ? mainContent.substring(0, 1500) + '...'
            : mainContent;
        return `I'm in offline mode, but here's what I found:\n\n${truncatedContext}${errorInfo}`;
    }

    // PRIORITY 2: Keyword-based quick responses (only when no RAG context available)

    // Greetings
    if (lowerMessage.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/)) {
        return quickResponses.greeting[Math.floor(Math.random() * quickResponses.greeting.length)];
    }

    // About - Only trigger if we didn't find specific context above
    if (lowerMessage.includes('about') || lowerMessage.includes('who are you') || lowerMessage.includes('tell me about')) {
        return quickResponses.aboutSrujan;
    }

    // Skills & Expertise
    if (lowerMessage.includes('skill') || lowerMessage.includes('expertise') || lowerMessage.includes('tech') || lowerMessage.includes('what can you do')) {
        return quickResponses.expertise;
    }

    // Work approach
    if (lowerMessage.includes('how') && (lowerMessage.includes('work') || lowerMessage.includes('approach') || lowerMessage.includes('solve'))) {
        return quickResponses.howIWork;
    }

    // Projects
    if (lowerMessage.includes('project') || lowerMessage.includes('portfolio') || lowerMessage.includes('work')) {
        return "I've worked on various exciting projects across AI/ML, robotics, and web development. Check out the main portfolio for detailed case studies, or ask me about specific types of projects you're interested in!";
    }

    // Freelance/Experience (specific to freelancing questions)
    if (lowerMessage.includes('freelanc') || (lowerMessage.includes('experience') && !lowerMessage.includes('user experience'))) {
        return `Since June 2023, I've been doing specialized freelance engineering alongside intensive consciousness research at Isha Foundation. Key clients include:

• **FinTech Innovations (USA)** - Built a Finance Copilot, a scalable intelligence layer for traders
• **MediCare AI** - Delivered a Clinical AI Copilot with 95% accuracy, HIPAA-compliant with GraphRAG
• **AeroSpace DY** - Created a full 3D orbital tracking system

This period wasn't a gap - it was 10-12 hour workdays building complex systems while exploring consciousness. My rates range from $50-120/hour depending on the domain (AI/ML, Computer Vision, Robotics, Web Dev).

Would you like specific details about my freelance rates or a particular project?`;
    }

    // Estimate/Cost
    if (lowerMessage.includes('estimate') || lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('budget') || lowerMessage.includes('quote')) {
        return quickResponses.projectInquiry;
    }

    // Booking
    if (lowerMessage.includes('book') || lowerMessage.includes('meet') || lowerMessage.includes('call') || lowerMessage.includes('schedule') || lowerMessage.includes('consultation')) {
        return quickResponses.booking;
    }

    // AI/ML specific
    if (lowerMessage.includes('ai') || lowerMessage.includes('machine learning') || lowerMessage.includes('deep learning') || lowerMessage.includes('neural')) {
        return "AI and Machine Learning are my primary areas of expertise! I work with computer vision, NLP, and deep learning frameworks like PyTorch. Whether it's building custom models, deploying ML pipelines, or integrating AI into existing systems - I love tackling these challenges. What specific AI/ML project do you have in mind?";
    }

    // Robotics specific
    if (lowerMessage.includes('robot') || lowerMessage.includes('ros') || lowerMessage.includes('autonomous')) {
        return "Robotics is one of my passions! I work with ROS2 for autonomous systems, sensor fusion, and robot perception. From indoor navigation to manipulation tasks, I enjoy bringing robots to life. What kind of robotics project are you thinking about?";
    }

    // Contact
    if (lowerMessage.includes('contact') || lowerMessage.includes('reach') || lowerMessage.includes('email')) {
        return "You can reach Srujan at contact@srujan.dev for serious inquiries. For a quicker response on project discussions, I recommend booking a call through the booking section below. You can also connect on LinkedIn, Twitter, or GitHub!";
    }

    // Thank you
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
        return "You're welcome! Feel free to ask if you have any more questions. If you're ready to discuss a project, I can help you estimate costs or book a consultation. 🚀";
    }

    // Default fallback
    return `Thanks for your message! I'm an AI assistant representing K Srujan. While I don't have a specific answer for that, I can help you with:

• **Learning about my work** - Ask about projects, skills, or expertise
• **Getting project estimates** - Use the calculator below or ask me
• **Booking a consultation** - I'll help you schedule a call
• **Understanding my approach** - Ask how I solve problems

What would you like to explore?`;
}

// Health check with RAG status
export async function GET() {
    const apiKeys = getApiKeys();
    const ragStatus = getRAGStatus();

    // Get status of each key
    const keyStatuses = apiKeys.map((key, i) => {
        const status = keyStatusMap.get(key);
        const isAvailable = !status || status.rateLimitedUntil < Date.now();
        return {
            key: `key${i + 1}`,
            masked: `...${key.slice(-4)}`,
            available: isAvailable,
            cooldownRemaining: status ? Math.max(0, status.rateLimitedUntil - Date.now()) : 0,
        };
    });

    return NextResponse.json({
        status: 'ok',
        mode: apiKeys.length > 0 ? 'gemini' : 'fallback',
        model: GEMINI_MODEL,
        apiKeys: {
            count: apiKeys.length,
            statuses: keyStatuses,
        },
        rateLimit: {
            minIntervalMs: MIN_REQUEST_INTERVAL_MS,
            keyCooldownMs: KEY_COOLDOWN_MS,
            effectiveRPM: Math.floor(60000 / MIN_REQUEST_INTERVAL_MS) * apiKeys.length,
        },
        rag: {
            enabled: ragStatus.initialized,
            documentCount: ragStatus.documentCount,
        },
        message: apiKeys.length > 0
            ? `Gemini API (${GEMINI_MODEL}) with ${apiKeys.length} key(s). RAG: ${ragStatus.documentCount} documents. Effective RPM: ~${Math.floor(60000 / MIN_REQUEST_INTERVAL_MS) * apiKeys.length}`
            : 'Running in fallback mode. Add API keys in admin settings.',
    });
}
