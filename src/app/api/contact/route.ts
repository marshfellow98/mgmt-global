import { NextResponse } from 'next/server';
import { sendMail, clean, validEmail } from '@/lib/mail';
import {
  looksLikeSpam, clientKey, rateLimit, withinBudget, budgetUsed,
  firstTimeSeeing, contentLooksAutomated,
} from '@/lib/guard';

export const runtime = 'nodejs';

/* Daily ceiling for this form alone.

   Resend's allowance is shared with /confidential, and a bot once consumed
   all of it before 9am. This cap means contact-form abuse can exhaust only
   the contact form's share; a genuine confidential enquiry still gets
   through. Forty is far above anything this firm sees in a real day — the
   busiest legitimate day on record is nowhere near it — so it will only ever
   bite during an attack. */
const DEFAULT_DAILY_MAX = 40;

/* Emergency lever, settable from the Render dashboard with no code change.

   Set CONTACT_DAILY_MAX=0 to stop this form mailing anyone, immediately, the
   moment the service restarts. That matters because the alternative during
   an attack is waiting for a build. The form keeps accepting and still looks
   normal to a visitor; nothing is delivered.

   Raise it back when the attack passes. /confidential has its own budget and
   is unaffected by this value. */
function dailyMax(): number {
  const raw = process.env.CONTACT_DAILY_MAX;
  if (raw === undefined || raw.trim() === '') return DEFAULT_DAILY_MAX;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_DAILY_MAX;
}

/* Every rejection returns ok:true.

   Telling a bot it failed just invites a retry with the rule tweaked, and
   the sender cannot tell the difference anyway. The one exception is a
   malformed email address, which a real person needs to see so they can fix
   it. */
const ACCEPT = () => NextResponse.json({ ok: true });

export async function POST(req: Request) {
  const form = await req.formData();

  if (looksLikeSpam(form)) return ACCEPT();

  const who = clientKey(req);
  // A person sends one enquiry, occasionally two. Nobody sends four an hour.
  if (!rateLimit(`c:h:${who}`, 3, 60 * 60 * 1000)) return ACCEPT();
  if (!rateLimit(`c:d:${who}`, 8, 24 * 60 * 60 * 1000)) return ACCEPT();

  const email = clean(form, 'email', 200);
  if (!validEmail(email)) {
    return NextResponse.json({ ok: false, error: 'Please check the email address.' }, { status: 400 });
  }

  const name = clean(form, 'name', 120);
  const company = clean(form, 'company', 160);
  const phone = clean(form, 'phone', 60);
  const topic = clean(form, 'topic', 120);
  const message = clean(form, 'message');

  if (contentLooksAutomated({ name, company, message })) return ACCEPT();

  /* The attack was the same one or two names over and over, so identical
     content arriving twice is the clearest signal available. A real person
     re-sending because they weren't sure it worked is also served well by
     this: they get the success they expect, and the inbox gets one copy. */
  if (!firstTimeSeeing([name, email, message])) return ACCEPT();

  const max = dailyMax();
  if (max === 0 || !withinBudget('contact', max)) {
    /* Count only. No address, no content — this line exists so an unusual
       day is visible in Render's logs, not to record who wrote in. */
    console.warn('[contact] daily budget reached; dropping. used=', budgetUsed('contact'));
    return ACCEPT();
  }

  const body = [
    `Name:    ${name || '—'}`,
    `Company: ${company || '—'}`,
    `Email:   ${email}`,
    `Phone:   ${phone || '—'}`,
    `Topic:   ${topic || '—'}`,
    '',
    message || '(no message)',
  ].join('\n');

  const result = await sendMail({
    to: process.env.CONTACT_TO || 'info@mgmtglobal.com',
    subject: `Website enquiry${topic ? ` — ${topic}` : ''}${name ? ` — ${name}` : ''}`,
    body,
    replyTo: email,
  });

  if (!result.ok) return NextResponse.json(result, { status: 502 });
  return ACCEPT();
}
