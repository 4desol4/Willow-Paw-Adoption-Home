import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "motion/react";
import { registerLenis } from "@/lib/scroll";

/** Inertial scrolling for the public site. Native scrolling is kept for reduced-motion users and touch devices. */
export function SmoothScroll() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    registerLenis(lenis);
    let frame = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      registerLenis(null);
    };
  }, [reduce]);

  return null;
}
