import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware((auth, req) => {
  // You can add custom logic here if needed
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|.*\..*).*)', // Protect all routes except static files and _next
    '/api/:path*',            // Protect all API routes
  ],
}; 