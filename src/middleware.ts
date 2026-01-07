
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

  // Define protected routes
  const isAdminRoute = pathname.startsWith('/admin');
  const isProfileRoute = pathname.startsWith('/profile');

  // If user is not logged in
  if (!userIsLoggedIn) {
    // If trying to access a protected route (admin or profile), redirect to login
    if (isAdminRoute || isProfileRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  } else { // If user is logged in
    // If a logged-in user tries to access the login page, redirect them to the dashboard
    if (pathname === '/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // If a user who is not an Admin or SuperAdmin tries to access an admin route, redirect them
    if (isAdminRoute && userRole !== 'Admin' && userRole !== 'SuperAdmin') {
      const url = request.nextUrl.clone();
      url.pathname = '/'; // Redirect to home/dashboard
      return NextResponse.redirect(url);
    }
  }

  // If none of the above conditions are met, allow the request to proceed
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
