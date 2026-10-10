import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { PageHeader } from "@/components/aegis/PageHeader";
import { Hive, type HiveProfileNode } from "@/components/aegis/Hive";
import { Reveal } from "@/components/aegis/Reveal";
import { fetchBiometricProfiles, fetchDashboardKPIs } from "@/lib/telemetry-service";
import type { BiometricProfileSummary, DashboardKPIs } from "@/lib/telemetry";
import { ShieldCheck, Fingerprint, ScanFace, Activity } from "lucide-react";

export const Route = createFileRoute("/command/hive")({
  component: HiveMind,
});

function HiveMind() {
  const [profiles, setProfiles] = useState<BiometricProfileSummary[]>([]);
  const [selected, setSelected] = useState<HiveProfileNode | null>(null);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileList, kpiData] = await Promise.all([
          fetchBiometricProfiles(),
          fetchDashboardKPIs(),
        ]);
        setProfiles(profileList);
        setKpis(kpiData);
        if (profileList.length > 0 && profileList[0]) {
          const first = profileList[0];
          setSelected({
            id: first.id,
            profileIndex: first.profileIndex,
            label: first.displayName || `BIO ${first.profileIndex}`,
            detail: `Profile #${first.profileIndex} • ${first.status}`,
            status: first.status,
            hasFace: first.hasFaceEnrolled,
            hasDeviceBiometric: first.hasDeviceBiometric,
          });
        }
      } catch (err) {
        console.error("Failed to load hive profiles:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      <PageHeader
        index="02 — Hive Ecosystem"
        title="Living Biometric Security Network"
        subtitle="Observe real enrolled biometric profiles, device links and continuous telemetry consensus."
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="surface-card relative overflow-hidden rounded-3xl p-4">
          <Hive profiles={profiles} onSelect={(node) => setSelected(node)} />
        </div>

        <div className="space-y-4">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="surface-card rounded-3xl p-6"
            >
              <p className="eyebrow">Selected Profile</p>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="font-display text-3xl">{selected.label}</p>
                <span className="rounded-full border border-gold/40 px-3 py-0.5 text-xs text-gold">
                  BIO #{selected.profileIndex}
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                {selected.detail}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-background/40 p-3">
                  <p className="text-[10px] tracking-widest text-muted-foreground">STATUS</p>
                  <p className="mt-1 font-mono text-sm">{selected.status}</p>
                </div>
                <div className="rounded-xl border border-border bg-background/40 p-3">
                  <p className="text-[10px] tracking-widest text-muted-foreground">FACE AUTH</p>
                  <p className="mt-1 font-mono text-sm">
                    {selected.hasFace ? "ENROLLED" : "NONE"}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background/40 p-3">
                  <p className="text-[10px] tracking-widest text-muted-foreground">DEVICE BIO</p>
                  <p className="mt-1 font-mono text-sm">
                    {selected.hasDeviceBiometric ? "BOUND" : "UNBOUND"}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="surface-card rounded-3xl p-6 text-center">
              <p className="eyebrow">No Node Selected</p>
              <p className="mt-3 text-sm text-muted-foreground">
                {profiles.length === 0
                  ? "Awaiting biometric profile enrollment from physical AEGISAUTH devices."
                  : "Click any active profile node on the left to inspect telemetry."}
              </p>
            </div>
          )}

          <Reveal>
            <div className="surface-card rounded-3xl p-6">
              <p className="eyebrow">Network Status</p>
              <p className="mt-2 flex items-center gap-2 text-sm">
                <span
                  className={`size-2 rounded-full ${
                    profiles.length > 0
                      ? "bg-[var(--success)] animate-pulse"
                      : "bg-muted-foreground"
                  }`}
                />
                {profiles.length > 0
                  ? `${profiles.length} Active Biometric Profile${profiles.length > 1 ? "s" : ""}`
                  : "No Enrolled Biometric Profiles"}
              </p>

              {profiles.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {profiles.map((p) => (
                    <div
                      key={p.id}
                      onClick={() =>
                        setSelected({
                          id: p.id,
                          profileIndex: p.profileIndex,
                          label: p.displayName || `BIO ${p.profileIndex}`,
                          detail: `Profile #${p.profileIndex} • ${p.status}`,
                          status: p.status,
                          hasFace: p.hasFaceEnrolled,
                          hasDeviceBiometric: p.hasDeviceBiometric,
                        })
                      }
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-background/30 p-3 transition-colors hover:border-gold/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-7 items-center justify-center rounded-lg border border-border bg-card text-xs font-mono text-gold">
                          #{p.profileIndex}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{p.displayName}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {p.hasFaceEnrolled ? "Face Active" : "No Face"} •{" "}
                            {p.hasDeviceBiometric ? "Device Biometric" : "Local Only"}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-border p-6 text-center">
                  <Fingerprint className="mx-auto size-8 text-muted-foreground/50" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Zero enrolled profiles reported via telemetry.
                  </p>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="surface-card rounded-3xl p-6">
              <p className="eyebrow">Decisions 24h</p>
              <p className="mt-2 font-display text-4xl">
                {kpis?.hasRealData ? kpis.grantedAuths24h + kpis.blockedAuths24h : "—"}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {kpis?.hasRealData
                  ? `${kpis.grantedAuths24h} granted • ${kpis.blockedAuths24h} blocked`
                  : "No telemetry decisions logged in last 24h"}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}