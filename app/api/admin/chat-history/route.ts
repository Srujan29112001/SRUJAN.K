import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getChatHistory, saveChatHistory } from '@/lib/chat-history-store';

const SESSION_NAME = 'admin_session';
const SESSION_VALUE = 'authenticated';

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
