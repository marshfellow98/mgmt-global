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

---

## Glass surfaces

`.glass` in globals.css is the liquid-glass treatment: backdrop blur plus
saturation, a top-lit gradient, a specular hairline along the top edge, and a
faint gold bloom so it reads as part of this palette rather than a borrowed
system component.

**Use it only over imagery.** It sits on the hero stat panel because the video
is behind it. Over a flat dark section it has nothing to refract and looks
like grey plastic.

**Never put it on something that moves.** backdrop-filter re-blurs the region
behind the element on every frame. A blurred sticky nav was removed from this
project earlier precisely because it made the whole page feel choppy. Glass on
a fixed or stationary panel is cheap; glass on a scrolling or sticky element
is not.

Falls back to a solid panel where backdrop-filter is unsupported, and under
`prefers-reduced-transparency`.

## Cursor reactivity

Two components, both deliberately restrained.

**`Spotlight`** — a soft gold wash that follows the cursor across a surface.
Applied to the glass stat panel, the sticky service cards, and the
practice-area cards. Position is written to CSS custom properties on each
animation frame, never to React state; re-rendering on mousemove would be
catastrophic. It renders its own light layer rather than using a
pseudo-element, because `.glass` already uses both of its own.

**`Magnetic`** — the element leans toward the cursor, then settles back.
Applied only to the primary "Book a Consultation" calls to action. Travel is
capped at 7px on purpose: large magnetism makes a button feel slippery and
harder to click, which is the wrong trade for a conversion point.

Both skip pointer-coarse devices entirely — there is no cursor on a phone, so
the listeners would cost battery for nothing — and both respect
`prefers-reduced-motion`.

Don't extend these much further. The effect works because most of the page
doesn't do it.

## Motion inventory

Everything that moves, and why. Before adding more, check the list — the
effects work because most of the page is still.

| Effect | Where | Why |
|---|---|---|
| Masked line reveal | All display headings | The core reveal; content visible by default, animation only under `html.js` |
| Smooth scroll (Lenis) | Whole site | Native wheel scroll jumps ~100px; this interpolates |
| Pinned path sections | `/about`, `/services/retained-search` | The scroll contract; phase-two 3D swaps in here |
| Glass + spotlight | Hero stat panel | Glass needs imagery behind it; spotlight gives it a moving light source |
| Spotlight | Service cards, practice cards | Light follows cursor; pointer-fine only |
| Magnetic | Primary CTAs only | 7px travel; more makes buttons feel slippery |
| Counters | Hero stat panel | The numbers *are* the argument |
| Hero parallax | Homepage | Slight drift and scale; depth without announcing itself |
| Page transition | Every route | Keeps multi-page navigation from feeling like a hard cut |
| Arc divider | Homepage | Echoes the logo sweep — the one ornament drawn from his own identity |
| Marquee | Client names | Pauses on hover |
| Hover rows | Job listings | Indent plus gold edge |

Everything above is off under `prefers-reduced-motion`, and the cursor
effects are skipped entirely on touch devices.

## /confidential

A separate, deliberately different door for candidates.

**The reasoning.** The people worth reaching are the ones least able to raise
their hand. A producer with a real book has genuine exposure if word travels
before they're ready — standing, book, an unwanted non-compete conversation.
So they don't fill in contact forms. The main contact form asks for their
employer before it has earned any trust.

**What makes it work** is the copy more than the mechanics. It names the fear
directly, and it asks for *less* than the contact form, not more: personal
email, roughly what they do, what would make a move worth it, when it's safe
to reach them. No employer. No work phone. Name optional.

It's also visually quieter — no video, no glass, narrow column, minimal
motion. The restraint is part of the message. Don't "improve" it by adding
the homepage treatment.

**This only works if the promises are real.** The page commits to never
contacting someone at work and never putting a name in front of a client
without permission. If the firm doesn't operate that way, this is worse than
not having it. Confirm with Shane before launch.

Linked from: the hero prompt, the footer, the careers page, and the contact
page (as an exit for anyone hesitating over the employer field).

## Forms

Both relay straight to an inbox via Resend. Nothing is stored — no database,
no third-party dashboard, no log of the message body. That's deliberate:
`/confidential` promises discretion, and the promise is hollow if submissions
sit in a SaaS admin panel someone else can read. It's also why Formspree and
similar were not used.

`/api/contact` → `CONTACT_TO` (shared inbox is fine)
`/api/confidential` → `CONFIDENTIAL_TO`, a **personal** address of Shane's

The confidential route logs nothing at all, not even on failure, and its
subject line carries no identifying detail so a phone lock-screen
notification gives nothing away.

**Spam handling is a honeypot plus a timestamp, not a CAPTCHA.** Asking a
cautious executive to prove they're human on a confidential enquiry form is
exactly the wrong signal. The honeypot is a hidden field bots fill in; the
timestamp rejects anything submitted in under three seconds. Spam gets a
silent success response — telling a bot it failed just invites a retry.

Forms keep a real `action` and `method`, so they still work if JavaScript
fails. The fetch submission is an enhancement on top.

Env vars: see `.env.example`. All four are listed in `render.yaml` as
`sync: false`, so set them in the Render dashboard.
