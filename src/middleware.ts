
import { NextResponse, type NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const session = await getIronSession<{ token?: string, role?: string, isAnonymous?: boolean }>(request.cookies, sessionOptions);
  const { pathname } = request.nextUrl;

  const userIsLoggedIn = !!session.token;
  const userRole = session.role;
  const userIsAnonymous = !!session.isAnonymous;
  
  const publicRoutes = ['/', '/partner-registration'];
  const authRoutes = ['/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = authRoutes.includes(pathname);
  const isAdminRoute = pathname.startsWith('/admin');

  // Handle anonymous users first
  if (userIsLoggedIn && userIsAnonymous) {
      if (pathname === '/flashcards' || isAuthRoute) {
          return NextResponse.next(); // Allow access to flashcards and auth pages
      }
      // Redirect anonymous users from anywhere else to flashcards
      const url = request.nextUrl.clone();
      url.pathname = '/flashcards';
      return NextResponse.redirect(url);
  }
  
  // Handle authenticated (non-anonymous) users
  if (userIsLoggedIn && !userIsAnonymous) {
    // If user is on a public or auth route, redirect to their dashboard
    if (isPublicRoute || isAuthRoute) {
      const dashboardUrl = (userRole === 'Admin' || userRole === 'SuperAdmin' || userRole === 'Super Admin') ? '/admin' : '/training';
      const url = request.nextUrl.clone();
      url.pathname = dashboardUrl;
      return NextResponse.redirect(url);
    }

    // If a non-admin user tries to access an admin route, redirect them
    if (isAdminRoute && userRole !== 'Admin' && userRole !== 'SuperAdmin' && userRole !== 'Super Admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/training';
      return NextResponse.redirect(url);
    }

    // Otherwise, allow access to the requested protected route
    return NextResponse.next();
  }

  // Handle unauthenticated users
  if (!userIsLoggedIn) {
      // Allow access to public and auth routes
      if (isPublicRoute || isAuthRoute) {
          return NextResponse.next();
      }
      
      // For any other route, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configure the matcher to run on specific paths
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
