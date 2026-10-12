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
| Process ledger | Three service pages | Scroll-linked, not pinned; fills the old stock-photo slot |
| Globe (3D) | `/services/retained-search` | Phase two; see below |
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

## Recruiterflow

Written against the OpenAPI spec at recruiterflow.com/api. The first pass was
guessed from the help articles and got four things wrong — worth recording so
nobody reintroduces them:

| Wrong | Right |
|---|---|
| `recruiterflow.com/api/external` | `api.recruiterflow.com` |
| `X-API-KEY` header | `RF-Api-Key` header |
| `?status=open` | `?only_open=1` |
| `location`, `workplace_type` | `locations[]` array, no workplace field |

Useful query params: `only_open`, `include_description`, `include_notes`,
`include_count`, `items_per_page`, `current_page`.

Response fields we use: `id`, `title`, `about_position`, `apply_link`,
`employment_type`, `locations[]`, `is_open`, `publish_to_careers_page`.

**The key is account-level.** Recruiterflow has no jobs-only credential, so
the same key reads candidates, clients and deals. It must never reach the
browser — hence no `NEXT_PUBLIC_` prefix and server-only fetching. Don't log
the key or the request URL.

**Not the iframe.** Recruiterflow support suggested embedding their hosted
careers page. That would drop their fonts, colours and scrollbar into the
middle of ours. The API keeps roles in our own design.

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

## Phase two: the globe

`Globe.tsx` + `GlobeScene.tsx` are the 3D interior for `PinnedSection`. Live
on `/services/retained-search`; `/about` still runs `PathDiagram`.

**Everything is procedural.** No model file, no texture, nothing to license or
host. The globe is a sphere geometry whose wireframe segments double as
latitude and longitude lines. Flat materials only — no lights, no shadows —
so it looks like a drawing, matches the rest of the site, and costs almost
nothing per frame.

**The contract held.** Swapping `<PathDiagram />` for `<Globe />` was one
import and one line on the page. Nothing else changed. Swapping back is the
same one line.

**It's client-only and code-split.** `next/dynamic` with `ssr: false` keeps
Three.js (~900 KB) out of every page except the one that uses it. Under
`prefers-reduced-motion` PinnedSection renders its flat layout and the globe
never mounts.

**Progress crosses into the Canvas via a ref, not context.** R3F runs its own
React tree; context from outside doesn't reach it. `Globe.tsx` subscribes with
`useScrollProgress` and writes to a ref the scene reads in `useFrame`.

**The scene smooths itself.** Scroll progress arrives at whatever cadence
scrolling produces; `useFrame` lerps rotation and arc reveal toward it at
60fps, so motion stays continuous regardless of input rate.

Waypoints live in `content.ts` as `PROCESS_GLOBE` — lat/lon per stop. Change
those to move the stops; keep longitudes ~70° apart so the globe visibly
turns between them.

## Process ledger

`ProcessLedger.tsx` fills the 3:4 slot on each service page where a stock
photo used to sit. A gold rail fills as the panel passes through the viewport
and each step lights as the rail reaches it. One large word sits behind at 6%
opacity — the only flourish.

**Scroll-linked, deliberately not pinned.** Retained-search already has a
pinned section (the globe). Two on one page fight each other. The ledger moves
as you pass it and is then done, so the page keeps one moment of arrival.

Content lives in `content.ts` as `RETAINED_LEDGER`, `CONTINGENT_LEDGER`,
`MA_LEDGER`. Every line is derived from copy already on the site — nothing
invented about his process. Change the wording there, not in the component.

## /overview — the pitch deck

A deck that lives at a URL rather than in a file. Eight slides, sent as a
link, on the firm's own domain.

**Built as spatial movement, not slides.** The whole deck is one wide track
and advancing translates it sideways, so each step reads as travelling
through a space rather than cutting between pages — the Prezi quality without
the Prezi subscription. Transform-only on a single element, so it composites
on the GPU and stays smooth on a phone.

Navigation: arrow keys, space, swipe, click the left/right thirds, number
keys to jump, or the dots. Slide index lives in the URL hash, so a client can
be sent to `/overview#4` and the back button behaves.

