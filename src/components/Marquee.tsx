import { CLIENTS } from '@/lib/content';

/* Doubled so the -50% keyframe loops seamlessly. */
export default function Marquee() {
  return (
    <div className="marq">
      <div className="marq-track">
        {[...CLIENTS, ...CLIENTS].map((name, i) => (
          <span key={`${name}-${i}`}>{name}</span>
        ))}
      </div>
    </div>
  );
}
