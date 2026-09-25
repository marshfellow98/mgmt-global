'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DECK, AMBIENCE, type Slide } from '@/lib/deck';
import Counter from '@/components/Counter';

/* ============================================================================
   Deck — a pitch deck that lives at a URL.

   Built as spatial movement rather than slides: the whole deck is one wide
   track and advancing slides it sideways, so each step feels like travelling
   through a space instead of cutting between pages. That's the Prezi quality
   without the Prezi subscription — and on the firm's own domain, which reads
   more seriously than a third-party link.

   Navigation, all of it:
     → ↓ space / click right side / swipe left   advance
     ← ↑ / click left side / swipe right         back
     Home / End                                  first / last
     number keys                                 jump to slide
     dots at the bottom                          jump to slide

   Deliberate choices:

   - Content is real DOM text, not canvas. It's readable by search engines,
     selectable, and works at any zoom — a deck built from images would be
     none of those.
   - Movement is transform-only on a single track, so the browser composites
     it on the GPU and it stays smooth on a phone.
   - Slide state is in the URL hash, so a client can be sent straight to
     slide 4 and back-button behaviour works.
   - Reduced motion gets instant cuts, no sliding.
   ============================================================================ */

export default function Deck() {
  const [i, setI] = useState(0);
  const [reduced, setReduced] = useState(false);
  const touchX = useRef<number | null>(null);
  const last = DECK.length - 1;

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const fromHash = Number(window.location.hash.replace('#', ''));
    if (fromHash >= 1 && fromHash <= DECK.length) setI(fromHash - 1);
  }, []);

  const go = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(last, next));
    setI(clamped);
    window.history.replaceState(null, '', `#${clamped + 1}`);
  }, [last]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowRight', 'ArrowDown', ' ', 'PageDown'].includes(e.key)) { e.preventDefault(); go(i + 1); }
      else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); go(i - 1); }
      else if (e.key === 'Home') go(0);
      else if (e.key === 'End') go(last);
      else if (/^[1-9]$/.test(e.key)) go(Number(e.key) - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [i, go, last]);

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50) go(dx < 0 ? i + 1 : i - 1);
    touchX.current = null;
  };

  return (
    /* Sized explicitly, not by stretching between inset edges.

       template.tsx wraps every page in an animated transform, and any
       ancestor with a transform becomes the containing block for `fixed`
       descendants instead of the viewport. That wrapper has zero height —
       its only child is fixed and so out of the flow — which collapsed this
       container to nothing and rendered a black screen. Explicit viewport
       units are immune to whatever the ancestor happens to be. */
    <div
      className="fixed left-0 top-0 overflow-hidden bg-ink"
      style={{ width: '100vw', height: '100svh' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ---- Layer 1: ambient light. Moves at 35% of the content's rate,
           so the light appears to sit far behind and drift as you pass. ---- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          transform: `translate3d(-${(i * 35) / DECK.length}%, 0, 0)`,
          transition: reduced ? 'none' : 'transform 1.1s cubic-bezier(.22,1,.36,1)',
        }}
      >
        <div
          className="h-full w-full transition-[background] duration-700"
          style={{
            background: `radial-gradient(${AMBIENCE[i]?.size ?? '70vw'} circle at ${AMBIENCE[i]?.x ?? '50%'} ${AMBIENCE[i]?.y ?? '40%'}, rgba(225,161,63,${AMBIENCE[i]?.alpha ?? 0.15}) 0%, rgba(225,161,63,0) 62%)`,
          }}
        />
      </div>

      {/* ---- Layer 2: the slide number as an enormous ghost. Moves at 60%,
           between the light and the content — the middle distance. ---- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-end overflow-hidden pr-[3vw]"
        style={{
          transform: `translate3d(-${(i * 60) / DECK.length}%, 0, 0)`,
          transition: reduced ? 'none' : 'transform 1s cubic-bezier(.22,1,.36,1)',
        }}
      >
        <span
          className="select-none font-display font-semibold leading-none transition-opacity duration-700"
          style={{
            fontSize: 'clamp(16rem, 42vw, 40rem)',
            color: 'rgba(225,161,63,.035)',
            letterSpacing: '-0.06em',
          }}
        >
          {String(i + 1).padStart(2, '0')}
        </span>
      </div>

      {/* ---- Layer 3: the content. ---- */}
      <div
        className="relative flex h-full"
        style={{
          width: `${DECK.length * 100}%`,
          transform: `translate3d(-${(i * 100) / DECK.length}%, 0, 0)`,
          transition: reduced ? 'none' : 'transform .85s cubic-bezier(.22,1,.36,1)',
        }}
      >
        {DECK.map((slide, n) => (
          <div
            key={n}
            className="relative h-full"
            style={{
              width: `${100 / DECK.length}%`,
              /* Inactive slides sit fractionally back and dimmed. With the
                 three parallax layers this reads as real depth rather than
                 a filmstrip scrolling past. */
              transform: n === i ? 'scale(1)' : 'scale(.965)',
              opacity: n === i ? 1 : 0.35,
              transition: reduced
                ? 'none'
                : 'transform .85s cubic-bezier(.22,1,.36,1), opacity .6s ease',
            }}
          >
            <SlideView slide={slide} active={n === i} reduced={reduced} />
          </div>
        ))}
      </div>

      {/* Click zones. Generous on desktop, out of the way of the CTA. */}
      <button
        aria-label="Previous slide"
        onClick={() => go(i - 1)}
        className="absolute inset-y-0 left-0 w-[18%] cursor-w-resize opacity-0"
        disabled={i === 0}
      />
      <button
        aria-label="Next slide"
        onClick={() => go(i + 1)}
        className="absolute inset-y-0 right-0 w-[18%] cursor-e-resize opacity-0"
        disabled={i === last}
      />

      {/* Progress rail. A client should be able to see, at a glance, that
          this is eight slides and not forty. */}
      <div className="absolute inset-x-0 top-0 h-px bg-rule">
        <div
          className="h-full origin-left bg-gold"
          style={{
            transform: `scaleX(${(i + 1) / DECK.length})`,
            transition: reduced ? 'none' : 'transform .85s cubic-bezier(.22,1,.36,1)',
          }}
        />
      </div>

      {/* Wordmark, always present. */}
      <div className="pointer-events-none absolute left-[var(--pad)] top-8 flex flex-col gap-0.5 leading-none">
        <span className="font-display text-[1.15rem] font-semibold text-white">MGMT</span>
        <span className="text-[.45rem] font-medium uppercase tracking-[.34em] text-[#9AA4AF]">
          Global Consulting
        </span>
      </div>

      {/* Slide counter */}
      <div className="pointer-events-none absolute right-[var(--pad)] top-9 font-display text-[.9rem] text-[#5A6B82]">
        <span className="text-gold">{String(i + 1).padStart(2, '0')}</span>
        <span className="mx-1.5">/</span>
        {String(DECK.length).padStart(2, '0')}
      </div>

      {/* Dots */}
      <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 gap-2.5">
        {DECK.map((_, n) => (
          <button
            key={n}
            aria-label={`Go to slide ${n + 1}`}
            aria-current={n === i}
            onClick={() => go(n)}
            className="group p-2"
          >
            <span
              className="block h-[3px] rounded-full transition-all duration-500"
              style={{
                width: n === i ? 28 : 14,
                background: n === i ? 'var(--gold)' : '#2A3746',
              }}
            />
          </button>
        ))}
      </div>

      {/* Hint, first slide only */}
      <div
        className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 text-[.62rem] uppercase tracking-[.2em] text-[#46525F] transition-opacity duration-500"
        style={{ opacity: i === 0 ? 1 : 0 }}
      >
        Arrow keys, swipe, or click
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Slide bodies. Each fades and lifts in when it becomes active, so arriving
   feels like something rather than nothing.
   --------------------------------------------------------------------------- */

function SlideView({ slide, active, reduced }: { slide: Slide; active: boolean; reduced: boolean }) {
  const anim = (delay: number) => ({
    opacity: active ? 1 : 0,
    transform: active ? 'none' : 'translateY(18px)',
    transition: reduced ? 'none' : `opacity .7s ease ${delay}ms, transform .7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
  });

  return (
    <div className="flex h-full w-full items-center px-[var(--pad)] py-24">
      <div className="mx-auto w-full max-w-shell">
        {slide.kind === 'cover' && (
          <>
            <div className="kick" style={anim(0)}>{slide.eyebrow}</div>
            <h1 className="mb-8 text-[clamp(2.2rem,7vw,5.6rem)] leading-[1.02]">
              {slide.lines.map((l, n) => (
                <span key={l} className="block" style={anim(120 + n * 110)}>
                  {n === slide.lines.length - 1 ? <em className="accent">{l}</em> : l}
                </span>
              ))}
            </h1>
            <p className="sub max-w-[46ch]" style={anim(520)}>{slide.sub}</p>
          </>
        )}

        {slide.kind === 'statement' && (
          <>
            <div className="kick" style={anim(0)}>{slide.eyebrow}</div>
            <h2 className="mb-8 text-[clamp(2rem,6.2vw,5rem)] leading-[1.04]">
              {slide.lines.map((l, n) => (
                <span key={l} className="block" style={anim(120 + n * 110)}>
                  {n === slide.lines.length - 1 ? <em className="accent">{l}</em> : l}
                </span>
              ))}
            </h2>
            {slide.sub && (
              <p className="sub max-w-[58ch]" style={anim(160 + slide.lines.length * 110)}>{slide.sub}</p>
            )}
          </>
        )}

        {slide.kind === 'figures' && (
          <>
            <div className="kick" style={anim(0)}>{slide.eyebrow}</div>
            <h2 className="mb-14 text-[clamp(1.8rem,4.4vw,3.4rem)]" style={anim(110)}>{slide.heading}</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
              {slide.figures.map((f, n) => (
                <div key={f.label} style={anim(220 + n * 110)}>
                  <div className="font-display text-[clamp(2.4rem,5.5vw,4.4rem)] font-semibold leading-[.9] tracking-[-.03em]">
                    {/* Keyed on `active` so the count restarts each time the
                        slide is reached — a deck gets navigated back and
                        forth, and a number that only animates once feels
                        broken the second time. */}
                    {active
                      ? <Counter key={`${f.label}-on`} value={Number(String(f.n).replace(/,/g, ''))} />
                      : <span>0</span>}
                    <span className="text-gold">{f.unit}</span>
                  </div>
                  <div
                    className="mt-5 h-px origin-left bg-gold/40"
                    style={{
                      transform: active ? 'scaleX(1)' : 'scaleX(0)',
                      transition: reduced ? 'none' : `transform .9s cubic-bezier(.22,1,.36,1) ${420 + n * 110}ms`,
                    }}
                  />
                  <div className="mt-4 max-w-[18ch] text-[.8rem] leading-snug text-muted">{f.label}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {slide.kind === 'list' && (
          <>
            <div className="kick" style={anim(0)}>{slide.eyebrow}</div>
            <h2 className="mb-12 text-[clamp(1.8rem,4.4vw,3.4rem)]" style={anim(110)}>{slide.heading}</h2>
            <div className="grid gap-10 lg:grid-cols-3">
              {slide.items.map((it, n) => (
                <div key={it.title} className="topline" style={anim(220 + n * 130)}>
                  <h3 className="text-[clamp(1.1rem,2vw,1.45rem)]">{it.title}</h3>
                  <p className="mt-3 text-[.92rem] text-muted">{it.body}</p>
                  {it.meta && (
                    <p className="mt-4 border-t border-rule pt-3 text-[.72rem] uppercase tracking-[.1em] text-[#5A6B82]">
                      {it.meta}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {slide.kind === 'process' && (
          <>
            <div className="kick" style={anim(0)}>{slide.eyebrow}</div>
            <h2 className="mb-12 text-[clamp(1.8rem,4.4vw,3.4rem)]" style={anim(110)}>{slide.heading}</h2>
            <ol className="relative m-0 grid list-none gap-8 p-0 lg:grid-cols-4">
              {slide.steps.map((s, n) => (
                <li key={s.n} style={anim(220 + n * 120)}>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-none text-gold">
                      {s.n}
                    </span>
                    <span className="h-px flex-1 bg-rule" />
                  </div>
                  <h3 className="text-[clamp(1rem,1.7vw,1.2rem)]">{s.title}</h3>
                  <p className="mt-2 text-[.88rem] leading-snug text-muted">{s.body}</p>
                </li>
              ))}
            </ol>
          </>
        )}

        {slide.kind === 'proof' && (
          <>
            <div className="kick" style={anim(0)}>{slide.eyebrow}</div>
            <h2 className="mb-10 text-[clamp(1.8rem,4.4vw,3.4rem)]" style={anim(110)}>{slide.heading}</h2>
            <div
              className="mb-12 flex flex-wrap gap-x-9 gap-y-4 border-y border-rule py-6"
              style={anim(220)}
            >
              {slide.clients.map((c) => (
                <span key={c} className="text-[.9rem] font-semibold uppercase tracking-[.13em] text-[#3E4A57]">
                  {c}
                </span>
              ))}
            </div>
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="quote" style={anim(340)}>
                <blockquote className="text-[clamp(.95rem,1.5vw,1.15rem)] leading-relaxed">
                  {slide.quote.body}
                </blockquote>
                <div className="who">
                  <div className="name">{slide.quote.name}</div>
                  <div className="role">{slide.quote.role}</div>
                </div>
              </div>
              {slide.secondQuote && (
                <div className="quote" style={anim(440)}>
                  <blockquote className="text-[clamp(.95rem,1.5vw,1.15rem)] leading-relaxed">
                    {slide.secondQuote.body}
                  </blockquote>
                  <div className="who">
                    <div className="name">{slide.secondQuote.name}</div>
                    <div className="role">{slide.secondQuote.role}</div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {slide.kind === 'segments' && (
          <>
            <div className="kick" style={anim(0)}>{slide.eyebrow}</div>
            <h2 className="mb-3 text-[clamp(1.8rem,4.4vw,3.4rem)]" style={anim(110)}>{slide.heading}</h2>
            <p className="sub mb-10" style={anim(170)}>{slide.sub}</p>
            <div className="grid gap-x-10 gap-y-7 md:grid-cols-2">
              {slide.groups.map((g, n) => (
                <div key={g.title} className="border-t border-rule pt-4" style={anim(260 + n * 100)}>
                  <h3 className="text-[clamp(1rem,1.7vw,1.2rem)] text-gold">{g.title}</h3>
                  <p className="mt-2 text-[.84rem] leading-relaxed text-muted">{g.roles}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {slide.kind === 'why' && (
          <>
            <div className="kick" style={anim(0)}>{slide.eyebrow}</div>
            <h2 className="mb-12 text-[clamp(1.8rem,4.4vw,3.4rem)]" style={anim(110)}>{slide.heading}</h2>
            <div className="grid gap-x-10 gap-y-9 md:grid-cols-2">
              {slide.points.map((pt, n) => (
                <div key={pt.title} className="topline" style={anim(230 + n * 110)}>
                  <h3 className="text-[clamp(1.05rem,1.9vw,1.3rem)]">{pt.title}</h3>
                  <p className="mt-3 text-[.92rem] text-muted">{pt.body}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {slide.kind === 'close' && (
          <div className="text-center">
            <div className="kick justify-center" style={anim(0)}>{slide.eyebrow}</div>
            <h2 className="mx-auto mb-8 max-w-[18ch] text-[clamp(2rem,5.8vw,4.6rem)] leading-[1.04]">
              {slide.lines.map((l, n) => (
                <span key={l} className="block" style={anim(120 + n * 120)}>
                  {n === slide.lines.length - 1 ? <em className="accent">{l}</em> : l}
                </span>
              ))}
            </h2>
            <p className="sub mx-auto mb-11 max-w-[44ch]" style={anim(400)}>{slide.sub}</p>
            <div style={anim(500)}>
              <a className="btn" href={slide.href} target="_blank" rel="noopener noreferrer">
                {slide.cta} <span className="arw">&rarr;</span>
              </a>
            </div>
            <p className="mt-10 text-[.85rem] text-[#5A6B82]" style={anim(600)}>
              info@mgmtglobal.com &middot; 469-458-6469
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
