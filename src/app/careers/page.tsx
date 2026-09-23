import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import Line from '@/components/Line';
import CloseBand from '@/components/CloseBand';
import JobBoard from './JobBoard';
import { getOpenJobs, locationsOf } from '@/lib/recruiterflow';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Open roles placed by MGMTGlobal, and opportunities to join the firm.',
};

/* Revalidated on the same window as the API cache. */
export const revalidate = 900;

export default async function Careers() {
  const jobs = await getOpenJobs();
  const locations = locationsOf(jobs);

  return (
    <>
      <Reveal as="header" immediate className="glow border-b border-rule">
        <div
          className="shell"
          style={{
            paddingTop: 'calc(var(--navh) + clamp(3rem,8vw,6rem))',
            paddingBottom: 'clamp(3.5rem,7vw,5.5rem)',
          }}
        >
          <div className="kick fade">Careers</div>
          <h1 className="display-lg mb-8">
            <Line>Build the future of</Line>
            <Line><>insurance talent <em className="accent">with us.</em></></Line>
          </h1>
          <p className="sub fade d2">
            We’re always looking for sharp, driven individuals who want to shape how companies grow
            through people.
          </p>
        </div>
      </Reveal>

      <section className="py-[clamp(4rem,10vw,9rem)]">
        <Reveal className="shell grid gap-10 lg:grid-cols-2 lg:gap-[4.5rem]">
          <div>
            <div className="kick fade">Why MGMT</div>
            <h2 className="display">
              <Line>A boutique</Line><Line><em className="accent">by design.</em></Line>
            </h2>
          </div>
          <div>
            <p className="fade d2">
              MGMTGlobal is the executive search and M&amp;A partner of choice for the insurance
              industry. We stay small on purpose, so every search gets senior attention and every
              engagement is run by someone who knows this market.
            </p>
            <p className="fade d3">
              If you’re tired of being a number at a large firm, or you want a seat at the table on
              the deals that shape this industry, we’d like to meet you.
            </p>
            <p className="fade d4 mt-8">
              <Link href="/about" className="lnk">Learn more about us <span>&rarr;</span></Link>
            </p>
            <p className="fade d4 mt-6 max-w-[46ch] text-[.88rem] text-muted">
              Not looking at our own roles, but curious what else is out there?{' '}
              <Link href="/confidential" className="text-gold underline-offset-4 hover:underline">
                Start a confidential conversation
              </Link>{' '}
              instead — nothing goes anywhere without your say-so.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="bg-char py-[clamp(4rem,10vw,9rem)]">
        <Reveal className="shell">
          <div className="kick fade">Open roles</div>
          <h2 className="display mb-12">
            <Line>Currently</Line><Line><em className="accent">searching.</em></Line>
          </h2>
          <div className="fade d2">
            <JobBoard jobs={jobs} locations={locations} />
          </div>
        </Reveal>
      </section>

      <CloseBand />
    </>
  );
}
