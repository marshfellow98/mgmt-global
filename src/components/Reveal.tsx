'use client';

import { useEffect, useRef, useState, type ReactNode, type ElementType } from 'react';

/* Adds `is-on` to trigger the masked line reveals and fades in globals.css.

   Two safeguards, both learned the hard way:

   - `immediate` reveals on mount instead of waiting for an intersection.
     Use it for anything above the fold. A hero is already on screen, so
     making it wait for a scroll observer is both pointless and fragile.

   - A timeout reveals anything still hidden after 1.2s. If an observer
     never fires — an odd viewport, a layout that leaves the element
     technically out of view — content appears anyway rather than
     staying invisible. */
export default function Reveal({
  children,
  as: Tag = 'div',
  className = '',
  threshold = 0.12,
  immediate = false,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  threshold?: number;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      requestAnimationFrame(() => setOn(true));
      return;
    }

    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setOn(true); return; }

    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setOn(true); io.disconnect(); } },
      { threshold, rootMargin: '0px 0px -6% 0px' }
    );
    io.observe(el);

    const failsafe = window.setTimeout(() => { setOn(true); io.disconnect(); }, 1200);

    return () => { io.disconnect(); window.clearTimeout(failsafe); };
  }, [threshold, immediate]);

  return (
    <Tag ref={ref as never} className={`${on ? 'is-on' : ''} ${className}`.trim()}>
      {children}
    </Tag>
  );
}
