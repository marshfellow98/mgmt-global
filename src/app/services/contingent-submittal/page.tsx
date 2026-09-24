import type { Metadata } from 'next';
import Reveal from '@/components/Reveal';
import Line from '@/components/Line';
import CloseBand from '@/components/CloseBand';
import LedgerSection from '@/components/LedgerSection';
import { CONTINGENT_LEDGER } from '@/lib/content';
import ServiceShell from '../ServiceShell';

export const metadata: Metadata = {
  title: 'Contingent Submittal',
  description: 'Flexible, success-based recruitment for ongoing insurance hiring needs.',
};

const IDEAL = ['Producers', 'Account managers', 'Underwriters', 'Claims professionals',
  'Operations', 'Mid-level professionals', 'Administrative leadership'];
const WHY = ['No upfront commitment', 'Faster candidate delivery', 'Access to established talent networks',
  'Industry-specialized recruiters', 'Flexible hiring support', 'Success-based engagement'];

export default function ContingentSubmittal() {
  return (
    <ServiceShell
      kick="Contingent recruitment"
      heading={<><Line>Flexible recruitment</Line><Line><>for <em className="accent">ongoing hiring needs.</em></></Line></>}
      lede="When speed and flexibility are priorities, our contingent service connects organizations with qualified professionals while keeping the industry expertise and personal service MGMTGlobal is known for."
      active="contingent-submittal"
    >
      <section className="py-[clamp(4rem,10vw,9rem)]">
        <Reveal className="shell grid gap-10 lg:grid-cols-2 lg:gap-[4.5rem]">
          <div>
            <h2 className="display text-[clamp(1.6rem,3.6vw,2.6rem)]"><Line>Our approach</Line></h2>
            {/* Rewritten — the original copy on the old site was garbled. */}
            <p className="fade d2">
              While running a retained search we often meet exceptional people who aren’t right for
              that particular role but would be right for someone. Rather than let those
              introductions go to waste, we bring them to organizations we know are hiring.
            </p>
            <p className="fade d2">
              Every contingent search still draws on our full network and legacy database. Our
              consultants identify, evaluate, and present candidates who align with both your
              technical requirements and your culture.
            </p>
            <p className="fade d3 font-medium text-white">You pay only on a successful placement.</p>
            <p className="fade d3 mt-8">
              <a className="lnk" href="#">Download the overview (PDF) <span>&rarr;</span></a>
            </p>
          </div>
          <div className="fade d1 aspect-[3/4]">
            <div className="ph h-full w-full">Contingent Submittal — image</div>
          </div>
        </Reveal>
      </section>

      <section className="bg-char py-[clamp(4rem,10vw,9rem)]">
        <Reveal className="shell grid gap-10 lg:grid-cols-2 lg:gap-[4.5rem]">
          <div>
            <h3 className="fade mb-6 text-[1.35rem]">Best suited for</h3>
            <ul className="checks fade d1">{IDEAL.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
          <div>
            <h3 className="fade d1 mb-6 text-[1.35rem]">Why clients choose it</h3>
            <ul className="checks fade d2">{WHY.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
        </Reveal>
      </section>

      <LedgerSection {...CONTINGENT_LEDGER} />

      <CloseBand />
    </ServiceShell>
  );
}
