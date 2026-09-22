'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/* ============================================================================
   SmoothScroll

   The browser scrolls a page in coarse jumps — a mouse wheel moves it ~100px
   at a time, and nothing interpolates between those steps. That is what reads
   as choppy, and no amount of easing inside an animated section fixes it,
   because the page itself is what's jumping.

   Lenis intercepts wheel and touch input and drives the scroll position
   itself, interpolating every frame. Everything downstream — the pinned
   sections, the reveal observers, position: sticky — keeps working, because
   Lenis still moves real scroll position and fires real scroll events.

   Respects prefers-reduced-motion: anyone who has asked for less movement
   gets plain native scrolling, which is the correct behaviour rather than a
   degraded one.
   ============================================================================ */

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.05,          // seconds to settle; lower = tighter, higher = floatier
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      // Leave touch devices on native scrolling. Phones already interpolate,
      // and overriding it fights the platform's own momentum.
      syncTouch: false,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // In-page anchors need to go through Lenis, or they jump instantly and
    // leave its internal position out of step with the real one.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement)?.closest?.('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -100 });
    };
    document.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('click', onClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
