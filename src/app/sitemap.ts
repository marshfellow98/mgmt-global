import type { MetadataRoute } from 'next';

/* Next generates /sitemap.xml from this. Submit it once in Google Search
   Console and every page gets found without waiting to be crawled. */
const BASE = 'https://mgmtglobal.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, freq: 'weekly' | 'monthly') => ({
    url: `${BASE}${path}`,
    lastModified: now,
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
    // Careers changes whenever a role opens — crawl it more often.
    page('/careers', 0.9, 'weekly'),
    page('/confidential', 0.7, 'monthly'),
    page('/contact', 0.7, 'monthly'),
  ];
}
