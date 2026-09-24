import { useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { EASE } from "@/components/animations/motion";
import { Button } from "@/components/ui/Button";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useScrollLock } from "@/hooks/useScrollLock";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "md" | "lg" | "full";
  hideTitle?: boolean;
}

/** Accessible dialog: focus is trapped, Escape closes, background scroll is locked, and it animates in and out. */
export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  hideTitle = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useScrollLock(open);
  useFocusTrap(panelRef, open, onClose);

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="modal"
          className={cn(
            "fixed inset-0 z-[85] flex justify-center",
            size === "full" ? "items-stretch" : "items-end sm:items-center sm:p-6",
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-[#0B1327]/75 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            data-lenis-prevent
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className={cn(
              "relative w-full overflow-y-auto text-ink",
              size === "full"
                ? "h-full"
                : "max-h-[92vh] rounded-t-3xl bg-bg p-6 shadow-2xl sm:rounded-3xl sm:p-8",
              size === "md" && "sm:max-w-lg",
              size === "lg" && "sm:max-w-3xl",
            )}
          >
            <h2
              id={titleId}
              className={hideTitle ? "sr-only" : "pr-10 font-display text-display-sm"}
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={cn(
                "absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                size === "full" ? "bg-bg/90 text-ink hover:bg-sun" : "hover:bg-ink/10",
              )}
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={loading ? () => undefined : onClose} title={title}>
      <p className="mt-3 text-muted">{message}</p>
      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          Keep it
        </Button>
        <Button variant="danger" state={loading ? "loading" : "idle"} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
