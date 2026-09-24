import type { Metadata } from 'next';
import Reveal from '@/components/Reveal';
import Line from '@/components/Line';
import StickyCards from '@/components/StickyCards';
import CloseBand from '@/components/CloseBand';

export const metadata: Metadata = {
  title: 'Insurance Recruitment Services | Retained Search & M&A',
  description:
    'Retained search, contingent submittal, and M&A consulting for insurance carriers, brokerages, captives and programs across the United States.',
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'Insurance Recruitment Services | Retained Search & M&A',
    description: 'Retained search, contingent submittal, and M&A consulting for insurance carriers, brokerages, captives and programs across the United States.',
    url: '/services',
    type: 'website',
  },
};

export default function Services() {
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
          <div className="kick fade">Our services</div>
          <h1 className="display-lg mb-8">
            <Line>Strategic recruitment</Line>
            <Line><>and <em className="accent">consulting solutions.</em></></Line>
          </h1>
          <p className="sub fade d2">
            MGMTGlobal partners with insurance organizations to solve complex talent challenges
            through executive search, specialized recruitment, and strategic advisory.
          </p>
        </div>
      </Reveal>

      <section className="py-[clamp(4rem,10vw,9rem)]"><StickyCards /></section>

      <section className="bg-char py-[clamp(4rem,10vw,9rem)]">
        <Reveal className="shell grid gap-10 lg:grid-cols-2 lg:gap-[4.5rem]">
          <div>
            <div className="kick fade">Why MGMT</div>
            <h2 className="display">
              <Line>Built for firms where</Line>
              <Line><em className="accent">talent matters most.</em></Line>
            </h2>
          </div>
          <div>
            <p className="fade d2">
              Every engagement is different, but our objective remains the same — to connect
              exceptional organizations with exceptional professionals.
            </p>
            <p className="fade d3">
              Our consultants combine industry expertise, market intelligence, and an extensive
              professional network to deliver recruitment solutions that create long-term value.
            </p>
          </div>
        </Reveal>
      </section>

      <CloseBand />
    </>
  );
}
