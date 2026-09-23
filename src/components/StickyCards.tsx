import Link from 'next/link';
import Spotlight from './Spotlight';
import { SERVICES } from '@/lib/content';

/* Each card sticks a little lower than the last, so they stack as you pass.
   Offsets clear the fixed nav. */
export default function StickyCards() {
  return (
    <div className="shell">
      {SERVICES.map((s, i) => (
        <Spotlight
          as="article"
          key={s.slug}
          className="scard"
          size={520}
        >
          <div>
            <div className="idx">Service {String(i + 1).padStart(2, '0')}</div>
            <h3>{s.title}</h3>
          </div>
          <div>
            <p>{s.blurb}</p>
            <Link href={`/services/${s.slug}`} className="lnk">
              Explore {s.title.toLowerCase()} <span>&rarr;</span>
            </Link>
          </div>
        </Spotlight>
      ))}
    </div>
  );
}
