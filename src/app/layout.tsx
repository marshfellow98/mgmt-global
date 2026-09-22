import type { Metadata } from 'next';
import { Schibsted_Grotesk, Source_Serif_4 } from 'next/font/google';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import SmoothScroll from '@/components/SmoothScroll';
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
    default: 'MGMTGlobal — The insurance industry’s boutique retained-search and M&A partner',
    template: '%s — MGMTGlobal',
  },
  description:
    'MGMTGlobal places top-performing producers, executives, and teams for the insurance industry. Retained search, contingent submittal, and M&A consulting.',
  openGraph: {
    type: 'website',
    siteName: 'MGMTGlobal',
    locale: 'en_US',
  },
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
