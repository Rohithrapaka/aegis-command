import { cn } from "@/lib/utils";

export function AegisMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden>
      <polygon
        points="16,2 29,9.5 29,24.5 16,32 3,24.5 3,9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M16 9 L21.5 12 L21.5 19 C21.5 22 16 24.5 16 24.5 C16 24.5 10.5 22 10.5 19 L10.5 12 Z"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="1.2"
      />
      <circle cx="16" cy="16" r="1.8" fill="var(--gold)" />
    </svg>
  );
}

export function Wordmark({ className, sub }: { className?: string; sub?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <AegisMark />
      <span className="leading-none">
        <span className="block text-[15px] font-medium tracking-[0.16em]">AEGISAUTH</span>
        {sub ? (
          <span className="mt-1 block text-[9px] tracking-[0.28em] text-muted-foreground">{sub}</span>
        ) : null}
      </span>
    </span>
  );
}