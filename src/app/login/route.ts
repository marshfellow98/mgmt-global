import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* ============================================================================
   /login  →  the recruitment dashboard

   This is a redirect, not a login. The dashboard runs as its own service and
   does its own passcode check; nothing here authenticates anybody, and no
   credential of any kind passes through this route.

   Why a redirect instead of linking the onrender.com URL directly:

   1. It's typeable. "mgmtglobal.com/login" can be entered from a phone, a
      client's laptop, anywhere — no bookmark required, which was the whole
      point of the request.
   2. The dashboard's address lives in one place. Render URLs change when a
      service is renamed, and if the dashboard ever moves to its own domain
      this is the only line that needs editing.

   The redirect is resolved per request (force-dynamic) and sent as a 307
   rather than a permanent 308 on purpose: a browser caches a permanent
   redirect more or less forever, so if the dashboard moved, anyone who had
   visited once would keep being sent to the dead address with no way to
   clear it short of wiping their browser data.
   ============================================================================ */

const FALLBACK = 'https://recruiter-dashboard-f8lz.onrender.com/';

export function GET() {
  const target = process.env.DASHBOARD_URL?.trim() || FALLBACK;

  /* Only ever leave for an https address. If the env var is set to something
     malformed, send the visitor to the homepage rather than somewhere
     unexpected. */
  let url: URL;
  try {
    url = new URL(target);
    if (url.protocol !== 'https:') throw new Error('not https');
  } catch {
    return NextResponse.redirect(new URL('/', 'https://mgmtglobal.com'), 307);
  }

  const res = NextResponse.redirect(url, 307);
  // Keep this out of search results and out of any shared cache.
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
