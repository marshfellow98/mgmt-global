import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* ============================================================================
   /api/health

   Reports which environment variables the running server can actually see.
   Booleans only — never the values themselves.

   This exists because "is the variable set?" is otherwise unanswerable from
   outside. The Render dashboard showing a variable and the running process
   seeing it are two different things: a typo in the key name, a value pasted
   with quotes, or a deploy that predates the change all look identical from
   the form.

   Safe to leave in place. If you'd rather not have it public, delete this
   file once the forms are confirmed working.
   ============================================================================ */

export async function GET() {
  const key = process.env.RESEND_API_KEY ?? '';

  return NextResponse.json({
    RESEND_API_KEY: {
      present: key.length > 0,
      looksValid: /^re_/.test(key),
      length: key.length,          // length only, never the value
    },
    MAIL_FROM: {
      present: Boolean(process.env.MAIL_FROM),
      value: process.env.MAIL_FROM ?? null,   // not a secret; must match the verified domain
    },
    CONTACT_TO: { present: Boolean(process.env.CONTACT_TO) },
    CONFIDENTIAL_TO: { present: Boolean(process.env.CONFIDENTIAL_TO) },
    RECRUITERFLOW_API_KEY: { present: Boolean(process.env.RECRUITERFLOW_API_KEY) },
    nodeEnv: process.env.NODE_ENV,
    checkedAt: new Date().toISOString(),
  });
}
