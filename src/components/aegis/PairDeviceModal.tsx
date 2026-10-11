import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Smartphone, CheckCircle2, AlertCircle, Loader2, X, ShieldCheck } from "lucide-react";
import { claimDevicePairing, type PairedDevice } from "@/lib/pairing-service";

interface PairDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPairingSuccess: () => void;
  activeDevice?: PairedDevice | null;
}

export function PairDeviceModal({
  isOpen,
  onClose,
  onPairingSuccess,
  activeDevice,
}: PairDeviceModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successModel, setSuccessModel] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (clean.length < 6) {
      setError("Please enter a valid 6-character pairing code.");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await claimDevicePairing(clean);
    setLoading(false);

    if (result.success) {
      setSuccessModel(result.deviceModel || "Android Device");
      setTimeout(() => {
        onPairingSuccess();
        onClose();
      }, 1500);
    } else {
      switch (result.errorCode) {
        case "CODE_EXPIRED":
          setError("This pairing code has expired. Please generate a new code on your Android device.");
          break;
        case "ALREADY_CLAIMED":
          setError("This pairing code has already been claimed.");
          break;
        case "INVALID_CODE":
          setError("Invalid pairing code. Please double-check the characters shown on your device.");
          break;
        case "RATE_LIMITED":
          setError("Too many attempts. Please wait 15 minutes before trying again.");
          break;
        default:
          setError(`Pairing failed: ${result.errorCode || "Unknown error"}`);
          break;
      }
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-background/80 backdrop-blur-md"
        />

        {/* Modal card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl border border-gold/40 bg-gold/10 text-gold">
              <Smartphone className="size-5" />
            </div>
            <div>
              <p className="font-display text-lg tracking-tight">Pair Physical Device</p>
              <p className="text-[12px] text-muted-foreground">Authorize telemetry for AEGIS COMMAND</p>
            </div>
          </div>

          {activeDevice ? (
            <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/5 p-4">
              <div className="flex items-center gap-2 text-gold">
                <ShieldCheck className="size-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Device Paired</span>
              </div>
              <p className="mt-1 font-display text-sm text-foreground">
                {activeDevice.model || activeDevice.deviceIdentifier}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                OS: {activeDevice.osVersion || "Android"} · App: v{activeDevice.appVersion || "1.0.0"}
              </p>
              <p className="mt-3 text-[11px] text-muted-foreground/80 leading-relaxed">
                Entering a new pairing code will replace this link with the new device.
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-border bg-muted/40 p-3.5 text-[12px] text-muted-foreground leading-relaxed">
              1. Open <strong>AEGISAUTH</strong> on your Android device.<br />
              2. Go to <strong>Settings → Connect Command Center</strong>.<br />
              3. Tap <strong>Generate Pairing Code</strong> and enter the 6-character code below.
            </div>
          )}

          {successModel ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex flex-col items-center justify-center py-6 text-center"
            >
              <CheckCircle2 className="size-12 text-[var(--success)]" />
              <p className="mt-3 font-display text-base text-foreground">Device Linked Successfully!</p>
              <p className="text-xs text-muted-foreground">{successModel} is now streaming live telemetry.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  6-Character Pairing Code
                </label>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="e.g. 7K4M9Q"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError(null);
                  }}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-center font-mono text-xl uppercase tracking-widest text-foreground outline-none transition-colors focus:border-gold"
                  disabled={loading}
                  autoFocus
                />
              </div>

              {error ? (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading || code.trim().length < 6}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Verifying Code…</span>
                  </>
                ) : (
                  <span>Link Device</span>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
