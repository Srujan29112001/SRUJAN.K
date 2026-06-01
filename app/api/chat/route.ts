/**
 * =============================================================================
 * CHAT API — RAG + STREAMING + MULTI-TURN MEMORY
 * =============================================================================
 *
 * Flow:
 *   1. Receive user message + sessionId
 *   2. Retrieve relevant context from knowledge base (RAG)
 *   3. Load prior turns for sessionId (multi-turn memory)
 *   4. Stream Gemini response via SSE  (?stream=1)  — primary path
 *      OR return JSON               (offlineMode / non-stream clients)
 *   5. Persist the full assistant reply to chat-history once stream completes
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiPersona, quickResponses } from '@/data/ai-persona';
import { getRAGContext, getRAGStatus, initializeRAG } from '@/lib/rag';
import { addMessageToSession, getChatHistory } from '@/app/api/admin/chat-history/route';

// =============================================================================
// CONFIG
// =============================================================================
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

// Optional fallback chain — only used if you EXPLICITLY set GEMINI_MODEL_FALLBACKS
// (comma-separated). Without it, requests stay on the configured model and just
// retry on transient 503s. This avoids auto-falling back to models the keys may
// not have access to under free tier.
//
// Example: GEMINI_MODEL_FALLBACKS=gemini-2.5-flash-lite,gemini-1.5-flash
const MODEL_FALLBACK_CHAIN: string[] = (() => {
    const fromEnv = (process.env.GEMINI_MODEL_FALLBACKS || '')
        .split(',').map(s => s.trim()).filter(Boolean);
    return [GEMINI_MODEL, ...fromEnv].filter((m, i, a) => a.indexOf(m) === i);
})();

// On a transient 503 ("model overloaded") we retry the SAME model this many times
// before failing. Each retry waits 1.5s.
const SAME_MODEL_503_RETRIES = 2;

const generateUrl = (model: string) =>
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
const streamUrl = (model: string) =>
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent`;

// How many prior message *pairs* to replay back to the model
const HISTORY_TURN_PAIRS = 4; // last 4 user/assistant pairs ≈ 8 messages
// Per-message cap when loading history (chars). Prevents long bot replies from
// bloating request bodies and burning input-token quota.
const HISTORY_MESSAGE_MAX_CHARS = 800;

function getApiKeys(): string[] {
    const multipleKeys = process.env.GEMINI_API_KEYS;
    if (multipleKeys) {
        return multipleKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
    }
    const singleKey = process.env.GEMINI_API_KEY;
    return singleKey ? [singleKey] : [];
}

interface KeyStatus {
    rateLimitedUntil: number;
    failureCount: number;
}
const keyStatusMap = new Map<string, KeyStatus>();

const KEY_COOLDOWN_MS = 60000;
const INITIAL_RETRY_DELAY_MS = 2000;
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 2000;

function getNextAvailableKey(): { key: string; index: number } | null {
    const keys = getApiKeys();
    const now = Date.now();
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const status = keyStatusMap.get(key);
        if (!status || status.rateLimitedUntil < now) return { key, index: i };
    }
    let soonest: { key: string; index: number; availableAt: number } | null = null;
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const availableAt = keyStatusMap.get(key)?.rateLimitedUntil || 0;
        if (!soonest || availableAt < soonest.availableAt) soonest = { key, index: i, availableAt };
    }
    return soonest ? { key: soonest.key, index: soonest.index } : null;
}

function markKeyRateLimited(key: string, retryAfterMs?: number) {
    const cooldown = retryAfterMs || KEY_COOLDOWN_MS;
    const status = keyStatusMap.get(key) || { rateLimitedUntil: 0, failureCount: 0 };
    status.rateLimitedUntil = Date.now() + cooldown;
    status.failureCount++;
    keyStatusMap.set(key, status);
    console.log(`🔑 Key ...${key.slice(-4)} rate limited for ${cooldown}ms (failures: ${status.failureCount})`);
}

function markKeySuccess(key: string) { keyStatusMap.delete(key); }

interface ChatRequest {
    message: string;
    history?: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
    offlineMode?: boolean;
    sessionId?: string;
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function extractRetryDelay(errorMessage: string): number {
    const match = errorMessage.match(/retry\s+(?:in|after)\s+([\d.]+)\s*s/i);
    if (match) return Math.ceil(parseFloat(match[1]) * 1000) + 500;
    return INITIAL_RETRY_DELAY_MS;
}

// =============================================================================
// MULTI-TURN MEMORY — load prior turns for this session from chat-history.json
// =============================================================================
function loadPriorTurns(sessionId: string): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
    if (!sessionId) return [];
    try {
        const data = getChatHistory();
        const session = data.sessions.find(s => s.id === sessionId);
        if (!session || session.messages.length === 0) return [];

        // Take the last (HISTORY_TURN_PAIRS * 2) messages, oldest-first
        const recent = session.messages.slice(-HISTORY_TURN_PAIRS * 2);

        // Convert to Gemini format, truncating long messages to stay within token budget
        return recent.map(m => {
            const content = m.content.length > HISTORY_MESSAGE_MAX_CHARS
                ? m.content.slice(0, HISTORY_MESSAGE_MAX_CHARS) + '…'
                : m.content;
            return {
                role: m.role === 'assistant' ? 'model' as const : 'user' as const,
                parts: [{ text: content }],
            };
        });
    } catch (e) {
        console.error('Failed to load prior turns:', e);
        return [];
    }
}

// =============================================================================
// PROMPT BUILDER
// =============================================================================
function buildSystemPrompt(ragContext: string): string {
    if (ragContext && ragContext.length > 0) {
        return `${aiPersona.systemPrompt}

---
Relevant memory from your portfolio for this question:

${ragContext}
---`;
    }
    // No RAG hits — tell the model honestly so it doesn't fabricate
    return `${aiPersona.systemPrompt}

---
Note: nothing specific in your portfolio knowledge base matches this question. If it's about your work, say plainly that you haven't done that specifically and offer the closest related thing if any. If it's small talk or off-topic, just respond naturally as yourself.
---`;
}

function buildContents(
    systemPrompt: string,
    history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
    userMessage: string,
) {
    return [
        // Persona / context as a synthetic first turn
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Got it.' }] },
        // Real conversation history
        ...history,
        // Current message
        { role: 'user', parts: [{ text: userMessage }] },
    ];
}

const generationConfig = {
    temperature: 0.85, // a touch warmer for conversational feel
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
};

const safetySettings = [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
];

function isModelOverloaded(status: number): boolean {
    return status === 503 || status === 502 || status === 500;
}

// =============================================================================
// NON-STREAM CALL
// Strategy: try the configured model, retry SAME model on 503, only walk the
// fallback chain if user explicitly configured one via GEMINI_MODEL_FALLBACKS.
// =============================================================================
async function callGeminiOnce(
    requestBody: object,
): Promise<{ success: boolean; data?: unknown; error?: string; keyUsed?: string; modelUsed?: string }> {
    const keys = getApiKeys();
    if (keys.length === 0) return { success: false, error: 'No API keys configured' };

    let lastError = '';

    for (const model of MODEL_FALLBACK_CHAIN) {
        const triedKeys = new Set<string>();
        const maxAttempts = Math.min(keys.length * 2, 24);
        let consecutive503 = 0;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const keyInfo = getNextAvailableKey();
            if (!keyInfo) { await sleep(INITIAL_RETRY_DELAY_MS); continue; }
            const { key, index } = keyInfo;

            const since = Date.now() - lastRequestTime;
            if (since < MIN_REQUEST_INTERVAL_MS) await sleep(MIN_REQUEST_INTERVAL_MS - since);
            lastRequestTime = Date.now();

            console.log(`🔑 [${model}] key ${index + 1}/${keys.length} (...${key.slice(-4)})`);
            try {
                const response = await fetch(`${generateUrl(model)}?key=${key}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                });
                if (response.ok) {
                    const data = await response.json();
                    markKeySuccess(key);
                    return { success: true, data, keyUsed: `key${index + 1}`, modelUsed: model };
                }
                if (response.status === 429) {
                    const errData = await response.json().catch(() => ({}));
                    const errMsg = errData.error?.message || 'Rate limit exceeded';
                    lastError = errMsg;
                    markKeyRateLimited(key, extractRetryDelay(errMsg));
                    triedKeys.add(key);
                    if (triedKeys.size < keys.length) continue;
                    await sleep(INITIAL_RETRY_DELAY_MS);
                    continue;
                }
                if (isModelOverloaded(response.status)) {
                    const rawBody = await response.text().catch(() => '');
                    consecutive503++;
                    lastError = `${model} ${response.status}: ${rawBody.slice(0, 200)}`;
                    if (consecutive503 <= SAME_MODEL_503_RETRIES) {
                        console.warn(`⚠️ [${model}] ${response.status} (try ${consecutive503}/${SAME_MODEL_503_RETRIES}) — retrying same model after backoff`);
                        await sleep(1500 * consecutive503); // 1.5s, 3s
                        continue;
                    }
                    // Same model wouldn't recover — break to try next model in chain (only if user configured one)
                    console.warn(`⚠️ [${model}] persistent 503 after ${consecutive503} tries — moving on`);
                    break;
                }
                const rawBody = await response.text().catch(() => '<unreadable>');
                let parsedMsg = rawBody;
                try { parsedMsg = JSON.parse(rawBody)?.error?.message || rawBody; } catch {}
                return { success: false, error: `Gemini ${response.status}: ${parsedMsg}` };
            } catch (e) {
                lastError = e instanceof Error ? e.message : 'Network error';
                console.error(`❌ [${model}] network error on key ${index + 1}:`, lastError);
            }
        }
    }
    return { success: false, error: lastError || 'Gemini request failed' };
}

// =============================================================================
// STREAMING CALL — returns a ReadableStream<string> of text deltas
// Strategy: try the configured model, retry SAME model on 503, only walk the
// fallback chain if user explicitly configured one via GEMINI_MODEL_FALLBACKS.
// =============================================================================
async function callGeminiStream(requestBody: object): Promise<
    | { success: true; stream: ReadableStream<string>; keyUsed: string; modelUsed: string }
    | { success: false; error: string }
> {
    const keys = getApiKeys();
    if (keys.length === 0) return { success: false, error: 'No API keys configured' };

    let lastError = '';

    for (const model of MODEL_FALLBACK_CHAIN) {
        const triedKeys = new Set<string>();
        const maxAttempts = Math.min(keys.length * 2, 24);
        let consecutive503 = 0;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const keyInfo = getNextAvailableKey();
            if (!keyInfo) { await sleep(INITIAL_RETRY_DELAY_MS); continue; }
            const { key, index } = keyInfo;

            const since = Date.now() - lastRequestTime;
            if (since < MIN_REQUEST_INTERVAL_MS) await sleep(MIN_REQUEST_INTERVAL_MS - since);
            lastRequestTime = Date.now();

            console.log(`🔑 [stream:${model}] key ${index + 1}/${keys.length} (...${key.slice(-4)})`);
            try {
                const response = await fetch(`${streamUrl(model)}?alt=sse&key=${key}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                });

                if (response.ok && response.body) {
                    markKeySuccess(key);
                    console.log(`✅ [stream:${model}] OK with key ${index + 1}`);
                    const stream = parseGeminiSSE(response.body);
                    return { success: true, stream, keyUsed: `key${index + 1}`, modelUsed: model };
                }

                if (response.status === 429) {
                    const errData = await response.json().catch(() => ({}));
                    const errMsg = errData.error?.message || 'Rate limit exceeded';
                    console.warn(`⚠️ [stream:${model}] key ${index + 1} hit 429: ${errMsg}`);
                    lastError = errMsg;
                    markKeyRateLimited(key, extractRetryDelay(errMsg));
                    triedKeys.add(key);
                    if (triedKeys.size < keys.length) continue;
                    await sleep(INITIAL_RETRY_DELAY_MS);
                    continue;
                }

                if (isModelOverloaded(response.status)) {
                    const rawBody = await response.text().catch(() => '');
                    consecutive503++;
                    lastError = `${model} ${response.status}: ${rawBody.slice(0, 200)}`;
                    if (consecutive503 <= SAME_MODEL_503_RETRIES) {
                        console.warn(`⚠️ [stream:${model}] ${response.status} (try ${consecutive503}/${SAME_MODEL_503_RETRIES}) — retrying same model after backoff`);
                        await sleep(1500 * consecutive503);
                        continue;
                    }
                    console.warn(`⚠️ [stream:${model}] persistent 503 — moving on`);
                    break;
                }

                const rawBody = await response.text().catch(() => '<unreadable>');
                console.error(`❌ [stream:${model}] ${response.status} ${response.statusText}: ${rawBody.slice(0, 500)}`);
                let parsedMsg = rawBody;
                try { parsedMsg = JSON.parse(rawBody)?.error?.message || rawBody; } catch {}
                return { success: false, error: `Gemini ${response.status}: ${parsedMsg}` };
            } catch (e) {
                lastError = e instanceof Error ? e.message : 'Network error';
                console.error(`❌ [stream:${model}] network error on key ${index + 1}:`, lastError);
            }
        }
    }
    return { success: false, error: lastError || 'Gemini stream request failed' };
}

/**
 * Convert Gemini's SSE stream into a stream of text deltas.
 * Each SSE event has shape:  data: {"candidates":[{"content":{"parts":[{"text":"..."}]}}]}
 */
