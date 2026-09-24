import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/** Moves its content slower/faster than the page. Give the parent `overflow-hidden` and scale the child up slightly. */
export function Parallax({
  children,
  speed = 40,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-speed, speed]);
  return (
    <div ref={ref} className={className}>
      <motion.div
        style={reduce ? undefined : { y }}
        className="h-full w-full will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}
