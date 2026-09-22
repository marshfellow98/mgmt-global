import type { ReactNode } from 'react';

/* One line of a display headline, masked so it rises into place.
   Always use inside a <Reveal>. */
export default function Line({ children }: { children: ReactNode }) {
  return <span className="rv"><span>{children}</span></span>;
}
