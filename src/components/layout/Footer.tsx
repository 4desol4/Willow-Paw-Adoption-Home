import { Link } from "react-router-dom";
import { Magnetic } from "@/components/animations/Magnetic";
import { ExternalButton } from "@/components/ui/Button";
import { NAV_ITEMS } from "@/components/navigation/nav-items";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import {
  generalEnquiryMessage,
  mailtoLink,
  socialLinks,
  telLink,
  whatsappLink,
} from "@/lib/contact";

export function Footer() {
  const { settings } = useSiteSettings();
  const socials = socialLinks(settings);
  const linkClass = "text-inverse-fg/75 transition-colors hover:text-sun";

  return (
    <footer className="bg-inverse text-inverse-fg">
      <div className="container-page py-20 sm:py-28">
        <div className="grid gap-16 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="font-display text-display-lg">Someone small is waiting to meet you.</p>
            <div className="mt-10">
              <Magnetic>
                <ExternalButton
                  variant="sun"
                  size="lg"
                  newTab
                  href={whatsappLink(settings.whatsapp, generalEnquiryMessage(settings.site_name))}
                >
                  Start a conversation
                </ExternalButton>
              </Magnetic>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2">
            <nav aria-label="Footer">
              <h2 className="text-sm font-semibold text-inverse-fg/50">Explore</h2>
              <ul className="mt-4 space-y-2.5">
                {NAV_ITEMS.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div>
              <h2 className="text-sm font-semibold text-inverse-fg/50">Visit and write</h2>
              <ul className="mt-4 space-y-2.5">
                {settings.location ? (
                  <li className="text-inverse-fg/75">{settings.location}</li>
                ) : null}
                {settings.contact_hours ? (
                  <li className="text-inverse-fg/75">{settings.contact_hours}</li>
                ) : null}
                {settings.phone ? (
                  <li>
                    <a href={telLink(settings.phone)} className={linkClass}>
                      {settings.phone}
                    </a>
                  </li>
                ) : null}
                {settings.email ? (
                  <li>
                    <a href={mailtoLink(settings.email, "Adoption enquiry")} className={linkClass}>
                      {settings.email}
                    </a>
                  </li>
                ) : null}
              </ul>
              {socials.length > 0 ? (
                <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                  {socials.map((link) => (
                    <li key={link.key}>
                      <a
                        href={link.url ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-3 border-t border-inverse-fg/15 pt-6 text-sm text-inverse-fg/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.site_name}
          </p>
          <div className="flex items-center gap-2 text-inverse-fg/70">
            <span>Made by</span>
            <a
              href="https://github.com/4desol4"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-inverse-fg transition-colors duration-200 hover:text-sun"
            >
              4desol4
            </a>
          </div>
          <Link to="/admin/login" className="transition-colors hover:text-sun">
            Owner sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
