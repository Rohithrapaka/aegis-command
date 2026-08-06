import { motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type HiveNode = {
  id: string;
  label: string;
  detail: string;
  status: string;
};

export const HIVE_NODES: HiveNode[] = [
  { id: "face", label: "Face Recognition", detail: "Vector match across 512-d embeddings", status: "Active" },
  { id: "liveness", label: "Passive Liveness", detail: "Micro-movement & texture analysis", status: "Active" },
  { id: "risk", label: "Risk Engine", detail: "Device, behaviour & context signals", status: "Active" },
  { id: "biohash", label: "BioHash Engine", detail: "Irreversible template binding", status: "Active" },
  { id: "behavior", label: "Behaviour Analysis", detail: "Session cadence & intent modelling", status: "Active" },
  { id: "apps", label: "Protected Apps", detail: "12 applications under policy", status: "12 Apps" },
];

/** Flat-top hexagon path for a given radius. */
function hexPoints(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 })
    .map((_, i) => {
      const a = (Math.PI / 180) * (60 * i - 30);
      return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
    })
    .join(" ");
}

export function Hive({
  className,
  compact = false,
  onSelect,
}: {
  className?: string;
  compact?: boolean;
  onSelect?: (node: HiveNode) => void;
}) {
  const [active, setActive] = useState<string | null>(null);
  const cx = 260;
  const cy = 230;
  const ring = compact ? 128 : 150;
  const r = compact ? 52 : 58;

  const positions = HIVE_NODES.map((n, i) => {
    const a = (Math.PI / 180) * (60 * i - 90);
    return { ...n, x: cx + ring * Math.cos(a), y: cy + ring * Math.sin(a) };
  });

  return (
    <div className={cn("relative w-full", className)}>
      <svg viewBox="0 0 520 460" className="w-full">
        <defs>
          <radialGradient id="hive-core" cx="50%" cy="40%">
            <stop offset="0%" stopColor="var(--gold-soft)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.15" />
          </radialGradient>
          <linearGradient id="hive-edge" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="var(--gold)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        <circle cx={cx} cy={cy} r={ring + 46} fill="none" stroke="var(--border)" strokeDasharray="2 8" />
        <circle cx={cx} cy={cy} r={ring + 12} fill="none" stroke="var(--border)" />

        {positions.map((p, i) => (
          <line
            key={`l-${p.id}`}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="url(#hive-edge)"
            strokeWidth={active === p.id ? 1.8 : 0.9}
            strokeDasharray="4 6"
            style={{ animation: `aegis-dash ${18 + i * 2}s linear infinite` }}
          />
        ))}

        <g className="animate-breathe" style={{ transformOrigin: `${cx}px ${cy}px` }}>
          <polygon points={hexPoints(cx, cy, r + 14)} fill="url(#hive-core)" stroke="var(--gold)" strokeWidth="1.2" />
          <polygon points={hexPoints(cx, cy, r - 4)} fill="none" stroke="var(--gold)" strokeOpacity="0.45" />
          <text x={cx} y={cy - 2} textAnchor="middle" className="fill-foreground" fontSize="15" fontFamily="var(--font-display)">
            AEGIS
          </text>
          <text x={cx} y={cy + 18} textAnchor="middle" className="fill-muted-foreground" fontSize="8.5" letterSpacing="2">
            HIVE MIND
          </text>
        </g>

        {positions.map((p) => {
          const isActive = active === p.id;
          return (
            <motion.g
              key={p.id}
              onMouseEnter={() => setActive(p.id)}
              onMouseLeave={() => setActive(null)}
              onClick={() => onSelect?.(p)}
              animate={{ scale: isActive ? 1.09 : 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: `${p.x}px ${p.y}px`, cursor: onSelect ? "pointer" : "default" }}
            >
              <polygon
                points={hexPoints(p.x, p.y, r)}
                fill="var(--card)"
                fillOpacity={isActive ? 0.98 : 0.75}
                stroke={isActive ? "var(--gold)" : "var(--border)"}
                strokeWidth={isActive ? 1.5 : 1}
              />
              <text
                x={p.x}
                y={p.y - 4}
                textAnchor="middle"
                className="fill-foreground"
                fontSize="9"
                fontWeight="500"
              >
                {p.label.split(" ").map((word, wi, arr) => (
                  <tspan key={word} x={p.x} dy={wi === 0 ? (arr.length > 1 ? -4 : 2) : 11}>
                    {word}
                  </tspan>
                ))}
              </text>
              <text x={p.x} y={p.y + 26} textAnchor="middle" fontSize="7.5" className="fill-muted-foreground" letterSpacing="1">
                {p.status.toUpperCase()}
              </text>
            </motion.g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
        <motion.p
          key={active ?? "idle"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur"
        >
          {active ? HIVE_NODES.find((n) => n.id === active)?.detail : "Hover any node to inspect the intelligence"}
        </motion.p>
      </div>
    </div>
  );
}