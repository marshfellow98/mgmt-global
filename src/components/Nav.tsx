'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const LINKS = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/careers', label: 'Careers' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav() {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);

  /* Transparent over a hero but with a gradient scrim behind it, so the
     links never fight the headline. Goes solid after a short scroll rather
     than waiting for the hero to leave the viewport entirely. */
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 w-full transition-colors duration-300 ${
        solid ? 'border-b border-rule bg-ink' : ''
      }`}
    >
      {!solid && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(to bottom,rgba(5,7,10,.92) 0%,rgba(5,7,10,.55) 55%,rgba(5,7,10,0) 100%)' }}
        />
      )}
      <div
        className="relative mx-auto flex max-w-shell items-center justify-between gap-6 px-[var(--pad)] transition-[padding] duration-300"
        style={{ paddingTop: solid ? '.9rem' : '1.4rem', paddingBottom: solid ? '.9rem' : '1.4rem' }}
      >
        <Wordmark />
        <div className="hidden gap-9 lg:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + '/');
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`group relative text-[.74rem] font-semibold uppercase tracking-[.14em] transition-colors ${
                  active ? 'text-gold' : 'text-[#9AA4AF] hover:text-white'
                }`}
              >
                {l.label}
                <span
                  className={`absolute -bottom-1.5 left-0 h-px bg-gold transition-[right] duration-300 ${
                    active ? 'right-0' : 'right-full group-hover:right-0'
                  }`}
                />
              </Link>
            );
          })}
        </div>
        <Link href="/contact" className="btn shrink-0 whitespace-nowrap">
          Book a Consultation <span className="arw">&rarr;</span>
        </Link>
      </div>
    </nav>
  );
}

/* Placeholder wordmark until the real logo arrives.
   To swap: replace the two spans with
     <Image src="/logo.svg" alt="MGMTGlobal" width={150} height={38} priority />
   Nothing else changes. */
export function Wordmark({ large = false }: { large?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 flex-col gap-0.5 leading-none">
      <span className={`font-display font-semibold text-white ${large ? 'text-[1.7rem]' : 'text-[1.5rem]'}`}>
        MGMT
      </span>
      <span className="text-[.5rem] font-medium uppercase tracking-[.34em] text-[#9AA4AF]">
        Global Consulting
      </span>
    </Link>
  );
}
