'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Wordmark } from './Wordmark';

const LINKS = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/careers', label: 'Careers' },
  { href: '/confidential', label: 'In Confidence' },
  { href: '/contact', label: 'Contact' },
];

/* A padlock reads as "not for you" faster than any wording, which is exactly
   what this link needs to say to the 99% of visitors who aren't Shane. */
function LockIcon() {
  return (
    <svg
      width="10"
      height="12"
      viewBox="0 0 10 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="1" y="5" width="8" height="6.4" rx="1.2" />
      <path d="M3 5V3.4a2 2 0 0 1 4 0V5" />
    </svg>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  /* Transparent over a hero but with a gradient scrim behind it, so the links
     never fight the headline. Goes solid after a short scroll rather than
     waiting for the hero to leave the viewport entirely. */
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the menu on navigation, and lock the page behind it while open.
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Escape closes it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 w-full transition-colors duration-300 ${
          solid || open ? 'border-b border-rule bg-ink' : ''
        }`}
      >
        {!solid && !open && (
          <div
            className="pointer-events-none absolute inset-0"
            /* Was .92 at the top, which read as a black band across the
               hero. Staging has no scrim at all; this keeps just enough to
               hold the links legible over bright sky. */
            style={{ background: 'linear-gradient(to bottom,rgba(5,7,10,.52) 0%,rgba(5,7,10,.24) 60%,rgba(5,7,10,0) 100%)' }}
          />
        )}

        <div
          className="relative mx-auto flex max-w-shell items-center justify-between gap-4 px-[var(--pad)] transition-[padding] duration-300"
          style={{ paddingTop: solid ? '.9rem' : '1.4rem', paddingBottom: solid ? '.9rem' : '1.4rem' }}
        >
          <Wordmark />

          {/* Gaps tighten below 1280. The bar holds five links, two CTAs and
              the login utility; at laptop widths the fixed 2.25rem gap pushed
              the gold button off the right edge, and body's `overflow-x: clip`
              hid it instead of showing a scrollbar — so the primary call to
              action was simply sliced in half with nothing to notice. */}
          <div className="hidden gap-5 lg:flex xl:gap-9">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                /* nowrap: "In Confidence" is the only two-word label and it
                   broke across two lines as soon as the row got tight. */
                className={`group relative whitespace-nowrap text-[.74rem] font-semibold uppercase tracking-[.14em] transition-colors ${
                  isActive(l.href) ? 'text-gold' : 'text-[#9AA4AF] hover:text-white'
                }`}
              >
                {l.label}
                <span
                  className={`absolute -bottom-1.5 left-0 h-px bg-gold transition-[right] duration-300 ${
                    isActive(l.href) ? 'right-0' : 'right-full group-hover:right-0'
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Two audiences, two doors — but deliberately different weights.
              Two filled buttons cancel each other out and make the visitor
              choose before they know what the firm does. Employers get the
              emphasis because they're the paying side; candidates get an
              unmissable but unpressured route.

              Candidates go to /confidential rather than /careers: careers is
              the job board for people actively applying, and a senior
              producer quietly wondering what's out there won't click that. */}
          <div className="hidden shrink-0 items-center gap-4 lg:flex xl:gap-6">
            {/* Hidden below 1280. This points at /confidential, and so does
                "In Confidence" in the main links — the same destination twice
                in one bar. It's ~210px, and it was what pushed the gold CTA
                off the right edge at laptop widths. Above 1280 there's room
                for both and the candidate path keeps its explicit wording;
                below it, "In Confidence" still carries that route. */}
            <Link
              href="/confidential"
              className="hidden whitespace-nowrap text-[.74rem] font-semibold uppercase tracking-[.14em] text-[#9AA4AF] transition-colors hover:text-gold xl:block"
            >
              Explore opportunities
            </Link>
            <Link href="/contact" className="btn whitespace-nowrap">
              Discuss a Search <span className="arw">&rarr;</span>
            </Link>

            {/* Staff login. Deliberately the quietest thing in the bar: it's
                for one person, and a prominent "Login" on a search firm's
                homepage makes every candidate and client wonder whether they
                were supposed to have an account. Sits past the CTA behind a
                hairline so it reads as a utility, not a third option.
                rel=nofollow keeps crawlers off the dashboard. */}
            <span aria-hidden="true" className="h-4 w-px bg-rule" />
            <Link
              href="/login"
              rel="nofollow"
              title="Dashboard sign-in (staff)"
              aria-label="Dashboard login"
              /* Below 1280 the word is dropped and the padlock stands alone.
                 The label costs ~55px the bar doesn't have at laptop widths,
                 and the icon alone is still a real target — aria-label and
                 title carry the meaning for anyone who needs it. */
              className="flex items-center gap-1.5 whitespace-nowrap text-[.7rem] font-semibold uppercase tracking-[.14em] text-[#6B7480] transition-colors hover:text-gold"
            >
              <LockIcon />
              {/* 1400, not 1280: at exactly 1280 "Explore opportunities"
                  reappears, and both labels arriving on the same breakpoint
                  was the one width where the bar still overflowed. */}
              <span className="hidden [@media(min-width:1400px)]:inline">Login</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="relative z-10 -mr-2 flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-[5px] lg:hidden"
          >
            <span
              className="block h-px w-6 bg-white transition-transform duration-300"
              style={{ transform: open ? 'translateY(3px) rotate(45deg)' : undefined }}
            />
            <span
              className="block h-px w-6 bg-white transition-transform duration-300"
              style={{ transform: open ? 'translateY(-3px) rotate(-45deg)' : undefined }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu. Full height, generous tap targets, CTA at the bottom
          where a thumb reaches. */}
      <div
        id="mobile-menu"
        className="fixed inset-0 z-40 bg-ink transition-opacity duration-300 lg:hidden"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          paddingTop: 'var(--navh)',
        }}
      >
        <div className="flex h-full flex-col justify-between px-[var(--pad)] pb-12 pt-8">
          <ul className="m-0 list-none p-0">
            {LINKS.map((l, i) => (
              <li key={l.href} className="border-b border-rule">
                <Link
                  href={l.href}
                  className={`block py-5 font-display text-[1.6rem] transition-colors ${
                    isActive(l.href) ? 'text-gold' : 'text-white'
                  }`}
                  style={{
                    opacity: open ? 1 : 0,
                    transform: open ? 'none' : 'translateY(10px)',
                    transition: `opacity .4s ease ${i * 60}ms, transform .4s cubic-bezier(.22,1,.36,1) ${i * 60}ms`,
                  }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div>
            <Link href="/contact" className="btn w-full justify-center">
              Discuss a Search <span className="arw">&rarr;</span>
            </Link>
            <Link
              href="/confidential"
              className="mt-3 block w-full text-center text-[.78rem] font-semibold uppercase tracking-[.14em] text-[#9AA4AF]"
            >
              Or explore opportunities
            </Link>
            <p className="mt-6 text-center text-[.8rem] text-muted">
              info@mgmtglobal.com &middot; 469-458-6469
            </p>
            {/* Same reasoning as the desktop bar — quietest item, below the
                phone number, where only someone looking for it will find it. */}
            <Link
              href="/login"
              rel="nofollow"
              className="mt-5 flex items-center justify-center gap-1.5 text-[.7rem] font-semibold uppercase tracking-[.14em] text-[#6B7480]"
            >
              <LockIcon />
              Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
