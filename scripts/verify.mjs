/* Pre-commit sanity checks. Run: node scripts/verify.mjs
   These exist because three separate bugs shipped that a thirty-second
   check would have caught: a globe larger than its own camera frustum, a
   page file overwritten with a different page's content, and a component
   left imported but unused. */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

let fail = 0;
const bad = (m) => { console.error('  FAIL ' + m); fail++; };
const ok  = (m) => console.log('  ok   ' + m);

// ---------- 1. Globe fits inside the camera frustum ----------
{
  const src = readFileSync('src/components/GlobeScene.tsx', 'utf8');
  const R = Number(src.match(/const R = ([\d.]+)/)?.[1]);
  const z = Number(src.match(/position: \[0, 0, ([\d.]+)\]/)?.[1]);
  const fov = Number(src.match(/fov: ([\d.]+)/)?.[1]);
  const visible = 2 * z * Math.tan((fov / 2) * Math.PI / 180);
  const fill = (2 * R) / visible;
  if (!R || !z || !fov) bad('globe: could not read R / z / fov');
  else if (fill > 0.97) bad(`globe fills ${(fill*100).toFixed(0)}% of frame — clips. Need z >= ${(((2*R)/0.9)/(2*Math.tan((fov/2)*Math.PI/180))).toFixed(2)}`);
  else ok(`globe fills ${(fill*100).toFixed(0)}% of frame (R=${R}, z=${z}, fov=${fov})`);
}

// ---------- 2. Every page's metadata matches its folder ----------
{
  /* Match a distinctive phrase rather than the exact title: page titles get
     rewritten for SEO, but a file landing in the wrong folder still gets
     caught, which is the failure this is here to prevent. */
  const expect = {
    'retained-search': /Retained (Executive )?Search/i,
    'contingent-submittal': /Contingent/i,
    'ma-consulting': /M&A/i,
  };
  for (const [dir, pattern] of Object.entries(expect)) {
    const p = `src/app/services/${dir}/page.tsx`;
    const s = readFileSync(p, 'utf8');
    const found = s.match(/title: '([^']+)'/)?.[1];
    if (!found || !pattern.test(found)) bad(`${dir}/page.tsx title "${found}" doesn't match ${pattern} — wrong file in folder?`);
    else ok(`${dir} → "${found}"`);
  }
}

// ---------- 3. No imports left dangling ----------
{
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
  const files = walk('src').filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'));
  for (const f of files) {
    const s = readFileSync(f, 'utf8');
    for (const m of s.matchAll(/^import (\w+) from '(@\/[^']+|\.\/[^']+|\.\.\/[^']+)';$/gm)) {
      const [, name, spec] = m;
      const body = s.slice(m.index + m[0].length);
      if (!new RegExp(`[<{\\s]${name}\\b`).test(body)) bad(`${f}: imports ${name} but never uses it`);
      const rel = spec.startsWith('@/') ? 'src/' + spec.slice(2) : join(f, '..', spec);
      if (!existsSync(rel + '.tsx') && !existsSync(rel + '.ts')) bad(`${f}: imports ${name} from ${spec} — file missing`);
    }
  }
  ok('imports resolve and are used');
}

// ---------- 4. Pinned sections have an interior ----------
{
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
  for (const f of walk('src/app').filter((x) => x.endsWith('page.tsx'))) {
    const s = readFileSync(f, 'utf8');
    if (s.includes('<PinnedSection') && !/(Globe|PathDiagram|DallasSkyline)/.test(s))
      bad(`${f}: PinnedSection with no interior component`);
  }
  ok('pinned sections have interiors');
}

// ---------- 5. Every page has a canonical and a unique title ----------
{
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
  const pages = walk('src/app').filter((f) => f.endsWith('page.tsx'));
  const titles = new Map();
  for (const f of pages) {
    const s = readFileSync(f, 'utf8');
    if (!s.includes('export const metadata')) continue;   // homepage inherits layout
    if (!s.includes('canonical:')) bad(`${f}: no canonical URL`);
    const t = s.match(/title: '([^']+)'/)?.[1];
    if (!t) { bad(`${f}: no title`); continue; }
    if (titles.has(t)) bad(`duplicate title "${t}" in ${f} and ${titles.get(t)}`);
    titles.set(t, f);
  }
  ok(`${titles.size} pages with unique titles and canonicals`);
}

