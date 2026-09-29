import { NextResponse } from 'next/server';
import { looksLikeSpam, clean, validEmail } from '@/lib/mail';

export const runtime = 'nodejs';

/* ============================================================================
   Newsletter signup.

   Adds the address to Buttondown. The footer form has existed since the first
   build and posted to this route, which didn't exist — so every signup got a
   404 and was lost. Fixed.

   Notes:

   - Already-subscribed is treated as success. Telling someone "you're already
     on the list" is fine; returning an error for it makes the form look
     broken and invites a retry.

   - Buttondown's own double opt-in setting governs whether a confirmation
     email goes out. Leave that to their dashboard rather than forcing it
     here — it's a deliverability decision, not a code one.

   - The same honeypot and timing checks as the other forms. No CAPTCHA.
   ============================================================================ */

export async function POST(req: Request) {
  const form = await req.formData();

  // Silently accept spam — telling a bot it failed invites a retry.
  if (looksLikeSpam(form)) return NextResponse.json({ ok: true });

  const email = clean(form, 'email', 200);
  if (!validEmail(email)) {
    return NextResponse.json(
      { ok: false, error: 'Please check the email address.' },
      { status: 400 }
    );
  }

  const key = process.env.BUTTONDOWN_API_KEY;
  if (!key) {
    return NextResponse.json(
      { ok: false, error: 'Server is missing BUTTONDOWN_API_KEY.' },
      { status: 500 }
    );
  }

  try {
    const res = await fetch('https://api.buttondown.com/v1/subscribers', {
      method: 'POST',
      headers: { Authorization: `Token ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email_address: email,
        // Where they came from, so Shane can tell site signups from any
        // other source later.
        tags: ['website'],
      }),
    });

    if (res.ok) return NextResponse.json({ ok: true });

    // 400 with an "already exists" body is not a failure from the visitor's
    // point of view.
    const body = await res.text().catch(() => '');
    if (res.status === 400 && /already|exists|subscribed/i.test(body)) {
      return NextResponse.json({ ok: true, already: true });
    }

    console.error('[subscribe] Buttondown', res.status, body.slice(0, 200));
    return NextResponse.json(
      { ok: false, error: 'Could not subscribe. Please try again.' },
      { status: 502 }
    );
  } catch (err) {
    console.error('[subscribe] failed:', err instanceof Error ? err.name : 'unknown');
    return NextResponse.json(
      { ok: false, error: 'Could not reach the server. Please try again.' },
      { status: 502 }
    );
  }
}
