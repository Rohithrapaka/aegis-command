import { createFileRoute } from "@tanstack/react-router";
import { Activity, ShieldCheck, Boxes, Radar, ArrowUpRight } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { PageHeader } from "@/components/aegis/PageHeader";
import { TiltCard } from "@/components/aegis/TiltCard";
import { Counter } from "@/components/aegis/Counter";
import { Reveal } from "@/components/aegis/Reveal";
import { AUTH_TREND, TIMELINE } from "@/lib/aegis-data";

export const Route = createFileRoute("/command/")({
  component: MissionOverview,
});

const KPIS = [
  { icon: ShieldCheck, label: "System Health", value: 99.998, suffix: "%", decimals: 3, note: "All engines operational" },
  { icon: Activity, label: "Authentications Today", value: 284, suffix: "", decimals: 0, note: "+18% vs yesterday" },
  { icon: Boxes, label: "Protected Apps", value: 12, suffix: "", decimals: 0, note: "3 hardened policies" },
  { icon: Radar, label: "Threats Prevented", value: 7, suffix: "", decimals: 0, note: "−12% vs yesterday" },
];

function MissionOverview() {
  return (
    <div>
      <PageHeader
        index="01 — Mission Overview"
        title="Everything, at a glance."
        subtitle="Real-time posture across engines, applications and identities protected by AEGISAUTH."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((k, i) => (
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
                <Counter to={k.value} decimals={k.decimals} suffix={k.suffix} />
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground">{k.note}</p>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Reveal delay={1}>
          <div className="surface-card rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Authentications</p>
                <p className="mt-1 font-display text-2xl">Last 24 hours</p>
              </div>
              <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="size-1.5 animate-pulse rounded-full bg-[var(--success)]" /> Real-time
              </span>
            </div>
            <div className="mt-6 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={AUTH_TREND}>
                  <XAxis dataKey="t" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <Tooltip
                    cursor={{ fill: "color-mix(in oklab, var(--gold) 8%, transparent)" }}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="auth" fill="var(--gold)" radius={[3, 3, 0, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>

        <Reveal delay={2}>
          <div className="surface-card rounded-3xl p-6">
            <p className="eyebrow">Threat Level</p>
            <p className="mt-2 font-display text-3xl">Low</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              No sustained attack patterns across the last 24 hours.
            </p>
            <div className="mt-5 h-28">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={AUTH_TREND}>
                  <defs>
                    <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="risk"
                    stroke="var(--gold)"
                    strokeWidth={1.6}
                    fill="url(#riskFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
              {[
                ["18", "Avg risk"],
                ["02", "Blocked"],
                ["00", "Escalated"],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="font-display text-xl">{v}</p>
                  <p className="text-[10px] text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={2}>
        <div className="surface-card mt-4 rounded-3xl p-6">
          <p className="eyebrow">Recent Activity</p>
          <ul className="mt-5 divide-y divide-border">
            {TIMELINE.slice(0, 5).map((t) => (
              <li key={t.label + t.ago} className="flex items-center justify-between gap-4 py-3.5 text-sm">
                <span className="flex items-center gap-3">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ background: t.risk > 50 ? "var(--danger)" : "var(--success)" }}
                  />
                  {t.label}
                </span>
                <span className="flex items-center gap-6 text-[12px] text-muted-foreground">
                  <span className="font-mono">{t.user}</span>
                  <span className="font-mono">risk {t.risk}</span>
                  <span>{t.ago}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </div>
  );
}