// ---------- 6. Expensive effects are gated for mobile ----------
{
  const css = readFileSync('src/app/globals.css', 'utf8');
  if (!/max-width: 1023px\) \{ body::after/.test(css)) bad('grain not disabled on mobile');
  else ok('grain disabled on mobile');

  const globe = readFileSync('src/components/Globe.tsx', 'utf8');
  if (!globe.includes('min-width: 1024px')) bad('WebGL globe not gated to desktop');
  else ok('WebGL globe gated to desktop');

  const home = readFileSync('src/app/page.tsx', 'utf8');
  if (!home.includes('lg:hidden')) bad('hero video not gated to desktop');
  else ok('hero video gated to desktop');
}

// ---------- 7. Sitemap covers every route ----------
{
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
  const routes = walk('src/app')
    .filter((f) => f.endsWith('page.tsx'))
    .map((f) => f.replace('src/app', '').replace('/page.tsx', ''))
    // /overview is the sales deck: noindex by design, so it's deliberately
    // absent from the sitemap.
    .filter((r) => r !== '/overview');
  const sm = readFileSync('src/app/sitemap.ts', 'utf8');
  const missing = routes.filter((r) => !sm.includes(`page('${r}'`));
  if (missing.length) bad(`sitemap missing: ${missing.join(', ')}`);
  else ok(`sitemap covers all ${routes.length} routes`);
}

// ---------- 8. Fixed full-screen containers size themselves explicitly ----------
{
  /* A `fixed` element stretched with inset-0 resolves against the nearest
     ancestor with a transform — not the viewport. template.tsx animates a
     transform on every page, so inset-0 collapses to zero height. Anything
     meant to fill the screen must use explicit viewport units. */
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
  const files = [...walk('src/app'), ...walk('src/components')].filter((f) => f.endsWith('.tsx'));
  for (const f of files) {
    const src = readFileSync(f, 'utf8');
    for (const m of src.matchAll(/className="[^"]*\bfixed\b[^"]*\binset-0\b[^"]*"/g)) {
      const after = src.slice(m.index, m.index + 400);
      const sized = /100svh|100vh|h-screen/.test(after);
      const isOverlay = /pointer-events-none|z-\d/.test(m[0]);
      if (!sized && !isOverlay) bad(`${f}: fixed inset-0 without explicit viewport height — collapses under a transformed ancestor`);
    }
  }
  ok('fixed full-screen containers sized explicitly');
}

