
import { NextResponse, type NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const session = await getIronSession<{ token?: string; role?: string, isAnonymous?: boolean }>(
    request.cookies,
    sessionOptions
  );
  const { pathname } = request.nextUrl;

  const isLoggedIn = !!session.token;
  const isAnonymous = session.isAnonymous === true;
  const isAdmin = session.role === 'Admin' || session.role === 'SuperAdmin' || session.role === 'Super Admin';

  const publicRoutes = ['/', '/partner-registration'];
  const authRoutes = ['/login', '/signup'];
  const anonymousAllowedRoutes = ['/flashcards', ...authRoutes, ...publicRoutes];
  const isAdminRoute = pathname.startsWith('/admin');

  // --- Anonymous User Flow ---
  if (isLoggedIn && isAnonymous) {
    // If anonymous, only allow access to anonymous-allowed routes.
    if (anonymousAllowedRoutes.includes(pathname)) {
      return NextResponse.next();
    }
    // Redirect from any other page to the main anonymous page.
    return NextResponse.redirect(new URL('/flashcards', request.url));
  }
  
  // --- Authenticated (Full) User Flow ---
  if (isLoggedIn && !isAnonymous) {
    // If logged in, redirect away from public/auth pages to their dashboard
    if (publicRoutes.includes(pathname) || authRoutes.includes(pathname)) {
        const destination = isAdmin ? '/admin' : '/training';
        return NextResponse.redirect(new URL(destination, request.url));
    }
    // If a non-admin tries to access an admin route, redirect to training dashboard
    if (isAdminRoute && !isAdmin) {
        return NextResponse.redirect(new URL('/training', request.url));
    }
    // Otherwise, they are good to go.
    return NextResponse.next();
  }
  
  // --- Unauthenticated User Flow ---
  if (!isLoggedIn) {
    // Allow access to public and auth routes
    if (publicRoutes.includes(pathname) || authRoutes.includes(pathname)) {
      return NextResponse.next();
    }
    // For any other protected route, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Fallback, should not be reached
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/ (for auth session management)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
