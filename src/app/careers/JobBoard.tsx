'use client';

import { useMemo, useState } from 'react';
import type { Job } from '@/lib/recruiterflow';

/* Filtering happens here, over the already-fetched set. The firm has tens of
   roles, not thousands, so this is instant for the visitor and costs the API
   nothing. */
export default function JobBoard({ jobs, locations }: { jobs: Job[]; locations: string[] }) {
  const [filter, setFilter] = useState<string | null>(null);

  const shown = useMemo(
    () => (filter ? jobs.filter((j) => j.location === filter) : jobs),
    [jobs, filter]
  );

  if (!jobs.length) {
    return (
      <p className="italic text-[#5D6874]">
        Open roles appear here once the Recruiterflow API key is connected.
      </p>
    );
  }

  return (
    <>
      <div className="mb-9 flex flex-wrap gap-2">
        <FilterButton on={filter === null} onClick={() => setFilter(null)}>All locations</FilterButton>
        {locations.map((loc) => (
          <FilterButton key={loc} on={filter === loc} onClick={() => setFilter(loc)}>
            {loc}
          </FilterButton>
        ))}
      </div>

      <div className="rows">
        {shown.map((job) => (
          <a
            key={job.id}
            className="hrow"
            /* Always the URL the API returned — never a constructed one.
               A custom form would break source attribution and screening. */
            href={job.applyUrl ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h4>{job.title}</h4>
            <div className="meta">
              {[job.location, job.employmentType].filter(Boolean).join(' · ')}
            </div>
          </a>
        ))}
      </div>

      {!shown.length && (
        <p className="mt-8 italic text-[#5D6874]">No open roles in that location right now.</p>
      )}
    </>
  );
}

function FilterButton({
  on, onClick, children,
}: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-[1.05rem] py-2.5 text-[.72rem] font-semibold uppercase tracking-[.14em] transition-colors ${
        on ? 'border-gold bg-gold text-ink' : 'border-rule text-[#9AA4AF] hover:border-gold hover:text-gold'
      }`}
    >
      {children}
    </button>
  );
}
