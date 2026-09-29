'use client';

import { useMemo, useRef } from 'react';
import { useScrollProgress } from './PinnedSection';

/* ============================================================================
   DallasSkyline — the About page's pinned interior.

   The skyline draws itself left to right as you scroll, like a pen moving
   across the page. Replaces an abstract four-node path that left most of the
   frame empty and said nothing in particular.

   Why this instead: the firm is in North Texas, the hero already carries the
   Dallas skyline as video, and drawing it by hand is a quieter way of saying
   the same thing. It earns the space in a way an abstract diagram didn't.

   Technique is the one from hgrellc.com: each building is a path, and
   stroke-dashoffset animates from full length to zero to reveal it. What's
   different here is that the reveal is ordered by horizontal position and
   driven by scroll rather than by a load animation — so the pen genuinely
   tracks your progress across the section.

   Landmarks are recognisable rather than literal: Reunion Tower's sphere on
   its stalk, the Bank of America Plaza slab, Fountain Place's wedge, the
   Omni's stepped top. Somebody from Dallas should know what they're looking
   at without it pretending to be an elevation drawing.
   ============================================================================ */

const GOLD = '#E1A13F';

/** Each element carries an x-range so it can be revealed in left-to-right order. */
type Shape = { d: string; x: number; accent?: boolean; width?: number };

const GROUND = 300;

const SHAPES: Shape[] = [
  // --- far left: low-rise ---
  { d: `M8 ${GROUND} V262 H44 V${GROUND}`, x: 8 },
  { d: `M50 ${GROUND} V240 H82 V${GROUND}`, x: 50 },
  { d: 'M56 240 V228 H76 V240', x: 56 },

  // --- Reunion Tower: stalk, sphere, mast ---
  { d: `M104 ${GROUND} V168`, x: 104, accent: true, width: 2 },
  { d: `M118 ${GROUND} V168`, x: 118, accent: true, width: 2 },
  { d: 'M96 168 h34', x: 96, accent: true, width: 2 },
  // sphere as two arcs so it draws rather than pops
  // r must be half the span or the two arcs meet at points and read as a
  // lens rather than a sphere.
  { d: 'M96 152 a17 17 0 0 1 34 0', x: 96, accent: true, width: 2 },
  { d: 'M130 152 a17 17 0 0 1 -34 0', x: 96, accent: true, width: 2 },
  { d: 'M113 133 V118', x: 113, accent: true, width: 1.4 },

  // --- mid: mid-rise cluster ---
  { d: `M148 ${GROUND} V206 H186 V${GROUND}`, x: 148 },
  { d: `M194 ${GROUND} V228 H222 V${GROUND}`, x: 194 },

  // --- Fountain Place: the wedge ---
  { d: `M232 ${GROUND} V196 L262 150 L292 196 V${GROUND}`, x: 232, accent: true, width: 2 },
  { d: 'M232 196 h60', x: 232 },

  // --- Bank of America Plaza: the tall slab ---
  { d: `M306 ${GROUND} V112 H352 V${GROUND}`, x: 306, accent: true, width: 2 },
  { d: 'M312 112 V98 h34 V112', x: 312, accent: true, width: 1.6 },
  { d: 'M329 98 V82', x: 329, accent: true, width: 1.2 },
  // a few floor lines, so the slab reads as a building not a rectangle
  { d: 'M306 150 h46', x: 306, width: 0.8 },
  { d: 'M306 192 h46', x: 306, width: 0.8 },
  { d: 'M306 234 h46', x: 306, width: 0.8 },

  // --- Renaissance Tower: twin masts ---
  { d: `M364 ${GROUND} V176 H404 V${GROUND}`, x: 364 },
  { d: 'M374 176 V140', x: 374, width: 1.2 },
  { d: 'M394 176 V140', x: 394, width: 1.2 },

  // --- Omni: stepped ---
  { d: `M414 ${GROUND} V214 H448 V${GROUND}`, x: 414 },
  { d: 'M420 214 V198 H442 V214', x: 420 },

  // --- right: falling away ---
  { d: `M458 ${GROUND} V244 H486 V${GROUND}`, x: 458 },
  { d: `M494 ${GROUND} V226 H520 V${GROUND}`, x: 494 },
  { d: 'M500 226 V212 h14 V226', x: 500 },
  { d: `M528 ${GROUND} V258 H556 V${GROUND}`, x: 528 },
  { d: `M564 ${GROUND} V270 H592 V${GROUND}`, x: 564 },
];

const X_MIN = 8;
const X_MAX = 592;

export default function DallasSkyline() {
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const groundRef = useRef<SVGPathElement>(null);
  const penRef = useRef<SVGCircleElement>(null);

  /* Each shape gets a slice of the scroll based on where it sits
     horizontally, so the drawing sweeps left to right. Slices overlap
     slightly — a strictly sequential reveal looks mechanical. */
  const windows = useMemo(
    () =>
      SHAPES.map((s) => {
        const at = (s.x - X_MIN) / (X_MAX - X_MIN);
        const start = at * 0.82;          // finish drawing before scroll ends
        return { start, end: Math.min(start + 0.16, 1) };
      }),
    []
  );

  useScrollProgress((p) => {
    // Ground line draws first, across the whole width.
    const ground = groundRef.current;
    if (ground) {
      const len = ground.getTotalLength();
      ground.style.strokeDasharray = String(len);
      ground.style.strokeDashoffset = String(len * (1 - Math.min(p / 0.12, 1)));
    }

    SHAPES.forEach((_, i) => {
      const el = pathRefs.current[i];
      if (!el) return;
      const { start, end } = windows[i];
      const local = Math.max(0, Math.min((p - start) / (end - start), 1));

      const len = el.getTotalLength();
      el.style.strokeDasharray = String(len);
      el.style.strokeDashoffset = String(len * (1 - local));
      // Lines brighten slightly as they complete.
      el.style.opacity = String(0.35 + local * 0.65);
    });

    // The pen: a dot tracking the leading edge of the drawing.
    const pen = penRef.current;
    if (pen) {
      const x = X_MIN + (X_MAX - X_MIN) * Math.min(p / 0.82, 1);
      pen.setAttribute('cx', String(x));
      pen.style.opacity = p > 0.02 && p < 0.9 ? '1' : '0';
    }
  });

  return (
    <svg viewBox="0 0 600 330" aria-hidden="true" style={{ overflow: 'visible' }}>
      {/* Ground */}
      <path
        ref={groundRef}
        d={`M0 ${GROUND} H600`}
        fill="none"
        stroke="#2A3746"
        strokeWidth={1}
      />

      {SHAPES.map((s, i) => (
        <path
          key={s.d}
          ref={(el) => { pathRefs.current[i] = el; }}
          d={s.d}
          fill="none"
          stroke={s.accent ? GOLD : '#5A6B82'}
          strokeWidth={s.width ?? 1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0 }}
        />
      ))}

      {/* The pen — sits on the ground line at the leading edge. */}
      <circle
        ref={penRef}
        cx={X_MIN}
        cy={GROUND}
        r={3}
        fill={GOLD}
        style={{ opacity: 0, transition: 'opacity .4s ease' }}
      />
    </svg>
  );
}
