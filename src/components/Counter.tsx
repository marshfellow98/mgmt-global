'use client';

import { useEffect, useRef, useState } from 'react';

/* ============================================================================
   Counter

   Counts up to the figure when it first comes into view. Worth doing here
   because the numbers *are* the argument — 1,200 placements and 25 years of
   database are the reason to trust the firm, and watching them climb makes a
   reader actually register the size rather than skim past it.

   Details that keep it from feeling cheap:

   - Eases out rather than running linear, so it decelerates into the final
     value instead of stopping dead.
   - Runs once. Re-triggering on every scroll past is the thing that makes
     counters feel like a widget.
   - Duration scales slightly with magnitude, so 50 doesn't take as long as
     1,200 — otherwise small numbers crawl.
   - Reduced motion gets the final value immediately, no animation.
   - The final value is in the markup from the start, so it's correct for
     search engines and for anyone without JavaScript.
   ============================================================================ */

export default function Counter({
  value,
  duration,
}: {
  /** The target figure, e.g. 1200. */
  value: number;
  /** Override the automatic duration, in ms. */
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  const doneRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    // Start from zero only once we know we'll animate.
    setShown(0);

    const ms = duration ?? Math.min(2200, 900 + Math.log10(Math.max(value, 10)) * 400);

    const run = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      const start = performance.now();

      const tick = (now: number) => {
        const t = Math.min((now - start) / ms, 1);
        // easeOutExpo — fast out of the gate, gentle landing
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        setShown(Math.round(value * eased));
        if (t < 1) requestAnimationFrame(tick);
        else setShown(value);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { run(); io.disconnect(); } },
      { threshold: 0.4 }
    );
    io.observe(el);

    // If the observer never fires, show the real number rather than a zero.
    const failsafe = window.setTimeout(() => { setShown(value); io.disconnect(); }, 2500);

    return () => { io.disconnect(); window.clearTimeout(failsafe); };
  }, [value, duration]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {shown.toLocaleString('en-US')}
    </span>
  );
}
