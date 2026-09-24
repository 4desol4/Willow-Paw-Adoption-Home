import { useEffect } from "react";
import { lockScroll, unlockScroll } from "@/lib/scroll";

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lockScroll();
    return unlockScroll;
  }, [active]);
}
