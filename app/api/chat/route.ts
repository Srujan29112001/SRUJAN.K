/**
 * =============================================================================
 * CHAT API — BYOK (Bring Your Own Key) + RAG + TOOLS + MULTI-TURN MEMORY
 * =============================================================================
 *
 * KEY POLICY (per the owner's explicit design):
 *   The AI Chat NEVER uses the owner's API keys. Visitors supply their own
 *   key for whichever provider they prefer (Gemini, Groq, OpenAI, Anthropic,
 *   DeepSeek, Z.ai). The key travels with each request, is used transiently,
 *   and is never stored or logged. Without a key the chat runs in offline
 *   mode (cached knowledge + prompt to add a key).
 *   The owner's keys are reserved exclusively for the Resume Engine.
 *
 * Flow per message:
 *   1. RAG retrieval over the portfolio knowledge base
 *   2. Multi-turn memory: replay recent turns for this sessionId
 *   3. Tool pass (Phase 2): structured data lookup when the question needs it
 *   4. Generate with the VISITOR's key via the multi-provider layer
 *   5. Stream back over the same SSE protocol the UI already speaks
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiPersona, quickResponses } from '@/data/ai-persona';
import { getRAGStatus, initializeRAG } from '@/lib/rag';
import { addMessageToSession, getChatHistory } from '@/lib/chat-history-store';
import {
    generateTextStream, PROVIDER_IDS, PROVIDER_LABELS,
    type ProviderId, type ChatTurn,
} from '@/lib/ai-providers';
import { retrieveKnowledge, logKnowledgeGap } from '@/lib/chat-agents/knowledge';
import { routeAndExecute } from '@/lib/chat-agents/router';

// How many prior message *pairs* to replay back to the model
const HISTORY_TURN_PAIRS = 4;
const HISTORY_MESSAGE_MAX_CHARS = 800;

interface ByokConfig {
    provider?: string;
    key?: string;
    model?: string;
}

interface ChatRequest {
    message: string;
    offlineMode?: boolean;
    sessionId?: string;
    byok?: ByokConfig;
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================================================================
// MULTI-TURN MEMORY
// =============================================================================
function loadPriorTurns(sessionId: string): ChatTurn[] {
    if (!sessionId) return [];
    try {
        const data = getChatHistory();
        const session = data.sessions.find(s => s.id === sessionId);
        if (!session || session.messages.length === 0) return [];
        return session.messages.slice(-HISTORY_TURN_PAIRS * 2).map(m => ({
            role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
            content: m.content.length > HISTORY_MESSAGE_MAX_CHARS
                ? m.content.slice(0, HISTORY_MESSAGE_MAX_CHARS) + '…'
                : m.content,
        }));
    } catch (e) {
        console.error('Failed to load prior turns:', e);
        return [];
    }
}

// =============================================================================
// PROMPT BUILDER
// =============================================================================
function buildSystemPrompt(ragContext: string, toolResult: string | null): string {
    let prompt = aiPersona.systemPrompt;
    if (ragContext) {
        prompt += `\n\n---\nRelevant memory from your portfolio for this question:\n\n${ragContext}\n---`;
    } else {
        prompt += `\n\n---\nNote: nothing specific in your portfolio knowledge base matches this question. If it's about your work, say plainly that you haven't done that specifically and offer the closest related thing if any. If it's small talk or off-topic, just respond naturally as yourself.\n---`;
    }
    if (toolResult) {
        prompt += `\n\n---\nLive data lookup (treat as your own accurate records — answer from this):\n\n${toolResult}\n---`;
    }
    return prompt;
}

// =============================================================================
// OFFLINE / NO-KEY RESPONSES (no RAG context dumping — privacy)
// =============================================================================
function getOfflineResponse(message: string, reason: 'no-key' | 'asa' | 'key-error', errorDetail?: string): string {
    const lower = message.toLowerCase().trim();

    if (reason === 'key-error') {
        return `Your API key hit a problem: ${errorDetail || 'request failed'}. Check the key in the 🔑 panel — you can also switch provider there.`;
    }

    const keyHint = reason === 'no-key'
        ? `\n\n_(I'm in offline mode — tap the 🔑 button above the chat box, paste a free API key from Google AI Studio, Groq, or any provider you like, and I'll answer properly.)_`
        : '';

    if (/^(hi|hello|hey|yo)\b/.test(lower)) {
        return quickResponses.greeting[Math.floor(Math.random() * quickResponses.greeting.length)] + keyHint;
    }
    if (lower.includes('book') || lower.includes('call') || lower.includes('meet') || lower.includes('schedule')) {
        return quickResponses.booking + keyHint;
    }
    if (lower.includes('cost') || lower.includes('price') || lower.includes('estimate') || lower.includes('budget')) {
        return quickResponses.projectInquiry + keyHint;
    }
    if (lower.includes('skill') || lower.includes('stack') || lower.includes('tech')) {
        return quickResponses.expertise + keyHint;
    }
    if (lower.includes('project') || lower.includes('work') || lower.includes('portfolio')) {
        return "The Projects section above has 60+ shipped systems — AI, robotics, and research. Ask me about any of them once you've added an API key, or just scroll up." + keyHint;
    }
    return reason === 'asa'
        ? quickResponses.offlineNote
        : `I can only give canned answers without an API key.${keyHint}`;
}

// =============================================================================
// SSE HELPERS (same protocol the UI already speaks: meta / chunk / done / error)
// =============================================================================
function sseEvent(event: string, data: unknown): string {
    return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/** Provenance shown to the visitor: was this answered live on their key? */
