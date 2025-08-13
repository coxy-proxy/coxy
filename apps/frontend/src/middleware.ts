import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const AUTH_ENABLED = process.env.AUTH_ENABLED === 'true';

const isProtectedRoute = createRouteMatcher(['/chat(.*)', '/api-keys(.*)']);
const protectByClerk = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
}) as unknown as (req: NextRequest) => Promise<Response> | Response;

const middleware = AUTH_ENABLED
  ? protectByClerk
  : function middleware(req: NextRequest) {
      return NextResponse.next();
    };

export default middleware;

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
