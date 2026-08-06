import { useMemo } from "react";
import { cn } from "@/lib/utils";

/** Procedural biometric face mesh — deterministic point cloud, no assets. */
export function FaceMesh({ className, points = 320 }: { className?: string; points?: number }) {
  const dots = useMemo(() => {
    const out: { x: number; y: number; r: number; o: number }[] = [];
    let seed = 7;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    for (let i = 0; i < points; i++) {
      const t = i / points;
      const a = t * Math.PI * 2;
      // Ovoid face silhouette with jitter, denser toward centre features.
      const layer = rand();
      const rx = 74 * (0.35 + layer * 0.65);
      const ry = 98 * (0.35 + layer * 0.65);
      out.push({
        x: 100 + Math.cos(a) * rx * (0.9 + rand() * 0.2),
        y: 120 + Math.sin(a) * ry * (0.9 + rand() * 0.2),
        r: 0.5 + rand() * 1.1,
        o: 0.25 + rand() * 0.7,
      });
    }
    return out;
  }, [points]);

  return (
    <svg viewBox="0 0 200 240" className={cn("h-full w-full", className)} aria-hidden>
      <defs>
        <radialGradient id="mesh-glow" cx="50%" cy="45%">
          <stop offset="0%" stopColor="var(--gold-soft)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="120" rx="86" ry="110" fill="url(#mesh-glow)" />
      <g>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="var(--gold)" opacity={d.o} />
        ))}
      </g>
      {/* connective tissue */}
      {dots.slice(0, 90).map((d, i) => {
        const n = dots[(i * 7) % dots.length];
        if (!n) return null;
        return (
          <line
            key={`c-${i}`}
            x1={d.x}
            y1={d.y}
            x2={n.x}
            y2={n.y}
            stroke="var(--gold)"
            strokeWidth="0.25"
            opacity="0.18"
          />
        );
      })}
      <ellipse cx="100" cy="120" rx="84" ry="108" fill="none" stroke="var(--gold)" strokeOpacity="0.35" strokeDasharray="3 7" />
    </svg>
  );
}