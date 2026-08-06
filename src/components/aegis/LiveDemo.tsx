import { motion, useInView } from "motion/react";
import { Check, Loader2, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FaceMesh } from "./FaceMesh";
import { cn } from "@/lib/utils";

const STEPS = [
  "Face Detected",
  "Passive Liveness",
  "Image Quality",
  "Risk Evaluation",
  "Generating BioHash",
  "Verifying Trust",
];

export function LiveDemo({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-120px" });
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (!inView) return;
    setStep(0);
    setScore(0);
    const timers = STEPS.map((_, i) => window.setTimeout(() => setStep(i + 1), 700 + i * 750));
    const scoreTimer = window.setTimeout(() => setScore(18), 700 + STEPS.length * 750);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(scoreTimer);
    };
  }, [inView, runId]);

  const done = step >= STEPS.length;
  const circumference = 2 * Math.PI * 54;
  const progress = done ? 0.82 : step / STEPS.length / 1.6;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div className="relative rounded-[2rem] border border-border bg-card/70 p-3 shadow-[var(--shadow-lift)] backdrop-blur-2xl">
        <div className="grid gap-3 rounded-[1.6rem] border border-border/70 bg-background/60 p-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
          {/* camera */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-secondary/40">
            <div className="absolute left-3 top-3 flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground">
              <span className="size-1.5 animate-pulse rounded-full bg-[var(--success)]" /> LIVE
            </div>
            <div className="px-8 py-6">
              <FaceMesh />
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-16"
              style={{
                background: "linear-gradient(180deg, transparent, color-mix(in oklab, var(--gold) 22%, transparent), transparent)",
                animation: "aegis-scan 4.5s cubic-bezier(0.16,1,0.3,1) infinite",
              }}
            />
            {["left-3 top-3", "right-3 top-3", "left-3 bottom-3", "right-3 bottom-3"].map((pos) => (
              <span key={pos} className={cn("absolute size-5 border-gold/70", pos)} style={{ borderTopWidth: pos.includes("top") ? 1 : 0, borderBottomWidth: pos.includes("bottom") ? 1 : 0, borderLeftWidth: pos.includes("left") ? 1 : 0, borderRightWidth: pos.includes("right") ? 1 : 0 }} />
            ))}
          </div>

          {/* checklist */}
          <div className="rounded-2xl border border-border bg-card/60 p-5">
            <p className="font-display text-lg">{done ? "Authenticated" : "Authenticating…"}</p>
            <ul className="mt-4 space-y-3">
              {STEPS.map((s, i) => {
                const state = step > i ? "done" : step === i ? "active" : "idle";
                return (
                  <li key={s} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "flex size-4.5 items-center justify-center rounded-full border transition-colors duration-500",
                          state === "done"
                            ? "border-[var(--success)] bg-[var(--success)]/15 text-[var(--success)]"
                            : state === "active"
                              ? "border-gold text-gold"
                              : "border-border text-transparent",
                        )}
                      >
                        {state === "done" ? (
                          <Check className="size-3" strokeWidth={2.5} />
                        ) : state === "active" ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : null}
                      </span>
                      <span className={state === "idle" ? "text-muted-foreground" : ""}>{s}</span>
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {state === "done" ? "OK" : state === "active" ? "…" : "—"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* risk score */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/60 p-5">
            <p className="eyebrow">Risk Score</p>
            <div className="relative mt-4 size-32">
              <svg viewBox="0 0 120 120" className="size-full -rotate-90">
                <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="6" />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="var(--success)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset: circumference * (1 - progress) }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-4xl">{score || "—"}</span>
                <span className="text-[10px] tracking-widest text-muted-foreground">LOW RISK</span>
              </div>
            </div>
            <div className="mt-5 w-full">
              <p className="eyebrow">Status</p>
              <p className="mt-1 text-sm">{done ? "Trust verified" : "Evaluating signals"}</p>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-border">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, var(--gold), var(--gold-soft))" }}
                  animate={{ width: `${Math.min(100, (step / STEPS.length) * 100)}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
            <button
              onClick={() => setRunId((r) => r + 1)}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground transition-colors duration-500 hover:border-gold hover:text-foreground"
            >
              <RotateCcw className="size-3.5" /> Replay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}