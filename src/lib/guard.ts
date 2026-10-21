import { createHash } from 'node:crypto';

/* ============================================================================
   Form abuse guard.

   Written after a bot hammered /api/contact and burned the entire Resend
   daily allowance before 9am, which meant the site could not send anything
   for the rest of the day — including a real enquiry.

   Two things made that possible:

   1. The old checks had a hole. The honeypot only catches a bot that submits
      the rendered form, and the timestamp check read
      `if (started && Date.now() - started < 3000)` — so a POST that simply
      omitted `started_at` skipped the check entirely instead of failing it.
      A script posting straight at the endpoint passed both trivially.

   2. Nothing capped the damage. Every accepted submission became a Resend
      call, so the quota was the only limit, and it is shared with the
      confidential form.

   Everything here is in-memory. That is deliberate: both forms promise that
   nothing is stored, and /confidential's promise is the whole point of that
   page. The cost is that a deploy or restart resets the counters, which is
   fine — a restart is rare and the budget is a backstop, not an audit trail.
   Nothing here is ever written to disk or logged with content attached.
   ============================================================================ */

/** Hash anything we need to remember, so no raw address or text is held. */
function digest(input: string): string {
  return createHash('sha256').update(input).digest('base64url').slice(0, 22);
}

/** Client IP as Render presents it, hashed. Falls back to a shared bucket. */
export function clientKey(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for') || '';
  const ip = fwd.split(',')[0].trim() || req.headers.get('x-real-ip') || '';
  return ip ? digest(ip) : 'unknown';
}

/* ---------- sliding-window rate limit ---------- */

type Hits = number[];
const windows = new Map<string, Hits>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (windows.get(key) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  windows.set(key, hits);

  // Opportunistic prune so the map can't grow without bound under attack.
  if (windows.size > 5000) {
    for (const [k, v] of windows) {
      if (!v.length || now - v[v.length - 1] > windowMs) windows.delete(k);
    }
  }
  return hits.length <= max;
}

/* ---------- daily send budget ---------- */

const budgets = new Map<string, { day: string; used: number }>();

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/* Each form gets its OWN budget, which is the point.

   Resend's allowance is shared, so before this a flood of contact spam could
   consume every send for the day and a genuine confidential enquiry — the
   highest-stakes message this site carries — would silently fail to arrive.
   Separate budgets mean contact abuse can only ever exhaust contact. */
export function withinBudget(form: string, max: number): boolean {
  const d = today();
  const b = budgets.get(form);
  if (!b || b.day !== d) {
    budgets.set(form, { day: d, used: 1 });
    return true;
  }
  b.used += 1;
  return b.used <= max;
}

export function budgetUsed(form: string): number {
  const b = budgets.get(form);
  return b && b.day === today() ? b.used : 0;
}

/* ---------- duplicate suppression ---------- */

const seen = new Map<string, number>();
const DEDUPE_MS = 24 * 60 * 60 * 1000;

/** True the first time this content is seen, false for a repeat. */
export function firstTimeSeeing(parts: string[]): boolean {
  const key = digest(parts.join('\u0000').toLowerCase());
  const now = Date.now();
  const prev = seen.get(key);
  if (prev && now - prev < DEDUPE_MS) return false;
  seen.set(key, now);
  if (seen.size > 5000) {
    for (const [k, t] of seen) if (now - t > DEDUPE_MS) seen.delete(k);
  }
  return true;
}

/* ---------- content heuristics ---------- */

/* Tuned to be conservative. A false positive here is a lost client enquiry,
   which costs far more than a spam email getting through, so each rule has
   to be something a real insurance executive would never trip. */
const LINK = /https?:\/\/|\bwww\./i;

export function contentLooksAutomated(fields: {
  name: string;
  company: string;
  message: string;
}): boolean {
  // Nobody puts a URL in their own name. Bots do it constantly.
  if (LINK.test(fields.name) || LINK.test(fields.company)) return true;

  // A wall of links is an advertisement, not an enquiry.
  const links = (fields.message.match(/https?:\/\//gi) || []).length;
  if (links >= 3) return true;

  // BBCode/markdown link syntax belongs to forum spam, never to email.
  if (/\[url=|\[\/url\]/i.test(fields.message)) return true;

  return false;
}

/* ---------- honeypot + timing, with the hole closed ---------- */

export function looksLikeSpam(form: FormData): boolean {
  if (String(form.get('company_website') || '').trim() !== '') return true;

  /* The timestamp is now REQUIRED and must be sane.

     Previously a missing or zero value skipped the check, so omitting the
     field was easier than defeating it. The real form always sends a
     millisecond timestamp set on mount, so anything else is not the form:
     absent, unparseable, in the future, or older than a day. */
  const raw = form.get('started_at');
  if (raw === null) return true;
  const started = Number(raw);
  if (!Number.isFinite(started) || started <= 0) return true;

  const age = Date.now() - started;
  if (age < 3000) return true;                 // too fast to have been typed
  if (age > 24 * 60 * 60 * 1000) return true;  // a replayed stale token
  if (age < 0) return true;                    // clock from the future

  return false;
}
