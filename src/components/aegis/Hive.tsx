import { motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { BiometricProfileSummary, NodeSecurityStatus } from "@/lib/telemetry";

export interface HiveProfileNode {
  id: string;
  profileIndex: number;
  label: string;
  detail: string;
  status: NodeSecurityStatus;
  hasFace: boolean;
  hasDeviceBiometric: boolean;
  x?: number;
  y?: number;
}

/** Flat-top hexagon path for a given radius. */
function hexPoints(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 })
    .map((_, i) => {
      const a = (Math.PI / 180) * (60 * i - 30);
      return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
    })
    .join(" ");
}

const STATUS_COLOR: Record<NodeSecurityStatus, { stroke: string; glow: string; text: string }> = {
  ACTIVE: {
    stroke: "var(--gold)",
    glow: "rgba(201, 165, 78, 0.4)",
    text: "var(--gold)",
  },
  MONITORED: {
    stroke: "rgba(56, 189, 248, 0.9)", // Cyan
    glow: "rgba(56, 189, 248, 0.35)",
    text: "rgb(56, 189, 248)",
  },
  WARNING: {
    stroke: "var(--warning)",
    glow: "rgba(234, 179, 8, 0.4)",
    text: "var(--warning)",
  },
  BLOCKED: {
    stroke: "var(--danger)",
    glow: "rgba(239, 68, 68, 0.45)",
    text: "var(--danger)",
  },
  OFFLINE: {
    stroke: "var(--border)",
    glow: "rgba(100, 116, 139, 0.2)",
    text: "var(--muted-foreground)",
  },
};

