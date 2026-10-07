import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import Line from '@/components/Line';

export const metadata: Metadata = {
  title: 'Page not found | MGMTGlobal',
  description:
    'That page has moved. Find retained search, contingent submittal, M&A consulting, open roles, and contact details for MGMTGlobal Consulting.',
  robots: { index: false, follow: true },
};

/* Most arrivals here are old links from the previous site that next.config.mjs
   doesn't have a redirect for. So this page routes rather than apologises —
   the four destinations below cover everything the old site had. */
const ROUTES: [string, string, string][] = [
  ['Retained Search', '/services/retained-search', 'For the hires that matter most.'],
  ['M&A Consulting', '/services/ma-consulting', 'Grow by acquisition, not one hire at a time.'],
  ['Open roles', '/careers', 'Current searches across the insurance industry.'],
  ['Talk to us', '/contact', 'Thirty minutes, directly with Shane.'],
];

export default function NotFound() {
  return (
    <section className="glow">
      <div
        className="shell"
        style={{
          paddingTop: 'calc(var(--navh) + clamp(3rem,8vw,6rem))',
          paddingBottom: 'clamp(4rem,10vw,8rem)',
        }}
      >
        <Reveal immediate>
          <div className="kick fade">404</div>
          <h1 className="display-lg mb-8">
            <Line>That page has</Line><Line><em className="accent">moved.</em></Line>
          </h1>
          <p className="sub fade d2 mb-12 max-w-[52ch]">
            We rebuilt this site, and a few old addresses didn’t survive the move.
            Everything that was here is still here — it’s just somewhere else now.
          </p>

          <div className="fade d3 max-w-[46rem]">
            {ROUTES.map(([label, href, blurb]) => (
              <Link
                key={href}
                href={href}
                className="group block border-t border-rule py-[1.3rem] transition-[padding] duration-300 last:border-b hover:pl-3 sm:flex sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-8"
              >
                <span className="text-[1.05rem] transition-colors group-hover:text-gold">
                  {label} <span className="arw">&rarr;</span>
                </span>
                <span className="mt-1 block text-[.88rem] text-muted sm:mt-0 sm:inline">{blurb}</span>
              </Link>
            ))}
          </div>

          <p className="fade d4 mt-12 text-[.9rem] text-muted">
            Exploring a move and would rather stay discreet?{' '}
            <Link href="/confidential" className="text-gold underline-offset-4 hover:underline">
              Reach us in confidence
            </Link>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}
