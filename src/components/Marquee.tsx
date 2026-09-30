import { CLIENTS } from '@/lib/content';

/* Doubled so the -50% keyframe loops seamlessly. */
export default function Marquee() {
  return (
    <div className="marq">
      {/* The logos were an unexplained row of names. One line of framing
          turns them into a statement about reach. */}
      <div className="shell mb-5">
        <p className="m-0 text-center text-[.66rem] font-semibold uppercase tracking-[.22em] text-[#5A6B82]">
          Trusted by organizations across the insurance ecosystem
        </p>
      </div>
      <div className="marq-track">
        {[...CLIENTS, ...CLIENTS].map((name, i) => (
          <span key={`${name}-${i}`}>{name}</span>
        ))}
      </div>
    </div>
  );
}
