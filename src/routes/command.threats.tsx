import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { PageHeader } from "@/components/aegis/PageHeader";
import { Reveal } from "@/components/aegis/Reveal";
import { fetchSecurityAlerts } from "@/lib/telemetry-service";
import type { SecurityAlert, SecurityAlertSeverity } from "@/lib/telemetry";
import { ShieldCheck, ShieldAlert, CheckCircle2 } from "lucide-react";
import globe from "@/assets/threat-globe.jpg";

export const Route = createFileRoute("/command/threats")({
  component: ThreatResponse,
});

const SEVERITY: Record<SecurityAlertSeverity, string> = {
  CRITICAL: "var(--danger)",
  HIGH: "var(--danger)",
  MEDIUM: "var(--warning)",
  LOW: "var(--success)",
};

function ThreatResponse() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSecurityAlerts(30);
        setAlerts(data);
      } catch (e) {
        console.error("Failed to load security alerts:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <PageHeader
        index="04 — Threat Response"
        title="Incident Triage & Security Alerts"
        subtitle="Real-time detection of spoof attempts, multiple failures, and active defense responses."
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <Reveal>
          <div className="surface-card overflow-hidden rounded-3xl">
            <div className="flex items-center justify-between px-6 py-5">
              <p className="eyebrow">Security Incident Feed</p>
              <span className="text-[11px] text-muted-foreground">Real-time Telemetry</span>
            </div>

            {alerts.length > 0 ? (
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
                  {alerts.map((inc, i) => (
                    <motion.tr
                      key={inc.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: i * 0.04 }}
                      className="border-b border-border/60 transition-colors duration-500 last:border-0 hover:bg-accent/40"
                    >
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2">
                          <span
                            className="size-1.5 rounded-full"
                            style={{ background: SEVERITY[inc.severity] || "var(--danger)" }}
                          />
                          {inc.severity}
                        </span>
                      </td>
                      <td className="px-3 py-4 font-mono text-xs">{inc.alertType}</td>
                      <td className="hidden px-3 py-4 text-muted-foreground md:table-cell">
                        {inc.details}
                      </td>
                      <td className="px-3 py-4 text-muted-foreground font-mono text-xs">
                        {new Date(inc.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className="rounded-full border px-2.5 py-1 text-[11px]"
                          style={{
                            color: SEVERITY[inc.severity] || "var(--danger)",
                            borderColor: `color-mix(in oklab, ${
                              SEVERITY[inc.severity] || "var(--danger)"
                            } 45%, transparent)`,
                          }}
                        >
                          {inc.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 className="size-12 text-muted-foreground/30" />
                <p className="mt-4 font-display text-lg">NO ACTIVE THREATS</p>
                <p className="mt-1.5 max-w-sm text-xs text-muted-foreground leading-relaxed">
                  No passive liveness failures, spoof injections, or lockout anomalies have been
                  reported by active devices.
                </p>
              </div>
            )}
          </div>
        </Reveal>

        <Reveal delay={1}>
          <div className="surface-card relative overflow-hidden rounded-3xl p-6">
            <p className="eyebrow">Endpoint Threat Map</p>
            <div className="relative mt-5 overflow-hidden rounded-2xl">
              <img
                src={globe}
                alt="Global Threat Overview"
                width={1200}
                height={912}
                loading="lazy"
                className="w-full opacity-60"
              />
            </div>
            <div className="mt-5 rounded-2xl border border-dashed border-border p-4 text-center">
              <p className="text-xs font-medium text-foreground">
                {alerts.length > 0
                  ? `${alerts.length} Incident${alerts.length > 1 ? "s" : ""} Under Observation`
                  : "All Protected Devices Secure"}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Threat intelligence updates synchronously with on-device risk evaluations.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}