import { NextResponse } from 'next/server';
import { sendMail, looksLikeSpam, clean, validEmail } from '@/lib/mail';

export const runtime = 'nodejs';

/* ============================================================================
   Confidential enquiries.

   Deliberately different from /api/contact:

   - Goes to CONFIDENTIAL_TO, which should be a personal address of Shane's,
     not a shared inbox that staff or a future hire could read.
   - Nothing is logged. Not the body, not the sender, not even on failure.
     The page promises discretion; a server log is a place that promise could
     leak from.
   - The subject line carries no identifying detail, so a notification on a
     lock screen gives nothing away.
   ============================================================================ */

export async function POST(req: Request) {
  const form = await req.formData();

  if (looksLikeSpam(form)) return NextResponse.json({ ok: true });

  const email = clean(form, 'email', 200);
  if (!validEmail(email)) {
    return NextResponse.json({ ok: false, error: 'Please check the email address.' }, { status: 400 });
  }

  const name = clean(form, 'name', 120);
  const focus = clean(form, 'focus', 300);
  const motivation = clean(form, 'motivation');
  const reach = clean(form, 'reach', 300);

  const body = [
    'Confidential enquiry from the website.',
    '',
    `Name:        ${name || '(not given)'}`,
    `Email:       ${email}`,
    `Focus:       ${focus || '—'}`,
    `Reach them:  ${reach || '—'}`,
    '',
    'What would make a move worth it:',
    motivation || '(not given)',
    '',
    '---',
    'Do not reply to a work address. Use the address above only.',
  ].join('\n');

  const result = await sendMail({
    to: process.env.CONFIDENTIAL_TO || process.env.CONTACT_TO || 'info@mgmtglobal.com',
    subject: 'Confidential enquiry',   // no name, no detail
    body,
    replyTo: email,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
