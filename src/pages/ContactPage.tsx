import { Reveal } from "@/components/animations/Reveal";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import {
  generalEnquiryMessage,
  mailtoLink,
  socialLinks,
  telLink,
  whatsappLink,
} from "@/lib/contact";

export default function ContactPage() {
  usePageTitle("Contact");
  const { settings } = useSiteSettings();
  const socials = socialLinks(settings);
  const big =
    "block font-display text-display-sm underline-offset-4 transition-colors hover:text-accent hover:underline";

  return (
    <>
      <PageHeader
        title="We'd love to hear from you."
        lead="The quickest way to reach us is WhatsApp. The form works too, and we reply to both."
      />
      <section className="container-page grid gap-12 pb-28 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <Reveal>
          <ul className="space-y-8">
            <li>
              <p className="text-sm font-semibold text-muted">WhatsApp</p>
              <a
                href={whatsappLink(settings.whatsapp, generalEnquiryMessage(settings.site_name))}
                target="_blank"
                rel="noopener noreferrer"
                className={big}
              >
                Start a chat
              </a>
            </li>
            {settings.phone ? (
              <li>
                <p className="text-sm font-semibold text-muted">Phone</p>
                <a href={telLink(settings.phone)} className={big}>
                  {settings.phone}
                </a>
              </li>
            ) : null}
            {settings.email ? (
              <li>
                <p className="text-sm font-semibold text-muted">Email</p>
                <a
                  href={mailtoLink(settings.email, "Adoption enquiry")}
                  className={`${big} break-all`}
                >
                  {settings.email}
                </a>
              </li>
            ) : null}
            {settings.location ? (
              <li>
                <p className="text-sm font-semibold text-muted">Find us</p>
                <p className="font-display text-display-sm">{settings.location}</p>
                {settings.contact_hours ? (
                  <p className="text-muted">{settings.contact_hours}</p>
                ) : null}
              </li>
            ) : null}
            {socials.length > 0 ? (
              <li className="flex flex-wrap gap-x-6 gap-y-2">
                {socials.map((link) => (
                  <a
                    key={link.key}
                    href={link.url ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline underline-offset-4 hover:text-accent"
                  >
                    {link.label}
                  </a>
                ))}
              </li>
            ) : null}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative rounded-[2rem] bg-surface p-6 sm:p-10">
            <h2 className="mb-6 font-display text-display-sm">Send a message</h2>
            <EnquiryForm />
          </div>
        </Reveal>
      </section>
    </>
  );
}
