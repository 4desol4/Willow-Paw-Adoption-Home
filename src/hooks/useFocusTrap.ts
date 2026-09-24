import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Keeps Tab inside `ref` while active, closes on Escape, and restores focus afterwards. */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onEscape?: () => void,
) {
  const escapeRef = useRef(onEscape);
  escapeRef.current = onEscape;

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const items = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0,
      );
    (items()[0] ?? node).focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        escapeRef.current?.();
        return;
      }
      if (event.key !== "Tab") return;
      const list = items();
      const first = list[0];
      const last = list[list.length - 1];
      if (!first || !last) {
        event.preventDefault();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [active, ref]);
}
