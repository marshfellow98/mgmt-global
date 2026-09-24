import type { Metadata } from 'next';
import Deck from './Deck';

/* The deck is a self-contained viewer: no site nav, no footer, no scroll.
   Someone opening this link should see the pitch and nothing else. */

export const metadata: Metadata = {
  title: 'MGMTGlobal — Firm Overview',
  description:
    'A ninety-second overview of MGMTGlobal Consulting: boutique retained executive search ' +
    'for the insurance industry. Producers, C-suite and whole teams, placed quietly since 2000.',
  alternates: { canonical: '/overview' },
  openGraph: {
    title: 'MGMTGlobal — Firm Overview',
    description: 'Boutique retained executive search for the insurance industry.',
    url: '/overview',
    type: 'website',
  },
  // A sales deck shouldn't compete with the real pages in search results.
  robots: { index: false, follow: true },
};

export default function Overview() {
  return <Deck />;
}
