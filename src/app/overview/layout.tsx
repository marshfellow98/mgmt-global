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
      `}</style>
      {children}
    </>
  );
}
