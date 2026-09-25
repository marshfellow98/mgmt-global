/* ============================================================================
   Pitch deck content.

   Eight slides. The discipline is one idea per slide — a deck that tries to
   say everything says nothing, and this is meant to be read in ninety seconds
   by someone deciding whether to take a call.

   Sourced from the site's own copy so the deck and the website never drift
   apart. Change it here, not in the component.
   ============================================================================ */

export type Slide =
  | { kind: 'cover'; eyebrow: string; lines: string[]; sub: string }
  | { kind: 'statement'; eyebrow: string; lines: string[]; sub?: string }
  | { kind: 'figures'; eyebrow: string; heading: string; figures: { n: string; unit: string; label: string }[] }
  | { kind: 'list'; eyebrow: string; heading: string; items: { title: string; body: string; meta?: string }[] }
  | { kind: 'process'; eyebrow: string; heading: string; steps: { n: string; title: string; body: string }[] }
  | { kind: 'proof'; eyebrow: string; heading: string; clients: string[];
      quote: { body: string; name: string; role: string };
      secondQuote?: { body: string; name: string; role: string } }
  | { kind: 'segments'; eyebrow: string; heading: string; sub: string; groups: { title: string; roles: string }[] }
  | { kind: 'why'; eyebrow: string; heading: string; points: { title: string; body: string }[] }
  | { kind: 'close'; eyebrow: string; lines: string[]; sub: string; cta: string; href: string };

/* Each slide gets an ambient glow placed differently in the frame. Moving
   between them shifts the light, which is what makes the deck feel like
   travelling through a space rather than paging through cards. */
export const AMBIENCE: { x: string; y: string; size: string; alpha: number }[] = [
  { x: '18%', y: '32%', size: '80vw', alpha: 0.20 },  // cover — broad, low
  { x: '78%', y: '18%', size: '55vw', alpha: 0.10 },  // problem — pushed away, dim
  { x: '30%', y: '55%', size: '70vw', alpha: 0.22 },  // position — returns, warmer
  { x: '50%', y: '20%', size: '85vw', alpha: 0.16 },  // figures — even, overhead
  { x: '22%', y: '70%', size: '65vw', alpha: 0.14 },  // services
  { x: '70%', y: '40%', size: '72vw', alpha: 0.15 },  // process
  { x: '40%', y: '25%', size: '60vw', alpha: 0.12 },  // proof
  { x: '50%', y: '50%', size: '95vw', alpha: 0.28 },  // close — brightest, centred
  { x: '62%', y: '62%', size: '68vw', alpha: 0.13 },  // segments
  { x: '34%', y: '38%', size: '74vw', alpha: 0.17 },  // why
];

