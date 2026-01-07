
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('firebase-session-token');
  const { pathname } = request.nextUrl;

  // Define protected routes
  const protectedRoutes = ['/admin', '/profile'];

  // Check if the current path starts with any of the protected routes
  const isProtectedRoute = protectedRoutes.some(p => pathname.startsWith(p));

  // If trying to access a protected route without a session token, redirect to login
  if (isProtectedRoute && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If there is a session or the route is not protected, continue
  return NextResponse.next();
}

// Configure the matcher to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
