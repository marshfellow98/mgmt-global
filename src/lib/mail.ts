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
  if (!key) return { ok: false, error: 'Email is not configured yet.' };
  if (!to) return { ok: false, error: 'No destination address configured.' };

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

/* ----------------------------------------------------------------------------
   Spam handling without a CAPTCHA.

   A CAPTCHA on a confidential inquiry form is exactly the wrong signal — it
   tells a cautious executive that the firm is worried about them. These two
   checks cost the visitor nothing and stop the overwhelming majority of bots:

   - A honeypot field, hidden from people, that bots fill in.
   - A timestamp. A human takes more than three seconds to complete a form;
     a script posts instantly.
   ---------------------------------------------------------------------------- */

export function looksLikeSpam(form: FormData): boolean {
  if (String(form.get('company_website') || '').trim() !== '') return true;

  const started = Number(form.get('started_at') || 0);
  if (started && Date.now() - started < 3000) return true;

  return false;
}

export function clean(form: FormData, key: string, max = 4000): string {
  return String(form.get(key) ?? '').trim().slice(0, max);
}

export function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}
