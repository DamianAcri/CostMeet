import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Generate CSRF token
function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto.getRandomValues
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  // CSRF protection for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const method = request.method;
    
    // Only protect state-changing methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrfToken = request.headers.get('x-csrf-token');
      const sessionToken = request.cookies.get('session-csrf')?.value;
      
      // For now, just ensure both tokens exist
      // In production, implement proper token validation
      if (!csrfToken || !sessionToken) {
        return new NextResponse(
          JSON.stringify({ error: 'CSRF token required' }),
          { 
            status: 403,
            headers: { 'content-type': 'application/json' }
          }
        );
      }
    }
  }

  // Set CSRF token for client-side forms
  if (!request.cookies.get('session-csrf')) {
    const csrfToken = generateCSRFToken();
    response.cookies.set('session-csrf', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
