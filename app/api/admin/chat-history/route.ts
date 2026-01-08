import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

const SESSION_NAME = 'admin_session';
const SESSION_VALUE = 'authenticated';
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

interface ChatHistoryData {
    sessions: ChatSession[];
}

// Check if admin is authenticated
async function isAuthenticated(): Promise<boolean> {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get(SESSION_NAME);
        return session?.value === SESSION_VALUE;
    } catch {
        return false;
    }
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

// GET - List all chat sessions (admin only)
export async function GET(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sessionId = searchParams.get('sessionId');

    const data = getChatHistory();

    // If requesting specific session
    if (sessionId) {
        const session = data.sessions.find(s => s.id === sessionId);
        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }
        return NextResponse.json({ session });
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSessions = data.sessions
        .slice(startIndex, endIndex)
        .map(s => ({
            id: s.id,
            startedAt: s.startedAt,
            lastMessageAt: s.lastMessageAt,
            userAgent: s.userAgent,
            ipAddress: s.ipAddress,
            messageCount: s.messageCount,
            preview: s.messages[0]?.content?.substring(0, 100) || 'No messages'
        }));

    return NextResponse.json({
        sessions: paginatedSessions,
        total: data.sessions.length,
        page,
        limit,
        totalPages: Math.ceil(data.sessions.length / limit)
    });
}

// DELETE - Delete specific session or all sessions older than X days
export async function DELETE(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const olderThanDays = searchParams.get('olderThanDays');

    const data = getChatHistory();
    const initialCount = data.sessions.length;

    if (sessionId) {
        // Delete specific session
        data.sessions = data.sessions.filter(s => s.id !== sessionId);
    } else if (olderThanDays) {
        // Delete sessions older than X days
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThanDays));
        data.sessions = data.sessions.filter(
            s => new Date(s.lastMessageAt) > cutoffDate
        );
    } else {
        return NextResponse.json(
            { error: 'Provide sessionId or olderThanDays parameter' },
            { status: 400 }
        );
    }

    saveChatHistory(data);

    return NextResponse.json({
        success: true,
        deletedCount: initialCount - data.sessions.length,
        remainingCount: data.sessions.length
    });
}
