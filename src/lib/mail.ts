import { Resend } from 'resend';

/* ============================================================================
   Mail

   Both forms relay straight to an inbox. Nothing is stored anywhere — no
   database, no third-party dashboard, no logs of the message body. That is a
   deliberate choice rather than a shortcut: /confidential promises discretion,
   and a promise like that is hollow if the submission sits in a SaaS admin
   panel someone else can read.

   Uses Resend. Free tier covers 3,000 emails a month, which is far beyond
   what a boutique firm's site will generate.
   ============================================================================ */

const FROM = process.env.MAIL_FROM || 'MGMTGlobal Site <noreply@mgmtglobal.com>';

export type MailResult = { ok: true } | { ok: false; error: string };

export async function sendMail({
  to, subject, body, replyTo,
}: {
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
}): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY;

  /* Name the missing piece rather than saying "not configured". The generic
     message sends you hunting; this points straight at the variable. */
  if (!key) {
    return { ok: false, error: 'Server is missing RESEND_API_KEY. Check the Render environment.' };
  }
  if (!to) {
    return { ok: false, error: 'Server is missing a destination address (CONTACT_TO / CONFIDENTIAL_TO).' };
  }
  if (!/^re_/.test(key)) {
    return { ok: false, error: 'RESEND_API_KEY does not look like a Resend key — check for stray quotes or spaces.' };
  }

  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      text: body,
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) {
      // Log the failure, never the message contents.
      console.error('Mail send failed:', error.name);
      return { ok: false, error: 'Could not send. Please try again.' };
    }
    return { ok: true };
  } catch (err) {
    console.error('Mail threw:', err instanceof Error ? err.name : 'unknown');
    return { ok: false, error: 'Could not send. Please try again.' };
  }
}

/* Spam handling lives in guard.ts — honeypot, timing, rate limits, per-form
   daily budgets and duplicate suppression, in one place. It is deliberately
   not here: this file sends mail and should have no opinion about whether a
   submission deserves sending. */

export function clean(form: FormData, key: string, max = 4000): string {
  return String(form.get(key) ?? '').trim().slice(0, max);
}

export function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}
