import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminSessionTokenEdge } from '@/lib/edgeAuth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Admin API routes
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login') {
    const adminToken = request.cookies.get('tkfk26_admin_session')?.value;
    const session = await verifyAdminSessionTokenEdge(adminToken);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Protect Admin UI Pages
  if (pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get('tkfk26_admin_session')?.value;
    const session = await verifyAdminSessionTokenEdge(adminToken);
    const isAuthenticated = Boolean(session);

    if (pathname === '/admin/login') {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
