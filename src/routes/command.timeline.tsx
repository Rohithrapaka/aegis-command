import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { PageHeader } from "@/components/aegis/PageHeader";
import { TIMELINE } from "@/lib/aegis-data";

export const Route = createFileRoute("/command/timeline")({
  component: Timeline,
});

function Timeline() {
  return (
    <div>
      <PageHeader
        index="05 — Authentication Timeline"
        title="Every decision, in sequence."
        subtitle="A continuous ledger of authentication events, engine verdicts and risk outcomes."
      />

      <div className="surface-card rounded-3xl p-6 lg:p-8">
        <ol className="relative border-l border-border pl-8">
          {TIMELINE.map((t, i) => (
            <motion.li
              key={t.label + t.ago}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.8, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="group relative pb-8 last:pb-0"
            >
              <span
                className="absolute -left-[38px] top-1 flex size-4 items-center justify-center rounded-full border bg-background transition-transform duration-500 group-hover:scale-125"
                style={{ borderColor: t.risk > 50 ? "var(--danger)" : "var(--gold)" }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: t.risk > 50 ? "var(--danger)" : "var(--gold)" }}
                />
              </span>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="text-sm">{t.label}</p>
                <span className="font-mono text-[11px] text-muted-foreground">{t.ago}</span>
              </div>
              <p className="mt-1.5 flex flex-wrap gap-x-5 text-[12px] text-muted-foreground">
                <span className="font-mono">user · {t.user}</span>
                <span className="font-mono">risk · {t.risk}</span>
                <span className="font-mono">engine · consensus</span>
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  );
}