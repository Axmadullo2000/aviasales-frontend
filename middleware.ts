import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register'];

// Routes that are always accessible (static files, api, etc.)
const ALWAYS_PUBLIC_PREFIXES = [
    '/_next',
    '/favicon',
    '/api/v1/auth',
    '/api/flights/search',
    '/api/flights/airports',
    '/api/flights/airlines',
    '/api/flights/popular-destinations',
    '/api/flights',
    '/api/pricing',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for Next.js internals and public API routes
    if (ALWAYS_PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
        return NextResponse.next();
    }

    // Check for access token in cookies (set during login)
    const accessToken =
        request.cookies.get('accessToken')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '');

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isAuthenticated = Boolean(accessToken);

    // If not authenticated and trying to access a protected route → redirect to /login
    if (!isAuthenticated && !isPublicRoute) {
        const loginUrl = new URL('/login', request.url);
        // Preserve the original URL so we can redirect back after login
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If already authenticated and trying to access login/register → redirect to home
    if (isAuthenticated && isPublicRoute) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    // Apply middleware to all routes except static files
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)'],
};
