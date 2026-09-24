import type Lenis from "lenis";

/** Shared handle so modals and menus can pause smooth scrolling while they are open. */
let lenis: Lenis | null = null;
let locks = 0;

export function registerLenis(instance: Lenis | null) {
  lenis = instance;
}

export function lockScroll() {
  locks += 1;
  if (locks === 1) {
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
  }
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) {
    document.documentElement.style.removeProperty("overflow");
    lenis?.start();
  }
}