// ---------- 9. Deck ambience covers every slide ----------
{
  const src = readFileSync('src/lib/deck.ts', 'utf8');
  const slides = (src.match(/\n    kind: '/g) || []).length;
  const amb = (src.match(/\{ x: '/g) || []).length;
  if (slides !== amb) bad(`deck has ${slides} slides but ${amb} ambience entries — later slides lose their light`);
  else ok(`deck: ${slides} slides, ${amb} ambience entries`);
}

// ---------- 10. No dependencies on the old staging server ----------
{
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
  const files = walk('src').filter((f) => /\.(tsx?|css)$/.test(f));
  let found = 0;
  for (const f of files) {
    if (readFileSync(f, 'utf8').includes('zktech.dz')) { bad(`${f}: still loads from the old staging server`); found++; }
  }
  if (!found) ok('no assets load from the old staging server');
}

// ---------- 11. Download links point at files that exist ----------
{
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
  const files = walk('src/app').filter((f) => f.endsWith('.tsx'));
  let n = 0;
  for (const f of files) {
    for (const m of readFileSync(f, 'utf8').matchAll(/href="(\/(?:downloads|video|images)\/[^"]+)"/g)) {
      const target = 'public' + m[1];
      if (!existsSync(target)) bad(`${f}: links to ${m[1]} which doesn't exist`);
      else n++;
    }
  }
  ok(`${n} asset links resolve`);
}

// ---------- 12. Newsletter cannot send on its own ----------
{
  /* The job must only ever create drafts. If someone changes status to
     'sent' or adds a send call, several hundred industry inboxes get
     whatever the model produced, unreviewed. */
  const src = readFileSync('jobs/newsletter.ts', 'utf8');
  if (!src.includes("status: 'draft'")) bad('newsletter: not explicitly saving as a draft');
  else if (/status:\s*'(sent|scheduled|about_to_send)'/.test(src)) bad('newsletter: would send without review');
  else ok('newsletter saves as draft only');
}

// ---------- 13. Every form action has a route behind it ----------
{
  /* The footer signup posted to /api/subscribe for weeks with no such route,
     so every submission 404'd and was lost silently. */
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
  const files = walk('src').filter((f) => f.endsWith('.tsx'));
  const seen = new Set();
  for (const f of files) {
    for (const m of readFileSync(f, 'utf8').matchAll(/action="(\/api\/[^"]+)"/g)) {
      seen.add(m[1]);
      if (!existsSync(`src/app${m[1]}/route.ts`)) bad(`${f}: posts to ${m[1]} but no route handler exists`);
    }
  }
  ok(`${seen.size} form endpoints have routes`);
}

// ---------- 14. Skyline arcs close properly ----------
{
  /* Two arcs only form a circle when the radius is exactly half the span.
     Reunion Tower's sphere rendered as a pointed lens until this was
     right. */
  const src = readFileSync('src/components/DallasSkyline.tsx', 'utf8');
  const arcs = [...src.matchAll(/a(\d+) \1 0 0 1 (-?)(\d+) 0/g)];
  let bad_ = 0;
  for (const m of arcs) {
    const r = Number(m[1]), span = Number(m[3]);
    if (Math.abs(span - r * 2) > 0.5) { bad(`skyline arc r=${r} span=${span} — won't close into a circle`); bad_++; }
  }
  if (!bad_) ok(`skyline: ${arcs.length} arcs close correctly`);
}

// ---------- 15. Favicons present ----------
{
  /* Next's App Router picks these up from src/app/ by filename. Missing them
     means the browser tab shows a blank page icon. */
  for (const f of ['icon.svg', 'icon.png', 'apple-icon.png']) {
    if (!existsSync(`src/app/${f}`)) bad(`missing src/app/${f}`);
  }
  if (existsSync('src/app/icon.svg')) ok('favicons present');
}

// ---------- 16. Legacy redirects are sane ----------
{
  /* A redirect whose source matches a real route silently shadows that page —
     the page still exists, builds, and is in the sitemap, but nobody can ever
     reach it. And a redirect pointing at a route that doesn't exist sends the
     visitor from one 404 to another. Both are invisible until someone clicks. */
  const cfg = readFileSync('next.config.mjs', 'utf8');
  const pairs = [...cfg.matchAll(/\['(\/[^']*)', '(\/[^']*)'\]/g)].map((m) => [m[1], m[2]]);

  const routes = new Set();
  const walk = (dir, url) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory() || e.name === 'api' || e.name.startsWith('_')) continue;
      const seg = e.name.replace(/^\((.*)\)$/, '');           // route groups add no segment
      const next = seg === e.name ? `${url}/${e.name}` : url;
      if (existsSync(join(dir, e.name, 'page.tsx'))) routes.add(next || '/');
      walk(join(dir, e.name), next);
    }
  };
  if (existsSync('src/app/page.tsx')) routes.add('/');
  walk('src/app', '');

  if (!pairs.length) bad('no legacy redirects found in next.config.mjs');
  let bad_ = 0;
  for (const [source, destination] of pairs) {
    const base = source.replace(/\/:.*$/, '');                 // /MGMT/:path* -> /MGMT
    if (routes.has(source)) { bad(`redirect source ${source} shadows a real page`); bad_++; }
    else if (source !== base && routes.has(base)) { bad(`redirect source ${source} shadows pages under ${base}`); bad_++; }
    if (!routes.has(destination)) { bad(`redirect ${source} -> ${destination}, which is not a route`); bad_++; }
  }
  if (!bad_) ok(`${pairs.length} legacy redirects, none shadowing ${routes.size} real routes`);
}

