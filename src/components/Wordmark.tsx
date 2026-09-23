'use client';

import Link from 'next/link';
import { useState } from 'react';

/* The real logo: public/logo.svg, 230x60, already drawn in #fff and the brand
   gold #E1A13F.

   If the file is missing the text wordmark shows instead, so the site is never
   left with a broken image. Remove the fallback once the file is in place. */
export function Wordmark({ large = false }: { large?: boolean }) {
  const [failed, setFailed] = useState(false);
  const h = large ? 46 : 38;

  return (
    <Link href="/" className="flex shrink-0 items-center leading-none" aria-label="MGMTGlobal, home">
      {failed ? (
        <span className="flex flex-col gap-0.5">
          <span className={`font-display font-semibold text-white ${large ? 'text-[1.7rem]' : 'text-[1.5rem]'}`}>
            MGMT
          </span>
          <span className="text-[.5rem] font-medium uppercase tracking-[.34em] text-[#9AA4AF]">
            Global Consulting
          </span>
        </span>
      ) : (
        /* Plain <img>, not next/image — an SVG has no variants worth
           generating and this keeps it crisp at any size. */
        <img
          src="/logo.svg"
          alt="MGMTGlobal"
          height={h}
          style={{ height: h, width: 'auto' }}
          onError={() => setFailed(true)}
        />
      )}
    </Link>
  );
}
