import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminSessionTokenEdge } from '@/lib/edgeAuth';

// ────────────────────────────────────────────────────────────────────────────
// Edge-compatible Supabase settings fetch
// Uses the REST API directly — no Node.js SDK needed
// ────────────────────────────────────────────────────────────────────────────

let _cachedMaintenanceMode: boolean | null = null;
let _cacheExpiresAt = 0;

async function getMaintenanceModeEdge(): Promise<boolean> {
  const now = Date.now();
  if (_cachedMaintenanceMode !== null && now < _cacheExpiresAt) {
    return _cachedMaintenanceMode;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      _cachedMaintenanceMode = false;
      _cacheExpiresAt = now + 10000;
      return false;
    }

    // Direct Supabase REST API call — edge-compatible
    const url = `${supabaseUrl}/rest/v1/system_config?key=eq.site_settings&select=value`;
    const res = await fetch(url, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      // 3-second timeout so middleware doesn't slow requests
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const rows = await res.json();
      const value = rows?.[0]?.value;
      _cachedMaintenanceMode = Boolean(value?.maintenance_mode);
    } else {
      _cachedMaintenanceMode = false;
    }
  } catch {
    // On any error, default to NOT blocking (fail open)
    _cachedMaintenanceMode = false;
  }

  // Cache for 10 seconds so every request doesn't hit Supabase
  _cacheExpiresAt = Date.now() + 10000;
  return _cachedMaintenanceMode!;
}

// ────────────────────────────────────────────────────────────────────────────
// Routes that ALWAYS bypass maintenance mode
// ────────────────────────────────────────────────────────────────────────────
const BYPASS_PREFIXES = [
  '/admin',
  '/api/admin',
  '/api/site-settings',   // must always work so the guard can check itself
  '/_next',
  '/favicon',
  '/android-chrome',
  '/apple-touch',
  '/site.webmanifest',
  '/robots.txt',
  '/sitemap.xml',
];

const BYPASS_EXACT = ['/'];  // home page bypass (or remove this if you want home blocked too)

function isBypassRoute(pathname: string): boolean {
  if (BYPASS_EXACT.includes(pathname)) return false; // show maintenance even on home
  return BYPASS_PREFIXES.some((p) => pathname.startsWith(p));
}

// ────────────────────────────────────────────────────────────────────────────
// Maintenance mode HTML — shown server-side, no flash
// ────────────────────────────────────────────────────────────────────────────
function maintenanceHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Platform Under Maintenance — TKFK</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f8f5f0;
      color: #141412;
      min-height: 100svh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .card {
      background: #fff;
      border: 1px solid #ece8e1;
      border-radius: 2rem;
      max-width: 480px;
      width: 100%;
      padding: 3rem 2.5rem;
      text-align: center;
      box-shadow: 0 25px 60px rgba(0,0,0,.08);
    }
    .icon-wrap {
      width: 5rem; height: 5rem;
      background: rgba(245,158,11,.1);
      border: 1px solid rgba(245,158,11,.2);
      border-radius: 1.25rem;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1.75rem;
      font-size: 2.25rem;
    }
    .badge {
      display: inline-flex; align-items: center; gap: .35rem;
      background: #141412; color: #fff;
      font-size: .65rem; font-family: monospace; font-weight: 900;
      letter-spacing: .12em; text-transform: uppercase;
      padding: .25rem .65rem; border-radius: 999px;
      margin-bottom: 1rem;
    }
    h1 { font-size: 1.6rem; font-weight: 900; letter-spacing: -.02em; margin-bottom: .75rem; }
    p  { font-size: .875rem; color: #706e6a; line-height: 1.6; margin-bottom: 1.75rem; }
    .actions { display: grid; grid-template-columns: 1fr 1fr; gap: .65rem; margin-bottom: 1.25rem; }
    a.btn {
      display: flex; align-items: center; gap: .5rem;
      padding: .75rem 1rem; border-radius: .85rem;
      font-size: .8rem; font-weight: 700; text-decoration: none;
      border: 1px solid #ece8e1; color: #141412; background: #faf8f5;
      transition: background .15s;
    }
    a.btn:hover { background: #f0ece5; }
    a.btn.wa { background: rgba(37,211,102,.08); border-color: rgba(37,211,102,.3); color: #075e54; }
    a.btn.wa:hover { background: rgba(37,211,102,.16); }
    .email-row { font-size: .75rem; color: #9c9a97; border-top: 1px solid #ece8e1; padding-top: 1rem; }
    .email-row a { font-weight: 700; color: #141412; text-decoration: none; font-family: monospace; }
    .admin-link {
      display: inline-flex; align-items: center; gap: .35rem;
      font-size: .75rem; font-weight: 700; color: #9c9a97;
      text-decoration: none; margin-top: 1.5rem;
    }
    .admin-link:hover { color: #ff6b35; }
    footer { font-size: .72rem; color: #c5c3bf; margin-top: 2.5rem; }
    @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
    .bounce { animation: bounce 1.4s ease-in-out infinite; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-wrap"><span class="bounce">🔧</span></div>
    <span class="badge">⚠ System Notice</span>
    <h1>Platform Under Scheduled Maintenance</h1>
    <p>The Knowledge Forum Kerala (TKFK) platform is currently undergoing scheduled platform upgrades and maintenance. All active records and participant passes are safe.</p>
    <div class="actions">
      <a class="btn wa" href="https://chat.whatsapp.com/KMtL6c6cIwH6tG0L0lGypW" target="_blank" rel="noopener">
        💬 WhatsApp Desk
      </a>
      <a class="btn" href="tel:+919778219793">
        📞 +91 97782 19793
      </a>
    </div>
    <div class="email-row">
      Email Support: <a href="mailto:theknowledgeforumkerala@gmail.com">theknowledgeforumkerala@gmail.com</a>
    </div>
    <a class="admin-link" href="/admin/login">🔒 Super Administrator Sign In →</a>
  </div>
  <footer>© ${new Date().getFullYear()} The Knowledge Forum Kerala (TKFK). All rights reserved.</footer>
</body>
</html>`;
}

// ────────────────────────────────────────────────────────────────────────────
// Main Middleware
// ────────────────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Admin auth gate ─────────────────────────────────────────────────
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login') {
    const adminToken = request.cookies.get('tkfk26_admin_session')?.value;
    const session = await verifyAdminSessionTokenEdge(adminToken);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }
    return NextResponse.next();
  }

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

    // Admin is authenticated — NEVER show maintenance to admin
    return NextResponse.next();
  }

  // ── 2. Skip maintenance check for internal/static resources ───────────
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/android-chrome') ||
    pathname.startsWith('/apple-touch') ||
    pathname === '/site.webmanifest' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.startsWith('/api/site-settings') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf|css|js|map)$/)
  ) {
    return NextResponse.next();
  }

  // ── 3. Maintenance mode check for all public routes ───────────────────
  const inMaintenance = await getMaintenanceModeEdge();

  if (inMaintenance) {
    // API routes: return JSON error (so AJAX calls fail gracefully)
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Platform is under maintenance. Please try again later.', maintenance: true },
        { status: 503, headers: { 'Retry-After': '300' } }
      );
    }

    // Page routes: return styled HTML maintenance page
    return new NextResponse(maintenanceHtml(), {
      status: 503,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Retry-After': '300',
        'Cache-Control': 'no-store, no-cache',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match ALL routes except static files handled by Next.js internals
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
