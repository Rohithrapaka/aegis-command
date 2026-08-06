import { createFileRoute } from "@tanstack/react-router";
import { Boxes } from "lucide-react";
import { PageHeader } from "@/components/aegis/PageHeader";
import { TiltCard } from "@/components/aegis/TiltCard";
import { Reveal } from "@/components/aegis/Reveal";
import { Counter } from "@/components/aegis/Counter";
import { PROTECTED_APPS } from "@/lib/aegis-data";

export const Route = createFileRoute("/command/apps")({
  component: ProtectedApps,
});

function ProtectedApps() {
  return (
    <div>
      <PageHeader
        index="06 — Protected Applications"
        title="Policy, per surface."
        subtitle="Each application carries its own trust threshold, fallback behaviour and device-binding rules."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {PROTECTED_APPS.map((a, i) => (
          <Reveal key={a.name} delay={i}>
            <TiltCard className="p-6">
              <div className="flex items-start justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-background/40 text-gold">
                  <Boxes className="size-4" strokeWidth={1.5} />
                </span>
                <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                  {a.posture}
                </span>
              </div>
              <p className="mt-6 font-display text-2xl">{a.name}</p>
              <p className="mt-1 text-[12px] text-muted-foreground">{a.policy}</p>
              <div className="mt-6 flex items-baseline justify-between border-t border-border pt-4">
                <span className="eyebrow">Auths today</span>
                <span className="font-display text-xl">
                  <Counter to={a.auths} />
                </span>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </div>
  );
}