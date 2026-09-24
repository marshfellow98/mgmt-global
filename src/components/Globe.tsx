'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';
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

export default function Globe({ waypoints }: { waypoints: GlobeWaypoint[] }) {
  const progressRef = useRef(0);
  useScrollProgress((p) => { progressRef.current = p; });

  return (
    <div className="h-full w-full">
      <GlobeScene progressRef={progressRef} waypoints={waypoints} />
    </div>
  );
}
