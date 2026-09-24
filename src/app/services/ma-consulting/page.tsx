import type { Metadata } from 'next';
import Reveal from '@/components/Reveal';
import Line from '@/components/Line';
import CloseBand from '@/components/CloseBand';
import LedgerSection from '@/components/LedgerSection';
import { MA_LEDGER } from '@/lib/content';
import ServiceShell from '../ServiceShell';

export const metadata: Metadata = {
  title: 'M&A Consulting',
  description: 'Talent consulting for mergers, acquisitions, lift-outs, and restructuring in insurance.',
};

const MODES = [
  { title: 'Acquisitions', body: 'Supporting leadership integration, talent retention, and organizational restructuring following acquisitions.' },
  { title: 'Lift-outs', body: 'Recruiting entire teams or specialized business units while ensuring continuity and minimal disruption.' },
  { title: 'Fold-ins', body: 'Supporting the successful integration of acquired teams into existing organizational structures.' },
  { title: 'Roll-ins', body: 'Advising through business consolidations, leadership realignment, and operational restructuring.' },
];

export default function MAConsulting() {
  return (
    <ServiceShell
      kick="M&amp;A Consulting"
      heading={<><Line>Strategic consulting</Line><Line><>through <em className="accent">every stage of growth.</em></></Line></>}
      lede="Corporate transactions reshape organizations, and people are often the most critical factor in their success. We help organizations navigate mergers, acquisitions, restructuring, and executive transitions with confidence."
      active="ma-consulting"
    >
      <section className="py-[clamp(4rem,10vw,9rem)]">
        <Reveal className="shell grid gap-10 lg:grid-cols-2 lg:gap-[4.5rem]">
          <div>
            <h2 className="display text-[clamp(1.6rem,3.6vw,2.6rem)]">
              <Line>Grow by team,</Line><Line>not just by hire.</Line>
            </h2>
            <p className="fade d2">
              Successful M&amp;A activity requires more than financial planning. It demands careful
              leadership assessment, organizational alignment, talent retention, and strategic
              recruitment.
            </p>
            <p className="fade d3">
              Our consultants work alongside executive teams to ensure the right people are in the
              right roles before, during, and after organizational change.
            </p>
            <p className="fade d3 mt-8">
              <a className="lnk" href="#">Download the overview (PDF) <span>&rarr;</span></a>
            </p>
          </div>
          <div className="fade d1 aspect-[3/4]">
            <div className="ph h-full w-full">M&amp;A Consulting — image</div>
          </div>
        </Reveal>
      </section>

      <section className="bg-char py-[clamp(4rem,10vw,9rem)]">
        <Reveal className="shell">
          <div className="kick fade">Our services</div>
          <h2 className="display mb-12">
            <Line>A client-specific</Line><Line><em className="accent">consulting search.</em></Line>
          </h2>
          <div className="grid gap-9 md:grid-cols-2 lg:grid-cols-4">
            {MODES.map((m, i) => (
              <div key={m.title} className={`topline fade d${i}`}>
                <h3>{m.title}</h3>
                <p>{m.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <LedgerSection {...MA_LEDGER} />

      <CloseBand />
    </ServiceShell>
  );
}
