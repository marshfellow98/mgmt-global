'use client';

import { useEffect, useRef } from 'react';
import type { LedgerItem } from './ProcessLedger';

/* ============================================================================
   LedgerSection — the pinned, full-width version of the process ledger.

   The inline ProcessLedger sat in a 3:4 slot beside body copy. This takes the
   whole viewport instead: one enormous word behind, the steps at display size,
   a rail that fills as you scroll through.

   It reuses PinnedSection's contract shape (compute progress, hand it to a
   draw function) but not the component itself, because the layout is
   different — no side-by-side column, no swappable interior.

   Height is items.length + 1 viewports, same rule as PinnedSection: room to
   move through every step and then release.
   ============================================================================ */

export default function LedgerSection({
  kick, watermark, items,
}: { kick: string; watermark: string; items: LedgerItem[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const tickRefs = useRef<(HTMLElement | null)[]>([]);
  const shownRef = useRef(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const n = items.length;
    const at = items.map((_, i) => (n <= 1 ? 0 : i / (n - 1)));

    const paint = (p: number) => {
      if (railRef.current) railRef.current.style.transform = `scaleY(${p})`;
      rowRefs.current.forEach((row, i) => {
        if (row) row.dataset.on = String(p >= at[i] - 0.02);
      });
      tickRefs.current.forEach((bar, i) => {
        if (!bar) return;
        const lo = i === 0 ? 0 : at[i - 1];
        bar.style.transform = `scaleX(${clamp((p - lo) / (at[i] - lo || 1))})`;
      });
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      paint(1);
      return;
    }

    let frame = 0;
    let running = false;

    const tick = () => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) { running = false; return; }
      const total = r.height - window.innerHeight;
      const target = total > 0 ? clamp(-r.top / total) : 0;
      const diff = target - shownRef.current;
      if (Math.abs(diff) < 0.0005) {
        shownRef.current = target;
        paint(target);
        running = false;
        return;
      }
      shownRef.current += diff * 0.14;
      paint(shownRef.current);
      frame = requestAnimationFrame(tick);
    };

    const kickOff = () => { if (!running) { running = true; frame = requestAnimationFrame(tick); } };
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
    <section
      ref={sectionRef}
      className="relative bg-char2"
      style={{ height: `${(items.length + 1) * 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden" style={{ contain: 'layout paint' }}>
        {/* The flourish: one enormous word, barely there. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 select-none text-center font-display font-semibold leading-none"
          style={{
            fontSize: 'clamp(8rem, 30vw, 26rem)',
            color: 'rgba(225,161,63,.045)',
            letterSpacing: '-0.05em',
            transform: 'translateY(-50%)',
          }}
        >
          {watermark}
        </div>

        <div className="pin-head shell relative">
          <div className="kick">{kick}</div>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center">
          <div className="shell w-full">
            <ol className="relative m-0 flex list-none flex-col gap-[clamp(1.6rem,4vh,3rem)] p-0 pl-10 sm:pl-14">
              <div aria-hidden="true" className="absolute bottom-3 left-0 top-3 w-px bg-rule" />
              <div
                ref={railRef}
                aria-hidden="true"
                className="absolute bottom-3 left-0 top-3 w-px origin-top bg-gold"
                style={{ transform: 'scaleY(0)' }}
              />

              {items.map((it, i) => (
                <li
                  key={it.n}
                  ref={(el) => { rowRefs.current[i] = el; }}
                  data-on="false"
                  className="ledger-row relative"
                >
                  <span
                    aria-hidden="true"
                    className="ledger-dot absolute -left-10 top-[.42em] h-[9px] w-[9px] -translate-x-[4px] rounded-full border border-[#3B4E66] bg-char2 sm:-left-14"
                  />
                  <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                    <span className="ledger-n font-display text-[clamp(2.2rem,6vw,4.5rem)] font-semibold leading-none">
                      {it.n}
                    </span>
                    <div>
                      <div className="ledger-title font-display text-[clamp(1.3rem,3vw,2.2rem)] font-semibold leading-tight">
                        {it.title}
                      </div>
                      <div className="ledger-detail mt-1.5 max-w-[46ch] text-[clamp(.9rem,1.3vw,1.05rem)] leading-snug text-muted">
                        {it.detail}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="ticks relative">
          {items.map((it, i) => (
            <div key={it.n} className="tick">
              <i ref={(el) => { tickRefs.current[i] = el; }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
