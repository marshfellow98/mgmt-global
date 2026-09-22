import type { Metadata } from 'next';
import Reveal from '@/components/Reveal';
import Line from '@/components/Line';
import { CONTACT, CONTACT_TOPICS } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Talk to MGMTGlobal about a search, a placement, or your next move.',
};

const DETAILS = [
  ['Location', CONTACT.location],
  ['Call', CONTACT.phone],
  ['WhatsApp', CONTACT.whatsapp],
  ['Fax', CONTACT.fax],
  ['Email', CONTACT.email],
];

export default function Contact() {
  return (
    <>
      <Reveal as="header" className="glow border-b border-rule">
        <div
          className="shell"
          style={{
            paddingTop: 'calc(var(--navh) + clamp(3rem,8vw,6rem))',
            paddingBottom: 'clamp(3.5rem,7vw,5.5rem)',
          }}
        >
          <div className="kick fade">Reach out</div>
          <h1 className="display-lg mb-8">
            <Line>Let’s start a</Line><Line><em className="accent">conversation.</em></Line>
          </h1>
          <p className="sub fade d2">
            Thirty minutes, completely confidential, and you talk directly with our team.
          </p>
        </div>
      </Reveal>

      <section className="py-[clamp(4rem,10vw,9rem)]">
        <Reveal className="shell grid gap-10 lg:grid-cols-2 lg:gap-[4.5rem]">
          <div>
            <h2 className="display mb-4 text-[clamp(1.6rem,3.6vw,2.4rem)]">
              <Line>Send us a message.</Line>
            </h2>
            <p className="fade d2 mb-9">
              For general inquiries, fill out the form and we’ll get back to you within one
              business day.
            </p>
            <form action="/api/contact" method="post" className="fade d3 grid gap-4 sm:grid-cols-2">
              <Field label="Name" name="name" required />
              <Field label="Company" name="company" />
              <Field label="Email" name="email" type="email" required />
              <Field label="Phone number" name="phone" type="tel" />
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="topic">Choose a topic</label>
                <select id="topic" name="topic" className="field" defaultValue="">
                  <option value="" disabled>Select one…</option>
                  {CONTACT_TOPICS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="message">How can we help?</label>
                <textarea id="message" name="message" className="field min-h-[130px] resize-y" />
              </div>
              <div className="sm:col-span-2">
                <button type="submit" className="btn">Send message <span className="arw">&rarr;</span></button>
              </div>
            </form>
          </div>

          <div>
            <h2 className="display mb-9 text-[clamp(1.6rem,3.6vw,2.4rem)]">
              <Line>Or reach us directly.</Line>
            </h2>
            <div className="fade d2">
              {DETAILS.map(([k, v]) => (
                <div key={k} className="flex flex-wrap justify-between gap-4 border-t border-rule py-[1.15rem] last:border-b">
                  <span className="text-[.64rem] font-semibold uppercase tracking-[.18em] text-gold">{k}</span>
                  <span className="text-[.98rem]">{v}</span>
                </div>
              ))}
            </div>
            <p className="fade d3 mt-10 text-[.95rem] text-muted">
              MGMT Global Consulting serves clients across the United States and beyond.
            </p>
            <p className="fade d3 mt-8">
              <a className="btn" href={CONTACT.calendly} target="_blank" rel="noopener noreferrer">
                Schedule on Calendly <span className="arw">&rarr;</span>
              </a>
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function Field({
  label, name, type = 'text', required = false,
}: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="field-label" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} required={required} className="field" />
    </div>
  );
}
