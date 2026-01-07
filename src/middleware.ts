
import { NextResponse, type NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const session = request.cookies.get('firebase-session-token');
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/profile');

  // If trying to access a protected route without a session token, redirect to login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there is a session or the route is not protected, continue
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*', '/profile'],
};
