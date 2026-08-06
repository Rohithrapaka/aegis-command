import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { PageHeader } from "@/components/aegis/PageHeader";
import { Reveal } from "@/components/aegis/Reveal";
import { useTheme, type AegisTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/command/settings")({
  component: Settings,
});

const THEMES: {
  id: AegisTheme;
  name: string;
  tagline: string;
  swatch: string[];
}[] = [
  { id: "light", name: "AEGIS Light", tagline: "Light · Warm · Clean", swatch: ["#f7f3ea", "#e7dfd0", "#c2a367", "#3a3630"] },
  { id: "obsidian", name: "AEGIS Obsidian", tagline: "Dark · Deep · Focused", swatch: ["#1b1a18", "#2a2825", "#c9a54e", "#efe7d8"] },
  { id: "midnight", name: "AEGIS Midnight", tagline: "Midnight · Cool · Sleek", swatch: ["#141826", "#212739", "#d3b06b", "#e9ecf5"] },
];

const PREFS = [
  { label: "Adaptive risk thresholds", note: "Auto-tighten policy during anomalies", on: true },
  { label: "Anonymised telemetry", note: "Share aggregate model metrics", on: true },
  { label: "Step-up challenge", note: "Require challenge above risk 40", on: true },
  { label: "Email digests", note: "Daily posture summary at 08:00", on: false },
];

function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <PageHeader
        index="07 — Settings"
        title="Customise your experience."
        subtitle="Appearance, policy defaults and notification behaviour for this Command Center workspace."
      />

      <Reveal>
        <div className="surface-card rounded-3xl p-6 lg:p-8">
          <p className="eyebrow">Theme</p>
          <p className="mt-1 text-[13px] text-muted-foreground">Choose your preferred surface.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {THEMES.map((t) => {
              const selected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-700",
                    selected ? "border-gold shadow-[var(--shadow-lift)]" : "border-border hover:border-gold/50",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{t.tagline}</p>
                    </div>
                    {selected ? (
                      <motion.span
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex size-5 items-center justify-center rounded-full bg-gold text-background"
                      >
                        <Check className="size-3" strokeWidth={3} />
                      </motion.span>
                    ) : null}
                  </div>
                  <div
                    className="mt-5 h-24 rounded-xl border border-border p-3"
                    style={{ background: `linear-gradient(150deg, ${t.swatch[0]}, ${t.swatch[1]})` }}
                  >
                    <span className="block h-2 w-16 rounded-full" style={{ background: t.swatch[2] }} />
                    <span className="mt-2 block h-1.5 w-24 rounded-full opacity-60" style={{ background: t.swatch[3] }} />
                    <span className="mt-1.5 block h-1.5 w-14 rounded-full opacity-40" style={{ background: t.swatch[3] }} />
                    <span className="mt-4 block h-6 w-6 rounded-md" style={{ background: t.swatch[2], opacity: 0.85 }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Reveal>

      <Reveal delay={1}>
        <div className="surface-card mt-4 rounded-3xl p-6 lg:p-8">
          <p className="eyebrow">Security preferences</p>
          <ul className="mt-5 divide-y divide-border">
            {PREFS.map((p) => (
              <li key={p.label} className="flex items-center justify-between gap-6 py-4">
                <span>
                  <span className="block text-sm">{p.label}</span>
                  <span className="block text-[12px] text-muted-foreground">{p.note}</span>
                </span>
                <span
                  className={cn(
                    "flex h-6 w-11 shrink-0 items-center rounded-full border px-0.5 transition-colors duration-500",
                    p.on ? "justify-end border-gold bg-gold/25" : "justify-start border-border bg-muted",
                  )}
                >
                  <span
                    className="size-5 rounded-full"
                    style={{ background: p.on ? "var(--gold)" : "var(--muted-foreground)" }}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </div>
  );
}