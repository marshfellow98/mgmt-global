import Link from 'next/link';
import Reveal from '@/components/Reveal';
import Line from '@/components/Line';
import Marquee from '@/components/Marquee';
import StickyCards from '@/components/StickyCards';
import SegmentRail from '@/components/SegmentRail';
import CloseBand from '@/components/CloseBand';
import { STATS, PROCESS_STEPS, WHY, QUOTES } from '@/lib/content';

/* Hosted on the previous developer's staging server for now. Move to
   /public and swap these paths once the uploads zip arrives. */
const HERO_VIDEO = 'https://zktech.dz/MGMT/wp-content/uploads/2026/07/Hero-Video.mp4#t=0,9';
const HERO_POSTER = 'https://zktech.dz/MGMT/wp-content/uploads/2026/07/Hero-Home.webp';

export default function Home() {
  return (
    <>
      <Reveal as="header" className="relative flex min-h-[100svh] items-end overflow-hidden">
        <div className="absolute inset-0 bg-[#0A0F16] motion-reduce:hidden">
          <video
            autoPlay muted loop playsInline poster={HERO_POSTER}
            className="h-full w-full object-cover"
            style={{ objectPosition: 'center 60%' }}
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg,rgba(5,7,10,.96) 0%,rgba(5,7,10,.82) 38%,rgba(5,7,10,.25) 78%),' +
              'linear-gradient(to top,rgba(5,7,10,1) 2%,rgba(5,7,10,0) 48%)',
          }}
        />
        <div
          className="relative mx-auto w-full max-w-shell px-[var(--pad)]"
          style={{
            paddingTop: 'calc(var(--navh) + clamp(1.5rem,4vh,3rem))',
            paddingBottom: 'clamp(3rem,9vh,6rem)',
          }}
        >
          <div className="fade mb-8 flex items-center gap-3 text-[.66rem] font-semibold uppercase tracking-[.24em] text-gold">
            <span className="h-px w-11 bg-gold" />
            Future growth, today
          </div>
          <h1 className="display-lg mb-8">
            <Line>Hire the insurance</Line>
            <Line>producers your</Line>
            <Line><em className="accent">competitors wish</em></Line>
            <Line><em className="accent">they had.</em></Line>
          </h1>
          <p className="sub fade d2 mb-11">
            For more than two decades, insurance organizations have come to MGMTGlobal when a hire
            is too important to leave to chance.
          </p>
          <div className="fade d3 flex flex-wrap items-center gap-x-10 gap-y-5">
            <Link href="/contact" className="btn">
              Book a Consultation <span className="arw">&rarr;</span>
            </Link>
            <p className="m-0 max-w-[19ch] text-[.8rem] leading-snug text-muted">
              Exploring your next move?
              <br />
              <Link href="/contact" className="lnk mt-2">Start here <span>&rarr;</span></Link>
            </p>
          </div>
        </div>
      </Reveal>

      <Marquee />

      <section className="glow py-[clamp(4rem,10vw,9rem)]">
        <div className="shell grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label}>
              <div className={`fade d${i} text-[clamp(2.6rem,6vw,4.6rem)] font-semibold leading-[.9] tracking-[-.03em] font-display`}>
                {s.n}<span className="text-gold">{s.unit}</span>
              </div>
              <div className={`fade d${i + 1} mt-4 max-w-[18ch] text-[.78rem] leading-snug text-muted`}>
                {s.label}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-char py-[clamp(4rem,10vw,9rem)]">
        <Reveal className="shell grid items-center gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-[4.5rem]">
          <div className="ph fade aspect-[4/5]">Shane Graham — portrait</div>
          <div>
            <div className="kick fade">Who we are</div>
            <h2 className="display">
              <Line>A recruiting firm</Line>
              <Line><>and a <em className="accent">growth partner.</em></></Line>
            </h2>
            <p className="fade d2">Most search firms cover every industry and know none of them deeply.</p>
            <p className="fade d2">
              We chose the opposite. MGMTGlobal works only in insurance — carriers, wholesale and
              retail brokerage, captives, and programs — across producer, C-suite, director, and
              partner roles.
            </p>
            <p className="fade d3">
              That focus is the whole advantage. We already know the players, the books, and the
              moves before we start.
            </p>
            <p className="fade d3 font-medium text-white">
              This isn’t résumé matching. It’s strategic growth, intelligently delivered.
            </p>
            <p className="fade d4 mt-8">
              <Link href="/about" className="lnk">Learn more about us <span>&rarr;</span></Link>
            </p>
          </div>
        </Reveal>
      </section>

      <section className="py-[clamp(4rem,10vw,9rem)]">
        <Reveal className="shell">
          <div className="kick fade">What we do</div>
          <h2 className="display">
            <Line>End-to-end talent</Line>
            <Line>and management</Line>
            <Line><em className="accent">solutions.</em></Line>
          </h2>
        </Reveal>
        <div className="mt-14"><StickyCards /></div>
      </section>

      <section className="bg-char py-[clamp(4rem,10vw,9rem)]">
        <Reveal className="shell">
          <div className="kick fade">How it works</div>
          <h2 className="display mb-12">
            <Line>A search process you</Line>
            <Line><>can <em className="accent">actually understand.</em></></Line>
          </h2>
          <div className="grid gap-9 md:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((s, i) => (
              <div key={s.n} className={`topline fade d${i}`}>
                <h3 className="text-[1.05rem]">{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-11">
            <Link href="/services/retained-search" className="lnk">
              See the full process <span>&rarr;</span>
            </Link>
          </p>
        </Reveal>
      </section>

      <section className="py-[clamp(4rem,10vw,9rem)]">
        <Reveal className="shell mb-11">
          <div className="kick fade">Where we work</div>
          <h2 className="display">
            <Line>Every corner of</Line>
            <Line>the industry.</Line>
          </h2>
        </Reveal>
        <SegmentRail />
      </section>

      <section className="bg-char2 py-[clamp(4rem,10vw,9rem)]">
        <Reveal className="shell">
          <div className="kick fade">Firms that trust us with their growth</div>
          <h2 className="display mb-12">
            <Line><>What our <em className="accent">clients say.</em></></Line>
          </h2>
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
