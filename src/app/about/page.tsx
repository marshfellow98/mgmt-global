import type { Metadata } from 'next';
import Image from 'next/image';
import Reveal from '@/components/Reveal';
import Line from '@/components/Line';
import PinnedSection from '@/components/PinnedSection';
import PathDiagram from '@/components/PathDiagram';
import SegmentRail from '@/components/SegmentRail';
import CloseBand from '@/components/CloseBand';
import { JsonLd, personSchema, breadcrumbSchema } from '@/lib/schema';
import { ADVANTAGE_STEPS, ADVANTAGE_PATH, ADVANTAGE_WAYPOINTS, VALUES, QUOTES } from '@/lib/content';

export const metadata: Metadata = {
  title: 'About MGMTGlobal | Insurance Executive Search Since 2000',
  description:
    'MGMTGlobal is a boutique retained search and M&A consultancy working only in insurance. Founded by Shane Graham, with a 25-year proprietary talent database.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About MGMTGlobal | Insurance Executive Search Since 2000',
    description: 'MGMTGlobal is a boutique retained search and M&A consultancy working only in insurance. Founded by Shane Graham, with a 25-year proprietary talent database.',
    url: '/about',
    type: 'website',
  },
};

export default function About() {
  return (
    <>
      <JsonLd
        data={[
          personSchema,
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
          ]),
        ]}
      />
      <Reveal as="header" className="glow border-b border-rule" >
        <div
          className="shell"
          style={{
            paddingTop: 'calc(var(--navh) + clamp(3rem,8vw,6rem))',
            paddingBottom: 'clamp(3.5rem,7vw,5.5rem)',
          }}
        >
          <div className="kick fade">Who we are</div>
          <h1 className="display-lg mb-8">
            <Line>A management partner,</Line>
            <Line><>not just a <em className="accent">recruitment firm.</em></></Line>
          </h1>
          <p className="sub fade d2">
            MGMTGlobal is a talent and management consultancy focused on helping organizations scale
            through better hiring decisions. We operate at the intersection of recruitment,
            strategy, and organizational design.
          </p>
        </div>
      </Reveal>

      <section className="py-[clamp(4rem,10vw,9rem)]">
        <Reveal className="shell grid items-center gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-[4.5rem]">
          <div className="fade relative aspect-[4/5] overflow-hidden">
            <Image
              src="/images/shane-graham.jpg"
              alt="Shane Graham, Founder, President & CEO of MGMTGlobal"
              fill
              sizes="(min-width: 900px) 42vw, 90vw"
              className="object-cover"
            />
          </div>
          <div>
            <div className="kick fade">The principal</div>
            <h2 id="shane-graham" className="display mb-2"><Line>Shane Graham</Line></h2>
            <p className="fade d1 mb-6 text-[.72rem] font-semibold uppercase tracking-[.18em] text-gold">
              Founder, President &amp; CEO
            </p>
            <p className="fade d2">
              As a young entrepreneur, Shane owned, operated, and directed an automotive
              manufacturing company into one of the largest in its industry.
            </p>
            <p className="fade d2">
              He founded Graham Group USA in 2000 and built it into a nationally recognized
              executive search and consulting firm working exclusively in insurance, earning
              multiple performance awards along the way.
            </p>
            <p className="fade d3">
              From 2007 through 2015 he was Shareholder, Partner, and Managing Director at
              Kaye/Bassman International, responsible for all insurance initiatives domestically
              and internationally.
            </p>
            <p className="fade d3">
              He has been married to Yvette for thirty years. They have two children, Shelbie and Ryan.
            </p>
          </div>
        </Reveal>
      </section>

      <PinnedSection
        kick="The advantage · One industry, twenty-five years"
        heading={<><Line>Depth you can’t build</Line><Line><>after the <em className="accent">search starts.</em></></Line></>}
        steps={ADVANTAGE_STEPS}
      >
        <PathDiagram path={ADVANTAGE_PATH} waypoints={ADVANTAGE_WAYPOINTS} />
      </PinnedSection>

      <section className="bg-char py-[clamp(4rem,10vw,9rem)]">
        <Reveal className="shell">
          <div className="kick fade">Core values</div>
          <h2 className="display mb-12"><Line><>How <em className="accent">we work.</em></></Line></h2>
          <div className="grid gap-9 md:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v, i) => (
              <div key={v.title} className={`topline fade d${i % 4}`}>
                <h3>{v.title}</h3>
                <p>{v.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="py-[clamp(4rem,10vw,9rem)]">
        <Reveal className="shell mb-11">
          <div className="kick fade">Experience</div>
          <h2 className="display">
            <Line>Built across every</Line>
            <Line><>corner of <em className="accent">the industry.</em></></Line>
          </h2>
        </Reveal>
        <SegmentRail />
      </section>

      <section className="bg-char2 py-[clamp(4rem,10vw,9rem)]">
        <Reveal className="shell">
          <div className="kick fade">Firms that trust us with their growth</div>
          <h2 className="display mb-12"><Line><>What our <em className="accent">clients say.</em></></Line></h2>
          <div className="grid gap-10 lg:grid-cols-3">
            {QUOTES.map((q, i) => (
              <div key={q.name} className={`quote fade d${i + 1}`}>
                <blockquote>{q.body}</blockquote>
                <div className="who">
                  <div className="name">{q.name}</div>
                  <div className="role">{q.role}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <CloseBand />
    </>
  );
}
