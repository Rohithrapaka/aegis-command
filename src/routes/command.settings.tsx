import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Check, Smartphone, Unlink, ShieldCheck, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { PageHeader } from "@/components/aegis/PageHeader";
import { Reveal } from "@/components/aegis/Reveal";
import { useTheme, type AegisTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { getActivePairedDevice, unpairCurrentDevice, type PairedDevice } from "@/lib/pairing-service";

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
  const [pairedDevice, setPairedDevice] = useState<PairedDevice | null>(null);
  const [unpairing, setUnpairing] = useState(false);

  async function loadDevice() {
    const dev = await getActivePairedDevice();
    setPairedDevice(dev);
  }

  useEffect(() => {
    loadDevice();
  }, []);

  async function handleUnpair() {
    if (!pairedDevice) return;
    setUnpairing(true);
    await unpairCurrentDevice(pairedDevice.pairingId);
    setPairedDevice(null);
    setUnpairing(false);
  }

  return (
    <div>
      <PageHeader
        index="07 — Settings"
        title="Customise your experience."
        subtitle="Appearance, device link and notification behaviour for this Command Center workspace."
      />

      <Reveal>
        <div className="surface-card mb-4 rounded-3xl p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Paired Physical Device</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Telemetry streams are cryptographically bound to an authorized AEGISAUTH handset.
              </p>
            </div>
            {pairedDevice ? (
              <span className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-medium text-gold">
                <ShieldCheck className="size-3.5" />
                ACTIVE LINK
              </span>
            ) : (
              <span className="rounded-full border border-border bg-muted px-3 py-1 text-[11px] text-muted-foreground">
                UNPAIRED
              </span>
            )}
          </div>

          {pairedDevice ? (
            <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-border bg-background/50 p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-gold">
                  <Smartphone className="size-5" />
                </div>
                <div>
                  <p className="font-display text-sm font-medium">
                    {pairedDevice.model || pairedDevice.deviceIdentifier}
                  </p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    Device ID: {pairedDevice.deviceIdentifier.slice(0, 16)}… · App v{pairedDevice.appVersion || "1.0"}
                  </p>
                </div>
              </div>

              <button
                onClick={handleUnpair}
                disabled={unpairing}
                className="flex items-center gap-1.5 self-start rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50 sm:self-center"
              >
                {unpairing ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Unpairing…</span>
                  </>
                ) : (
                  <>
                    <Unlink className="size-3.5" />
                    <span>Unpair Device</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-border p-6 text-center">
              <p className="text-sm font-medium">No device currently paired.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Use the "PAIR DEVICE" button in the top navigation bar to link your Android device.
              </p>
            </div>
          )}
        </div>
      </Reveal>

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