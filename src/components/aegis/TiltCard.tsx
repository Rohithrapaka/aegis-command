import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Glass card that tilts subtly toward the cursor and catches a soft reflection. */
export function TiltCard({
  children,
  className,
  intensity = 6,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [intensity, -intensity]), {
    stiffness: 140,
    damping: 20,
  });
  const ry = useSpring(useTransform(mx, [0, 1], [-intensity, intensity]), {
    stiffness: 140,
    damping: 20,
  });
  const shineX = useTransform(mx, (v) => `${v * 100}%`);
  const shineY = useTransform(my, (v) => `${v * 100}%`);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      className={cn("relative overflow-hidden rounded-3xl surface-card", className)}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 hover:opacity-100"
        style={{
          background: `radial-gradient(340px circle at ${shineX} ${shineY}, color-mix(in oklab, var(--gold) 16%, transparent), transparent 70%)`,
          opacity: 1,
        }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}