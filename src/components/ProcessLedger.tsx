'use client';

import { useEffect, useRef } from 'react';

/* ============================================================================
   ProcessLedger — a typographic process panel that fills the 3:4 slot on each
   service page, where a stock photo used to sit.

   Scroll-linked but NOT pinned. As the panel travels up through the viewport,
   a gold rail fills from top to bottom and each step lights as the rail
   reaches it. It reads as a ledger being ticked off, which is what a search
   process is.

   Why this instead of another pinned section: the retained-search page
   already has one (the globe) further down. Two pinned sections on one page
   would fight each other. This one is quieter — it moves as you pass it and
   then it's done — so the page has one moment of arrival, not two.

   Behind the steps sits a single large word at very low opacity, set in the
   display serif. It's the one flourish. It gives the panel a sense of depth
   and identity without any imagery, and it costs nothing.

   Progress is computed from the panel's own position: 0 when its top enters
   the lower part of the viewport, 1 when its bottom reaches the upper part.
   Eased toward each frame so it never steps.

   Reduced motion: everything rendered fully lit, no animation.
   ============================================================================ */

export type LedgerItem = { n: string; title: string; detail: string };

export default function ProcessLedger({
  kick,
  watermark,
  items,
}: {
  kick: string;
  watermark: string;
  items: LedgerItem[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const shownRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    const rail = railRef.current;
    if (!el || !rail) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

    const paint = (p: number) => {
      rail.style.transform = `scaleY(${p})`;
      const n = items.length;
      rowRefs.current.forEach((row, i) => {
        if (!row) return;
        const at = n <= 1 ? 0 : i / (n - 1);
        row.dataset.on = String(p >= at - 0.02);
      });
    };

    if (reduced) { paint(1); return; }

    let frame = 0;
    let running = false;

    const target = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Start when the panel's top is 80% down the screen; finish when its
      // bottom is 30% down. That keeps the action in the middle band, where
      // the reader is actually looking.
      const start = vh * 0.8;
      const end = vh * 0.3;
      return clamp((start - r.top) / (start - end + r.height));
    };

    const tick = () => {
      const t = target();
      const diff = t - shownRef.current;
      if (Math.abs(diff) < 0.0005) {
        shownRef.current = t;
        paint(t);
        running = false;
        return;
      }
      shownRef.current += diff * 0.14;
      paint(shownRef.current);
      frame = requestAnimationFrame(tick);
    };

    const kickOff = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', kickOff, { passive: true });
    window.addEventListener('resize', kickOff);
    kickOff();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', kickOff);
      window.removeEventListener('resize', kickOff);
    };
  }, [items]);

  return (
    <div
      ref={ref}
      className="ledger relative flex h-full w-full flex-col overflow-hidden border border-rule bg-char2"
    >
      {/* The one flourish: a large word, barely there. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[.18em] -right-[.06em] select-none font-display font-semibold leading-none"
        style={{
          fontSize: 'clamp(7rem, 22vw, 15rem)',
          color: 'rgba(225,161,63,.06)',
          letterSpacing: '-0.04em',
        }}
      >
        {watermark}
      </div>

      <div className="relative flex h-full flex-col p-[clamp(1.5rem,3.5vw,2.6rem)]">
        <div className="kick mb-0">{kick}</div>

        <ol className="relative m-0 mt-auto flex list-none flex-col gap-[clamp(1.1rem,2.4vw,1.8rem)] p-0 pl-8">
          {/* Rail: a track, and a gold fill that scales with progress. */}
          <div aria-hidden="true" className="absolute bottom-2 left-0 top-2 w-px bg-rule" />
          <div
            ref={railRef}
            aria-hidden="true"
            className="absolute bottom-2 left-0 top-2 w-px origin-top bg-gold"
            style={{ transform: 'scaleY(0)' }}
          />

          {items.map((it, i) => (
            <li
              key={it.n}
              ref={(el) => { rowRefs.current[i] = el; }}
              data-on="false"
              className="ledger-row relative"
            >
              {/* Node on the rail */}
              <span
                aria-hidden="true"
                className="ledger-dot absolute -left-8 top-[.55em] h-[7px] w-[7px] -translate-x-[3px] rounded-full border border-[#3B4E66] bg-char2"
              />
              <div className="flex items-baseline gap-4">
                <span className="ledger-n font-display text-[clamp(1.6rem,3vw,2.3rem)] font-semibold leading-none">
                  {it.n}
                </span>
                <div>
                  <div className="ledger-title font-display text-[clamp(1rem,1.5vw,1.2rem)] font-semibold leading-tight">
                    {it.title}
                  </div>
                  <div className="ledger-detail mt-1 text-[.86rem] leading-snug text-muted">
                    {it.detail}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
