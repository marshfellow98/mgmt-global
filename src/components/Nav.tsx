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

          <div className="hidden gap-9 lg:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`group relative text-[.74rem] font-semibold uppercase tracking-[.14em] transition-colors ${
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

          {/* Desktop CTA. Hidden on mobile, where it lives inside the menu —
              the button plus a burger crowds a 390px bar. */}
          <Link href="/contact" className="btn hidden shrink-0 whitespace-nowrap lg:inline-flex">
            Book a Consultation <span className="arw">&rarr;</span>
          </Link>

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
              Book a Consultation <span className="arw">&rarr;</span>
            </Link>
            <p className="mt-6 text-center text-[.8rem] text-muted">
              info@mgmtglobal.com &middot; 469-458-6469
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
