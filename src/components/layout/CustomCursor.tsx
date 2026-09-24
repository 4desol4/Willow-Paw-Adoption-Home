import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useFinePointer } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

/**
 * A soft follower that swells into a labelled bubble over anything marked `data-cursor="Label"`.
 * It never replaces the system cursor and is not rendered on touch devices or under reduced motion.
 */
export function CustomCursor() {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 500, damping: 42, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 500, damping: 42, mass: 0.4 });
  const [label, setLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const enabled = fine && !reduce;

  useEffect(() => {
    if (!enabled) return;
    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };
    const onOver = (event: PointerEvent) => {
      const target =
        event.target instanceof Element ? event.target.closest<HTMLElement>("[data-cursor]") : null;
      setLabel(target?.dataset["cursor"] ?? null);
    };
    const onLeave = () => setVisible(false);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[75]"
      style={{ x: springX, y: springY }}
    >
      <motion.div
        animate={{ scale: label ? 1 : 0.3, opacity: visible ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className={cn(
          "-ml-12 -mt-12 flex h-24 w-24 items-center justify-center rounded-full text-sm font-bold transition-colors duration-200",
          label ? "bg-sun text-[#121E38]" : "border-2 border-ink/60",
        )}
      >
        {label}
      </motion.div>
    </motion.div>
  );
}
