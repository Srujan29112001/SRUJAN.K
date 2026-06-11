/**
 * Chat history storage — shared by the public chat API (writes) and the
 * admin chat-history API (reads/deletes). Lives in lib/ because Next.js
 * route files may only export HTTP handlers.
 */

import fs from 'fs';
import path from 'path';

const CHAT_HISTORY_FILE = path.join(process.cwd(), 'data', 'chat-history.json');

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

// Read chat history from JSON file
export function getChatHistory(): ChatHistoryData {
    try {
        const data = fs.readFileSync(CHAT_HISTORY_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return { sessions: [] };
    }
}

// Write chat history to JSON file
export function saveChatHistory(data: ChatHistoryData): void {
    fs.writeFileSync(CHAT_HISTORY_FILE, JSON.stringify(data, null, 2));
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
