import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readKnowledgeGaps } from '@/lib/chat-agents/knowledge';

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

// GET - chat questions the portfolio knowledge couldn't answer
export async function GET() {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ gaps: readKnowledgeGaps().slice(0, 30) });
}
