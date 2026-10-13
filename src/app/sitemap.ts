import type { MetadataRoute } from 'next';

/* Next generates /sitemap.xml from this. Submit it once in Google Search
   Console and every page gets found without waiting to be crawled. */
const BASE = 'https://mgmtglobal.com';

/* Real dates, not `new Date()`.

   Every entry used to carry the build time, which told Google that all nine
   pages changed the moment anything deployed — including a deploy that only
   touched a redirect. Google explicitly discounts `lastmod` when it behaves
   like that, so an always-now sitemap is worth less than one with honest
   dates, and it removes a signal that would otherwise help: a page that
   genuinely changed looks identical to one that didn't.

   So each route carries the date its content last actually changed. Update
   the date here when you change a page's copy — not when you deploy. The
   careers board is the exception: its listings come from Recruiterflow and
   do change on their own, so it tracks the current date legitimately. */
const CONTENT_UPDATED: Record<string, string> = {
  '': '2026-10-09',
  '/services': '2026-09-28',
  '/services/retained-search': '2026-09-30',
  '/services/contingent-submittal': '2026-09-28',
  '/services/ma-consulting': '2026-09-28',
  '/about': '2026-09-30',
  '/confidential': '2026-09-28',
  '/contact': '2026-10-09',
};

export default function sitemap(): MetadataRoute.Sitemap {
  /* `live` marks a route whose content changes without a deploy. Only the
     careers board qualifies: its listings come from Recruiterflow, so a
     current timestamp there is honest rather than noise. */
  const page = (
    path: string,
    priority: number,
    freq: 'weekly' | 'monthly',
    live = false,
  ) => ({
    url: `${BASE}${path}`,
    lastModified: live ? new Date() : new Date(CONTENT_UPDATED[path] ?? '2026-09-28'),
    changeFrequency: freq,
    priority,
  });

  return [
    page('', 1.0, 'weekly'),
    page('/services', 0.9, 'monthly'),
    page('/services/retained-search', 0.9, 'monthly'),
    page('/services/contingent-submittal', 0.8, 'monthly'),
    page('/services/ma-consulting', 0.8, 'monthly'),
    page('/about', 0.8, 'monthly'),
    page('/careers', 0.9, 'weekly', true),
    page('/confidential', 0.7, 'monthly'),
    page('/contact', 0.7, 'monthly'),
  ];
}
