'use client';

import { useEffect, useRef, type ReactNode, type ElementType } from 'react';

/* ============================================================================
   Spotlight

   A soft light that follows the cursor across a surface, as though the panel
   were catching a lamp as you move past it. Pairs naturally with the glass
   treatment — glass without a moving light source looks inert.

   Implementation notes that matter:

   - Position is written to CSS custom properties, not to React state.
     Re-rendering on mousemove would be catastrophic; this touches two
     numbers on one element and lets the compositor do the rest.

   - Updates are throttled to one per animation frame. Mouse events fire far
     more often than the screen refreshes, so anything more is wasted work.

   - Pointer-coarse devices are skipped entirely. There is no cursor on a
     phone, so the listeners would cost battery for nothing.

   - Respects prefers-reduced-motion.
   ============================================================================ */

export default function Spotlight({
  children,
  as: Tag = 'div',
  className = '',
  size = 420,
  strength = 0.09,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Diameter of the light, in px. */
  size?: number;
  /** Peak opacity of the gold wash. Keep it low — this should read as a
      change in light, not as a coloured blob. */
  strength?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const paint = () => {
      frame = 0;
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onEnter = () => el.style.setProperty('--spot', '1');
    const onLeave = () => el.style.setProperty('--spot', '0');

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`spot ${className}`.trim()}
      style={{ '--spot-size': `${size}px`, '--spot-strength': strength } as React.CSSProperties}
    >
      <span className="spot-layer" aria-hidden="true" />
      {children}
    </Tag>
  );
}
