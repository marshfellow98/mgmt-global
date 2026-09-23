'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/* ============================================================================
   Form

   Wraps a plain <form> and submits it with fetch, so the visitor gets an
   inline result instead of a page reload.

   It stays a real form with a real action, which matters: if JavaScript fails
   the browser posts it natively and the route handler still works. Same
   principle as the reveal animations — the fallback is the thing that works,
   and the enhancement sits on top.

   Carries the two anti-spam fields described in lib/mail.ts: a honeypot only
   a bot would fill, and a timestamp that catches instant submissions. No
   CAPTCHA anywhere — on a confidential enquiry form especially, asking an
   executive to prove they're human is the wrong signal entirely.
   ============================================================================ */

type State = 'idle' | 'sending' | 'sent' | 'error';

export default function Form({
  action,
  children,
  submitLabel,
  successTitle = 'Message sent.',
  successBody = 'We’ll be in touch shortly.',
}: {
  action: string;
  children: ReactNode;
  submitLabel: string;
  successTitle?: string;
  successBody?: string;
}) {
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState('');
  const startedRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === 'sending') return;

    setState('sending');
    setError('');

    try {
      const res = await fetch(action, {
        method: 'POST',
        body: new FormData(e.currentTarget),
      });
      const data = await res.json().catch(() => ({ ok: res.ok }));

      if (res.ok && data.ok) setState('sent');
      else {
        setError(data.error || 'Something went wrong. Please try again.');
        setState('error');
      }
    } catch {
      setError('Could not reach the server. Please try again.');
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div className="border-l-2 border-gold py-1 pl-6">
        <p className="mb-2 font-display text-[1.25rem] font-semibold text-white">{successTitle}</p>
        <p className="m-0 text-[.95rem] text-muted">{successBody}</p>
      </div>
    );
  }

  return (
    <form action={action} method="post" onSubmit={onSubmit} className="grid gap-5">
      {children}

      {/* Anti-spam. Hidden from people, visible to bots. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="company_website">Leave this field empty</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={startedRef} type="hidden" name="started_at" defaultValue="0" />

      <div className="mt-2 flex flex-wrap items-center gap-5">
        <button type="submit" className="btn" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : submitLabel}{' '}
          {state !== 'sending' && <span className="arw">&rarr;</span>}
        </button>
        {state === 'error' && (
          <p role="alert" className="m-0 text-[.88rem] text-[#E08B8B]">{error}</p>
        )}
      </div>
    </form>
  );
}
