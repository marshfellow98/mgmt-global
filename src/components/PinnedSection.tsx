'use client';

import {
  createContext, useContext, useEffect, useRef, useState, type ReactNode,
} from 'react';

/* ============================================================================
   PinnedSection — THE CONTRACT

   This component does exactly one thing: it pins itself for a stretch of
   scrolling, works out how far through that stretch the reader is, and
   publishes that number — 0 to 1 — to whatever is inside it.

   It does not know or care what gets drawn. The interior calls
   useScrollProgress(fn) to receive progress. Today that interior is
   <PathDiagram>, an SVG line. In phase two it becomes a Three.js scene with
   a camera moving along a curve:

       <PinnedSection ...>
         <SceneThree ... />        // in place of <PathDiagram ... />
       </PinnedSection>

   Nothing else on any page changes.

   Two details worth preserving:

   1. Smoothing. Scroll events arrive in coarse jumps — a mouse wheel fires
      maybe fifteen chunky deltas a second. Drawing straight off that feels
      notchy. We keep a target (real scroll position) and a shown value (what
      is drawn) and ease shown toward target every frame, so output stays
      continuous however lumpy the input.

   2. Height. The section reserves one viewport per step plus one, giving
      room to move through every step and then release.
   ============================================================================ */

export type RenderFn = (progress: number) => void;

type Registry = { register: (fn: RenderFn) => () => void };
const ProgressContext = createContext<Registry | null>(null);

/** Called by the interior to receive scroll progress. */
export function useScrollProgress(fn: RenderFn) {
  const ctx = useContext(ProgressContext);
  const ref = useRef(fn);
  ref.current = fn;

  useEffect(() => {
    if (!ctx) return;
    return ctx.register((p) => ref.current(p));
  }, [ctx]);
}

type Props = {
  kick: string;
  heading: ReactNode;
  steps: { n: string; title: string; body: string }[];
  children: ReactNode;
};

const EASE = 0.14;

export default function PinnedSection({ kick, heading, steps, children }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const subscribers = useRef<Set<RenderFn>>(new Set());
  const shownRef = useRef(0);
  const runningRef = useRef(false);
  const tickRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);

  const registryRef = useRef<Registry>({
    register: (fn: RenderFn) => {
      subscribers.current.add(fn);
      return () => { subscribers.current.delete(fn); };
    },
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const el = sectionRef.current;
    if (!el) return;

    const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const at = steps.map((_, i) => i / Math.max(steps.length - 1, 1));

    const draw = (p: number) => {
      subscribers.current.forEach((fn) => fn(p));

      at.forEach((a, i) => {
        const lo = i === 0 ? 0 : at[i - 1];
        const bar = tickRefs.current[i];
        if (bar) bar.style.transform = `scaleX(${clamp((p - lo) / (a - lo || 1))})`;
      });

      let next = 0;
      for (let i = 0; i < at.length; i++) if (p >= at[i] - 0.01) next = i;
      setActive((cur) => (cur === next ? cur : next));
    };

    const frame = () => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) {
        runningRef.current = false;
        return;
      }
      const total = r.height - window.innerHeight;
      const target = total > 0 ? clamp(-r.top / total) : 0;
      const diff = target - shownRef.current;

      if (Math.abs(diff) < 0.0004) {
        if (shownRef.current !== target) { shownRef.current = target; draw(target); }
        runningRef.current = false;
        return;
      }
      shownRef.current += diff * EASE;
      draw(shownRef.current);
      requestAnimationFrame(frame);
    };

    const kickOff = () => {
      if (runningRef.current) return;
      runningRef.current = true;
      requestAnimationFrame(frame);
    };

    window.addEventListener('scroll', kickOff, { passive: true });
    window.addEventListener('resize', kickOff);
    kickOff();
    return () => {
      window.removeEventListener('scroll', kickOff);
      window.removeEventListener('resize', kickOff);
    };
  }, [steps, reduced]);

  // Reduced motion: flat layout, nothing pinned, all steps visible.
  if (reduced) {
    return (
      <section className="py-[clamp(4rem,10vw,9rem)]">
        <div className="shell">
          <div className="kick">{kick}</div>
          <h2 className="display mb-10">{heading}</h2>
          <div className="grid gap-9 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="topline">
                <div className="text-[.64rem] font-semibold uppercase tracking-[.18em] text-gold">{s.n}</div>
                <h3 className="my-2 text-[1.1rem]">{s.title}</h3>
                <p className="m-0 text-[.9rem] text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <ProgressContext.Provider value={registryRef.current}>
      <section
        ref={sectionRef}
        className="pinsec"
        style={{ height: `${(steps.length + 1) * 100}vh` }}
      >
        <div className="pin">
          <div className="pin-head shell">
            <div className="kick">{kick}</div>
            <h2 className="display">{heading}</h2>
          </div>

          <div className="pin-body">
            <div className="steps">
              {steps.map((s, i) => (
                <article key={s.n} className="step" data-on={i === active}>
                  <div className="n">{s.n}</div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </article>
              ))}
            </div>

            <div className="viz">{children}</div>
          </div>

          <div className="ticks">
            {steps.map((s, i) => (
              <div key={s.n} className="tick">
                <i ref={(el) => { tickRefs.current[i] = el; }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </ProgressContext.Provider>
  );
}
