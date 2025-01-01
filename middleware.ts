import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Auth routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register', '/', '/api/stripe/webhook'];
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  // If user is not signed in and the current path is not public, redirect to login
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If user is signed in and trying to access public routes, redirect to goals
  if (session && isPublicRoute) {
    return NextResponse.redirect(new URL('/goals', request.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public/*)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};