**Content lives in `src/lib/deck.ts`**, drawn from the site's own copy so the
two can't drift apart. One idea per slide on purpose — this is meant to be
read in ninety seconds by someone deciding whether to take a call.

`robots: noindex` — a sales deck shouldn't compete with the real service
pages in search results. It's deliberately absent from the sitemap for the
same reason (verify.mjs knows about the exception).

The route has its own layout that hides the site nav and footer. Someone
opening the link should see the pitch and nothing else.

## Monthly newsletter

`jobs/newsletter.ts`, run by a Render cron job on the 1st of each month.
Setup guide in `NEWSLETTER.md`.

**It is an industry digest, not a firm update.** Live web search over the
insurance trade press → digest with source links → Buttondown draft → email
to Shane. Brokerage and carrier M&A, leadership moves, market conditions,
talent and compensation.

That framing is what makes automation work. A boutique doesn't generate
enough internal news to fill a monthly, and firm commentary would have to be
invented. External news is factual, checkable, and every claim carries a
link. The firm's own news is a two-line footer.

**The web_search tool is not optional.** Without it the model writes from
stale training data and invents specifics — the exact failure an insurance
executive spots immediately.

**It must never send.** Not because the content is untrustworthy — it's
sourced — but because Shane's read on what matters is what makes it his
rather than a feed. `verify.mjs` fails the build if the status changes from
`draft`.

The brief is the `SYSTEM` constant. Plain English. The list of sections it
searches for is there too.

### Newsletter email template

`jobs/email-template.ts` renders the digest as branded HTML.

**Email HTML is not web HTML.** No web fonts (Outlook and Gmail's app ignore
`@font-face`), so Georgia and a system sans stack stand in for Source Serif
and Schibsted Grotesk — same serif/sans pairing, same proportions, which is
what actually reads as the brand. Tables and inline styles only; Outlook
renders through Word's engine.

Dark masthead, light body. A fully dark email is a deliverability risk and
some clients invert it.

**Two bugs worth not reintroducing:**

The model's preamble was leaking into the sent email as a subtitle. Fixed by
prefilling the assistant turn with `# `, so the response begins mid-heading
and physically cannot open with "Here's the digest…". There's a second guard
that strips anything before the first heading.

The Markdown converter originally treated every source line as a paragraph,
which broke wrapped sentences into fragments. It now buffers lines and
flushes at blank lines and block elements.

`email_type: 'premium'` on the Buttondown call tells it the body is finished
HTML — without it, Buttondown wraps the markup in its own template and the
branding is lost.

### About page: the Dallas skyline

`DallasSkyline.tsx` is the About page's pinned interior, replacing an
abstract four-node path that left most of the frame empty.

Draws left to right as you scroll — each building gets a slice of the scroll
based on its x position, so a pen appears to track across the page. Technique
borrowed from hgrellc.com (stroke-dashoffset reveal), but driven by scroll
rather than a load animation.

Landmarks are recognisable rather than literal: Reunion Tower, Fountain
Place's wedge, the Bank of America Plaza slab, Renaissance Tower's masts.
Gold marks the landmarks, grey the filler.

Two things not to break: the sphere's arcs need `r` to be exactly half the
span or they meet at points and read as a lens (verify.mjs checks this), and
the section passes `wide` to PinnedSection — a skyline needs the full column,
not the square box the globe uses.

## Brand assets and favicons

`public/brand/` holds the full set: logo (dark/light/white/black), icon
(gold/white/black), wordmark (white/black). `public/logo.svg` is the
dark-background variant, used in the nav and footer.

Favicons live in `src/app/` — Next picks them up by filename, no `<link>`
tags: `icon.svg`, `icon.png` (32px), `apple-icon.png` (180px). They use the
**gold swoosh alone**, not the full logo — a wordmark at 16px is a smear.
PNGs are rendered on the brand dark so the gold has contrast against a dark
browser tab; a transparent favicon disappears there.

## CTAs are split by audience

Employers get the filled button (**Discuss a Search** → /contact).
Candidates get a quieter text link (**Explore opportunities** →
/confidential).