function parseGeminiSSE(body: ReadableStream<Uint8Array>): ReadableStream<string> {
    const decoder = new TextDecoder();
    let buffer = '';
    let eventCount = 0;
    let textChunkCount = 0;

    const processBuffer = (controller: ReadableStreamDefaultController<string>, flushIncomplete = false) => {
        // Gemini SSE may use \r\n\r\n (CRLF) on some networks/proxies; normalise first
        // so the split below works regardless of line ending style.
        const normalised = buffer.replace(/\r\n/g, '\n');
        const events = normalised.split('\n\n');
        if (!flushIncomplete) buffer = events.pop() || '';
        else buffer = '';

        for (const event of events) {
            if (!event.trim()) continue;
            eventCount++;
            const line = event.split('\n').find(l => l.startsWith('data:'));
            if (!line) {
                console.warn(`[parseGeminiSSE] event #${eventCount} has no data: line:`, event.slice(0, 200));
                continue;
            }
            const json = line.slice(5).trim();
            if (!json || json === '[DONE]') continue;
            try {
                const parsed = JSON.parse(json) as {
                    candidates?: Array<{
                        content?: { parts?: Array<{ text?: string }> };
                        finishReason?: string;
                        safetyRatings?: unknown;
                    }>;
                    promptFeedback?: { blockReason?: string };
                };

                if (parsed.promptFeedback?.blockReason) {
                    console.warn(`[parseGeminiSSE] prompt blocked: ${parsed.promptFeedback.blockReason}`);
                    controller.enqueue(`(I can't respond to that — flagged by safety filter: ${parsed.promptFeedback.blockReason})`);
                    continue;
                }

                const cand = parsed.candidates?.[0];
                const text = cand?.content?.parts?.[0]?.text;
                if (text) {
                    textChunkCount++;
                    controller.enqueue(text);
                } else if (cand?.finishReason && cand.finishReason !== 'STOP') {
                    console.warn(`[parseGeminiSSE] finishReason: ${cand.finishReason}`, cand.safetyRatings);
                }
            } catch (e) {
                console.warn('[parseGeminiSSE] JSON parse fail:', json.slice(0, 200), e);
            }
        }
    };

    return new ReadableStream<string>({
        async start(controller) {
            const reader = body.getReader();
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    processBuffer(controller);
                }
                // Flush any trailing event that didn't end with \n\n
                if (buffer.trim()) processBuffer(controller, true);
                console.log(`[parseGeminiSSE] done — ${eventCount} events, ${textChunkCount} text chunks`);
                controller.close();
            } catch (e) {
                console.error('[parseGeminiSSE] reader error:', e);
                controller.error(e);
            }
        },
    });
}

