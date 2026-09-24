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
  | { kind: 'list'; eyebrow: string; heading: string; items: { title: string; body: string }[] }
  | { kind: 'process'; eyebrow: string; heading: string; steps: { n: string; title: string; body: string }[] }
  | { kind: 'proof'; eyebrow: string; heading: string; clients: string[]; quote: { body: string; name: string; role: string } }
  | { kind: 'close'; eyebrow: string; lines: string[]; sub: string; cta: string; href: string };

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
    sub: 'MGMTGlobal works only in insurance. Carriers, wholesale and retail brokerage, captives and programs — across producer, C-suite, director and partner roles. Nothing else.',
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
      { title: 'Retained Search', body: 'For the hires that matter most. A limited number of searches at a time, and a shortlist of three or four finalists.' },
      { title: 'Contingent Submittal', body: 'A no-risk way to start. We introduce someone exceptional we already know. You pay only on placement.' },
      { title: 'M&A Consulting', body: 'Grow by team, not one hire at a time. Lift-outs, tuck-ins, roll-ins and acquisitions.' },
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
