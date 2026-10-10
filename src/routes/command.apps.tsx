import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Boxes, ShieldCheck, Lock } from "lucide-react";
import { PageHeader } from "@/components/aegis/PageHeader";
import { TiltCard } from "@/components/aegis/TiltCard";
import { Reveal } from "@/components/aegis/Reveal";
import { fetchProtectedApps } from "@/lib/telemetry-service";
import type { ProtectedAppSummary } from "@/lib/telemetry";

export const Route = createFileRoute("/command/apps")({
  component: ProtectedApps,
});

function ProtectedApps() {
  const [apps, setApps] = useState<ProtectedAppSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProtectedApps();
        setApps(data);
      } catch (e) {
        console.error("Failed to load protected apps:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <PageHeader
        index="06 — Protected Applications"
        title="Policy & Surface Telemetry"
        subtitle="Individual application postures, biometric fallback rules, and step-up challenge policies."
      />

      {apps.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {apps.map((a, i) => (
            <Reveal key={a.id} delay={i}>
              <TiltCard className="p-6">
                <div className="flex items-start justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-background/40 text-gold">
                    <Boxes className="size-4" strokeWidth={1.5} />
                  </span>
                  <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                    {a.isProtected ? "Protected" : "Disabled"}
                  </span>
                </div>
                <p className="mt-6 font-display text-2xl">{a.appLabel}</p>
                <p className="mt-1 text-[12px] font-mono text-muted-foreground">{a.packageName}</p>
                <div className="mt-6 flex items-baseline justify-between border-t border-border pt-4">
                  <span className="eyebrow">Enforced Policy</span>
                  <span className="text-xs font-mono text-gold">{a.policy}</span>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="surface-card rounded-3xl p-12 text-center">
          <Lock className="mx-auto size-12 text-muted-foreground/30" />
          <p className="mt-4 font-display text-xl">NO PROTECTED APPLICATIONS</p>
          <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground leading-relaxed">
            No application protection rules have been synchronized from enrolled Android endpoints.
            Configure protected apps on the AEGISAUTH device to establish security policies.
          </p>
        </div>
      )}
    </div>
  );
}