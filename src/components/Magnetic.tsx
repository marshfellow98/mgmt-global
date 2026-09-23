'use client';

import Link from 'next/link';
import { useEffect, useRef, type ReactNode } from 'react';

/* ============================================================================
   Magnetic

   The element leans a few pixels toward the cursor as it approaches, then
   settles back. It reads as physical rather than decorative, which is why it
   suits a primary call to action and would be irritating on everything.

   Kept deliberately small — 7px of travel. Large magnetism is a portfolio-site
   move and makes buttons feel slippery and harder to click, which is the
   opposite of what a "Book a Consultation" button should do.

   Skipped on touch devices and under reduced motion.
   ============================================================================ */

export default function Magnetic({
  href,
  children,
  className = '',
  travel = 7,
  external = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  travel?: number;
  external?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let tx = 0;
    let ty = 0;

    const paint = () => {
      frame = 0;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      // -1..1 from the centre of the element
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      tx = Math.max(-1, Math.min(1, dx)) * travel;
      ty = Math.max(-1, Math.min(1, dy)) * travel * 0.55;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [travel]);

  const style = { transition: 'transform .45s cubic-bezier(.22,1,.36,1)' };

  if (external) {
    return (
      <a ref={ref} href={href} className={className} style={style} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link ref={ref} href={href} className={className} style={style}>
      {children}
    </Link>
  );
}
