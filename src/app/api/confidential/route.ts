import { NextResponse } from 'next/server';
import { sendMail, clean, validEmail } from '@/lib/mail';
import { looksLikeSpam, clientKey, rateLimit, withinBudget } from '@/lib/guard';

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

   Its abuse protection is deliberately lighter than the contact form's, and
   it is NOT the same code path:

   - No content de-duplication. Hashing what someone wrote, even in memory
     and even unreadable, is the one thing this page should not do.
   - No warning log when the budget is hit. The contact route logs a count;
     this one stays silent, because even "a confidential enquiry was dropped
     at 09:14" is more than this page should ever record.
   - Its own daily budget, so a flood against /api/contact can never consume
     the allowance this form needs. That is the failure that actually
     mattered when the contact form was attacked: the highest-stakes message
     on the site would have been the one that silently failed to arrive.
   ============================================================================ */

/* Generous: a candidate reaching out quietly may well hesitate, close the
   tab and come back. This exists to stop a flood, not to ration access. */
const DAILY_MAX = 30;

export async function POST(req: Request) {
  const form = await req.formData();

  if (looksLikeSpam(form)) return NextResponse.json({ ok: true });

  const who = clientKey(req);
  if (!rateLimit(`x:h:${who}`, 5, 60 * 60 * 1000)) return NextResponse.json({ ok: true });
  if (!withinBudget('confidential', DAILY_MAX)) return NextResponse.json({ ok: true });

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