// =============================================================================
// OFFLINE FALLBACK — used when no API keys / API down / offlineMode flag
//
// PRIVACY: never dump raw RAG context here. The knowledge base contains personal
// info (email, phone, address) that should ONLY be exposed via LLM-mediated answers
// where the persona prompt controls what gets shared. Without the LLM as a filter,
// we keep responses short and direct the user to retry.
// =============================================================================
function classifyError(details?: string): {
    userMessage: string;
    showError: boolean;
} {
    if (!details) return { userMessage: '', showError: false };
    const d = details.toLowerCase();
    if (d.includes('quota') || d.includes('exceeded')) {
        return { userMessage: 'daily quota reached — try again tomorrow or check API billing', showError: true };
    }
    if (d.includes('overloaded') || d.includes('high demand') || d.includes('503')) {
        return { userMessage: 'AI is overloaded right now — give it a minute and retry', showError: true };
    }
    if (d.includes('asa mode')) {
        return { userMessage: 'ASA offline mode', showError: false };
    }
    if (d.includes('no api key')) {
        return { userMessage: 'no API key configured', showError: true };
    }
    return { userMessage: 'AI service temporarily unavailable', showError: true };
}

function getOfflineResponse(message: string, _ragContext: string, errorDetails?: string): string {
    void _ragContext; // intentionally unused — see PRIVACY note above
    const { userMessage, showError } = classifyError(errorDetails);
    const errorTag = showError ? `\n\n_(${userMessage})_` : '';

    const lower = message.toLowerCase().trim();
    if (/^(hi|hello|hey|yo)\b/.test(lower)) {
        return quickResponses.greeting[Math.floor(Math.random() * quickResponses.greeting.length)] + errorTag;
    }
    if (lower.includes('book') || lower.includes('call') || lower.includes('meet') || lower.includes('schedule')) {
        return quickResponses.booking + errorTag;
    }
    if (lower.includes('cost') || lower.includes('price') || lower.includes('estimate') || lower.includes('budget')) {
        return quickResponses.projectInquiry + errorTag;
    }
    if (showError) {
        return `Can't reach the AI right now. ${userMessage.charAt(0).toUpperCase() + userMessage.slice(1)}. Try again in a moment.`;
    }
    return `I'm temporarily offline. Try asking again in a moment — or use the booking widget below if you want to reach me directly.${errorTag}`;
}

