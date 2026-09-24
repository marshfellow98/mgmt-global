'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useScrollProgress } from './PinnedSection';
import type { GlobeWaypoint } from './GlobeScene';

/* ============================================================================
   Globe — the phase-two interior, ready to drop into a PinnedSection.

   Two jobs:

   1. Subscribe to scroll progress with the same hook PathDiagram used, and
      keep it in a ref. The Canvas below runs its own React tree, so the
      context doesn't cross into it — a ref does, and it's cheaper anyway.

   2. Load the Three.js scene client-only. WebGL needs a real browser; the
      server has none. next/dynamic with ssr:false also code-splits Three.js
      out of every other page, so the homepage doesn't pay for a library it
      never uses.

   Usage — identical shape to PathDiagram:

       <PinnedSection ...>
         <Globe waypoints={PROCESS_GLOBE} />
       </PinnedSection>
   ============================================================================ */

const GlobeScene = dynamic(() => import('./GlobeScene'), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden="true"
      className="h-full w-full rounded-full"
      style={{
        border: '1px solid #243244',
        opacity: 0.5,
        maskImage: 'radial-gradient(circle, #000 55%, transparent 72%)',
        WebkitMaskImage: 'radial-gradient(circle, #000 55%, transparent 72%)',
      }}
    />
  ),
});

export default function Globe({
  waypoints, fallback,
}: { waypoints: GlobeWaypoint[]; fallback?: ReactNode }) {
  const progressRef = useRef(0);
  const [use3D, setUse3D] = useState(false);
  useScrollProgress((p) => { progressRef.current = p; });

  /* WebGL only where it's a fair ask.

     A phone rendering a live 3D scene while also scrolling a long page is
     the most expensive thing on this site, and on a mid-range Android it
     shows. Below 1024px we render the SVG path instead — which is exactly
     what PathDiagram was kept around for. Same contract, same progress,
     a fraction of the cost. */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setUse3D(mq.matches && !reduced.matches);
    sync();
    mq.addEventListener('change', sync);
    reduced.addEventListener('change', sync);
    return () => { mq.removeEventListener('change', sync); reduced.removeEventListener('change', sync); };
  }, []);

  if (!use3D) return <>{fallback ?? null}</>;

  return (
    <div className="relative h-full w-full">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(225,161,63,.16) 0%, rgba(225,161,63,.05) 42%, rgba(225,161,63,0) 68%)',
        }}
      />
      <div className="relative h-full w-full">
        <GlobeScene progressRef={progressRef} waypoints={waypoints} />
      </div>
    </div>
  );
}
