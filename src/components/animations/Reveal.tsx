import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { EASE } from "./motion";

/** One animation pattern, several presets: fade, slide-up, scale-in, slide from either side. */
export type RevealPreset = "up" | "fade" | "scale" | "left" | "right";

const HIDDEN: Record<RevealPreset, { x?: number; y?: number; scale?: number }> = {
  up: { y: 32 },
  fade: {},
  scale: { scale: 0.94 },
  left: { x: -40 },
  right: { x: 40 },
};

interface RevealProps {
  children: ReactNode;
  preset?: RevealPreset;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}

export function Reveal({
  children,
  preset = "up",
  delay = 0,
  duration = 0.8,
  className,
  once = true,
  amount = 0.2,
}: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...HIDDEN[preset] }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  gap?: number;
  delay?: number;
  amount?: number;
}

/** Parent for a group of <StaggerItem>s that enter one after another. */
export function Stagger({
  children,
  className,
  gap = 0.08,
  delay = 0,
  amount = 0.15,
}: StaggerProps) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: gap, delayChildren: delay } },
  };
  return (
    <motion.div
      className={className}
      variants={variants}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  preset = "up",
}: {
  children: ReactNode;
  className?: string;
  preset?: RevealPreset;
}) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: { opacity: 0, ...HIDDEN[preset] },
    show: { opacity: 1, x: 0, y: 0, scale: 1, transition: { duration: 0.7, ease: EASE } },
  };
  return (
    <motion.div className={className} variants={reduce ? undefined : variants}>
      {children}
    </motion.div>
  );
}
