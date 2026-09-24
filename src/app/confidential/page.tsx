import type { Metadata } from 'next';
import Reveal from '@/components/Reveal';
import Line from '@/components/Line';
import Form from '@/components/Form';
import { CONTACT } from '@/lib/content';

/* ============================================================================
   /confidential

   A deliberately different door.

   The people worth reaching are the ones least able to raise their hand. A
   producer with a real book has genuine exposure if word travels before
   they're ready. So this page is built around removing reasons not to start
   a conversation:

   - It asks for less than the contact form, not more. No employer, no work
     phone. Name is optional.
   - It names the fear out loud instead of pretending it isn't there.
   - It is visually quieter than the rest of the site — no video, no glass,
     narrow column, minimal motion. The restraint is the message.

   The commitments below are promises the firm has to actually keep. If the
   page says "we won't contact you at work" and someone calls their office,
   this is worse than not having it at all.
   ============================================================================ */

export const metadata: Metadata = {
  title: 'A Confidential Conversation | Explore Quietly',
  description:
    'A discreet way for insurance professionals to explore options. Your name goes nowhere without your say-so, and we never contact you at work.',
  alternates: { canonical: '/confidential' },
  openGraph: {
    title: 'A Confidential Conversation | Explore Quietly',
    description: 'A discreet way for insurance professionals to explore options. Your name goes nowhere without your say-so, and we never contact you at work.',
    url: '/confidential',
    type: 'website',
  },
};

const COMMITMENTS = [
  {
    title: 'Your name goes nowhere without your say-so.',
    body: 'We never put a name, a résumé, or a detail in front of a client until you have told us to, for that specific role.',
  },
  {
    title: 'We will not contact you at work.',
    body: 'No calls to your office line, no messages to your work address, nothing through a colleague. You tell us how and when to reach you.',
  },
  {
    title: 'A conversation is not a commitment.',
    body: 'Most people we talk to are not ready to move. That is normal, and it is useful — knowing the market is worth something on its own.',
  },
  {
    title: 'We already know your market.',
    body: 'You will not spend the first call explaining what a wholesale broker does. Twenty-five years in insurance and nothing else.',
  },
];

export default function Confidential() {
  return (
    <>
      <Reveal as="header" immediate>
        <div
          className="mx-auto max-w-[760px] px-[var(--pad)]"
          style={{
            paddingTop: 'calc(var(--navh) + clamp(3rem,9vw,6.5rem))',
            paddingBottom: 'clamp(2rem,5vw,3.5rem)',
          }}
        >
          <div className="kick fade">In confidence</div>
          <h1 className="mb-8 text-[clamp(2rem,5vw,3.6rem)] leading-[1.04]">
            <Line>Explore quietly.</Line>
            <Line><>Nothing moves until <em className="accent">you say so.</em></></Line>
          </h1>
          <p className="fade d2 max-w-[56ch] text-[clamp(1rem,1.4vw,1.1rem)] text-[#AFBAC4]">
            The best people in this industry are rarely looking, and they have good reason to be
            careful. If you are curious about what else is out there but cannot afford for that
            curiosity to travel, this is the way to start.
          </p>
        </div>
      </Reveal>

      <section className="pb-[clamp(3rem,7vw,5rem)]">
        <Reveal className="mx-auto max-w-[760px] px-[var(--pad)]">
          <div className="border-t border-rule pt-10">
            <div className="kick fade">What we commit to</div>
            <dl className="mt-2 grid gap-8 sm:grid-cols-2">
              {COMMITMENTS.map((c, i) => (
                <div key={c.title} className={`fade d${i}`}>
                  <dt className="mb-2 font-display text-[1.08rem] font-semibold leading-snug">
                    {c.title}
                  </dt>
                  <dd className="m-0 text-[.92rem] leading-relaxed text-muted">{c.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </section>

      <section className="pb-[clamp(4rem,10vw,8rem)]">
        <Reveal className="mx-auto max-w-[760px] px-[var(--pad)]">
          <div className="border-t border-rule pt-10">
            <div className="kick fade">Start the conversation</div>
            <h2 className="mb-3 text-[clamp(1.5rem,3vw,2.1rem)]">
              <Line>Tell us as little as you like.</Line>
            </h2>
            <p className="fade d2 mb-9 max-w-[52ch] text-[.96rem] text-muted">
              Enough to have a useful conversation is enough. We do not need your employer, and we
              do not need your name until you want to give it.
            </p>

            {/* Deliberately fewer fields than the contact form. Every one
                removed is a reason not to start that has been taken away. */}
            <div className="fade d3">
              <Form
                action="/api/confidential"
                submitLabel="Send privately"
                successTitle="Received, in confidence."
                successBody="It goes to Shane directly. He’ll reply from a personal address, using the method you asked for — never to a work address."
              >
                <div>
                  <label className="field-label" htmlFor="email">
                    Personal email{' '}
                    <span className="normal-case tracking-normal text-muted">
                      — not your work address
                    </span>
                  </label>
                  <input id="email" name="email" type="email" required className="field" />
                </div>

                <div>
                  <label className="field-label" htmlFor="focus">What you do</label>
                  <input
                    id="focus" name="focus" type="text" className="field"
                    placeholder="Commercial producer, employee benefits, underwriting…"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="motivation">
                    What would make a move worth it
                  </label>
                  <textarea
                    id="motivation" name="motivation" className="field min-h-[120px] resize-y"
                    placeholder="Better carrier relationships, a real path to equity, leaving a bad fit, or just curious what the market looks like."
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="reach">When and how to reach you</label>
                  <input
                    id="reach" name="reach" type="text" className="field"
                    placeholder="Evenings on my mobile, email only, weekends…"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="name">
                    Name{' '}
                    <span className="normal-case tracking-normal text-muted">— optional</span>
                  </label>
                  <input id="name" name="name" type="text" className="field" />
                </div>
              </Form>
            </div>

            <p className="fade d4 mt-8 text-[.85rem] leading-relaxed text-[#6B7681]">
              Would rather not use a form? Email{' '}
              <a href={`mailto:${CONTACT.email}`} className="text-gold underline-offset-4 hover:underline">
                {CONTACT.email}
              </a>{' '}
              from a personal address, or call {CONTACT.phone} and ask for Shane directly. Either
              reaches the same place.
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
