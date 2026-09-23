'use client';

import { useEffect, useRef } from 'react';

/* ============================================================================
   ArcDivider

   A single gold arc that draws itself as it enters view, echoing the sweep in
   the logo mark.

   This is the one piece of ornament on the site that isn't borrowed from a
   general design vocabulary — it comes from his own identity. That's what
   makes it feel like this firm's website rather than a well-executed
   template, and it costs one SVG path.

   Used as a section break where the page needs a breath rather than another
   heading.
   ============================================================================ */

export default function ArcDivider({ flip = false }: { flip?: boolean }) {
  const ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let len = 600;
    try { len = el.getTotalLength(); } catch { /* not laid out yet */ }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      el.style.strokeDasharray = 'none';
      return;
    }

    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(len);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.22,1,.36,1)';
        el.style.strokeDashoffset = '0';
        io.disconnect();
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="shell py-[clamp(2rem,6vw,4rem)]" aria-hidden="true">
      <svg
        viewBox="0 0 1200 90"
        className="block w-full"
        style={{ transform: flip ? 'scaleX(-1)' : undefined }}
      >
        <path
          ref={ref}
          d="M 0 78 C 300 78, 420 14, 700 14 S 1020 62, 1200 34"
          fill="none"
          stroke="#E1A13F"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
    </div>
  );
}