// =============================================================================
// HANDLER
// =============================================================================
export async function POST(request: NextRequest) {
    const wantsStream = request.nextUrl.searchParams.get('stream') === '1'
        || request.headers.get('accept')?.includes('text/event-stream');

    let message = '';
    let ragContext = '';
    let sessionId = '';
    let userAgent = '';
    let ipAddress = '';

    try {
        const body: ChatRequest = await request.json();
        message = body.message;
        const offlineMode = body.offlineMode || false;
        sessionId = body.sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        userAgent = request.headers.get('user-agent') || 'Unknown';
        ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || request.headers.get('x-real-ip')
            || 'Unknown';

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // 🔍 RAG retrieval
        try {
            await initializeRAG();
            ragContext = await getRAGContext(message, 5);
            console.log(`📚 RAG context length: ${ragContext.length} chars`);
        } catch (e) {
            console.error('RAG retrieval failed:', e);
        }

        // 🧠 Multi-turn memory (server-side load by sessionId)
        const priorTurns = loadPriorTurns(sessionId);
        if (priorTurns.length > 0) console.log(`💬 Loaded ${priorTurns.length} prior turns for ${sessionId.slice(-8)}`);

        const systemPrompt = buildSystemPrompt(ragContext);
        const requestBody = {
            contents: buildContents(systemPrompt, priorTurns, message),
            generationConfig,
            safetySettings,
        };

        const apiKeys = getApiKeys();

        // ============ OFFLINE / NO-KEY PATH ============
        if (offlineMode || apiKeys.length === 0) {
            const offline = getOfflineResponse(
                message,
                ragContext,
                offlineMode ? 'ASA mode' : 'no API key configured',
            );
            try { addMessageToSession(sessionId, message, offline, offlineMode ? 'offline' : 'local', userAgent, ipAddress); } catch {}
            if (wantsStream) return streamPlainText(offline, sessionId, ragContext.length > 0, 'offline');
            return NextResponse.json({
                response: offline,
                source: offlineMode ? 'offline' : 'local',
                rag: ragContext.length > 0,
                mode: offlineMode ? 'asa-offline' : undefined,
                sessionId,
            });
        }

        // ============ STREAMING PATH ============
        if (wantsStream) {
            const result = await callGeminiStream(requestBody);
            if (!result.success) {
                console.error(`❌ Stream call failed: ${result.error}`);
                // In dev, surface the actual error so it's debuggable from the UI
                const errDetail = process.env.NODE_ENV !== 'production'
                    ? result.error
                    : 'AI service temporarily busy';
                const fallback = getOfflineResponse(message, ragContext, errDetail);
                try { addMessageToSession(sessionId, message, fallback, 'local-fallback', userAgent, ipAddress); } catch {}
                return streamPlainText(fallback, sessionId, ragContext.length > 0, 'local-fallback');
            }

            // Wrap Gemini's text-delta stream in our SSE protocol and persist on completion
            return new Response(
                wrapAsClientSSE(result.stream, async (full: string) => {
                    try { addMessageToSession(sessionId, message, full, 'gemini', userAgent, ipAddress); } catch (e) { console.error('persist failed', e); }
                }, sessionId, ragContext.length > 0),
                {
                    headers: {
                        'Content-Type': 'text/event-stream; charset=utf-8',
                        'Cache-Control': 'no-cache, no-transform',
                        'Connection': 'keep-alive',
                        'X-Accel-Buffering': 'no',
                    },
                },
            );
        }

        // ============ NON-STREAM JSON PATH (back-compat) ============
        const result = await callGeminiOnce(requestBody);
        if (!result.success) {
            const fallback = getOfflineResponse(message, ragContext, 'AI service temporarily busy');
            try { addMessageToSession(sessionId, message, fallback, 'local-fallback', userAgent, ipAddress); } catch {}
            return NextResponse.json({
                response: fallback,
                source: 'local',
                apiError: true,
                rag: ragContext.length > 0,
                sessionId,
            });
        }
        const data = result.data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!aiResponse) {
            const fb = getOfflineResponse(message, ragContext);
            try { addMessageToSession(sessionId, message, fb, 'local-no-response', userAgent, ipAddress); } catch {}
            return NextResponse.json({ response: fb, source: 'local', rag: ragContext.length > 0, sessionId });
        }
        try { addMessageToSession(sessionId, message, aiResponse, 'gemini', userAgent, ipAddress); } catch (e) { console.error(e); }
        return NextResponse.json({
            response: aiResponse,
            source: 'gemini',
            model: GEMINI_MODEL,
            rag: ragContext.length > 0,
            sessionId,
        });
    } catch (error) {
        console.error('Chat API error:', error);
        const fb = getOfflineResponse(message, ragContext, error instanceof Error ? error.message : String(error));
        try { if (sessionId) addMessageToSession(sessionId, message, fb, 'error', userAgent, ipAddress); } catch {}
        if (wantsStream) return streamPlainText(fb, sessionId, false, 'error');
        return NextResponse.json(
            { error: 'Failed to process message', response: fb, rag: false, sessionId },
            { status: 500 },
        );
    }
}

