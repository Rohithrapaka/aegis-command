import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowRight, ArrowUpRight, Play, ScanFace, ShieldCheck, Fingerprint, Radar } from "lucide-react";

import { SiteNav } from "@/components/aegis/SiteNav";
import { SiteFooter } from "@/components/aegis/SiteFooter";
import { AegisFlow } from "@/components/aegis/AegisFlow";
import { Particles } from "@/components/aegis/Particles";
import { Reveal } from "@/components/aegis/Reveal";
import { Counter } from "@/components/aegis/Counter";
import { Hive } from "@/components/aegis/Hive";
import { Pipeline } from "@/components/aegis/Pipeline";
import { LiveDemo } from "@/components/aegis/LiveDemo";
import { TiltCard } from "@/components/aegis/TiltCard";
import { MagneticButton } from "@/components/aegis/MagneticButton";
import heroFace from "@/assets/hero-face.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AEGISAUTH — Adaptive Biometric Authentication" },
      {
        name: "description",
        content:
          "AEGISAUTH is adaptive biometric protection: passive liveness, risk evaluation and BioHashing that verify real people in milliseconds.",
      },
      { property: "og:title", content: "AEGISAUTH — Adaptive Biometric Authentication" },
      {
        property: "og:description",
        content:
          "Passive liveness, risk evaluation and BioHashing — identity infrastructure built for real-world threats.",
      },
    ],
  }),
  component: Landing,
});

const PILLARS = [
  { icon: ScanFace, title: "Passive Liveness", copy: "Real. Not replayed." },
  { icon: Radar, title: "Risk Evaluation", copy: "Every signal matters." },
  { icon: Fingerprint, title: "BioHashing", copy: "You are your key." },
  { icon: ShieldCheck, title: "Adaptive Protection", copy: "Always one step ahead." },
];

