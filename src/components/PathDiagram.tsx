'use client';

import { useCallback, useRef } from 'react';
import { useScrollProgress } from './PinnedSection';

/* ============================================================================
   PathDiagram — the phase-one interior of a PinnedSection.

   Draws a line that traces itself as scroll progresses, lighting waypoints as
   it reaches them. It gets progress from useScrollProgress and has no opinion
   about scrolling at all.

   Phase two replaces this component with a Three.js scene that moves a camera
   along a curve. Same hook, same 0-to-1 input. PinnedSection and every page
   using it stay untouched, and this version remains as the reduced-motion and
   low-end-device fallback.

   All geometry lives inside the 420x420 box, labels included — the pinned
   container clips its contents, so anything outside would be cut off.
   ============================================================================ */

export type Waypoint = { x: number; y: number; label: string; anchor: 'start' | 'end' };

export default function PathDiagram({
  path, waypoints,
}: { path: string; waypoints: readonly Waypoint[] }) {
  const traceRef = useRef<SVGPathElement>(null);
  const lenRef = useRef(0);
  const nodeRefs = useRef<(SVGCircleElement | null)[]>([]);
  const haloRefs = useRef<(SVGCircleElement | null)[]>([]);
  const labelRefs = useRef<(SVGTextElement | null)[]>([]);

  const render = useCallback((p: number) => {
    const trace = traceRef.current;
    if (!trace) return;

    if (!lenRef.current) {
      try { lenRef.current = trace.getTotalLength(); } catch { lenRef.current = 1000; }
      trace.style.strokeDasharray = String(lenRef.current);
    }
    trace.style.strokeDashoffset = String(lenRef.current * (1 - p));

    const n = waypoints.length;
    for (let i = 0; i < n; i++) {
      const a = i / Math.max(n - 1, 1);
      const reached = p >= a - 0.01;
      nodeRefs.current[i]?.setAttribute('data-on', String(reached));
      labelRefs.current[i]?.setAttribute('data-on', String(reached));

      const halo = haloRefs.current[i];
      if (halo) {
        const near = 1 - Math.min(Math.abs(p - a) / 0.05, 1);
        halo.style.opacity = String(near * 0.5);
        halo.setAttribute('r', String(9 + near * 14));
      }
    }
  }, [waypoints]);

  useScrollProgress(render);

  return (
    <svg viewBox="0 0 420 420" aria-hidden="true">
      <path className="road" d={path} />
      <path ref={traceRef} className="trace" d={path} />
      {waypoints.map((w, i) => (
        <circle key={`h-${w.label}`} ref={(el) => { haloRefs.current[i] = el; }}
                className="halo" cx={w.x} cy={w.y} r={9} />
      ))}
      {waypoints.map((w, i) => (
        <circle key={`n-${w.label}`} ref={(el) => { nodeRefs.current[i] = el; }}
                className="node" cx={w.x} cy={w.y} r={6} />
      ))}
      {waypoints.map((w, i) => (
        <text key={`l-${w.label}`} ref={(el) => { labelRefs.current[i] = el; }}
              className="nlabel"
              x={w.anchor === 'start' ? w.x + 14 : w.x - 14}
              y={w.y - 4}
              textAnchor={w.anchor}>
          {w.label}
        </text>
      ))}
    </svg>
  );
}
