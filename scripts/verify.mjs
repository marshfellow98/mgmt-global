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
    if (s.includes('<PinnedSection') && !/(Globe|PathDiagram)/.test(s))
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

console.log(fail ? `\n${fail} problem(s) found.` : '\nAll checks passed.');
process.exit(fail ? 1 : 0);
