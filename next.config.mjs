/** @type {import('next').NextConfig} */

/* Legacy URL map.
   The old Wix site's paths are indexed in Google and now 404, which is what
   Search Console reports as "Blocked due to other 4xx issue". A 308 passes
   the accumulated link equity to the new page and keeps old links working.
   Anything not listed here lands on the branded 404 at src/app/not-found.tsx.
   Sources must never collide with a real route in src/app. */
const LEGACY = [
  // About and the pages Wix split off it
  ['/about-us', '/about'],
  ['/aboutus', '/about'],
  ['/about-mgmt', '/about'],
  ['/who-we-are', '/about'],
  ['/why-us', '/about'],
  ['/values', '/about'],
  ['/experience', '/about'],
  ['/expertise', '/about'],
  ['/team', '/about'],
  ['/our-team', '/about'],
  ['/leadership', '/about'],
  ['/clients', '/about'],
  ['/testimonials', '/about'],
  // Wix misspelled this one in its own nav, so it may well be the indexed form
  ['/testemonials', '/about'],

  // Services
  ['/service', '/services'],
  ['/what-we-do', '/services'],
  ['/solutions', '/services'],
  ['/retained-search', '/services/retained-search'],
  ['/executive-search', '/services/retained-search'],
  ['/contingent', '/services/contingent-submittal'],
  ['/contingent-submittal', '/services/contingent-submittal'],
  ['/ma-consulting', '/services/ma-consulting'],
  ['/m-a-consulting', '/services/ma-consulting'],
  ['/consulting', '/services/ma-consulting'],

  // Careers
  ['/career', '/careers'],
  ['/jobs', '/careers'],
  ['/job-board', '/careers'],
  ['/opportunities', '/careers'],
  ['/candidates', '/careers'],

  // Contact and confidential
  ['/contact-us', '/contact'],
  ['/contactus', '/contact'],
  ['/get-in-touch', '/contact'],
  ['/book', '/contact'],
  ['/consultation', '/contact'],
  ['/search', '/confidential'],

  // Home aliases Wix and Elementor leave behind
  ['/home', '/'],
  ['/index', '/'],
  ['/main', '/'],

  // The staging build lived under /MGMT. Those URLs were never meant to be
  // public, but they were crawlable while the dev had the site up.
  ['/MGMT', '/'],
  ['/MGMT/:path*', '/'],
];

const nextConfig = {
  reactStrictMode: true,
  images: { formats: ['image/avif', 'image/webp'] },
  async redirects() {
    return LEGACY.map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
};
export default nextConfig;
