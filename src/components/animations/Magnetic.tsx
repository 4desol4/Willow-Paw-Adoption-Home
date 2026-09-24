import { useRef, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useFinePointer } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

/** Pulls its child gently toward the pointer. A no-op on touch devices and under reduced motion. */
export function Magnetic({
  children,
  strength = 0.32,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  if (reduce || !fine) return <span className={cn("inline-flex", className)}>{children}</span>;

  const onMove = (event: PointerEvent<HTMLSpanElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x: springX, y: springY }}
      className={cn("inline-flex", className)}
    >
      {children}
    </motion.span>
  );
}
