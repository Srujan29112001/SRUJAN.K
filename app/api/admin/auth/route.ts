import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'HARDIK@2911';
const SESSION_NAME = 'admin_session';
const SESSION_VALUE = 'authenticated';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        if (password === ADMIN_PASSWORD) {
            const response = NextResponse.json({ success: true });

            // Set session cookie (24 hours)
            response.cookies.set(SESSION_NAME, SESSION_VALUE, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 24 hours
                path: '/',
            });

            return response;
        }

        return NextResponse.json(
            { success: false, message: 'Invalid password' },
            { status: 401 }
        );
    } catch {
        return NextResponse.json(
            { success: false, message: 'Authentication failed' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get(SESSION_NAME);

        if (session?.value === SESSION_VALUE) {
            return NextResponse.json({ authenticated: true });
        }

        return NextResponse.json({ authenticated: false }, { status: 401 });
    } catch {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true, message: 'Logged out' });
    response.cookies.delete(SESSION_NAME);
    return response;
}