interface ChatProvenance {
    live: boolean;
    provider?: string;
    model?: string;
}

function streamPlainText(text: string, sessionId: string, rag: boolean, source: string, prov: ChatProvenance): Response {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            controller.enqueue(encoder.encode(sseEvent('meta', { sessionId, rag, source, ...prov })));
            const chunkSize = 25;
            for (let i = 0; i < text.length; i += chunkSize) {
                controller.enqueue(encoder.encode(sseEvent('chunk', { delta: text.slice(i, i + chunkSize) })));
                await sleep(12);
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
// HANDLER
// =============================================================================
export async function POST(request: NextRequest) {
    const wantsStream = request.nextUrl.searchParams.get('stream') === '1'
        || request.headers.get('accept')?.includes('text/event-stream');

    let message = '';
    let sessionId = '';

    try {
        const body: ChatRequest = await request.json();
        message = body.message;
        const offlineMode = body.offlineMode || false;
        sessionId = body.sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const userAgent = request.headers.get('user-agent') || 'Unknown';
        const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || request.headers.get('x-real-ip') || 'Unknown';

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }
        if (message.length > 4000) {
            return NextResponse.json({ error: 'Message too long' }, { status: 400 });
        }

        // BYOK validation
        const byok = body.byok || {};
        const provider = (byok.provider || '').trim() as ProviderId;
        const userKey = (byok.key || '').trim();
        const userModel = (byok.model || '').trim();
        const hasValidByok = !!userKey && userKey.length >= 8 && PROVIDER_IDS.includes(provider);

        // ============ PARALLEL CONTEXT ASSEMBLY (multi-agent) ============
        // Three agents run simultaneously — none of them needs an LLM call:
        //   knowledge agent: real-time deterministic retrieval (+ time-boxed vectors)
        //   memory agent:    recent turns for this session
        //   tool router:     deterministic data-tool execution
        void initializeRAG(); // fast cache load; embedding sync detaches to background
        const [knowledge, priorTurns, routed] = await Promise.all([
            retrieveKnowledge(message, 5),
            Promise.resolve(loadPriorTurns(sessionId)),
            Promise.resolve(routeAndExecute(message)),
        ]);
        const ragContext = knowledge.context;

        // Self-improvement signal: the portfolio had nothing solid for this
        if (knowledge.weak && !routed && message.length > 12) {
            logKnowledgeGap(message);
        }

        const respond = (text: string, source: string, prov: ChatProvenance) => {
            try { addMessageToSession(sessionId, message, text, source, userAgent, ipAddress); } catch {}
            if (wantsStream) return streamPlainText(text, sessionId, ragContext.length > 0, source, prov);
            return NextResponse.json({ response: text, source, rag: ragContext.length > 0, sessionId, ...prov });
        };

        // ============ OFFLINE / NO-KEY PATHS ============
        if (offlineMode) {
            return respond(getOfflineResponse(message, 'asa'), 'offline', { live: false });
        }
        if (!hasValidByok) {
            return respond(getOfflineResponse(message, 'no-key'), 'no-key', { live: false });
        }

        // ============ BYOK PATH — true token streaming ============
        const llmBase = { provider, overrideKey: userKey, ...(userModel ? { overrideModel: userModel } : {}) };
        if (routed) console.log(`🔧 Tool routed: ${routed.tool}(${JSON.stringify(routed.args)})`);

        try {
            const { stream, model } = await generateTextStream({
                ...llmBase,
                system: buildSystemPrompt(ragContext, routed?.result || null),
                messages: priorTurns,
                prompt: message,
                temperature: 0.85,
                maxTokens: 1024,
            });
            const source = `byok-${provider}${routed ? `+${routed.tool}` : ''}`;
            const prov: ChatProvenance = { live: true, provider: PROVIDER_LABELS[provider], model };

            if (!wantsStream) {
                // non-stream clients: drain fully, return JSON (back-compat)
                const reader = stream.getReader();
                let full = '';
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    full += value;
                }
                try { addMessageToSession(sessionId, message, full, source, userAgent, ipAddress); } catch {}
                return NextResponse.json({ response: full, source, rag: ragContext.length > 0, sessionId, ...prov });
            }

            // Pipe provider tokens straight into our SSE protocol (identical
            // event shapes — the typewriter/avatar frontend needs no changes).
            const encoder = new TextEncoder();
            const ragFlag = ragContext.length > 0;
            const out = new ReadableStream<Uint8Array>({
                async start(controller) {
                    controller.enqueue(encoder.encode(sseEvent('meta', { sessionId, rag: ragFlag, source, ...prov })));
                    const reader = stream.getReader();
                    let full = '';
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
                        try { addMessageToSession(sessionId, message, full, source, userAgent, ipAddress); } catch {}
                        controller.enqueue(encoder.encode(sseEvent('done', { sessionId })));
                        controller.close();
                    }
                },
            });
            return new Response(out, {
                headers: {
                    'Content-Type': 'text/event-stream; charset=utf-8',
                    'Cache-Control': 'no-cache, no-transform',
                    'Connection': 'keep-alive',
                    'X-Accel-Buffering': 'no',
                },
            });
        } catch (e) {
            const detail = e instanceof Error ? e.message : 'request failed';
            console.warn(`BYOK ${provider} failed:`, detail);
            // Friendly, actionable error — distinguish key problems from transient ones
            const friendly = /401|403|rejected|invalid/i.test(detail)
                ? `That ${PROVIDER_LABELS[provider]} key was rejected (check it in the 🔑 panel).`
                : /429|quota|rate/i.test(detail)
                    ? `Your ${PROVIDER_LABELS[provider]} key hit its rate limit — wait a moment or switch provider in the 🔑 panel.`
                    : `Couldn't reach ${PROVIDER_LABELS[provider]} right now — try again or switch provider in the 🔑 panel.`;
            return respond(friendly, 'byok-error', { live: false });
        }
    } catch (error) {
        console.error('Chat API error:', error);
        const fb = "Something went wrong on my end — try again in a moment.";
        if (wantsStream) return streamPlainText(fb, sessionId, false, 'error', { live: false });
        return NextResponse.json({ error: 'Failed to process message', response: fb, sessionId, live: false }, { status: 500 });
    }
}

// =============================================================================
// HEALTH CHECK
// =============================================================================
export async function GET() {
    const ragStatus = getRAGStatus();
    return NextResponse.json({
        status: 'ok',
        mode: 'byok',
        architecture: 'v2: parallel agents (knowledge + memory + tool router) → true token streaming',
        keyPolicy: 'Visitors bring their own API key (any supported provider). Owner keys are not used for chat.',
        supportedProviders: PROVIDER_IDS.map(id => ({ id, label: PROVIDER_LABELS[id] })),
        streaming: 'true token streaming (provider deltas piped through SSE)',
        agents: {
            knowledge: 'real-time deterministic retrieval over live portfolio + time-boxed vector merge',
            memory: `last ${HISTORY_TURN_PAIRS} turn pairs per session`,
            toolRouter: ['list_projects', 'get_project', 'get_skills', 'get_experience', 'booking_info'],
            selfImprovement: 'background embedding sync + knowledge-gap logging',
        },
        rag: { enabled: ragStatus.initialized, documentCount: ragStatus.documentCount },
    });
}
