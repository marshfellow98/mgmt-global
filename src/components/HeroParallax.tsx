'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/* ============================================================================
   HeroParallax

   The video drifts down and scales up very slightly as you scroll away from
   it, so the hero recedes rather than sliding off as a flat sheet. It reads as
   depth without anyone consciously noticing motion — which is the point. Heavy
   parallax announces itself; this shouldn't.

   Transform only, written once per animation frame. No layout, no paint, so
   it costs the compositor almost nothing and doesn't undo the smooth-scroll
   work.
   ============================================================================ */

export default function HeroParallax({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;

    const paint = () => {
      frame = 0;
      const y = window.scrollY;
      const h = window.innerHeight;
      if (y > h) return;                 // hero is gone; stop working
      const p = Math.min(y / h, 1);      // 0 at top, 1 one screen down
      const drift = p * 90;              // px downward
      const scale = 1 + p * 0.07;        // slight push in
      el.style.transform = `translate3d(0, ${drift}px, 0) scale(${scale})`;
    };

    const onScroll = () => { if (!frame) frame = requestAnimationFrame(paint); };
    window.addEventListener('scroll', onScroll, { passive: true });
    paint();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div ref={ref} className="hero-media absolute inset-0 bg-[#0A0F16] will-change-transform motion-reduce:hidden">
      {children}
    </div>
  );
}
