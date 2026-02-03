import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware disabled - using client-side AuthGuard instead
// which properly checks Supabase session state
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
