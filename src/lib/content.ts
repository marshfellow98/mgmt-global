/* ============================================================================
   Site content.

   All copy lives here rather than inside components, so a wording change is
   one edit in one file and pages stay readable. Sourced from the previous
   build via content-inventory.md, with the known copy problems fixed —
   see CLAUDE.md for the list.
   ============================================================================ */

export const CONTACT = {
  email: 'info@mgmtglobal.com',
  phone: '469-458-6469',
  whatsapp: '469-628-5276',
  fax: '469-453-1315',
  location: 'Carrollton, TX',
  calendly: 'https://calendly.com/lsg-mgmt/brief-consultation-sg',
};

export const STATS = [
  { n: 1200, unit: '+',  label: 'Producers hired for key clients' },
  { n: 50,   unit: '+',  label: 'Years combined search experience' },
  { n: 25,   unit: 'yr', label: 'Proprietary talent database' },
  { n: 100,  unit: '%',  label: 'Insurance, no other industries' },
];

/* BB&T removed — merged into Truist in 2019. Confirm display permission
   with Shane before launch. */
export const CLIENTS = [
  'AIG', 'Liberty Mutual', 'Willis Towers Watson', 'Acrisure', 'Alliant',
  'Burns & Wilcox', 'Amwins Group', 'CBIZ', 'Woodruff Sawyer',
  'Cottingham & Butler', 'CAC Specialty', 'Cobbs Allen',
];

export const SERVICES = [
  {
    slug: 'retained-search',
    title: 'Retained Search',
    blurb:
      'For the hires that matter most. We take on a limited number of searches at a time so each one gets full attention, and deliver a shortlist of three to four finalists vetted against your culture, goals, and the role itself.',
  },
  {
    slug: 'contingent-submittal',
    title: 'Contingent Submittal',
    blurb:
      'A no-risk way to start. When we already have an exceptional candidate who fits your team, we’ll introduce them — and you pay only on a successful placement.',
  },
  {
    slug: 'ma-consulting',
    title: 'M&A Consulting',
    blurb:
      'Grow by acquisition, not one hire at a time. Lift-outs, tuck-ins, roll-ins, fold-ins, and acquisitions — entire high-performing teams, ready to produce on day one.',
  },
];

export const PROCESS_STEPS = [
  { n: 'Step 01', title: 'We learn your business.',
    body: 'Before we look at a single candidate, we understand your company, your culture, and what success in this role really looks like.' },
  { n: 'Step 02', title: 'We go to the market, quietly.',
    body: 'We tap our network and 25-year database to find high performers who aren’t looking, then approach them with discretion.' },
  { n: 'Step 03', title: 'We hand you a shortlist, not a pile.',
    body: 'Three or four finalists, fully evaluated on track record, fit, and ambition.' },
  { n: 'Step 04', title: 'We stay in it to the close.',
    body: 'We help structure interviews, negotiate, and bring the right person across the line.' },
];

export const PROCESS_PATH = 'M 90 62 C 252 62, 252 172, 102 172 S 92 292, 298 292 S 318 352, 252 372';
export const PROCESS_WAYPOINTS = [
  { x: 90,  y: 62,  label: 'Brief',     anchor: 'start' as const },
  { x: 102, y: 172, label: 'Market',    anchor: 'start' as const },
  { x: 298, y: 292, label: 'Shortlist', anchor: 'end'   as const },
  { x: 252, y: 372, label: 'Placement', anchor: 'end'   as const },
];

/* Globe positions for the retained-search process. Longitudes step ~70°
   apart so the globe turns meaningfully between stops. */
export const PROCESS_GLOBE = [
  { lat: 18,  lon: 20,  label: 'Brief' },
  { lat: -8,  lon: 92,  label: 'Market' },
  { lat: 26,  lon: 164, label: 'Shortlist' },
  { lat: -14, lon: 236, label: 'Placement' },
];

export const ADVANTAGE_STEPS = [
  { n: '01', title: 'One industry, total depth.',
    body: 'We live in insurance. Every search begins with knowledge most firms have to go and learn on your time.' },
  { n: '02', title: 'A 25-year legacy database.',
    body: 'Decades of relationships with the industry’s top performers — available the day you engage us, not built from scratch.' },
  { n: '03', title: 'We know the moves before they happen.',
    body: 'The players, the books, who is restless and who is not. Context you only get from staying in one market.' },
  { n: '04', title: 'An extension of your team.',
    body: 'We act as your advocate, protecting your reputation in the market and treating every hire as if it were our own.' },
];