Deliberately different weights. Two filled buttons cancel each other out and
force a choice before the visitor knows what the firm does. Employers carry
the emphasis because they're the paying side.

Candidates go to `/confidential`, not `/careers` — careers is the job board
for people actively applying, and a senior producer quietly testing the water
won't click that.

## Legacy URLs and the 404

Google indexed the old Wix site. Those URLs now 404, which is what Search
Console reports as **"Blocked due to other 4xx issue"** — a dead URL loses
whatever ranking it had accumulated, and anyone clicking an old link or an
old search result lands nowhere.

**`next.config.mjs` holds the map.** Roughly forty 308s pointing old paths at
their new equivalents. A 308 is permanent, so Google transfers the equity and
eventually replaces the old URL in its index.

The exact old URL list was never captured before the Wix site came down, so
the map is built from the nav recorded in `content-inventory.md` plus the
obvious variants (`/about-us`, `/aboutus`, `/contact-us`, `/career`). Listing a
path that never existed costs nothing. **To find the ones that are missing,
open the "Blocked due to other 4xx issue" report in Search Console** — it
lists the real URLs Google is still trying to crawl. Add any that aren't in
the map yet.

`verify.mjs` check 16 guards the two ways this goes wrong: a redirect whose
source shadows a real page (that page becomes permanently unreachable, and
nothing else would catch it), and a redirect pointing at a route that doesn't
exist (one 404 to another).

**`src/app/not-found.tsx` is the safety net** for every old URL not in the
map. It routes rather than apologises — four destinations covering everything
the old site had, plus the confidential link. `noindex`, since a 404 should
never appear in search results.

The other two Search Console reasons are expected, not problems:
*"Page with redirect"* is the www → non-www canonical, and *"Excluded by
'noindex' tag"* is `/overview`, which is deliberate.

## Staff login

A padlock and "Login" at the far right of the nav, and the same at the bottom
of the mobile menu, pointing at `/login` → the recruitment dashboard
(a separate Render service). Shane asked for it; he works out of the dashboard
daily and wanted one click from anywhere.

**Nothing here authenticates anyone.** `src/app/login/route.ts` is a redirect
and nothing else. The dashboard runs its own passcode gate — that was already
true before this link existed, which is the only reason linking it publicly is
acceptable. **Never add a credential, passcode or session check to this repo:**
it's a public GitHub repo, and the dashboard reads candidate and client data.
`verify.mjs` check 18 fails the build if that route so much as references a
password, secret or token.

Why a redirect rather than the onrender.com URL in an `href`:
`mgmtglobal.com/login` is typeable from any device, and the dashboard's
address then lives in exactly one place (`DASHBOARD_URL`, set in
`render.yaml`) for when the service is renamed or moves to its own domain.
It's a **307, not a 308** — browsers cache permanent redirects more or less
forever, so a permanent one would strand him if the dashboard ever moved.

Kept out of search: `robots.ts` disallows `/login`, the route sends
`X-Robots-Tag: noindex, nofollow`, the nav link carries `rel="nofollow"`, and
it's absent from the sitemap. The point is that the dashboard's passcode
screen never appears in Google results.

**It is deliberately the quietest thing in the bar** — padlock, `#6B7480`, set
off behind a hairline. A prominent "Login" on a search firm's homepage makes
candidates and clients wonder whether they were supposed to have an account,
and that confusion lands on the main conversion surface. The word itself only
appears above 1400px; below that the padlock stands alone with an
`aria-label`.

### The nav had no room, and the overflow was invisible

Adding this surfaced a bug that predated it: at 1024–1152px the gold
**"Discuss a Search" CTA was clipped off the right edge**, and `overflow-x:
clip` on `body` (there to protect `position: sticky`) meant no scrollbar ever
appeared. The primary call to action was sliced in half at common laptop
widths with nothing to notice.

Three changes made the bar fit at every width from 1024 to 1920:

- `whitespace-nowrap` on the main links. "In Confidence" is the only two-word
  label and it broke across two lines as soon as the row tightened.
