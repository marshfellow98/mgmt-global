/* The deck replaces the whole viewport, so it opts out of the site chrome.
   Nav and footer are rendered by the root layout; this route group hides
   them with CSS rather than restructuring the app, which keeps every other
   page untouched. */
export default function OverviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        body > nav, body > footer, body > div[id="mobile-menu"] { display: none !important; }
        body { overflow: hidden; }
        /* No page-transition transform on this route: a transformed ancestor
           becomes the containing block for the deck's fixed container, which
           collapses it to zero height. */
        .page-enter { animation: none !important; transform: none !important; }
      `}</style>
      {children}
    </>
  );
}