export const ADVANTAGE_PATH = 'M 210 58 C 82 122, 82 232, 210 256 S 328 312, 210 372';
export const ADVANTAGE_WAYPOINTS = [
  { x: 210, y: 58,  label: 'Focus',    anchor: 'start' as const },
  { x: 124, y: 162, label: 'Network',  anchor: 'start' as const },
  { x: 210, y: 256, label: 'Context',  anchor: 'start' as const },
  { x: 210, y: 372, label: 'Advocacy', anchor: 'start' as const },
];

export const WHY = [
  { title: 'One industry, total depth.',
    body: 'We live in insurance. Every search starts with knowledge most firms have to go learn.' },
  { title: 'Boutique by design.',
    body: 'We take on a limited number of searches so yours gets real attention — not a junior recruiter and a job-board crawl.' },
  { title: 'A 25-year network you can access.',
    body: 'Decades of relationships with the industry’s top performers, available the day you engage us.' },
  { title: 'An extension of your team.',
    body: 'We act as your advocate, protecting your reputation in the market and treating every hire as if it were our own.' },
];

export const SEGMENTS = [
  { title: 'Insurance Companies',
    blurb: 'Carriers across commercial, personal, specialty, and employee benefits markets.',
    roles: ['Marketing & Sales', 'Underwriting', 'Claims', 'Actuarial', 'Risk Management', 'Product Development', 'Executive Leadership'] },
  { title: 'Retail Brokerage',
    blurb: 'Independent agencies, regional firms, and national brokerages across all disciplines.',
    roles: ['Producers', 'Account Executives', 'Account Managers', 'Retirement & Wealth', 'Compliance', 'Claims', 'Executive Leadership'] },
  { title: 'Wholesale Brokerage',
    blurb: 'Strengthening production, underwriting, operations, and leadership teams.',
    roles: ['Wholesale Brokers', 'Underwriters', 'Risk Management', 'Marketing Specialists', 'Operations', 'Human Resources', 'Executive Leadership'] },
  { title: 'Captives, Programs & Services',
    blurb: 'Specialized recruitment for alternative risk organizations and specialty programs.',
    roles: ['MGA', 'MGU', 'TPA', 'Reinsurance', 'Benefit Consultants', 'Self-Insured Programs', 'Executive Leadership'] },
];

/* Rendered as text with name, title, and company. No headshots — the old
   site's were placeholders and the new site is single-principal. */
export const QUOTES = [
  { body: 'Shane has been responsible for some of the dramatic growth HUB California has had by bringing well qualified producers to us in all lines of insurance brokering.',
    name: 'James Stuart', role: 'Chief Sales Officer, CA · HUB International' },
  { body: 'Shane is one of the best, well-connected, methodical, and ethical people I know. He doesn’t toss bodies at you; he finds and thoroughly screens applicants that fit the employer’s requirements.',
    name: 'Jim Bayne', role: 'Area President · San Diego, CA · Retired' },
  { body: 'Shane’s early advice and mentorship were invaluable. It’s no surprise that his firm has transformed the insurance industry’s recruiting approach.',
    name: 'Christian Claudio', role: 'CEO & CTO · StaffMed Health Partners' },
];

/* Individual Accountability is deliberately blank — on the old site it
   duplicated Professional Growth word for word. Waiting on Shane. */
export const VALUES = [
  { title: 'Professional Growth',
    body: 'We foster continuous learning and development, empowering our people and clients to grow, adapt, and lead in an evolving business landscape.' },
  { title: 'Individual Accountability', body: null, pending: true },
  { title: 'Group Collaboration',
    body: 'We believe exceptional outcomes are achieved through teamwork, open communication, and shared expertise across every engagement.' },
  { title: 'Optimistic Attitude',
    body: 'We approach every challenge with confidence, resilience, and a solution-oriented mindset, turning opportunities into lasting success.' },
  { title: 'Professional Integrity',
    body: 'Integrity guides every decision we make. We uphold the highest ethical standards, ensuring trust, confidentiality, and respect in every relationship.' },
  { title: 'Full Transparency',
    body: 'We communicate openly and honestly, providing clear insights, realistic expectations, and complete visibility throughout every partnership.' },
];

export const CONTACT_TOPICS = [
  'Retained search',
  'Contingent submittal',
  'M&A consulting',
  'I’m exploring a move',
  'Something else',
];
