import { SEGMENTS } from '@/lib/content';

export default function SegmentRail() {
  return (
    <>
      <div className="hrail">
        {SEGMENTS.map((s) => (
          <div key={s.title} className="hcard">
            <h4>{s.title}</h4>
            <p>{s.blurb}</p>
            <ul>{s.roles.map((r) => <li key={r}>{r}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="shell">
        <div className="mt-4 text-[.7rem] uppercase tracking-[.16em] text-[#4A5661]">
          &larr; Drag to explore
        </div>
      </div>
    </>
  );
}
