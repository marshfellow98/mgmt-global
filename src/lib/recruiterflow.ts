/* ============================================================================
   Recruiterflow.

   Shane manages open roles in Recruiterflow; the site follows. Nothing is
   maintained twice.

   Two rules that matter:

   1. Apply links MUST use the application form URL the API returns. Never
      construct one, never build a custom form. Doing either breaks source
      attribution and Shane's screening questions, and applications end up
      somewhere he'd have to re-enter by hand.

   2. Rate limits aren't published. Fetch server-side, cache, and filter the
      cached set client-side. A boutique firm has 10–30 open roles, so pulling
      all of them and filtering in the browser is both faster for the visitor
      and gentler on the API than a request per filter change.

   The key is requested from Recruiterflow support — it isn't self-serve.
   ============================================================================ */

const BASE = 'https://recruiterflow.com/api/external';
const REVALIDATE = 900; // 15 minutes

export type Job = {
  id: string;
  title: string;
  location: string;
  employmentType: string | null;
  workplace: string | null;
  description: string | null;
  /** From the API. Never build this yourself. */
  applyUrl: string | null;
};

type RawJob = Record<string, unknown>;

function str(o: RawJob, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (v && typeof v === 'object' && 'name' in (v as RawJob)) {
      const n = (v as RawJob).name;
      if (typeof n === 'string' && n.trim()) return n.trim();
    }
  }
  return null;
}

function normalise(raw: RawJob): Job {
  return {
    id: String(raw.id ?? raw.job_id ?? crypto.randomUUID()),
    title: str(raw, 'title', 'name', 'job_title') ?? 'Untitled role',
    location: str(raw, 'location', 'city', 'job_location') ?? '',
    employmentType: str(raw, 'employment_type', 'job_type', 'type'),
    workplace: str(raw, 'workplace_type', 'work_type', 'remote_type'),
    description: str(raw, 'description', 'job_description'),
    applyUrl: str(raw, 'application_form_url', 'apply_url', 'job_url', 'url'),
  };
}

export async function getOpenJobs(): Promise<Job[]> {
  const key = process.env.RECRUITERFLOW_API_KEY;

  // No key yet — render the page with an empty board rather than failing.
  if (!key) return [];

  try {
    const res = await fetch(`${BASE}/job/list?status=open`, {
      headers: { 'X-API-KEY': key, Accept: 'application/json' },
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) {
      console.error('Recruiterflow responded', res.status);
      return [];
    }
    const json = (await res.json()) as unknown;
    const list = Array.isArray(json)
      ? json
      : ((json as Record<string, unknown>)?.data as RawJob[]) ??
        ((json as Record<string, unknown>)?.jobs as RawJob[]) ??
        [];
    return (list as RawJob[]).map(normalise);
  } catch (err) {
    console.error('Recruiterflow fetch failed', err);
    return [];
  }
}

/** Distinct locations across the open roles, for the filter buttons. */
export function locationsOf(jobs: Job[]): string[] {
  return [...new Set(jobs.map((j) => j.location).filter(Boolean))].sort();
}
