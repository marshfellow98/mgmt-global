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
  const expect = {
    'retained-search': 'Retained Search',
    'contingent-submittal': 'Contingent Submittal',
    'ma-consulting': 'M&A Consulting',
  };
  for (const [dir, title] of Object.entries(expect)) {
    const p = `src/app/services/${dir}/page.tsx`;
    const s = readFileSync(p, 'utf8');
    const found = s.match(/title: '([^']+)'/)?.[1];
    if (found !== title) bad(`${dir}/page.tsx has title "${found}", expected "${title}" — wrong file in folder?`);
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

console.log(fail ? `\n${fail} problem(s) found.` : '\nAll checks passed.');
process.exit(fail ? 1 : 0);
