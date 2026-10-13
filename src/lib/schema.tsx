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

/* ----------------------------------------------------------------------------
   Job postings.

   This is what makes open roles eligible for the jobs experience in Google
   and answerable by an assistant asked "who's hiring insurance producers in
   Dallas". For a search firm it's the highest-value markup on the site.

   It is also the easiest to get wrong in a way that hurts. Google requires
   `datePosted`, and marking up roles with a fabricated or always-current
   date is exactly what its job-spam policies target — a site can be dropped
   from the jobs experience for it. Stamping build time would claim every
   role was posted today, on every deploy.

   So: no date, no markup. `jobPostingSchema` returns null unless the feed
   gave a real date, and the careers page emits only what comes back. That
   degrades to nothing rather than to a falsehood, and it switches itself on
   the moment the date field is confirmed — see `postedAt` in
   recruiterflow.ts.
   ---------------------------------------------------------------------------- */
export function jobPostingSchema(job: {
  id: string;
  title: string;
  description: string | null;
  applyUrl: string | null;
  employmentType: string | null;
  postedAt: string | null;
  places: { city?: string | null; state?: string | null; country?: string | null }[];
}) {
  if (!job.postedAt || !job.title) return null;

  const posted = new Date(job.postedAt);
  if (Number.isNaN(posted.getTime())) return null;

  /* Google treats a posting with no `validThrough` as stale after a while.
     Recruiterflow has no expiry field, but the board only ever carries open
     roles — a closed role leaves the feed and this markup with it — so a
     rolling horizon is accurate rather than invented: while you can see
     this posting, the role is open. */
  const validThrough = new Date(Math.max(posted.getTime(), Date.now()) + 60 * 86400_000);

  /* Google requires `jobLocation` unless the role is explicitly marked
     remote, and the feed has no remote flag — a missing location is missing
     data, not evidence of a remote role. Defaulting to "United States" would
     be inventing a workplace, so a role with no location gets no markup,
     the same as a role with no date. */
  const locations = job.places
    .filter((p) => p.city || p.state)
    .map((p) => ({
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        ...(p.city ? { addressLocality: p.city } : {}),
        ...(p.state ? { addressRegion: p.state } : {}),
        addressCountry: p.country || 'US',
      },
    }));
  if (!locations.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    '@id': `${BASE}/careers#job-${job.id}`,
    title: job.title,
    description: job.description || job.title,
    datePosted: posted.toISOString().slice(0, 10),
    validThrough: validThrough.toISOString().slice(0, 10),
    /* The firm is the hiring organisation here. Client names are
       confidential on retained work, and inventing an employer would be
       worse than naming the agency running the search. */
    hiringOrganization: { '@id': `${BASE}/#organization` },
    employmentUnit: { '@id': `${BASE}/#organization` },
    jobLocation: locations,
    ...(job.employmentType
      ? { employmentType: job.employmentType.toUpperCase().replace(/[\s-]+/g, '_') }
      : {}),
    ...(job.applyUrl ? { url: job.applyUrl } : {}),
    // Applications are completed on Recruiterflow, not on this page.
    directApply: false,
    industry: 'Insurance',
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
