import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PawPrint } from "lucide-react";
import { EASE } from "@/components/animations/motion";
import { useScrollLock } from "@/hooks/useScrollLock";
import { shortBrand } from "@/lib/utils";

const SEEN_KEY = "gp-intro-seen";

/** Show the intro once per browser session, only on the home page, and never for reduced-motion users. */
export function shouldShowIntro(pathname: string): boolean {
  if (pathname !== "/") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    if (sessionStorage.getItem(SEEN_KEY)) return false;
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    return false;
  }
  return true;
}

/** About 1.1 s: the name rises out of a mask while a single line fills, then the curtain lifts. */
export function Preloader({
  name,
  onLeaving,
  onDone,
}: {
  name: string;
  onLeaving: () => void;
  onDone: () => void;
}) {
  const [leaving, setLeaving] = useState(false);
  useScrollLock(!leaving);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {!leaving ? (
        <motion.div
          key="intro"
          role="status"
          aria-label={`Loading ${name}`}
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-8 bg-inverse text-inverse-fg"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.75, ease: EASE }}
        >
          <div className="flex items-center gap-4 overflow-hidden pb-2">
            <motion.span
              initial={{ y: "120%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-sun text-[#121E38]"
            >
              <PawPrint aria-hidden="true" className="h-6 w-6" strokeWidth={2.25} />
            </motion.span>
            <motion.span
              initial={{ y: "120%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
              className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl"
            >
              {shortBrand(name)}
            </motion.span>
          </div>
          <div className="h-[3px] w-40 overflow-hidden rounded-full bg-inverse-fg/15">
            <motion.div
              className="h-full origin-left bg-sun"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
              onAnimationComplete={() => {
                setLeaving(true);
                onLeaving();
              }}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
