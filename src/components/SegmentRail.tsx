'use client';

import { useEffect, useRef, useState } from 'react';
import Spotlight from './Spotlight';
import { SEGMENTS } from '@/lib/content';

/* ============================================================================
   SegmentRail

   Four practice areas. On a wide monitor they all fit and this is simply a
   row; on a laptop or phone it scrolls sideways.

   The hint only appears when the rail actually overflows — measured, not
   assumed. Telling someone to drag a row that already fits is worse than
   saying nothing, because they go looking for behaviour that isn't there.

   A fade on the right edge appears under the same condition, so there's a
   visual cue that content continues past the edge, and it disappears once
   you've scrolled to the end.
   ============================================================================ */

export default function SegmentRail() {
  const railRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;

    const measure = () => {
      const over = el.scrollWidth > el.clientWidth + 4;
      setOverflows(over);
      setAtEnd(over && el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);

    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <div className="relative">
      <div ref={railRef} className="hrail">
        {SEGMENTS.map((s) => (
          <Spotlight key={s.title} className="hcard" size={320} strength={0.08}>
            <h4>{s.title}</h4>
            <p>{s.blurb}</p>
            <ul>{s.roles.map((r) => <li key={r}>{r}</li>)}</ul>
          </Spotlight>
        ))}
      </div>

      {/* Edge fade — only while there is more to reach. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-24 transition-opacity duration-300"
        style={{
          opacity: overflows && !atEnd ? 1 : 0,
          background: 'linear-gradient(to right, rgba(5,7,10,0), rgba(5,7,10,.9))',
        }}
      />

      {overflows && (
        <div className="shell">
          <div className="mt-4 text-[.7rem] uppercase tracking-[.16em] text-[#4A5661]">
            Drag to explore &rarr;
          </div>
        </div>
      )}
    </div>
  );
}
