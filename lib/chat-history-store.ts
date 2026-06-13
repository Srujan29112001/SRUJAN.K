/**
 * Chat history storage — shared by the public chat API (writes) and the
 * admin chat-history API (reads/deletes). Lives in lib/ because Next.js
 * route files may only export HTTP handlers.
 */

import fs from 'fs';
import path from 'path';
import { kvConfigAvailable, kvGetJSON, kvSetJSON } from './ai-providers';

const CHAT_HISTORY_FILE = path.join(process.cwd(), 'data', 'chat-history.json');
const KV_KEY = 'srujan:chat-history';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    source?: string;
}

export interface ChatSession {
    id: string;
    startedAt: string;
    lastMessageAt: string;
    userAgent?: string;
    ipAddress?: string;
    messageCount: number;
    messages: ChatMessage[];
}

export interface ChatHistoryData {
    sessions: ChatSession[];
}

// On Vercel the project filesystem is READ-ONLY, so file writes silently fail
// and the admin page never sees new sessions. When Upstash KV is connected we
// write through to it (durable + shared across serverless instances); the JSON
// file stays the local-dev store. A module snapshot keeps this sync API while
// async entry points (chat + admin routes) refresh it from KV via hydrate().
let snapshot: ChatHistoryData | null = null;

function readFileStore(): ChatHistoryData {
    try {
        return JSON.parse(fs.readFileSync(CHAT_HISTORY_FILE, 'utf-8')) as ChatHistoryData;
    } catch {
        return { sessions: [] };
    }
}

// Sync read — returns the in-memory snapshot (file-backed locally).
export function getChatHistory(): ChatHistoryData {
    if (!snapshot) snapshot = readFileStore();
    return snapshot;
}

/** Refresh the snapshot from the durable store. Call at async entry points. */
export async function hydrateChatHistory(): Promise<void> {
    if (kvConfigAvailable()) {
        const kv = await kvGetJSON<ChatHistoryData>(KV_KEY);
        if (kv) { snapshot = kv; return; }
    }
    if (!snapshot) snapshot = readFileStore();
}

// Persist: update snapshot, write KV when available (durable on Vercel), and
// best-effort write the local file (no-op on read-only hosts).
export function saveChatHistory(data: ChatHistoryData): void {
    snapshot = data;
    if (kvConfigAvailable()) void kvSetJSON(KV_KEY, data);
    try { fs.writeFileSync(CHAT_HISTORY_FILE, JSON.stringify(data, null, 2)); } catch { /* read-only FS */ }
}

// Add or update a chat session
export function addMessageToSession(
    sessionId: string,
    userMessage: string,
    assistantResponse: string,
    source: string,
    userAgent?: string,
    ipAddress?: string
): ChatSession {
    const data = getChatHistory();
    let session = data.sessions.find(s => s.id === sessionId);
    const now = new Date().toISOString();

    if (!session) {
        // Create new session
        session = {
            id: sessionId,
            startedAt: now,
            lastMessageAt: now,
            userAgent,
            ipAddress,
            messageCount: 0,
            messages: []
        };
        data.sessions.unshift(session); // Add to beginning for easy access to recent
    }

    // Add user message
    session.messages.push({
        id: `${Date.now()}-user`,
        role: 'user',
        content: userMessage,
        timestamp: now
    });

    // Add assistant response
    session.messages.push({
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: assistantResponse,
        timestamp: now,
        source
    });

    session.messageCount = session.messages.length;
    session.lastMessageAt = now;

    saveChatHistory(data);
    return session;
}