// =============================================================================
// SSE PROTOCOL HELPERS (server → client)
// Events:
//   meta  → { sessionId, rag, source }            sent first
//   chunk → { delta }                              sent per token group
//   done  → { sessionId }                          sent at end
//   error → { message }                            sent on failure
// =============================================================================

function sseEvent(event: string, data: unknown): string {
    return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/** Wrap Gemini's text-delta stream as our client-facing SSE protocol. */
function wrapAsClientSSE(
    geminiStream: ReadableStream<string>,
    onComplete: (full: string) => Promise<void>,
    sessionId: string,
    rag: boolean,
): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    let full = '';

    return new ReadableStream<Uint8Array>({
        async start(controller) {
            controller.enqueue(encoder.encode(sseEvent('meta', { sessionId, rag, source: 'gemini' })));
            const reader = geminiStream.getReader();
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    full += value;
                    controller.enqueue(encoder.encode(sseEvent('chunk', { delta: value })));
                }
            } catch (e) {
                controller.enqueue(encoder.encode(sseEvent('error', { message: e instanceof Error ? e.message : 'stream error' })));
            } finally {
                try { await onComplete(full); } catch (e) { console.error('onComplete failed', e); }
                controller.enqueue(encoder.encode(sseEvent('done', { sessionId })));
                controller.close();
            }
        },
    });
}

