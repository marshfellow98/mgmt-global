import type { Metadata } from 'next';
import { Schibsted_Grotesk, Source_Serif_4 } from 'next/font/google';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import SmoothScroll from '@/components/SmoothScroll';
import { JsonLd, organizationSchema, websiteSchema } from '@/lib/schema';
import './globals.css';

/* Serif carries display type and the wordmark — it matches the logo's voice.
   Sans handles body, labels, and UI. */
const display = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Schibsted_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mgmtglobal.com'),
  title: {
    default: 'Insurance Executive Search & Retained Recruiting | MGMTGlobal',
    template: '%s — MGMTGlobal',
  },
  description:
    'Boutique retained executive search for the insurance industry. We place top-performing ' +
    'producers, C-suite and partner talent across carriers, wholesale and retail brokerage, ' +
    'captives and programs. Based in North Texas, serving the US.',
  applicationName: 'MGMTGlobal',
  authors: [{ name: 'MGMTGlobal Consulting' }],
  creator: 'MGMTGlobal Consulting',
  publisher: 'MGMTGlobal Consulting',
  // Canonical for the site root; each page sets its own below.
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'MGMTGlobal Consulting',
    locale: 'en_US',
    url: '/',
    title: 'Insurance Executive Search & Retained Recruiting | MGMTGlobal',
    description:
      'Boutique retained executive search for the insurance industry. Producers, C-suite, ' +
      'and partner placements — and the M&A consulting to grow by team, not just by hire.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@MGMTGlobal',
    creator: '@MGMTGlobal',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  category: 'Executive Search',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <head>
        {/* Marks the document as scripted BEFORE first paint, which switches
            on the hidden starting state for reveal animations. If this never
            runs, content simply shows without animating — it is never blank. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        {/* Site-wide structured data. Lets Google treat the firm as an
            entity — the specialism, the location, the founder — rather
            than a page of text. */}
        <JsonLd data={[organizationSchema, websiteSchema]} />
      </head>
      <body>
        <SmoothScroll />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