- Gaps tighten below 1280 (`gap-5 xl:gap-9`, `gap-4 xl:gap-6`).
- **"Explore opportunities" is hidden below 1280.** It points at
  `/confidential` and so does "In Confidence" in the main links — the same
  destination twice in one bar, costing ~210px. Below 1280 "In Confidence"
  carries that route; above it, both show as approved.

The Login label appears at 1400 rather than 1280 on purpose: at exactly 1280
"Explore opportunities" reappears, and both labels arriving on the same
breakpoint was the one width that still overflowed.

**Measure, don't eyeball, when touching the nav.** Because the overflow is
clipped rather than scrolled, a broken bar looks fine in a screenshot of the
left-hand side. Walk the widths and compare each element's
`getBoundingClientRect().right` against `window.innerWidth`.

### Deck sizing: the type scale is height-aware

Every size on the deck was a width-only clamp, e.g.
`clamp(2rem, 6.2vw, 5rem)`. That is correct on a 1440x900 laptop and wrong in
two places, both of which shipped:

- **Short screens.** A 1366x768 or 1024x640 has plenty of width, so the
  width term stayed large while there was much less height to put it in.
- **Small phones.** At 360px wide the width term falls below the clamp floor,
  so the floor renders — and the floors were chosen for desktop.

Sizes now live as `--d-*` tokens in `globals.css` under `.deck`, each capped
by height as well: `clamp(2rem, min(6.2vw, 9.5vh), 5rem)`. The vh
coefficients are deliberately generous — at 1440x900 and 1920x1080 the width
term still wins, so **what Shane approved on a normal laptop is pixel
identical**. A `@media (max-width: 480px)` block drops the floors for phones.

`.deck` on the root is load-bearing: without it every `var(--d-*)` resolves
to nothing. verify.mjs check 19 asserts the class is present and that every
token used in `Deck.tsx` is actually defined, since a typo would otherwise
fall back silently.

### Why text was printing through the logo

The slide was one box: `flex h-full items-center overflow-y-auto` with the
padding on it. **Centring an overflowing flex item pushes its top edge above
the container's content box, and padding is not honoured in the overflow
direction.** So the moment a slide was taller than the viewport, its heading
rose up under the logo and there was no way to scroll back to it. On a 360px
phone that is exactly what slide 6 did — "Retained Search" was printed
straight through the wordmark.

It is now two nested boxes: the outer one scrolls and carries no padding, the
inner one takes the padding and `min-h-full`. Short content leaves the inner
box at viewport height and `items-center` centres it as before; tall content
grows it, so the top edge stays at padding-top. Overflow can no longer escape
upward. Don't collapse these back into one element — verify.mjs fails if
centring and scrolling land on the same box.

### Spacing has to be keyed off height, not width

The first pass at this tightened the slide rhythm with Tailwind `sm:` steps,
which key off **width**. A 1024x640 laptop is wide but short, so it kept the
full desktop rhythm and the dense slides still overflowed. The fix is the
`@media (max-height: 740px)` block in `globals.css`, which repeats those cuts
by height. Its selectors are element-qualified (`.deck h2` is 0,1,1) so they
outrank single-class Tailwind margins without `!important`.

### Scrims

The chrome sits over a scrollable region, so padding can reserve space at the
ends of a slide but cannot stop a line passing behind the dots mid-scroll.
Two gradients — opaque across the chrome band, then fading — mean such a line
disappears cleanly instead of ghosting through the indicators at 7% opacity,
which read as a rendering fault.

### Current state

Nothing overlaps and nothing is clipped at 1920x1080, 1440x900, 1366x768,
1280x800, 1024x640, 768x1024 or 390x844. On a 360px phone three dense slides
(4, 6, 9) still scroll by 70–110px; every line clears the dots once scrolled,
which was verified rather than assumed.

**Measuring this needs the real fonts.** fonts.googleapis.com is unreachable
from the build sandbox, and substituting Georgia changes the metrics enough to
invalidate any overlap measurement. Install `@fontsource/source-serif-4` and
`@fontsource/schibsted-grotesk` from npm, point `next/font/local` at those
woff2 files for the duration of the test, and revert afterwards.
