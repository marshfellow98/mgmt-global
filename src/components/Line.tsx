import type { ReactNode } from 'react';

/* One line of a display headline, masked so it rises into place.
   Always use inside a <Reveal>.

   The trailing space is deliberate and load-bearing. Each line is a block
   element, so a browser renders the line break and a human reads the
   headline correctly either way. But text extractors that simply strip tags
   — which includes some of what crawls a site for AI answers — concatenate
   the lines with nothing between them, turning the homepage h1 into
   "Hire the insurancetalent yourcompetitors wishthey had."

   A plain " " inside the span would be collapsed by JSX whitespace handling,
   hence the explicit expression. It costs nothing visually: it sits at the
   end of a block, where it cannot affect layout. */
export default function Line({ children }: { children: ReactNode }) {
  return (
    <span className="rv">
      <span>
        {children}
        {' '}
      </span>
    </span>
  );
}
