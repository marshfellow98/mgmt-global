import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Nothing useful to crawl in the form handlers.
          '/api/',
          /* The staff dashboard redirect. Keeping crawlers off it means the
             dashboard's passcode page never shows up in search results, so
             the only people who find it are the ones given the address. */
          '/login',
        ],
      },
    ],
    sitemap: 'https://mgmtglobal.com/sitemap.xml',
  };
}
