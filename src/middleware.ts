import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/partner-registration',
  '/flashcards',
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
  matcher: [
    '/admin/:path*',
    '/training/:path*',
    '/certificates/:path*',
    '/leaderboard/:path*',
    '/profile/:path*',
    '/risk-profile/:path*',
    '/simulations/:path*',
    '/tutor/:path*',
    '/phishing-engine/:path*',
    '/vapt/:path*',
    '/incident-response/:path*',
    '/system-audit/:path*',
    '/custom-training/:path*',
    '/dark-web-monitor/:path*',
    '/incident-response-playbook/:path*',
    '/threat-intelligence/:path*',
    '/vulnerability-challenge/:path*',
    '/escape-room/:path*',
    '/api-security-lab/:path*',
    '/threat-scenarios/:path*',
  ],
};
