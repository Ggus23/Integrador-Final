import { NextResponse, type NextRequest } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/assessments', '/checkins', '/alerts', '/admin'];

// Auth routes that should not be accessible if already logged in
const authRoutes = ['/login'];

export function proxy(request: NextRequest) {
  const token = request.cookies.get('mentalink_token')?.value;
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    // Redirect to login if trying to access a protected route without a token
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && token) {
    // Redirect to dashboard if trying to access login while already logged in
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
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
