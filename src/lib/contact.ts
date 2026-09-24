import type { Puppy, SiteSettings } from "@/types/database";

function digitsOnly(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

export function whatsappLink(number: string | null | undefined, message: string): string {
  return `https://wa.me/${digitsOnly(number)}?text=${encodeURIComponent(message)}`;
}

export function puppyEnquiryMessage(puppy: Pick<Puppy, "name" | "breed">): string {
  return `Hello, I am interested in ${puppy.name}, the ${puppy.breed}. I would like to know more about the puppy and the adoption process.`;
}

export function generalEnquiryMessage(siteName: string | null | undefined): string {
  return `Hello ${siteName ?? "there"}, I would like to know more about adopting a puppy.`;
}

export function telLink(phone: string | null | undefined): string {
  return `tel:${(phone ?? "").replace(/\s/g, "")}`;
}

export function mailtoLink(email: string | null | undefined, subject: string): string {
  return `mailto:${email ?? ""}?subject=${encodeURIComponent(subject)}`;
}

export function enquiryMailtoLink(
  ownerEmail: string | null | undefined,
  values: {
    name: string;
    email: string;
    phone: string;
    message: string;
    puppyName?: string | null;
  },
): string {
  const subject = values.puppyName
    ? `Adoption enquiry about ${values.puppyName}`
    : "Adoption enquiry";
  const body = [
    `Name: ${values.name}`,
    values.email ? `Email: ${values.email}` : null,
    values.phone ? `Phone: ${values.phone}` : null,
    "",
    "Message:",
    values.message,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");

  return `mailto:${ownerEmail ?? ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function socialLinks(settings: SiteSettings | null | undefined) {
  return [
    { key: "instagram", label: "Instagram", url: settings?.instagram },
    { key: "facebook", label: "Facebook", url: settings?.facebook },
    { key: "tiktok", label: "TikTok", url: settings?.tiktok },
    { key: "youtube", label: "YouTube", url: settings?.youtube },
  ].filter((link) => Boolean(link.url));
}
