import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const AUTH_ENABLED = process.env.AUTH_ENABLED === 'true';

// Protected routes that require authentication
const protectedRoutes = ['/chat', '/api-keys'];
const publicRoutes = ['/auth/login', '/auth/register', '/auth/oauth-success', '/auth/oauth-error'];

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname.startsWith(route));
}

async function checkAuth(req: NextRequest): Promise<boolean> {
  try {
    // Check for auth cookies (access_token)
    const accessToken = req.cookies.get('access_token')?.value;
    if (!accessToken) {
      return false;
    }

    // Verify token by calling backend profile endpoint
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3021';
    const response = await fetch(`${backendUrl}/api/auth/profile`, {
      headers: {
        Cookie: req.headers.get('cookie') || '',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
}

async function authMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for static files and API routes (except auth API routes)
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check auth for protected routes
  if (isProtectedRoute(pathname)) {
    const isAuthenticated = await checkAuth(req);

    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

const middleware = AUTH_ENABLED
  ? authMiddleware
  : function middleware(req: NextRequest) {
      return NextResponse.next();
    };

export default middleware;

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
