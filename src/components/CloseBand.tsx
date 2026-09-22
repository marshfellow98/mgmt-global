import Link from 'next/link';
import Reveal from './Reveal';
import Line from './Line';

export default function CloseBand() {
  return (
    <Reveal className="glow py-[clamp(5rem,12vw,10rem)] text-center">
      <div className="shell">
        <h2 className="mx-auto mb-9 max-w-[16ch] text-[clamp(2.1rem,5.6vw,4.6rem)] leading-[1.05]">
          <Line>A hire too important</Line>
          <Line><>to leave to <em className="accent">chance.</em></></Line>
        </h2>
        <p className="fade d2 mx-auto mb-11 max-w-[44ch] text-muted">
          Thirty minutes, completely confidential, and you talk directly with our team.
        </p>
        <Link href="/contact" className="btn fade d3">
          Book a Consultation <span className="arw">&rarr;</span>
        </Link>
      </div>
    </Reveal>
  );
}
