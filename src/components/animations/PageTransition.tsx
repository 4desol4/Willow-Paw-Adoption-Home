import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE } from "./motion";

/** Route change: short fade + rise in, quicker fade out. Keep durations low so navigation never feels slow. */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduce ? 0 : -8 }}
      transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
