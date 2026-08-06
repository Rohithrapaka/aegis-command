import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { PageHeader } from "@/components/aegis/PageHeader";
import { Reveal } from "@/components/aegis/Reveal";
import { INCIDENTS } from "@/lib/aegis-data";
import globe from "@/assets/threat-globe.jpg";

export const Route = createFileRoute("/command/threats")({
  component: ThreatResponse,
});

const SEVERITY: Record<string, string> = {
  High: "var(--danger)",
  Medium: "var(--warning)",
  Low: "var(--success)",
};

const ORIGINS = [
  { x: 30, y: 42 },
  { x: 52, y: 30 },
  { x: 63, y: 55 },
  { x: 44, y: 66 },
  { x: 71, y: 38 },
];

function ThreatResponse() {
  return (
    <div>
      <PageHeader
        index="04 — Threat Response"
        title="Every threat. Every detail."
        subtitle="Live origins, severity triage and the disposition of each incident across the protected estate."
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <Reveal>
          <div className="surface-card overflow-hidden rounded-3xl">
            <div className="flex items-center justify-between px-6 py-5">
              <p className="eyebrow">Incident feed</p>
              <span className="text-[11px] text-muted-foreground">Last 24 hours</span>
            </div>
            <table className="w-full text-left text-[13px]">
              <thead className="border-y border-border text-[10px] tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">SEVERITY</th>
                  <th className="px-3 py-3 font-medium">TYPE</th>
                  <th className="hidden px-3 py-3 font-medium md:table-cell">DETAILS</th>
                  <th className="px-3 py-3 font-medium">TIME</th>
                  <th className="px-6 py-3 text-right font-medium">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {INCIDENTS.map((inc, i) => (
                  <motion.tr
                    key={inc.type + inc.time}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: i * 0.06 }}
                    className="border-b border-border/60 transition-colors duration-500 last:border-0 hover:bg-accent/40"
                  >
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full" style={{ background: SEVERITY[inc.severity] }} />
                        {inc.severity}
                      </span>
                    </td>
                    <td className="px-3 py-4">{inc.type}</td>
                    <td className="hidden px-3 py-4 text-muted-foreground md:table-cell">{inc.detail}</td>
                    <td className="px-3 py-4 text-muted-foreground">{inc.time}</td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className="rounded-full border px-2.5 py-1 text-[11px]"
                        style={{
                          color: SEVERITY[inc.severity],
                          borderColor: `color-mix(in oklab, ${SEVERITY[inc.severity]} 45%, transparent)`,
                        }}
                      >
                        {inc.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <div className="surface-card relative overflow-hidden rounded-3xl p-6">
            <p className="eyebrow">Threat origins</p>
            <div className="relative mt-5 overflow-hidden rounded-2xl">
              <img
                src={globe}
                alt="Globe showing global threat origin activity"
                width={1200}
                height={912}
                loading="lazy"
                className="w-full"
              />
              {ORIGINS.map((o, i) => (
                <span key={i} className="absolute" style={{ left: `${o.x}%`, top: `${o.y}%` }}>
                  <span
                    className="block size-1.5 rounded-full"
                    style={{
                      background: "var(--danger)",
                      boxShadow: "0 0 0 5px color-mix(in oklab, var(--danger) 20%, transparent)",
                      animation: `aegis-breathe ${4 + i * 0.7}s ease-in-out infinite`,
                    }}
                  />
                </span>
              ))}
            </div>
            <ul className="mt-5 space-y-3 text-[12px]">
              {INCIDENTS.slice(0, 4).map((inc) => (
                <li key={inc.origin} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="size-1.5 rounded-full" style={{ background: SEVERITY[inc.severity] }} />
                    {inc.origin}
                  </span>
                  <span className="font-mono">{inc.type}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </div>
  );
}