import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/aegis/PageHeader";
import { Reveal } from "@/components/aegis/Reveal";
import { Counter } from "@/components/aegis/Counter";
import { AUTH_TREND, LOCATIONS, METHODS, PROTECTED_APPS, SUCCESS_TREND } from "@/lib/aegis-data";

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
  return (
    <div>
      <PageHeader
        index="03 — Analytics"
        title="Insights that strengthen security."
        subtitle="Authentication volume, risk movement, method distribution and geography — measured continuously."
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <Reveal>
          <Panel title="Authentications" note="Today">
            <p className="mt-3 font-display text-[2.4rem] leading-none">
              <Counter to={284} />
              <span className="ml-2 text-sm text-[var(--success)]">↑ 18%</span>
            </p>
            <div className="mt-4 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={AUTH_TREND}>
                  <XAxis dataKey="t" tickLine={false} axisLine={false} tick={axis} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "color-mix(in oklab, var(--gold) 8%, transparent)" }} />
                  <Bar dataKey="auth" fill="var(--gold)" radius={[3, 3, 0, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={1}>
          <Panel title="Success rate" note="7 days">
            <p className="mt-3 font-display text-[2.4rem] leading-none">
              <Counter to={99.71} decimals={2} suffix="%" />
            </p>
            <div className="mt-4 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SUCCESS_TREND}>
                  <XAxis dataKey="t" tickLine={false} axisLine={false} tick={axis} />
                  <YAxis domain={[98, 100]} hide />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="v" stroke="var(--gold)" strokeWidth={1.8} dot={{ r: 2.5, fill: "var(--gold)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={2}>
          <Panel title="Risk score (avg)" note="Today">
            <p className="mt-3 font-display text-[2.4rem] leading-none">
              <Counter to={18} />
              <span className="ml-2 text-sm text-muted-foreground">Low risk</span>
            </p>
            <div className="mt-4 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={AUTH_TREND}>
                  <defs>
                    <linearGradient id="riskFill2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="t" tickLine={false} axisLine={false} tick={axis} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="risk" stroke="var(--gold)" strokeWidth={1.6} fill="url(#riskFill2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </Reveal>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Reveal>
          <Panel title="Authentication methods" note="Distribution">
            <div className="mt-2 flex items-center gap-6">
              <div className="h-36 w-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={METHODS} dataKey="value" innerRadius={42} outerRadius={62} stroke="none" paddingAngle={3}>
                      {METHODS.map((_, i) => (
                        <Cell key={i} fill={`var(--chart-${i + 1})`} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="flex-1 space-y-3 text-[13px]">
                {METHODS.map((m, i) => (
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

        <Reveal delay={1}>
          <Panel title="Top protected apps" note="By authentications">
            <ul className="mt-4 space-y-3.5">
              {PROTECTED_APPS.map((a) => (
                <li key={a.name} className="flex items-center gap-3 text-[13px]">
                  <span className="w-28 shrink-0 truncate">{a.name}</span>
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-border">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${a.auths}%`, background: "linear-gradient(90deg, var(--gold), var(--gold-soft))" }}
                    />
                  </span>
                  <span className="w-7 text-right font-mono text-[11px] text-muted-foreground">{a.auths}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </Reveal>

        <Reveal delay={2}>
          <Panel title="Location insights" note="Top locations">
            <div className="relative mt-4 aspect-[2/1] overflow-hidden rounded-2xl border border-border bg-background/40">
              <svg viewBox="0 0 100 50" className="absolute inset-0 h-full w-full opacity-30">
                {Array.from({ length: 26 }).map((_, i) => (
                  <line key={`v${i}`} x1={i * 4} y1="0" x2={i * 4} y2="50" stroke="var(--border)" strokeWidth="0.2" />
                ))}
                {Array.from({ length: 13 }).map((_, i) => (
                  <line key={`h${i}`} x1="0" y1={i * 4} x2="100" y2={i * 4} stroke="var(--border)" strokeWidth="0.2" />
                ))}
              </svg>
              {LOCATIONS.map((l, i) => (
                <span
                  key={l.city}
                  className="absolute size-2 rounded-full"
                  style={{
                    left: `${l.x}%`,
                    top: `${l.y}%`,
                    background: "var(--gold)",
                    boxShadow: "0 0 0 6px color-mix(in oklab, var(--gold) 14%, transparent)",
                    animation: `aegis-breathe ${5 + i}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-[12px]">
              {LOCATIONS.map((l) => (
                <li key={l.city} className="flex justify-between">
                  <span className="text-muted-foreground">{l.city}</span>
                  <span className="font-mono">{l.share}%</span>
                </li>
              ))}
            </ul>
          </Panel>
        </Reveal>
      </div>
    </div>
  );
}