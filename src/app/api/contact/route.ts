import { NextResponse } from 'next/server';
import { sendMail, looksLikeSpam, clean, validEmail } from '@/lib/mail';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const form = await req.formData();

  // Silently accept spam. Telling a bot it failed just invites a retry.
  if (looksLikeSpam(form)) return NextResponse.json({ ok: true });

  const email = clean(form, 'email', 200);
  if (!validEmail(email)) {
    return NextResponse.json({ ok: false, error: 'Please check the email address.' }, { status: 400 });
  }

  const name = clean(form, 'name', 120);
  const company = clean(form, 'company', 160);
  const phone = clean(form, 'phone', 60);
  const topic = clean(form, 'topic', 120);
  const message = clean(form, 'message');

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
  return NextResponse.json({ ok: true });
}
