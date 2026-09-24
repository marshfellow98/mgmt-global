import { CONTACT } from './content';

/* ============================================================================
   Structured data (JSON-LD).

   This is what lets Google show the firm as an entity rather than just a page
   of text — the knowledge panel, the "Organization" understanding, the
   connection between Shane and the business.

   For a boutique firm competing against much larger search agencies, being
   legible as a specific insurance-only practice in North Texas is worth more
   than generic keyword work. Everything below is factual and already public
   on the site; none of it is keyword stuffing, which Google penalises.
   ============================================================================ */

const BASE = 'https://mgmtglobal.com';

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'EmploymentAgency'],
  '@id': `${BASE}/#organization`,
  name: 'MGMTGlobal Consulting',
  alternateName: 'MGMT Global Consulting',
  url: BASE,
  logo: `${BASE}/logo.svg`,
  description:
    'Boutique retained executive search and M&A consulting for the insurance industry. ' +
    'Producers, C-suite, director and partner placements across carriers, wholesale and ' +
    'retail brokerage, captives and programs.',
  email: CONTACT.email,
  telephone: CONTACT.phone,
  faxNumber: CONTACT.fax,
  foundingDate: '2000',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Carrollton',
    addressRegion: 'TX',
    addressCountry: 'US',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  // The specialism is the differentiator — say it in the markup too.
  knowsAbout: [
    'Insurance executive search',
    'Retained search',
    'Insurance producer recruitment',
    'Wholesale brokerage recruitment',
    'Retail brokerage recruitment',
    'Captives and programs',
    'Managing general agents',
    'Insurance M&A consulting',
    'Lift-outs',
  ],
  founder: { '@id': `${BASE}/about#shane-graham` },
  sameAs: [
    'https://www.linkedin.com/company/mgmtgc/',
    'https://x.com/MGMTGlobal',
    'https://www.facebook.com/mgmtglobal/',
  ],
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE}/#website`,
  url: BASE,
  name: 'MGMTGlobal Consulting',
  publisher: { '@id': `${BASE}/#organization` },
  inLanguage: 'en-US',
};

export const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${BASE}/about#shane-graham`,
  name: 'Shane Graham',
  jobTitle: 'Founder, President & CEO',
  worksFor: { '@id': `${BASE}/#organization` },
  image: `${BASE}/images/shane-graham.jpg`,
  description:
    'Founder of MGMTGlobal Consulting. Twenty-five years in insurance executive search, ' +
    'previously Shareholder, Partner and Managing Director at Kaye/Bassman International ' +
    'and founder of Graham Group USA.',
  url: `${BASE}/about`,
};

/** One service page's schema. */
export function serviceSchema(opts: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${BASE}${opts.path}#service`,
    name: opts.name,
    description: opts.description,
    provider: { '@id': `${BASE}/#organization` },
    serviceType: opts.name,
    areaServed: { '@type': 'Country', name: 'United States' },
    audience: { '@type': 'BusinessAudience', name: 'Insurance organizations' },
  };
}

/** Breadcrumbs — gives Google the path to show under the result. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: `${BASE}${t.path}`,
    })),
  };
}

/** Renders a schema object into the page. */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
