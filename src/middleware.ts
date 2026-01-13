
import { NextResponse, type NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';

const sessionOptions = {
  cookieName: 'firebase-session',
  password: process.env.SECRET_COOKIE_PASSWORD || 'complex_password_at_least_32_characters_long_for_dev',
   cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export async function middleware(request: NextRequest) {
  const session = await getIronSession<{ token?: string, role?: string }>(request.cookies, sessionOptions);
  const { pathname } = request.nextUrl;
  const userIsLoggedIn = !!session.token;
  const userRole = session.role;

  const isAdminRoute = pathname.startsWith('/admin');

  // If a user is logged in and tries to access login/signup, redirect to dashboard
  if (userIsLoggedIn && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // If a non-admin user tries to access an admin route, redirect them to the dashboard
  if (isAdminRoute && userIsLoggedIn && userRole !== 'Admin' && userRole !== 'SuperAdmin') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // If a user is not logged in and tries to access a protected admin route, they will
  // be handled by the client-side logic in DashboardLayout, which is more robust
  // for handling ongoing sign-in flows. We can let this pass through.
  
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
