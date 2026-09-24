import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu } from "lucide-react";
import { Magnetic } from "@/components/animations/Magnetic";
import { ExternalButton } from "@/components/ui/Button";
import { Logo } from "@/components/navigation/Logo";
import { MobileMenu } from "@/components/navigation/MobileMenu";
import { NAV_ITEMS } from "@/components/navigation/nav-items";
import { ThemeToggle } from "@/components/navigation/ThemeToggle";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { generalEnquiryMessage, whatsappLink } from "@/lib/contact";
import { cn } from "@/lib/utils";

/** Transparent at the top of the page, condenses into a frosted pill once you scroll. */
export function Navbar() {
  const { settings } = useSiteSettings();
  const { pathname } = useLocation();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => setScrolled(value > 24));
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4">
        <div className="container-page">
          <div
            className={cn(
              "flex items-center justify-between rounded-full border px-3 py-2 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 sm:px-4",
              scrolled
                ? "border-line bg-bg/80 shadow-[0_10px_40px_-12px_rgba(18,30,56,0.25)] backdrop-blur-xl"
                : "border-transparent bg-transparent",
            )}
          >
            <Logo name={settings.site_name} />

            <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "relative rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                      isActive ? "text-[#121E38]" : "text-ink hover:bg-ink/5",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 -z-10 rounded-full bg-sun"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      ) : null}
                      <span className="relative">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <ThemeToggle />
              <div className="hidden lg:block">
                <Magnetic>
                  <ExternalButton
                    size="sm"
                    newTab
                    href={whatsappLink(
                      settings.whatsapp,
                      generalEnquiryMessage(settings.site_name),
                    )}
                  >
                    WhatsApp us
                  </ExternalButton>
                </Magnetic>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-bg lg:hidden"
              >
                <Menu aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} settings={settings} />
    </>
  );
}
