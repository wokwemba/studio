import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/partner-registration',
  '/flashcards',
];

const PROTECTED_ROOT_ROUTES = [
  '/admin',
  '/training',
  '/certificates',
  '/leaderboard',
  '/profile',
  '/risk-profile',
  '/simulations',
  '/tutor',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || (route !== '/' && pathname.startsWith(route + '/'))
  );

  if (isPublic) {
    return NextResponse.next();
  }
  
  // The client-side ProtectedRoute component will handle redirects for
  // unauthenticated users on protected routes. This middleware is now just
  // a placeholder for potential future server-side session validation if needed.
  // It simplifies the logic and removes reliance on session cookies here,
  // which was a source of issues.

  return NextResponse.next();
}

export const config = {
  /*
    * Match all request paths except for the ones starting with:
    * - api/ (API routes)
    * - _next/static (static files)
    * - _next/image (image optimization files)
    * - favicon.ico (favicon file)
    */
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
};
