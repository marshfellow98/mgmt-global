import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Nothing useful to crawl in the form handlers.
        disallow: ['/api/'],
      },
    ],
    sitemap: 'https://mgmtglobal.com/sitemap.xml',
  };
}
