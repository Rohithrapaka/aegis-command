import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { PageHeader } from "@/components/aegis/PageHeader";
import { fetchAuthTimeline } from "@/lib/telemetry-service";
import type { AuthenticationEvent } from "@/lib/telemetry";
import { Activity, ShieldAlert, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/command/timeline")({
  component: Timeline,
});

function Timeline() {
  const [events, setEvents] = useState<AuthenticationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAuthTimeline(30);
        setEvents(data);
      } catch (e) {
        console.error("Failed to load timeline events:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <PageHeader
        index="05 — Authentication Timeline"
        title="Every decision, in sequence."
        subtitle="A continuous ledger of real authentication decisions, fallback events and risk outcomes."
      />

      <div className="surface-card rounded-3xl p-6 lg:p-8">
        {events.length > 0 ? (
          <ol className="relative border-l border-border pl-8">
            {events.map((t, i) => {
              const isSuccess = t.eventType === "AUTH_SUCCESS";
              return (
                <motion.li
                  key={t.id}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative pb-8 last:pb-0"
                >
                  <span
                    className="absolute -left-[38px] top-1 flex size-4 items-center justify-center rounded-full border bg-background transition-transform duration-500 group-hover:scale-125"
                    style={{ borderColor: isSuccess ? "var(--gold)" : "var(--danger)" }}
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ background: isSuccess ? "var(--gold)" : "var(--danger)" }}
                    />
                  </span>
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="text-sm font-medium">
                      {t.appLabel || t.packageName || "App Authentication"} —{" "}
                      <span className={isSuccess ? "text-[var(--success)]" : "text-[var(--danger)]"}>
                        {t.eventType.replace("_", " ")}
                      </span>
                    </p>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {new Date(t.createdAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="mt-1.5 flex flex-wrap gap-x-5 text-[12px] text-muted-foreground">
                    <span className="font-mono">method • {t.authMethod}</span>
                    {t.riskScore !== null && t.riskScore !== undefined && (
                      <span className="font-mono">risk • {t.riskScore}</span>
                    )}
                    {t.failureReason && (
                      <span className="font-mono text-[var(--danger)]">
                        reason • {t.failureReason}
                      </span>
                    )}
                    {t.latencyMs && <span className="font-mono">latency • {t.latencyMs}ms</span>}
                  </p>
                </motion.li>
              );
            })}
          </ol>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Clock className="size-12 text-muted-foreground/30" />
            <p className="mt-4 font-display text-lg">NO RECENT EVENTS</p>
            <p className="mt-1.5 max-w-md text-xs text-muted-foreground leading-relaxed">
              When an authentication attempt (face verification, system biometric fallback, or lockout)
              occurs on an enrolled device, it will be securely recorded in this timeline.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}