/* ============================================================================
   Recruiterflow.

   Written against the OpenAPI spec at recruiterflow.com/api, not guessed.
   The earlier version got four things wrong: the domain, the auth header,
   the query parameters and the response field names. Corrections noted
   inline so the next person doesn't have to re-derive them.

   Shane manages open roles in Recruiterflow; the site follows. Nothing is
   maintained twice.

   Two rules that matter:

   1. Apply links MUST use `apply_link` from the response. Never construct
      one. Doing so breaks source attribution and Shane's screening
      questions, and applications land somewhere he'd have to re-enter by
      hand.

   2. The key is ACCOUNT-LEVEL — Recruiterflow has no jobs-only key, so the
      same credential can read candidates, clients and deals. It must never
      reach the browser. Everything here is server-side only, and the env
      var deliberately has no NEXT_PUBLIC_ prefix so Next keeps it that way.
   ============================================================================ */

// Spec: "Domain for all API requests should be api.recruiterflow.com"
const BASE = 'https://api.recruiterflow.com';
const REVALIDATE = 900; // 15 minutes

/* Where to send someone if a role has no apply_link of its own. */
const CAREERS_FALLBACK = 'https://app.recruiterflow.com/mgmtglobal/jobs';

export type Job = {
  id: string;
  title: string;
  location: string;
  employmentType: string | null;
  description: string | null;
  /** The API's `apply_link`. Never build this yourself. */
  applyUrl: string | null;
};

type RawLocation = { city?: string | null; state?: string | null; country?: string | null; name?: string | null };
type RawJob = {
  id?: number | string;
  title?: string;
  name?: string;
  about_position?: string | null;
  apply_link?: string | null;
  employment_type?: string | null;
  job_type?: { name?: string } | null;
  locations?: RawLocation[] | null;
  is_open?: boolean;
  publish_to_careers_page?: boolean;
};

/** "Orange County, CA" from the locations array. */
function formatLocation(locs?: RawLocation[] | null): string {
  if (!locs || !locs.length) return '';
  const l = locs[0];
  const text = [l.city || l.name, l.state].filter(Boolean).join(', ');
  // More than one location is worth saying rather than hiding.
  return locs.length > 1 ? `${text} +${locs.length - 1}` : text;
}

function normalise(raw: RawJob): Job {
  return {
    id: String(raw.id ?? ''),
    title: raw.title || raw.name || 'Untitled role',
    location: formatLocation(raw.locations),
    employmentType: raw.employment_type || raw.job_type?.name || null,
    description: raw.about_position ?? null,
    /* Falls back to the hosted careers page. A listing with a slightly
       generic link is far better than a role that silently doesn't exist. */
    applyUrl: raw.apply_link ?? CAREERS_FALLBACK,
  };
}

export async function getOpenJobs(): Promise<Job[]> {
  const key = process.env.RECRUITERFLOW_API_KEY;

  // No key yet — render an empty board rather than failing the page.
  if (!key) return [];

  const url = new URL('/api/external/job/list', BASE);
  url.searchParams.set('only_open', '1');          // spec: 1 -> true, 0 -> false
  url.searchParams.set('include_description', 'true');
  url.searchParams.set('items_per_page', '100');   // a boutique firm won't exceed this
  url.searchParams.set('current_page', '1');

  try {
    const res = await fetch(url, {
      // Spec: "All requests must include the RF-Api-Key header."
      headers: { 'RF-Api-Key': key, Accept: 'application/json' },
      next: { revalidate: REVALIDATE },
    });

    if (!res.ok) {
      // Log the status only — never the key or the request URL.
      const body = await res.text().catch(() => '');
      console.error('[RF] responded', res.status, body.slice(0, 300));
      return [];
    }

    const json: unknown = await res.json();

    /* Diagnostic logging.

       The field names below were taken from the staging sample in
       Recruiterflow's OpenAPI spec, not from a real response on this
       account. If the shapes differ, jobs get silently filtered away and
       the page looks broken for no visible reason — which is exactly what
       happened. So: log the envelope and the first record's keys, once per
       fetch, to Render's logs.

       Never logs field VALUES, only names — a job record carries client and
       salary data that shouldn't sit in a log. Remove this block once the
       board is confirmed working. */
    const envelopeKeys = json && typeof json === 'object' && !Array.isArray(json)
      ? Object.keys(json as Record<string, unknown>)
      : '(array)';
    console.log('[RF] envelope:', JSON.stringify(envelopeKeys));

    const list: RawJob[] = Array.isArray(json)
      ? (json as RawJob[])
      : ((json as Record<string, unknown>)?.data as RawJob[]) ??
        ((json as Record<string, unknown>)?.jobs as RawJob[]) ??
        ((json as Record<string, unknown>)?.results as RawJob[]) ??
        [];

    console.log('[RF] records returned:', list.length);
    if (list[0]) {
      console.log('[RF] first record fields:', JSON.stringify(Object.keys(list[0])));
      console.log('[RF] gate values:', JSON.stringify({
        is_open: list[0].is_open,
        publish_to_careers_page: list[0].publish_to_careers_page,
        has_apply_link: Boolean(list[0].apply_link),
        has_title: Boolean(list[0].title || list[0].name),
      }));
    }

    /* Filters loosened deliberately.

       The previous version dropped any job where publish_to_careers_page
       was not explicitly true-ish, and any job without an apply_link. If
       either field is absent or named differently on this account, every
       job disappears. Now only an explicit `false` excludes a role, and a
       missing apply link falls back to the careers page rather than
       removing the listing entirely. */
    const mapped = list
      .filter((j) => j.is_open !== false)
      .map(normalise);

    console.log('[RF] after filtering:', mapped.length);
    return mapped;
  } catch (err) {
    console.error('Recruiterflow fetch failed', err instanceof Error ? err.name : 'unknown');
    return [];
  }
}

/** Distinct locations across the open roles, for the filter buttons. */
export function locationsOf(jobs: Job[]): string[] {
  return [...new Set(jobs.map((j) => j.location).filter(Boolean))].sort();
}
