import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { PageHeader } from "@/components/aegis/PageHeader";
import { Hive, HIVE_NODES, type HiveNode } from "@/components/aegis/Hive";
import { Reveal } from "@/components/aegis/Reveal";

export const Route = createFileRoute("/command/hive")({
  component: HiveMind,
});

function HiveMind() {
  const [selected, setSelected] = useState<HiveNode>(HIVE_NODES[0]!);

  return (
    <div>
      <PageHeader
        index="02 — Hive Mind"
        title="The intelligence behind every decision."
        subtitle="Six engines in consensus. Select a node to inspect its live contribution to the trust decision."
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="surface-card relative overflow-hidden rounded-3xl p-4">
          <Hive onSelect={setSelected} />
        </div>

        <div className="space-y-4">
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="surface-card rounded-3xl p-6"
          >
            <p className="eyebrow">Selected node</p>
            <p className="mt-2 font-display text-3xl">{selected.label}</p>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{selected.detail}</p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { l: "STATUS", v: selected.status },
                { l: "LATENCY", v: "38ms" },
                { l: "CONFIDENCE", v: "0.987" },
              ].map(({ l, v }) => (
                <div key={l} className="rounded-xl border border-border bg-background/40 p-3">
                  <p className="text-[10px] tracking-widest text-muted-foreground">{l}</p>
                  <p className="mt-1 font-mono text-sm">{v}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <Reveal>
            <div className="surface-card rounded-3xl p-6">
              <p className="eyebrow">Hive status</p>
              <p className="mt-2 flex items-center gap-2 text-sm">
                <span className="size-1.5 animate-pulse rounded-full bg-[var(--success)]" />
                All systems operational
              </p>
              <div className="mt-5 space-y-3">
                {HIVE_NODES.map((n, i) => (
                  <div key={n.id} className="flex items-center gap-3">
                    <span className="w-36 shrink-0 truncate text-[12px] text-muted-foreground">{n.label}</span>
                    <span className="h-1 flex-1 overflow-hidden rounded-full bg-border">
                      <motion.span
                        className="block h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, var(--gold), var(--gold-soft))" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${88 - i * 4}%` }}
                        transition={{ duration: 1.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </span>
                    <span className="w-9 text-right font-mono text-[11px] text-muted-foreground">
                      {88 - i * 4}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="surface-card rounded-3xl p-6">
              <p className="eyebrow">Decisions today</p>
              <p className="mt-2 font-display text-4xl">284</p>
              <svg viewBox="0 0 360 70" className="mt-4 w-full">
                {[0, 1, 2, 3].map((i) => (
                  <path
                    key={i}
                    d={`M0 ${36 + i * 3} C 80 ${8 + i * 6}, 150 ${62 - i * 5}, 220 ${36 + i * 2} S 310 ${14 + i * 4}, 360 ${40 - i * 3}`}
                    fill="none"
                    stroke="var(--gold)"
                    strokeOpacity={0.5 - i * 0.09}
                    strokeWidth="1"
                    strokeDasharray="500 180"
                    style={{ animation: `aegis-dash ${18 + i * 5}s linear infinite` }}
                  />
                ))}
              </svg>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}