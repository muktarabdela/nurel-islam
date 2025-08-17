import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public paths that don't require authentication
const publicPaths = ['/login', '/register'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the current path is public
    const isPublicPath = publicPaths.some(path =>
        pathname === path || pathname.startsWith(`${path}/`)
    );

    // Get the token from cookies
    const token = request.cookies.get('ustathToken')?.value;
    console.log("token from cookies:", token);

    // If trying to access a protected route without a token, redirect to login
    if (!isPublicPath && !token) {
        console.log("No token found, redirecting to login");
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If already logged in and trying to access login/register, redirect to home
    if (isPublicPath && token) {
        console.log("Already logged in, redirecting to home");
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// Configure which routes the middleware will run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
    ],
};