export function Hive({
  className,
  compact = false,
  profiles = [],
  onSelect,
}: {
  className?: string;
  compact?: boolean;
  profiles?: BiometricProfileSummary[];
  onSelect?: (node: HiveProfileNode) => void;
}) {
  const [active, setActive] = useState<string | null>(null);

  const cx = 260;
  const cy = 230;
  const ring = compact ? 130 : 155;
  const r = compact ? 48 : 54;

  const count = profiles.length;
  const isEmpty = count === 0;

  // Compute organic hexagonal ring node positions based on real profile count
  const positions: HiveProfileNode[] = profiles.map((p, i) => {
    // Distribute evenly along the circumference
    const angleStep = (2 * Math.PI) / count;
    const a = i * angleStep - Math.PI / 2;
    const x = cx + ring * Math.cos(a);
    const y = cy + ring * Math.sin(a);

    const methods: string[] = [];
    if (p.hasFaceEnrolled) methods.push("Face");
    if (p.hasDeviceBiometric) methods.push("Biometric");

    return {
      id: p.id,
      profileIndex: p.profileIndex,
      label: p.displayName || `BIO ${p.profileIndex}`,
      detail: `Profile #${p.profileIndex} • ${methods.join(" + ") || "Enrolled"}`,
      status: p.status,
      hasFace: p.hasFaceEnrolled,
      hasDeviceBiometric: p.hasDeviceBiometric,
      x,
      y,
    };
  });

  return (
    <div className={cn("relative w-full", className)}>
      <svg viewBox="0 0 520 460" className="w-full">
        <defs>
          <radialGradient id="hive-core" cx="50%" cy="45%">
            <stop offset="0%" stopColor="var(--gold-soft)" stopOpacity="0.85" />
            <stop offset="60%" stopColor="var(--gold)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.05" />
          </radialGradient>
          
          <linearGradient id="cyan-telemetry-edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.6" />
            <stop offset="50%" stopColor="rgba(56, 189, 248, 0.9)" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.2" />
          </linearGradient>

          <filter id="node-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Orbitals & Telemetry Grid */}
        <circle
          cx={cx}
          cy={cy}
          r={ring + 48}
          fill="none"
          stroke="var(--border)"
          strokeDasharray="2 8"
          strokeOpacity="0.6"
        />
        <circle
          cx={cx}
          cy={cy}
          r={ring + 12}
          fill="none"
          stroke="var(--border)"
          strokeOpacity="0.4"
        />

        {/* Active Connections (Only drawn when real profiles exist) */}
        {!isEmpty &&
          positions.map((p, i) => {
            const isHighlighted = active === p.id;
            return (
              <line
                key={`line-${p.id}`}
                x1={cx}
                y1={cy}
                x2={p.x}
                y2={p.y}
                stroke={isHighlighted ? "url(#cyan-telemetry-edge)" : "var(--border)"}
                strokeWidth={isHighlighted ? 2 : 1}
                strokeDasharray={isHighlighted ? "none" : "3 6"}
                strokeOpacity={isHighlighted ? 1 : 0.4}
                style={{
                  animation: `aegis-dash ${14 + i * 2}s linear infinite`,
                  transition: "stroke 0.4s, stroke-width 0.4s",
                }}
              />
            );
          })}

        {/* Central AEGIS Security Core */}
        <g className="animate-breathe" style={{ transformOrigin: `${cx}px ${cy}px` }}>
          <polygon
            points={hexPoints(cx, cy, r + 18)}
            fill="url(#hive-core)"
            stroke="var(--gold)"
            strokeWidth="1.4"
          />
          <polygon
            points={hexPoints(cx, cy, r - 2)}
            fill="none"
            stroke="var(--gold)"
            strokeOpacity="0.4"
            strokeDasharray="4 4"
          />
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            className="fill-foreground font-semibold"
            fontSize="15"
            fontFamily="var(--font-display)"
            letterSpacing="2"
          >
            AEGIS
          </text>
          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize="8"
            letterSpacing="2.5"
          >
            SECURITY CORE
          </text>
          
          {/* Subtle pulse indicator on core */}
          <circle
            cx={cx}
            cy={cy + 26}
            r="2"
            fill="var(--success)"
            className="animate-pulse"
          />
        </g>

        {/* Real Profile Hexagonal Nodes */}
        {!isEmpty &&
          positions.map((p) => {
            const isActive = active === p.id;
            const colors = STATUS_COLOR[p.status] || STATUS_COLOR.ACTIVE;

            return (
              <motion.g
                key={p.id}
                onMouseEnter={() => setActive(p.id)}
                onMouseLeave={() => setActive(null)}
                onClick={() => onSelect?.(p)}
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  transformOrigin: `${p.x}px ${p.y}px`,
                  cursor: onSelect ? "pointer" : "default",
                }}
              >
                <polygon
                  points={hexPoints(p.x!, p.y!, r)}
                  fill="var(--card)"
                  fillOpacity={isActive ? 0.98 : 0.8}
                  stroke={isActive ? colors.stroke : "var(--border)"}
                  strokeWidth={isActive ? 1.8 : 1}
                  filter={isActive ? "url(#node-glow)" : undefined}
                />
                
                {/* Profile Badge / Index */}
                <text
                  x={p.x}
                  y={p.y! - 8}
                  textAnchor="middle"
                  className="fill-foreground font-medium"
                  fontSize="11"
                  fontFamily="var(--font-display)"
                >
                  {p.label}
                </text>

                {/* Methods Pill */}
                <text
                  x={p.x}
                  y={p.y! + 7}
                  textAnchor="middle"
                  fontSize="7.5"
                  className="fill-muted-foreground"
                >
                  BIO #{p.profileIndex}
                </text>

                {/* Node Status Indicator */}
                <circle
                  cx={p.x! - 24}
                  cy={p.y! + 22}
                  r="2"
                  fill={colors.text}
                />
                <text
                  x={p.x! - 18}
                  y={p.y! + 24}
                  fontSize="7"
                  letterSpacing="1"
                  fill={colors.text}
                  textAnchor="start"
                >
                  {p.status}
                </text>
              </motion.g>
            );
          })}
      </svg>

      {/* Dynamic Status / Empty State Overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-1 flex justify-center">
        {isEmpty ? (
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card/85 px-6 py-3 text-center shadow-lg backdrop-blur-md">
            <p className="text-xs font-medium tracking-wide text-foreground">
              NO ACTIVE BIOMETRIC NODES
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Awaiting enrolled devices &amp; biometric telemetry...
            </p>
          </div>
        ) : (
          <motion.p
            key={active ?? "idle"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur"
          >
            {active
              ? positions.find((n) => n.id === active)?.detail
              : "Hover or select any node to inspect biometric telemetry"}
          </motion.p>
        )}
      </div>
    </div>
  );
}