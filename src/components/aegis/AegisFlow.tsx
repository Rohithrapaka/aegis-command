import { cn } from "@/lib/utils";

/**
 * The AEGIS FLOW ribbon — a layered neural ribbon that recurs across sections
 * to carry the brand's visual identity. Pure SVG, GPU-friendly.
 */
export function AegisFlow({
  className,
  strands = 7,
  opacity = 0.55,
  flip = false,
}: {
  className?: string;
  strands?: number;
  opacity?: number;
  flip?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0 overflow-hidden", className)}
      style={{ transform: flip ? "scaleY(-1)" : undefined }}
    >
      <svg
        viewBox="0 0 1440 280"
        preserveAspectRatio="none"
        className="h-full w-full"
        style={{ opacity }}
      >
        <defs>
          <linearGradient id="flow-gold" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0" />
            <stop offset="28%" stopColor="var(--gold)" stopOpacity="0.75" />
            <stop offset="62%" stopColor="var(--gold-soft)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: strands }).map((_, i) => {
          const o = (i - strands / 2) * 9;
          return (
            <path
              key={i}
              d={`M-40 ${168 + o} C 240 ${60 + o * 1.5}, 420 ${250 + o}, 720 ${140 + o} S 1180 ${40 + o * 1.4}, 1480 ${150 + o}`}
              fill="none"
              stroke="url(#flow-gold)"
              strokeWidth={i === Math.floor(strands / 2) ? 1.6 : 0.7}
              strokeDasharray="1600 400"
              style={{
                animation: `aegis-dash ${26 + i * 3.5}s linear infinite`,
                opacity: 0.35 + (1 - Math.abs(i - strands / 2) / strands) * 0.65,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}