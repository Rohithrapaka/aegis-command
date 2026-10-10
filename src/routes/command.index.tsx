import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Activity, ShieldCheck, Boxes, Radar, ArrowUpRight, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import { PageHeader } from "@/components/aegis/PageHeader";
import { TiltCard } from "@/components/aegis/TiltCard";
import { Reveal } from "@/components/aegis/Reveal";
import { fetchDashboardKPIs, fetchAuthTimeline, fetchSecurityAlerts } from "@/lib/telemetry-service";
import type { DashboardKPIs, AuthenticationEvent, SecurityAlert } from "@/lib/telemetry";

export const Route = createFileRoute("/command/")({
  component: MissionOverview,
});

function MissionOverview() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [recentEvents, setRecentEvents] = useState<AuthenticationEvent[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [kpiData, eventData, alertData] = await Promise.all([
          fetchDashboardKPIs(),
          fetchAuthTimeline(5),
          fetchSecurityAlerts(5),
        ]);
        setKpis(kpiData);
        setRecentEvents(eventData);
        setAlerts(alertData);
      } catch (e) {
        console.error("Failed to load dashboard metrics:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const hasData = kpis?.hasRealData ?? false;

  const kpiItems = [
    {
      icon: ShieldCheck,
      label: "System Integrity",
      value: hasData && kpis && kpis.systemIntegrityPercent !== null ? `${kpis.systemIntegrityPercent}%` : "—",
      note: hasData ? "Calculated from real events" : "No telemetry received",
    },
    {
      icon: Activity,
      label: "Authentications (24h)",
      value: hasData ? String(kpis?.grantedAuths24h ?? 0) : "—",
      note: hasData ? `${kpis?.blockedAuths24h ?? 0} blocked attempts` : "Awaiting authentications",
    },
    {
      icon: Boxes,
      label: "Protected Apps",
      value: hasData ? String(kpis?.protectedAppsCount ?? 0) : "—",
      note: hasData ? "Enforced by local policy" : "Zero apps registered",
    },
    {
      icon: Radar,
      label: "Threats Prevented",
      value: hasData ? String(kpis?.threatsPrevented24h ?? 0) : "—",
      note: hasData ? "Active incident response" : "No threat telemetry",
    },
  ];

  return (
    <div>
      <PageHeader
        index="01 — Mission Overview"
        title="Everything, at a glance."
        subtitle="Real-time telemetry across biometric profiles, applications and authentication decisions."
      />

      {/* KPI CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((k, i) => (
          <Reveal key={k.label} delay={i}>
            <TiltCard className="p-5">
              <div className="flex items-start justify-between">
                <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-background/40 text-gold">
                  <k.icon className="size-4" strokeWidth={1.5} />
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground/50" />
              </div>
              <p className="mt-6 eyebrow">{k.label}</p>
              <p className="mt-2 font-display text-[2.1rem] leading-none">
                {k.value}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground">{k.note}</p>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* RECENT AUTHENTICATION ACTIVITY */}
        <Reveal delay={1}>
          <div className="surface-card rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Authentications</p>
                <p className="mt-1 font-display text-2xl">Recent Decision Ledger</p>
              </div>
              <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className={`size-1.5 rounded-full ${hasData ? "bg-[var(--success)] animate-pulse" : "bg-muted-foreground"}`} />
                {hasData ? "Real-time" : "Awaiting Data"}
              </span>
            </div>

            {recentEvents.length > 0 ? (
              <ul className="mt-6 divide-y divide-border">
                {recentEvents.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-4 py-3.5 text-sm">
                    <span className="flex items-center gap-3">
                      <span
                        className="size-1.5 rounded-full"
                        style={{ background: t.eventType === "AUTH_SUCCESS" ? "var(--success)" : "var(--danger)" }}
                      />
                      <span className="font-medium">{t.appLabel || t.packageName || "App Unlock"}</span>
                      <span className="text-xs text-muted-foreground font-mono">[{t.authMethod}]</span>
                    </span>
                    <span className="flex items-center gap-4 text-[12px] text-muted-foreground">
                      {t.failureReason && (
                        <span className="text-danger text-[11px]">{t.failureReason}</span>
                      )}
                      {t.latencyMs && <span>{t.latencyMs}ms</span>}
                      <span className="font-mono text-[11px]">
                        {new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-8 flex flex-col items-center justify-center py-12 text-center">
                <Clock className="size-10 text-muted-foreground/40" />
                <p className="mt-3 text-sm font-medium text-foreground">NO RECENT AUTHENTICATIONS</p>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  Authentication events recorded on enrolled physical devices will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </Reveal>

        {/* THREAT & INCIDENT SUMMARY */}
        <Reveal delay={2}>
          <div className="surface-card rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Threat Posture</p>
                <p className="mt-2 font-display text-3xl">
                  {hasData && (kpis?.threatsPrevented24h ?? 0) > 0 ? "Alerts Detected" : "Nominal"}
                </p>
              </div>
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {hasData
                ? `${kpis?.threatsPrevented24h ?? 0} security incidents logged in the past 24 hours.`
                : "No telemetry incidents detected across protected endpoints."}
            </p>

            {alerts.length > 0 ? (
              <div className="mt-5 space-y-2.5">
                {alerts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-3 text-xs">
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-[var(--danger)]" />
                      <span className="font-mono">{a.alertType}</span>
                    </span>
                    <span className="text-muted-foreground">{a.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-border p-6 text-center">
                <CheckCircle2 className="mx-auto size-7 text-muted-foreground/50" />
                <p className="mt-2 text-xs text-muted-foreground">Zero active security alerts.</p>
              </div>
            )}

            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
              <div>
                <p className="font-display text-xl">{hasData && kpis && kpis.avgRiskScore24h !== null ? kpis.avgRiskScore24h : "—"}</p>
                <p className="text-[10px] text-muted-foreground">Avg Risk</p>
              </div>
              <div>
                <p className="font-display text-xl">{hasData && kpis ? kpis.blockedAuths24h : "—"}</p>
                <p className="text-[10px] text-muted-foreground">Blocked 24h</p>
              </div>
              <div>
                <p className="font-display text-xl">{hasData && kpis && kpis.medianLatencyMs !== null ? `${kpis.medianLatencyMs}ms` : "—"}</p>
                <p className="text-[10px] text-muted-foreground">Median</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}