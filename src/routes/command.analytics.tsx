import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { PageHeader } from "@/components/aegis/PageHeader";
import { Reveal } from "@/components/aegis/Reveal";
import { fetchDashboardKPIs, fetchAuthTimeline } from "@/lib/telemetry-service";
import type { DashboardKPIs, AuthenticationEvent } from "@/lib/telemetry";
import { BarChart3 } from "lucide-react";

export const Route = createFileRoute("/command/analytics")({
  component: Analytics,
});

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
};
const axis = { fontSize: 10, fill: "var(--muted-foreground)" };

function Panel({
  title,
  note,
  children,
  className,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`surface-card rounded-3xl p-6 ${className ?? ""}`}>
      <div className="flex items-baseline justify-between">
        <p className="eyebrow">{title}</p>
        {note ? <span className="text-[11px] text-muted-foreground">{note}</span> : null}
      </div>
      {children}
    </div>
  );
}

function Analytics() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [events, setEvents] = useState<AuthenticationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [kpiData, eventData] = await Promise.all([
          fetchDashboardKPIs(),
          fetchAuthTimeline(50),
        ]);
        setKpis(kpiData);
        setEvents(eventData);
      } catch (e) {
        console.error("Failed to load analytics data:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const hasData = kpis?.hasRealData && events.length > 0;

  // Derive real method distribution if data exists
  const faceAuths = events.filter((e) => e.authMethod === "FACE").length;
  const sysBioAuths = events.filter((e) => e.authMethod === "SYSTEM_BIOMETRIC").length;
  const patternAuths = events.filter((e) => e.authMethod === "PATTERN_RECOVERY").length;
  const total = events.length || 1;

  const methodData = hasData
    ? [
        { name: "Face Auth", value: Math.round((faceAuths / total) * 100) },
        { name: "Device Biometric", value: Math.round((sysBioAuths / total) * 100) },
        { name: "Pattern Fallback", value: Math.round((patternAuths / total) * 100) },
      ].filter((m) => m.value > 0)
    : [];

  return (
    <div>
      <PageHeader
        index="03 — Analytics"
        title="Continuous Telemetry & Decision Metrics"
        subtitle="Authentication volume, decision latency, risk scores, and method distributions measured in real-time."
      />

      {hasData ? (
        <>
          <div className="grid gap-4 xl:grid-cols-3">
            <Reveal>
              <Panel title="Authentications (24h)" note="Volume">
                <p className="mt-3 font-display text-[2.4rem] leading-none">
                  {kpis.grantedAuths24h + kpis.blockedAuths24h}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {kpis.grantedAuths24h} Granted • {kpis.blockedAuths24h} Blocked
                </p>
              </Panel>
            </Reveal>

            <Reveal delay={1}>
              <Panel title="System Success Rate" note="24 hours">
                <p className="mt-3 font-display text-[2.4rem] leading-none">
                  {kpis.systemIntegrityPercent !== null ? `${kpis.systemIntegrityPercent}%` : "—"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Based on verified event stream</p>
              </Panel>
            </Reveal>

            <Reveal delay={2}>
              <Panel title="Risk Score (Avg)" note="Today">
                <p className="mt-3 font-display text-[2.4rem] leading-none">
                  {kpis.avgRiskScore24h !== null ? kpis.avgRiskScore24h : "—"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Passive risk assessment</p>
              </Panel>
            </Reveal>
          </div>

          {methodData.length > 0 && (
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <Reveal>
                <Panel title="Authentication Method Distribution" note="Telemetry Ledger">
                  <div className="mt-4 flex items-center gap-6">
                    <div className="h-40 w-40 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={methodData} dataKey="value" innerRadius={42} outerRadius={62} stroke="none" paddingAngle={4}>
                            {methodData.map((_, i) => (
                              <Cell key={i} fill={`var(--chart-${i + 1})`} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <ul className="flex-1 space-y-3 text-[13px]">
                      {methodData.map((m, i) => (
                        <li key={m.name} className="flex items-center justify-between">
                          <span className="flex items-center gap-2.5">
                            <span className="size-2 rounded-full" style={{ background: `var(--chart-${i + 1})` }} />
                            {m.name}
                          </span>
                          <span className="font-mono text-muted-foreground">{m.value}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Panel>
              </Reveal>
            </div>
          )}
        </>
      ) : (
        <div className="surface-card rounded-3xl p-16 text-center">
          <BarChart3 className="mx-auto size-12 text-muted-foreground/30" />
          <p className="mt-4 font-display text-xl">NO ANALYTICS DATA</p>
          <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground leading-relaxed">
            Analytics, success trends, and method breakdowns require active authentication event
            streams from enrolled AEGISAUTH devices.
          </p>
        </div>
      )}
    </div>
  );
}