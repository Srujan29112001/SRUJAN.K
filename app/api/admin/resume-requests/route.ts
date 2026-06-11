import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readResumeRequests, deleteResumeRequest } from '@/lib/resume-agents/orchestrator';

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

// GET - list resume gate requests (most recent first)
export async function GET(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    const data = readResumeRequests();
    const start = (page - 1) * limit;

    return NextResponse.json({
        requests: data.requests.slice(start, start + limit),
        total: data.requests.length,
        page,
        totalPages: Math.max(1, Math.ceil(data.requests.length / limit)),
    });
}

// DELETE - remove one request by id
export async function DELETE(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'id parameter required' }, { status: 400 });
    }

    const deleted = deleteResumeRequest(id);
    return NextResponse.json({ success: deleted });
}
