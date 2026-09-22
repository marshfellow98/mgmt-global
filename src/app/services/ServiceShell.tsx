import Link from 'next/link';
import type { ReactNode } from 'react';
import Reveal from '@/components/Reveal';
import { SERVICES } from '@/lib/content';

/* Shared chrome for the three service pages: header, tab row, children. */
export default function ServiceShell({
  kick, heading, lede, active, children,
}: {
  kick: string; heading: ReactNode; lede: string;
  active: string; children: ReactNode;
}) {
  return (
    <>
      <Reveal as="header" immediate className="glow border-b border-rule">
        <div
          className="shell"
          style={{
            paddingTop: 'calc(var(--navh) + clamp(3rem,8vw,6rem))',
            paddingBottom: 'clamp(3.5rem,7vw,5.5rem)',
          }}
        >
          <div className="kick fade">{kick}</div>
          <h1 className="display-lg mb-8">{heading}</h1>
          <p className="sub fade d2 mb-9">{lede}</p>
          <div className="fade d3 flex flex-wrap gap-2">
            {SERVICES.map((s) => {
              const on = s.slug === active;
              return (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className={`border px-[1.15rem] py-3 text-[.7rem] font-semibold uppercase tracking-[.14em] transition-colors ${
                    on
                      ? 'border-gold bg-gold text-ink'
                      : 'border-rule text-[#9AA4AF] hover:border-gold hover:text-gold'
                  }`}
                >
                  {s.title}
                </Link>
              );
            })}
          </div>
        </div>
      </Reveal>
      {children}
    </>
  );
}
