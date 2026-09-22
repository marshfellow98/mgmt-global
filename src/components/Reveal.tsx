'use client';

import { useEffect, useRef, useState, type ReactNode, type ElementType } from 'react';

/* Adds `is-on` once the element enters the viewport, which triggers the
   masked line reveals and fades in globals.css. Reduced motion skips
   straight to the on state. */
export default function Reveal({
  children, as: Tag = 'div', className = '', threshold = 0.15,
}: { children: ReactNode; as?: ElementType; className?: string; threshold?: number }) {
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setOn(true); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setOn(true); io.disconnect(); } },
      { threshold, rootMargin: '0px 0px -6% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <Tag ref={ref as never} className={`${on ? 'is-on' : ''} ${className}`.trim()}>
      {children}
    </Tag>
  );
}
