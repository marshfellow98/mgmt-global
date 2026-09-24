import type { Metadata } from 'next';
import Reveal from '@/components/Reveal';
import Line from '@/components/Line';
import PinnedSection from '@/components/PinnedSection';
import Globe from '@/components/Globe';
import CloseBand from '@/components/CloseBand';
import ServiceShell from '../ServiceShell';
import { PROCESS_STEPS, PROCESS_GLOBE } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Retained Search',
  description: 'A dedicated executive search partnership for the hires that matter most.',
};

const IDEAL = ['Executive leadership', 'C-suite positions', 'Regional leadership', 'Practice leaders',
  'Specialized technical roles', 'Business development executives', 'Highly confidential searches'];
const WHY = ['Exclusive search partnership', 'Dedicated consulting team', 'Confidential recruitment process',
  'Comprehensive market research', 'Higher quality candidate pool', 'Long-term hiring success'];

export default function RetainedSearch() {
  return (
    <ServiceShell
      kick="Retained Search"
      heading={<><Line>A screening method</Line><Line><>designed for <em className="accent">high performers.</em></></Line></>}
      lede="When hiring executive leaders or highly specialized professionals, success requires more than access to candidates. It demands a strategic search process built on research, confidentiality, and partnership."
      active="retained-search"
    >
      <section className="py-[clamp(4rem,10vw,9rem)]">
        <Reveal className="shell grid gap-10 lg:grid-cols-2 lg:gap-[4.5rem]">
          <div>
            <h2 className="display text-[clamp(1.6rem,3.6vw,2.6rem)]"><Line>The partnership</Line></h2>
            <p className="fade d2">
              Retained Search is a dedicated executive recruitment partnership where MGMTGlobal
              manages every stage of the hiring process exclusively on your behalf.
            </p>
            <p className="fade d2">
              We invest significant time in understanding your business, leadership culture, and
              long-term objectives before identifying and engaging exceptional talent.
            </p>
            <p className="fade d3 font-medium text-white">
              Unlike transactional recruiting, retained search prioritizes quality, discretion, and
              long-term success.
            </p>
            <p className="fade d3 mt-8">
              {/* TODO: point at /retained-search-overview.pdf once the file arrives */}
              <a className="lnk" href="#">Download the overview (PDF) <span>&rarr;</span></a>
            </p>
          </div>
          <div className="ph fade d1 aspect-[3/4]">Retained Search — image</div>
        </Reveal>
      </section>

      <section className="bg-char py-[clamp(4rem,10vw,9rem)]">
        <Reveal className="shell grid gap-10 lg:grid-cols-2 lg:gap-[4.5rem]">
          <div>
            <h3 className="fade mb-6 text-[1.35rem]">When to choose retained search</h3>
            <ul className="checks fade d1">{IDEAL.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
          <div>
            <h3 className="fade d1 mb-6 text-[1.35rem]">Why clients choose it</h3>
            <ul className="checks fade d2">{WHY.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
        </Reveal>
      </section>

      <PinnedSection
        kick="How it works · Retained search in four steps"
        heading={<><Line>A search process you</Line><Line><>can <em className="accent">actually understand.</em></></Line></>}
        steps={PROCESS_STEPS}
      >
        {/* Phase two: the 3D interior. PathDiagram is one line away if
            this ever needs to come back out. */}
        <Globe waypoints={PROCESS_GLOBE} />
      </PinnedSection>

      <CloseBand />
    </ServiceShell>
  );
}
