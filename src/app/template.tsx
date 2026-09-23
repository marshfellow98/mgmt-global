'use client';

/* Next re-mounts template.tsx on every navigation, which gives us a hook for
   a transition between pages.

   Worth having because the site is deliberately multi-page — separate URLs
   for each service so they can rank and be linked directly. The cost of that
   choice is that navigation can feel like a hard cut. A short rise-and-fade
   keeps the continuity of a single-page site without giving up real routes.

   Kept short on purpose. Anything past ~400ms and people feel they're waiting
   on the site rather than moving through it. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
