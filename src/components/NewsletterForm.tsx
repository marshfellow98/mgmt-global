'use client';

import { useEffect, useRef, useState } from 'react';

/* ============================================================================
   NewsletterForm

   Sits in the footer on every page. Posts to /api/subscribe, which adds the
   address to Buttondown.

   Same principles as the contact forms: a real form with a real action so it
   works without JavaScript, fetch submission layered on top for inline
   feedback, and the honeypot-plus-timestamp spam check rather than a CAPTCHA.

   Being already subscribed reports as success with a different message. It
   isn't an error from the visitor's point of view, and showing one makes the
   form look broken.
   ============================================================================ */

type State = 'idle' | 'sending' | 'done' | 'error';

export default function NewsletterForm() {
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState('');
  const startedRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (startedRef.current) startedRef.current.value = String(Date.now());
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === 'sending') return;
    setState('sending');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        body: new FormData(e.currentTarget),
      });
      const data = await res.json().catch(() => ({ ok: res.ok }));

      if (res.ok && data.ok) {
        setMessage(data.already ? 'You’re already on the list.' : 'Thanks — you’re on the list.');
        setState('done');
      } else {
        setMessage(data.error || 'Something went wrong. Please try again.');
        setState('error');
      }
    } catch {
      setMessage('Could not reach the server. Please try again.');
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <p className="border-l-2 border-gold py-1 pl-4 text-[.9rem] text-white">
        {message}
      </p>
    );
  }

  return (
    <form action="/api/subscribe" method="post" onSubmit={onSubmit}>
      <div className="flex flex-wrap gap-2">
        <input
          type="email"
          name="email"
          required
          placeholder="you@company.com"
          aria-label="Email address"
          className="field min-w-[170px] flex-1"
        />
        <button type="submit" className="btn" disabled={state === 'sending'}>
          {state === 'sending' ? 'Joining…' : 'Join'}
        </button>
      </div>

      {/* Anti-spam: hidden from people, filled by bots. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="nl_company_website">Leave this field empty</label>
        <input id="nl_company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={startedRef} type="hidden" name="started_at" defaultValue="0" />

      {state === 'error' && (
        <p role="alert" className="mt-2 text-[.82rem] text-[#E08B8B]">{message}</p>
      )}
    </form>
  );
}