function Landing() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const faceY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const faceScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="grain min-h-screen overflow-x-clip bg-background">
      <SiteNav />

      {/* ── 01 HERO ─────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[104vh] overflow-hidden pt-36">
        <Particles count={40} />
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:px-12">
          <motion.div style={{ y: copyY, opacity: copyOpacity }} className="relative z-10">
            <Reveal>
              <p className="eyebrow">01 — Awakening</p>
            </Reveal>
            <Reveal delay={1}>
              <h1 className="mt-7 font-display text-[clamp(3.6rem,9vw,8.5rem)] leading-[0.86]">
                Trust
                <br />
                Verified.
              </h1>
            </Reveal>
            <Reveal delay={2}>
              <p className="mt-8 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                Adaptive biometric protection for the modern digital world. AEGISAUTH proves a real
                person is present — then makes that proof unforgeable.
              </p>
            </Reveal>
            <Reveal delay={3}>
              <div className="mt-10 flex flex-wrap items-center gap-5">
                <a href="#demo">
                  <MagneticButton>
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary-foreground/15">
                      <Play className="size-3" fill="currentColor" />
                    </span>
                    Experience AEGIS
                  </MagneticButton>
                </a>
                <a
                  href="#problem"
                  className="group flex items-center gap-3 text-sm text-muted-foreground transition-colors duration-500 hover:text-foreground"
                >
                  <span className="h-px w-9 bg-border transition-all duration-500 group-hover:w-14 group-hover:bg-gold" />
                  Scroll to explore
                </a>
              </div>
            </Reveal>
          </motion.div>

          <motion.div style={{ y: faceY, scale: faceScale }} className="relative">
            <div className="relative mx-auto max-w-[560px]">
              <img
                src={heroFace}
                alt="Procedural biometric face mesh rendered in warm ivory and gold"
                width={1200}
                height={1200}
                className="w-full mix-blend-multiply dark:mix-blend-normal"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(60% 55% at 50% 45%, transparent 40%, var(--background) 88%)",
                }}
              />
            </div>
            <div className="mt-4 grid gap-4 sm:absolute sm:-right-2 sm:top-1/2 sm:mt-0 sm:w-[230px] sm:-translate-y-1/2">
              {PILLARS.map((p, i) => (
                <Reveal key={p.title} delay={i + 2}>
                  <div className="group flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card/60 text-gold backdrop-blur transition-colors duration-500 group-hover:border-gold">
                      <p.icon className="size-4" strokeWidth={1.4} />
                    </span>
                    <span>
                      <span className="block text-[13px] font-medium">{p.title}</span>
                      <span className="block text-[12px] text-muted-foreground">{p.copy}</span>
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </motion.div>
        </div>

        <AegisFlow className="bottom-0 h-[280px]" />
        <div className="absolute inset-x-0 bottom-8 flex justify-center">
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <span className="flex h-8 w-5 justify-center rounded-full border border-border pt-1.5">
              <span className="h-1.5 w-0.5 rounded-full bg-gold" />
            </span>
            <span className="text-[10px] tracking-[0.24em] text-muted-foreground">SCROLL</span>
          </motion.div>
        </div>
      </section>

      {/* ── 02 PROBLEM ──────────────────────────────────────── */}
      <section id="problem" className="relative border-y border-border py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid gap-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div>
              <Reveal>
                <p className="eyebrow">02 — The Problem</p>
              </Reveal>
              <Reveal delay={1}>
                <h2 className="mt-7 font-display text-[clamp(2.6rem,5vw,4.6rem)] leading-[0.95]">
                  Passwords
                  <br />
                  are obsolete.
                </h2>
              </Reveal>
              <Reveal delay={2}>
                <p className="mt-7 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
                  Credentials leak. Biometrics get replayed. Attackers stopped breaking systems —
                  they started impersonating people.
                </p>
              </Reveal>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
              {[
                { value: 81, suffix: "%", label: "Breaches caused by weak credentials" },
                { value: 7.6, suffix: "B", label: "Stolen records in a single year", decimals: 1 },
                { value: 99, suffix: "%", label: "Attack attempts target humans, not systems" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 24, rotate: i === 1 ? -1.2 : 0.8 }}
                  whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 1.1, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="group bg-card px-8 py-14 transition-colors duration-700 hover:bg-secondary/60"
                >
                  <Counter
                    to={s.value}
                    decimals={s.decimals ?? 0}
                    suffix={s.suffix}
                    className="font-display text-[clamp(2.6rem,4vw,3.6rem)] leading-none"
                  />
                  <div className="mt-5 h-px w-8 bg-gold transition-all duration-700 group-hover:w-16" />
                  <p className="mt-5 text-[13px] leading-relaxed text-muted-foreground">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 03 SOLUTION ─────────────────────────────────────── */}
      <section id="solution" className="relative overflow-hidden py-32">
        <AegisFlow className="top-10 h-[300px]" opacity={0.35} flip />
        <div className="mx-auto grid max-w-[1400px] items-center gap-16 px-6 lg:grid-cols-2 lg:px-12">
          <div className="relative z-10">
            <Reveal>
              <p className="eyebrow">03 — Our Solution</p>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="mt-7 font-display text-[clamp(2.6rem,5vw,4.6rem)] leading-[0.95]">
                AEGISAUTH
                <br />
                changes that.
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p className="mt-7 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                Six specialised engines operate as one organism — the AEGIS Hive. Each decision is
                the consensus of liveness, quality, behaviour, device context and cryptographic
                binding.
              </p>
            </Reveal>
            <Reveal delay={3}>
              <dl className="mt-10 grid max-w-md grid-cols-2 gap-y-7">
                {[
                  ["< 400ms", "Median decision time"],
                  ["99.71%", "Successful first-attempt auth"],
                  ["0", "Raw biometrics stored"],
                  ["12", "Applications protected"],
                ].map(([v, l]) => (
                  <div key={l}>
                    <dt className="font-display text-2xl">{v}</dt>
                    <dd className="mt-1 text-[12px] text-muted-foreground">{l}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal delay={4}>
              <a
                href="#flow"
                className="group mt-10 inline-flex items-center gap-3 text-sm transition-colors duration-500 hover:text-gold"
              >
                Explore the technology
                <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
              </a>
            </Reveal>
          </div>
          <Reveal delay={2} className="relative z-10">
            <Hive />
          </Reveal>
        </div>
      </section>

      {/* ── 04 FLOW ─────────────────────────────────────────── */}
      <section id="flow" className="relative border-y border-border bg-secondary/25 py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <Reveal>
                <p className="eyebrow">04 — Architecture</p>
              </Reveal>
              <Reveal delay={1}>
                <h2 className="mt-7 font-display text-[clamp(2.4rem,4.4vw,4rem)] leading-[0.96]">
                  A continuous
                  <br />
                  intelligence flow.
                </h2>
              </Reveal>
            </div>
            <Reveal delay={2}>
              <p className="max-w-xs text-[14px] leading-relaxed text-muted-foreground">
                From signal to trust. Every millisecond, seven stages evaluate the request before
                access is ever granted.
              </p>
            </Reveal>
          </div>
          <Pipeline className="mt-16" />
        </div>
      </section>

      {/* ── 05 LIVE DEMO ────────────────────────────────────── */}
      <section id="demo" className="relative overflow-hidden py-32">
        <Particles count={26} />
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:items-center">
            <div>
              <Reveal>
                <p className="eyebrow">05 — Live Demo</p>
              </Reveal>
              <Reveal delay={1}>
                <h2 className="mt-7 font-display text-[clamp(2.4rem,4.4vw,4rem)] leading-[0.96]">
                  Experience
                  <br />
                  AEGISAUTH
                  <br />
                  in action.
                </h2>
              </Reveal>
              <Reveal delay={2}>
                <p className="mt-7 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
                  A real-time authentication flow, rendered in your browser. Watch the engines reach
                  consensus, one signal at a time.
                </p>
              </Reveal>
            </div>
            <Reveal delay={2}>
              <LiveDemo />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 06 COMMAND CENTER ───────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-border py-32">
        <AegisFlow className="top-0 h-[260px]" opacity={0.4} />
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <div className="relative z-10">
              <Reveal>
                <p className="eyebrow">06 — Command Center</p>
              </Reveal>
              <Reveal delay={1}>
                <h2 className="mt-7 font-display text-[clamp(2.4rem,4.4vw,4rem)] leading-[0.96]">
                  Total visibility.
                  <br />
                  Total control.
                </h2>
              </Reveal>
              <Reveal delay={2}>
                <p className="mt-7 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                  Monitor. Analyse. Respond. The Command Center is the enterprise surface of
                  AEGISAUTH — mission overview, hive telemetry, analytics and threat response in one
                  calm workspace.
                </p>
              </Reveal>
              <Reveal delay={3}>
                <Link to="/command" className="mt-10 inline-block">
                  <MagneticButton>
                    Enter Command Center
                    <ArrowUpRight className="size-4" />
                  </MagneticButton>
                </Link>
              </Reveal>
            </div>

            <Reveal delay={2}>
              <TiltCard className="p-6">
                <div className="flex items-center justify-between">
                  <p className="eyebrow">Mission Overview</p>
                  <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="size-1.5 animate-pulse rounded-full bg-[var(--success)]" />
                    Live Protection Active
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ["284", "Authentications"],
                    ["99.71%", "Success rate"],
                    ["07", "Threats stopped"],
                    ["12", "Protected apps"],
                  ].map(([v, l]) => (
                    <div key={l} className="rounded-xl border border-border bg-background/50 p-4">
                      <p className="font-display text-2xl">{v}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{l}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-border bg-background/40 p-4">
                  <p className="eyebrow">Neural flow · real-time decisions</p>
                  <svg viewBox="0 0 400 90" className="mt-3 w-full">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <path
                        key={i}
                        d={`M0 ${45 + i * 3} C 90 ${10 + i * 6}, 160 ${80 - i * 5}, 240 ${45 + i * 2} S 340 ${16 + i * 4}, 400 ${50 - i * 3}`}
                        fill="none"
                        stroke="var(--gold)"
                        strokeOpacity={0.5 - i * 0.07}
                        strokeWidth="1"
                        strokeDasharray="600 200"
                        style={{ animation: `aegis-dash ${20 + i * 4}s linear infinite` }}
                      />
                    ))}
                  </svg>
                </div>
              </TiltCard>
            </Reveal>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}