// ---------- 17. Branded 404 ----------
{
  /* Any old URL without a redirect lands here, so it has to do more than
     say "not found" — it's the last chance to route that visitor. */
  const p = 'src/app/not-found.tsx';
  if (!existsSync(p)) bad('missing src/app/not-found.tsx — old links hit the default Next 404');
  else {
    const src = readFileSync(p, 'utf8');
    /* Count route paths wherever they appear — href="..." or, as here, a
       data array the links are built from. */
    const links = new Set([...src.matchAll(/['"](\/[a-z0-9/-]+)['"]/g)].map((m) => m[1])).size;
    if (links < 3) bad(`404 page routes to ${links} destinations — should offer at least 3`);
    else if (!/index: false/.test(src)) bad('404 page is missing robots noindex');
    else ok(`404 page present, ${links} outbound links, noindex`);
  }
}

// ---------- 18. Staff login route is private and safe ----------
{
  /* /login leaves the site, which means three things can go wrong quietly:
     it gets indexed and the dashboard shows up in search results; it ends up
     in the sitemap, which actively asks Google to crawl it; or it sends
     people somewhere over plain http. */
  const p = 'src/app/login/route.ts';
  if (!existsSync(p)) bad('missing src/app/login/route.ts');
  else {
    const src = readFileSync(p, 'utf8');
    const robots = readFileSync('src/app/robots.ts', 'utf8');
    const sitemap = readFileSync('src/app/sitemap.ts', 'utf8');
    const nav = readFileSync('src/components/Nav.tsx', 'utf8');

    if (!/'\/login'/.test(robots)) bad('/login is not disallowed in robots.ts');
    else if (/\/login/.test(sitemap)) bad('/login is in the sitemap — that invites crawling');
    else if (!/noindex/.test(src)) bad('/login route is missing its X-Robots-Tag noindex header');
    else if (!/protocol !== 'https:'/.test(src)) bad('/login does not check the target is https');
    else if (/, 308\)|permanent: true/.test(src)) bad('/login uses a permanent redirect — browsers cache those indefinitely');
    else if (!/rel="nofollow"/.test(nav)) bad('nav login link is missing rel="nofollow"');
    else ok('/login: noindex, out of the sitemap, https-only, non-permanent');

    /* The dashboard holds candidate and client data. A credential reaching
       this repo would be committed to a public GitHub repo. */
    const code = src
      .replace(/\/\*[\s\S]*?\*\//g, '')          // block comments
      .replace(/^[ \t]*\/\/.*$/gm, '');          // line comments
    if (/pass(code|word)|secret|token/i.test(code)) {
      bad('/login route handles a credential — authentication belongs in the dashboard, never in this public repo');
    } else ok('/login holds no credential');
  }
}

// ---------- 19. Deck sizing and overlap guards ----------
{
  /* The deck's chrome — logo, counter, dot indicators — is absolutely
     positioned over a scrollable region, so three separate mistakes all show
     up as text printed through the logo or the dots. All three happened. */
  const deckRaw = readFileSync('src/app/overview/Deck.tsx', 'utf8');
  const css = readFileSync('src/app/globals.css', 'utf8');
  /* Strip comments before any structural test. The comments here quote the
     broken patterns they warn about, so matching against raw source makes
     the explanation itself trip the check. */
  const deck = deckRaw
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '');

  // (a) The type scale only applies if the root carries the class.
  if (!/className="deck /.test(deck)) {
    bad('Deck root is missing the `deck` class — every var(--d-*) resolves to nothing');
  }

  // (b) Every token used must actually be defined, or it silently falls back.
  const used = [...new Set([...deck.matchAll(/var\((--d-[a-z]+)\)/g)].map((m) => m[1]))];
  const defined = new Set([...css.matchAll(/(--d-[a-z]+)\s*:/g)].map((m) => m[1]));
  const missing = used.filter((v) => !defined.has(v));
  if (missing.length) bad(`deck type tokens used but not defined in globals.css: ${missing.join(', ')}`);
  else if (used.length) ok(`${used.length} deck type tokens all defined`);

  // (c) Width-only clamps are what broke short screens. The ghost numeral is
  //     allowed one, and it carries its own vh cap.
  const rawClamps = [...deck.matchAll(/text-\[clamp\([^\]]*\)\]/g)].map((m) => m[0]);
  if (rawClamps.length) {
    bad(`Deck has width-only type clamps, which overflow short screens: ${rawClamps.join(' ')}`);
  }

  // (d) The safe-centring pattern. Centring an overflowing flex item pushes
  //     its top above the padding box, which is how a heading ended up
  //     printed through the logo with no way to scroll to it.
  if (/items-center[^"]*overflow-y-auto|overflow-y-auto[^"]*items-center/.test(deck)) {
    bad('Deck slide centres and scrolls on the same element — overflow will tuck under the logo. Use an inner min-h-full flex.');
  } else if (!/min-h-full/.test(deck)) {
    bad('Deck slide is missing the inner min-h-full box that keeps overflow below the chrome');
  } else ok('deck slides centre safely (overflow grows the box, it does not escape it)');

  // (e) Scrims, so anything that does scroll fades instead of colliding.
  const scrims = (deck.match(/linear-gradient\(to (top|bottom),#05070A/g) || []).length;
  if (scrims < 2) bad(`deck has ${scrims} chrome scrims, expected 2 (top and bottom)`);
  else ok('deck top and bottom scrims present');

  // (f) The height-keyed spacing block. Without it, wide-but-short laptops
  //     keep the full desktop rhythm and the dense slides overflow.
  if (!/@media \(max-height: \d+px\)[\s\S]{0,400}\.deck/.test(css)) {
    bad('globals.css has no height-keyed .deck spacing block — short laptops will overflow');
  } else ok('deck has height-keyed spacing for short viewports');
}

console.log(fail ? `\n${fail} problem(s) found.` : '\nAll checks passed.');
process.exit(fail ? 1 : 0);
