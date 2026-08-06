import { motion } from "motion/react";
import {
  Camera,
  ScanFace,
  Sparkles,
  ShieldCheck,
  Boxes,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  { icon: Camera, title: "Capture", copy: "Image acquisition & face detection" },
  { icon: ScanFace, title: "Passive Liveness", copy: "Micro-movements & texture analysis" },
  { icon: Sparkles, title: "Image Quality", copy: "Sharpness, lighting & integrity" },
  { icon: ShieldCheck, title: "Risk Evaluation", copy: "Device, behaviour & context" },
  { icon: Boxes, title: "BioHash", copy: "Template protection & binding" },
  { icon: CheckCircle2, title: "Authentication", copy: "Decision engine verifies trust" },
  { icon: Lock, title: "Protected App", copy: "Access granted to selected apps" },
];

export function Pipeline({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div className="relative overflow-x-auto pb-4">
        <div className="relative grid min-w-[980px] grid-cols-7 gap-3">
          {/* travelling golden pulse rail */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute top-1/2 h-px w-40 -translate-y-1/2"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--gold), var(--gold-soft), transparent)",
            }}
            animate={{ x: ["-10%", "1000%"] }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          />

          {STAGES.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.9, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="group relative z-10 flex flex-col items-center rounded-2xl border border-border bg-card/60 px-3 py-7 text-center backdrop-blur-xl lift"
            >
              <span className="mb-4 flex size-11 items-center justify-center rounded-xl border border-border bg-background/60 text-gold transition-colors duration-500 group-hover:border-gold">
                <s.icon className="size-5" strokeWidth={1.4} />
              </span>
              <p className="text-sm font-medium">{s.title}</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{s.copy}</p>
              <span className="mt-4 font-mono text-[10px] tracking-widest text-muted-foreground/70">
                {String(i + 1).padStart(2, "0")}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}