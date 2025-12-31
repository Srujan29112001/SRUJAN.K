import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_NAME = 'admin_session';
const SESSION_VALUE = 'authenticated';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionCookie = request.cookies.get(SESSION_NAME);
    const isAuthenticated = sessionCookie?.value === SESSION_VALUE;

    console.log(`[Middleware] Path: ${pathname}, Authenticated: ${isAuthenticated}`);

    // Protected routes - require authentication
    if (pathname.startsWith('/admin/clients') || pathname.startsWith('/admin/settings')) {
        if (!isAuthenticated) {
            console.log(`[Middleware] Blocking access to ${pathname} - not authenticated`);
            const loginUrl = new URL('/admin', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Login page - redirect to clients if already authenticated
    if (pathname === '/admin') {
        if (isAuthenticated) {
            console.log(`[Middleware] Already authenticated, redirecting to clients`);
            return NextResponse.redirect(new URL('/admin/clients', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    // Match both /admin and /admin/* paths
    matcher: ['/admin', '/admin/:path*'],
};
