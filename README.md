# MGMTGlobal

Website for MGMT Global Consulting — boutique retained search and M&A
consulting for the insurance industry.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

## Deploy (Render)

New → Web Service → connect this repo.

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Tier: **Starter ($7/mo)**, not Free — free web services sleep after 15
  minutes idle and take 30–60s to wake, which is a bad first impression for
  an executive arriving from LinkedIn.

Environment variables (Render dashboard → Environment):

```
RECRUITERFLOW_API_KEY=
BUTTONDOWN_API_KEY=
```

Locally, put the same values in `.env.local` — gitignored. Never commit keys.

## Layout

```
src/
├── app/                      one folder per route
│   ├── layout.tsx            fonts, nav, footer
│   ├── globals.css           design system
│   ├── page.tsx              /
│   ├── about/                /about
│   ├── services/             /services + three children
│   ├── careers/              /careers, incl. the job board
│   └── contact/              /contact
├── components/
│   ├── PinnedSection.tsx     ← the scroll contract, read this first
│   ├── PathDiagram.tsx       ← phase-one interior, swappable
│   └── …
└── lib/
    ├── content.ts            all copy, as data
    └── recruiterflow.ts      job board API
```

## The scroll contract

`PinnedSection` pins itself, computes scroll progress 0→1, and publishes it
via context. The interior subscribes with `useScrollProgress(fn)` and draws.

That separation is the whole point. Phase two swaps `<PathDiagram />` for a
Three.js scene inside the same `<PinnedSection>`; nothing else changes, and
`PathDiagram` stays on as the reduced-motion fallback.

## Still outstanding

- Recruiterflow API key (requested from their support, not self-serve)
- WordPress uploads zip — logo SVG, photography, three service PDFs
- Professional headshot of Shane
- Rewritten "Individual Accountability" value
- Confirm client logos are cleared for display
