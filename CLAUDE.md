# MGMTGlobal — Website Rebuild

Rebuild of the MGMTGlobal Consulting site. Boutique executive search and M&A consulting, exclusively for the insurance industry. Based in Carrollton, TX. Founder and principal: Shane Graham.

The previous build (WordPress + Elementor, on a contractor's staging server) is being replaced. Copy and palette carry over; nothing else does.

---

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- GSAP + ScrollTrigger for scroll-driven sections
- Lenis for smooth scroll
- Deployed on Render

Phase two adds React Three Fiber + drei for two 3D sections. Do not add these until phase one is shipped.

---

## Design tokens

Carried from the previous build. These are correct — do not substitute.

```
--black:      #05070A   /* deepest background */
--charcoal:   #10151C   /* section background */
--charcoal-2: #14181D   /* lifted section background */
--gold:       #E1A13F   /* primary accent, CTAs, eyebrows */
--gold-pale:  #EFCFA0   /* hairline rules, light fills */
--cream:      #FFF9F0   /* light section background */
--white:      #FFFFFF   /* primary text on dark */
```

**Typeface:** Schibsted Grotesk throughout. A serif italic (Source Serif 4) carries one accent phrase per page — *one*, not one per heading. The old site used the device on every headline and it read as a tic.

**Body text is solid white or a deliberate grey.** The old build used `#FFFFFFD1` (82% alpha) which read muddy on black. Do not reintroduce alpha on text colors.

---

## Architecture rules

### Real pages, not one long scroll

Every nav item is a separate route with its own URL. Do not build a single-page site with anchor links that look like navigation. This is a firm decision from the client.

```
/                          Home
/about                     About + principal
/services                  Services index
/services/retained-search
/services/contingent-submittal
/services/ma-consulting
/careers                   Careers + job board
/contact                   Contact
```

Each page gets its own `<title>`, meta description, and `<h1>`. Separate URLs are also what lets individual service pages rank and be linked to directly.

Scroll-driven sections live *within* pages. The plan is two to three across the site, not one continuous scroll that spans everything.

### The process section is a swappable container

The four-step retained search section is the centerpiece. It must be built as a component that computes its own scroll progress (0 to 1) and passes that value down to its interior. The interior is what renders.

Phase one interior: an animated SVG line that draws itself, with steps revealing in sequence.
Phase two interior: a Three.js scene with a camera moving along a curve.

**Swapping the interior must touch only that one component.** Do not wire ScrollTrigger directly to SVG elements. Do not let page layout depend on what is inside the section — give it a fixed height in viewport units.

The phase-one interior stays permanently as the reduced-motion and low-end-device fallback.

### Content stays in the DOM

No important text baked into SVG, canvas, or images. The site needs to be crawlable and skimmable on a phone. Candidates and hiring managers are the audience, not design juries.

### Every motion section needs a static fallback

`prefers-reduced-motion: reduce` drops to the static version. This is not optional and it is cheaper to build in from the start than to retrofit.

---

## Job board

Open roles come from the **Recruiterflow API**. Shane manages roles in Recruiterflow; the site follows. Nothing is maintained in two places.

- Fetch server-side (route handler or server component), cache with a short revalidate window
- Pull all roles and filter client-side — the firm has 10–30 open roles, not thousands
- **Apply buttons must link to the application form URL returned by the API.** Never construct one, never build a custom form. Doing so breaks source attribution and Shane's screening questions.
- Rate limits are not published — cache, don't hammer
- API key is requested from Recruiterflow support, not self-serve

Career page filters by location (currently Orange County, San Francisco, All).

---

## Pages

| Page | Notes |
|---|---|
| Home | Hero, stat bar, audience fork, who we are, what we do, **process section**, why MGMT, testimonials |
| About | Positioning, core values, experience by segment, expertise, principal |
| Services | Index + three children: Retained Search, Contingent Submittal, M&A Consulting |
| Careers | Copy + Recruiterflow job board |
| Contact | Form, details, Calendly link |

Each service page has a PDF download CTA.

**Principal page, not a team page.** Shane only. Testimonials render as text with name, title, and company — no headshots.

The Careers copy currently assumes a larger team ("every consultant runs a focused book"). Adjust against the single-principal framing.

---

## Copy

Full inventory lives in `content-inventory.md`. All copy carries over from the previous build except the fixes below.

### Known copy problems — fix, don't carry over

- **Individual Accountability** core value duplicates Professional Growth word for word. Needs writing (waiting on Shane).
- **Contingent Submittal "Our Approach"** paragraph is garbled — sentence fragments, and "we want to take advantage of the scenario" is wrong for client-facing copy. Rewrite.
- **"Testemonials"** misspelled in nav and anchors.
- **Comma splice** in the homepage positioning paragraph: "works only in insurance, companies, wholesale and retail brokerage" should read "insurance companies, wholesale and retail brokerage."
- **Careers page eyebrow** is wrong — "Firms that trust us with their growth" sits above "Where you'd fit in."
- **Location inconsistency** — Contact says Carrollton TX, footer says DFW–North Texas. Pick one.
- **BB&T** appears in client logos and a testimonial attribution. Merged into Truist in 2019.

### Known build problems from the old site — do not reproduce

- Hero headline was dark text over a dark photo, effectively unreadable
- No `<h1>` on the homepage
- Overlapping text in the "Recruiting Firm & Growth Partner" section
- Fade-and-slide entrance animation on every single section (Elementor default) — made the page feel slow and templated

---

## Conversion paths

Primary CTA across the site is **Book a Consultation** → Calendly (`calendly.com/lsg-mgmt/brief-consultation-sg`).

Secondary path is the audience fork: hiring firms → Find Top Talent; insurance professionals → Calendly.

Contact form fields: Name, Company, Email, Phone, Topic (select), Message.

Newsletter signup in footer → Buttondown. Positioning: "Stay ahead of the insurance talent market. Industry hiring trends and insights, a few times a year."

---

## Working notes

- Build in slices. One page or one section per session, not "build the site."
- Gray-box before dressing. Get motion and pacing right before assets exist.
- Test on a real phone and an older laptop before anything ships.
- Update this file as decisions get made.

## Blocked on

- WordPress XML export + uploads zip from the previous developer (original images, logo SVG, three service PDFs)
- Recruiterflow API key
- Professional headshots of Shane
- Rewritten Individual Accountability copy
