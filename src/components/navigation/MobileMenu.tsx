import { useRef } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { EASE } from "@/components/animations/motion";
import { ExternalButton } from "@/components/ui/Button";
import { Logo } from "@/components/navigation/Logo";
import { NAV_ITEMS } from "@/components/navigation/nav-items";
import { ThemeToggle } from "@/components/navigation/ThemeToggle";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useScrollLock } from "@/hooks/useScrollLock";
import { generalEnquiryMessage, whatsappLink } from "@/lib/contact";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/types/database";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  settings: SiteSettings;
}

/** Full-screen menu that opens as a circular wipe from the menu button. */
export function MobileMenu({ open, onClose, settings }: MobileMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollLock(open);
  useFocusTrap(ref, open, onClose);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="mobile-menu"
          id="mobile-menu"
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
          tabIndex={-1}
          initial={{ clipPath: "circle(0% at calc(100% - 2.75rem) 2.75rem)" }}
          animate={{ clipPath: "circle(150% at calc(100% - 2.75rem) 2.75rem)" }}
          exit={{ clipPath: "circle(0% at calc(100% - 2.75rem) 2.75rem)" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="fixed inset-0 z-[70] flex flex-col bg-inverse text-inverse-fg"
        >
          <div className="container-page flex items-center justify-between pt-5">
            <Logo name={settings.site_name} onClick={onClose} />
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-inverse-fg/10 transition-colors hover:bg-inverse-fg/20"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          </div>

          <nav
            aria-label="Main"
            className="container-page flex flex-1 flex-col justify-center gap-1 py-6"
          >
            {NAV_ITEMS.map((item, index) => (
              <div key={item.to} className="overflow-hidden">
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{
                    y: 0,
                    transition: { delay: 0.2 + index * 0.06, duration: 0.6, ease: EASE },
                  }}
                  exit={{ y: "100%", transition: { duration: 0.2 } }}
                >
                  <NavLink
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "block py-1 font-display text-[clamp(2.5rem,12vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight transition-colors",
                        isActive ? "text-sun" : "hover:text-sun",
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </motion.div>
              </div>
            ))}
          </nav>

          <div className="container-page flex flex-col gap-3 pb-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-inverse-fg/70">{settings.location}</p>
            <ExternalButton
              variant="sun"
              size="lg"
              newTab
              href={whatsappLink(settings.whatsapp, generalEnquiryMessage(settings.site_name))}
            >
              Message us on WhatsApp
            </ExternalButton>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
