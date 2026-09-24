import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** True on devices with a real hover-capable pointer (not touch). */
export const useFinePointer = () => useMediaQuery("(hover: hover) and (pointer: fine)");