/** Stream a pre-computed full string as if it were a real model stream (for offline / fallback). */
function streamPlainText(text: string, sessionId: string, rag: boolean, source: string): Response {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            controller.enqueue(encoder.encode(sseEvent('meta', { sessionId, rag, source })));
            // Chunk into ~25-char pieces so the UI feels alive even for cached responses
            const chunkSize = 25;
            for (let i = 0; i < text.length; i += chunkSize) {
                controller.enqueue(encoder.encode(sseEvent('chunk', { delta: text.slice(i, i + chunkSize) })));
                await sleep(15);
            }
            controller.enqueue(encoder.encode(sseEvent('done', { sessionId })));
            controller.close();
        },
    });
    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}

// =============================================================================
// HEALTH CHECK
// =============================================================================
export async function GET() {
    const apiKeys = getApiKeys();
    const ragStatus = getRAGStatus();

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
        modelFallbackChain: MODEL_FALLBACK_CHAIN,
        streaming: true,
        memory: { historyTurnPairs: HISTORY_TURN_PAIRS },
        apiKeys: { count: apiKeys.length, statuses: keyStatuses },
        rateLimit: {
            minIntervalMs: MIN_REQUEST_INTERVAL_MS,
            keyCooldownMs: KEY_COOLDOWN_MS,
            effectiveRPM: Math.floor(60000 / MIN_REQUEST_INTERVAL_MS) * apiKeys.length,
        },
        rag: { enabled: ragStatus.initialized, documentCount: ragStatus.documentCount },
        message: apiKeys.length > 0
            ? `Gemini (${GEMINI_MODEL} + ${MODEL_FALLBACK_CHAIN.length - 1} fallbacks) with ${apiKeys.length} key(s). RAG: ${ragStatus.documentCount} docs. Streaming + memory enabled.`
            : 'Running in fallback mode. Add API keys in admin settings.',
    });
}
