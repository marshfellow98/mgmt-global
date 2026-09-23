import Link from 'next/link';
import { Wordmark } from './Wordmark';
import { CONTACT } from '@/lib/content';

const NAV = [
  ['/about', 'About'],
  ['/services', 'Services'],
  ['/services/retained-search', 'Retained Search'],
  ['/services/contingent-submittal', 'Contingent Submittal'],
  ['/services/ma-consulting', 'M&A Consulting'],
  ['/careers', 'Careers'],
  ['/confidential', 'In Confidence'],
  ['/contact', 'Contact'],
];

export default function Footer() {
  return (
    <footer className="border-t border-rule">
      <div className="shell">
        <div className="grid gap-10 pb-[clamp(2.5rem,5vw,3.5rem)] pt-[clamp(3rem,6vw,4.5rem)] md:grid-cols-[1.3fr_1fr_1.2fr] md:gap-14">
          <div>
            <Wordmark large />
            <p className="mt-4 max-w-[34ch] text-[.92rem] text-muted">
              The insurance industry&rsquo;s boutique retained-search and M&amp;A partner. Based in
              North Texas, serving clients across the United States and beyond.
            </p>
          </div>
          <div>
            <p className="mb-4 text-[.64rem] font-semibold uppercase tracking-[.2em] text-gold">Navigate</p>
            <ul className="grid list-none gap-2.5 p-0">
              {NAV.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-[.9rem] text-[#9AA4AF] transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-4 text-[.64rem] font-semibold uppercase tracking-[.2em] text-gold">
              Stay ahead of the market
            </p>
            <p className="mb-4 text-[.9rem] text-muted">
              Industry hiring trends and insights, a few times a year.
            </p>
            <NewsletterForm />
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-4 border-t border-rule py-6 pb-10 text-[.8rem] text-[#55606B]">
          <div>&copy; {new Date().getFullYear()} MGMT Global Consulting. All rights reserved.</div>
          <div>{CONTACT.email} &middot; {CONTACT.phone}</div>
        </div>
      </div>
    </footer>
  );
}

function NewsletterForm() {
  return (
    <form action="/api/subscribe" method="post" className="flex flex-wrap gap-2">
      <input
        type="email" name="email" required
        placeholder="you@company.com" aria-label="Email address"
        className="field min-w-[170px] flex-1"
      />
      <button type="submit" className="btn">Join</button>
    </form>
  );
}
