import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Activity,
  BarChart3,
  Boxes,
  Gauge,
  Hexagon,
  Settings2,
  ShieldAlert,
  Bell,
  Search,
} from "lucide-react";
import { Wordmark } from "@/components/aegis/Brand";
import { ThemeProvider } from "@/lib/theme";

export const Route = createFileRoute("/command")({
  head: () => ({
    meta: [
      { title: "AEGIS Command Center — Enterprise Identity Operations" },
      {
        name: "description",
        content:
          "Mission overview, hive telemetry, analytics, threat response and policy control for AEGISAUTH deployments.",
      },
      { property: "og:title", content: "AEGIS Command Center" },
      {
        property: "og:description",
        content: "Observe. Protect. Respond. The enterprise control surface for AEGISAUTH.",
      },
    ],
  }),
  component: CommandLayout,
});

const NAV = [
  { to: "/command", label: "Mission Overview", icon: Gauge, exact: true },
  { to: "/command/hive", label: "Hive Mind", icon: Hexagon },
  { to: "/command/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/command/threats", label: "Threat Response", icon: ShieldAlert },
  { to: "/command/timeline", label: "Auth Timeline", icon: Activity },
  { to: "/command/apps", label: "Protected Apps", icon: Boxes },
  { to: "/command/settings", label: "Settings", icon: Settings2 },
] as const;

function CommandLayout() {
  return (
    <ThemeProvider initial="obsidian">
      <div className="grain flex min-h-screen bg-background text-foreground">
        <aside className="sticky top-0 hidden h-screen w-[268px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-5 py-7 lg:flex">
          <Link to="/" className="transition-opacity duration-500 hover:opacity-70">
            <Wordmark sub="COMMAND CENTER" />
          </Link>

          <nav className="mt-11 space-y-1">
            {NAV.map((item, i) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: "exact" in item ? item.exact : false }}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-muted-foreground transition-colors duration-500 hover:bg-sidebar-accent hover:text-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-foreground"
              >
                <span className="font-mono text-[10px] text-muted-foreground/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <item.icon className="size-4 transition-colors duration-500 group-data-[status=active]:text-gold" strokeWidth={1.5} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-sidebar-border bg-background/40 p-4">
            <p className="eyebrow">Security Posture</p>
            <p className="mt-2 flex items-center gap-2 font-display text-xl">
              Excellent
              <span className="size-1.5 rounded-full bg-[var(--success)]" />
            </p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">99.998% integrity</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-border bg-background/70 px-6 py-4 backdrop-blur-xl">
            <div className="flex items-center gap-3 lg:hidden">
              <Wordmark />
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-[13px] text-muted-foreground lg:flex lg:w-80">
              <Search className="size-3.5" />
              Search users, apps, incidents…
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-2 rounded-full border border-border bg-card/50 px-3.5 py-1.5 text-[11px] text-muted-foreground sm:flex">
                <span className="size-1.5 animate-pulse rounded-full bg-[var(--success)]" />
                Live Protection: ACTIVE
              </span>
              <button className="rounded-full border border-border bg-card/50 p-2 text-muted-foreground transition-colors duration-500 hover:text-foreground">
                <Bell className="size-4" strokeWidth={1.5} />
              </button>
              <span className="size-8 rounded-full border border-gold/50 bg-gradient-to-br from-[var(--gold-soft)] to-[var(--gold)]" />
            </div>
          </header>

          <nav className="flex gap-1 overflow-x-auto border-b border-border px-4 py-2 lg:hidden">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: "exact" in item ? item.exact : false }}
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs text-muted-foreground data-[status=active]:bg-accent data-[status=active]:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <motion.main
            key="command-main"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 px-6 py-8 lg:px-10"
          >
            <Outlet />
          </motion.main>
        </div>
      </div>
    </ThemeProvider>
  );
}