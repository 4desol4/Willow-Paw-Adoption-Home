import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  const dark = resolved === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-ink/10"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={dark ? "moon" : "sun"}
          initial={{ rotate: -70, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 70, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.18 }}
          className="flex"
        >
          {dark ? (
            <Moon aria-hidden="true" className="h-5 w-5" />
          ) : (
            <Sun aria-hidden="true" className="h-5 w-5" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
