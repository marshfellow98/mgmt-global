'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DECK, type Slide } from '@/lib/deck';

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
    <div
      className="fixed inset-0 overflow-hidden bg-ink"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* The track: every slide side by side, moved as one. */}
      <div
        className="flex h-full"
        style={{
          width: `${DECK.length * 100}%`,
          transform: `translate3d(-${(i * 100) / DECK.length}%, 0, 0)`,
          transition: reduced ? 'none' : 'transform .85s cubic-bezier(.22,1,.36,1)',
        }}
      >
        {DECK.map((slide, n) => (
          <div key={n} className="relative h-full" style={{ width: `${100 / DECK.length}%` }}>
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
    <div className="glow flex h-full w-full items-center px-[var(--pad)] py-24">
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
                    {f.n}<span className="text-gold">{f.unit}</span>
                  </div>
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
            <div className="quote max-w-[64ch]" style={anim(340)}>
              <blockquote className="text-[clamp(1rem,1.7vw,1.3rem)] leading-relaxed">
                {slide.quote.body}
              </blockquote>
              <div className="who">
                <div className="name">{slide.quote.name}</div>
                <div className="role">{slide.quote.role}</div>
              </div>
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