export const DECK: Slide[] = [
  {
    kind: 'cover',
    eyebrow: 'MGMTGlobal Consulting',
    lines: ['The insurance', 'industry’s retained', 'search partner.'],
    sub: 'Producers, C-suite and whole teams — placed quietly, since 2000.',
  },
  {
    kind: 'statement',
    eyebrow: 'The problem',
    lines: ['Most search firms', 'cover every industry', 'and know none', 'of them deeply.'],
    sub: 'You spend the first call explaining what a wholesale broker does.',
  },
  {
    kind: 'statement',
    eyebrow: 'Our position',
    lines: ['We chose', 'the opposite.'],
    sub: 'MGMTGlobal works only in insurance, and has since 2000. That focus is the whole advantage: we already know the players, the books, and the moves before a search starts. No ramp-up on your time, no learning your market while billing for it.',
  },
  {
    kind: 'segments',
    eyebrow: 'Where we work',
    heading: 'Every corner of one industry.',
    sub: 'Four segments, and the roles we place across each.',
    groups: [
      { title: 'Insurance Companies', roles: 'Underwriting · Claims · Actuarial · Marketing & Sales · Product Development · Risk Management · Executive Leadership' },
      { title: 'Retail Brokerage', roles: 'Producers · Account Executives · Account Managers · Retirement & Wealth · Compliance · Claims · Executive Leadership' },
      { title: 'Wholesale Brokerage', roles: 'Wholesale Brokers · Underwriters · Risk Management · Marketing Specialists · Operations · Human Resources · Executive Leadership' },
      { title: 'Captives, Programs & Services', roles: 'MGA · MGU · TPA · Reinsurance · Benefit Consultants · Self-Insured Programs · Executive Leadership' },
    ],
  },
  {
    kind: 'figures',
    eyebrow: 'The record',
    heading: 'Twenty-five years in one market.',
    figures: [
      { n: '1,200', unit: '+', label: 'Producers hired for key clients' },
      { n: '50', unit: '+', label: 'Years combined search experience' },
      { n: '25', unit: 'yr', label: 'Proprietary talent database' },
      { n: '100', unit: '%', label: 'Insurance, no other industries' },
    ],
  },
  {
    kind: 'list',
    eyebrow: 'What we do',
    heading: 'Three ways to engage.',
    items: [
      { title: 'Retained Search',
        body: 'For the hires that matter most. We take a limited number of searches at a time so each gets full attention, and deliver three or four finalists vetted against your culture, goals and the role itself.',
        meta: 'C-suite · Regional leadership · Practice leaders · Confidential searches' },
      { title: 'Contingent Submittal',
        body: 'A no-risk way to start. When we already know someone exceptional who fits your team, we introduce them — and you pay only on a successful placement.',
        meta: 'Producers · Account managers · Underwriters · Claims · Operations' },
      { title: 'M&A Consulting',
        body: 'Grow by team, not one hire at a time. Leadership assessment, organizational alignment and talent retention before, during and after the transaction.',
        meta: 'Acquisitions · Lift-outs · Fold-ins · Roll-ins' },
    ],
  },
  {
    kind: 'process',
    eyebrow: 'How a search runs',
    heading: 'Four steps, no mystery.',
    steps: [
      { n: '01', title: 'We learn your business', body: 'Your company, your culture, and what success in the role actually looks like.' },
      { n: '02', title: 'We go to the market, quietly', body: 'High performers who aren’t looking, approached with discretion.' },
      { n: '03', title: 'We hand you a shortlist', body: 'Three or four finalists, fully evaluated. Not a pile of résumés.' },
      { n: '04', title: 'We stay in it to the close', body: 'Interviews, negotiation, and the right person across the line.' },
    ],
  },
  {
    kind: 'why',
    eyebrow: 'Why clients stay',
    heading: 'What you get that you’re not used to.',
    points: [
      { title: 'One industry, total depth', body: 'Every search starts with knowledge most firms have to go and learn while you wait.' },
      { title: 'Boutique by design', body: 'A limited number of searches at a time. Not a junior recruiter and a job-board crawl.' },
      { title: 'A 25-year network, available day one', body: 'Decades of relationships with the industry’s top performers — not built from scratch for your search.' },
      { title: 'An extension of your team', body: 'We protect your reputation in the market and treat every hire as if it were our own.' },
    ],
  },
  {
    kind: 'proof',
    eyebrow: 'Firms that trust us with their growth',
    heading: 'The people who already know.',
    clients: ['AIG', 'Liberty Mutual', 'Willis Towers Watson', 'Acrisure', 'Alliant',
              'Burns & Wilcox', 'Amwins Group', 'CBIZ', 'Woodruff Sawyer', 'Cottingham & Butler'],
    quote: {
      body: 'He doesn’t toss bodies at you; he finds and thoroughly screens applicants that fit the employer’s requirements.',
      name: 'Jim Bayne',
      role: 'Area President · San Diego, CA',
    },
    secondQuote: {
      body: 'Shane has been responsible for some of the dramatic growth HUB California has had by bringing well qualified producers to us in all lines of insurance brokering.',
      name: 'James Stuart',
      role: 'Chief Sales Officer, CA · HUB International',
    },
  },
  {
    kind: 'close',
    eyebrow: 'Next step',
    lines: ['A hire too important', 'to leave to chance.'],
    sub: 'Thirty minutes, completely confidential, and you talk directly with Shane.',
    cta: 'Book a consultation',
    href: 'https://calendly.com/lsg-mgmt/brief-consultation-sg',
  },
];
