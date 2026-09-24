import { z } from "zod";
import { GENDERS, PUPPY_STATUSES } from "@/types/database";
import type { PuppyInsert, SiteSettings } from "@/types/database";

/* Form state is always strings; these schemas validate it and the helpers below convert to DB values. */

const isoDate = z
  .string()
  .trim()
  .refine((v) => v === "" || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))), {
    message: "Use a valid date.",
  });

const optionalUrl = z
  .string()
  .trim()
  .max(500, "That link is too long.")
  .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), {
    message: "Use a full link starting with https://",
  });

export const puppyFormSchema = z.object({
  name: z.string().trim().min(1, "Enter a name.").max(60, "Keep the name under 60 characters."),
  breed: z.string().trim().min(1, "Enter a breed.").max(80, "Keep the breed under 80 characters."),
  gender: z.enum(GENDERS),
  date_of_birth: isoDate.refine((v) => v === "" || Date.parse(v) <= Date.now(), {
    message: "Date of birth can't be in the future.",
  }),
  color: z.string().trim().max(80),
  weight: z.string().trim().max(40),
  location: z.string().trim().max(120),
  description: z.string().trim().max(2000, "Keep the description under 2,000 characters."),
  temperament: z.string().trim().max(500),
  health_information: z.string().trim().max(1000),
  vaccination_status: z.string().trim().max(200),
  adoption_fee: z
    .string()
    .trim()
    .refine((v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0), {
      message: "Enter a fee of 0 or more.",
    }),
  status: z.enum(PUPPY_STATUSES as [string, ...string[]]),
  adoption_date: isoDate,
});
export type PuppyFormValues = z.infer<typeof puppyFormSchema>;

const orNull = (value: string): string | null => (value.trim() === "" ? null : value.trim());

export function toPuppyPayload(values: PuppyFormValues): Omit<PuppyInsert, "slug"> {
  const status = values.status as PuppyInsert["status"];
  const today = new Date().toISOString().slice(0, 10);
  return {
    name: values.name.trim(),
    breed: values.breed.trim(),
    gender: values.gender,
    date_of_birth: orNull(values.date_of_birth),
    color: orNull(values.color),
    weight: orNull(values.weight),
    location: orNull(values.location),
    description: orNull(values.description),
    temperament: orNull(values.temperament),
    health_information: orNull(values.health_information),
    vaccination_status: orNull(values.vaccination_status),
    adoption_fee: values.adoption_fee.trim() === "" ? null : Number(values.adoption_fee),
    status,
    adoption_date: status === "ADOPTED" ? (orNull(values.adoption_date) ?? today) : null,
  };
}

export const enquirySchema = z
  .object({
    name: z.string().trim().min(2, "Tell us your name.").max(120, "That name is too long."),
    email: z
      .string()
      .trim()
      .max(254)
      .refine((v) => v === "" || z.string().email().safeParse(v).success, {
        message: "Enter a valid email address.",
      }),
    phone: z
      .string()
      .trim()
      .refine((v) => v === "" || /^[+\d\s().-]{6,25}$/.test(v), {
        message: "Enter a valid phone number.",
      }),
    message: z
      .string()
      .trim()
      .min(5, "Write a short message (at least 5 characters).")
      .max(2000, "Keep the message under 2,000 characters."),
    website: z.string().max(0), // honeypot: real people never see or fill this
  })
  .refine((v) => v.email !== "" || v.phone !== "", {
    path: ["email"],
    message: "Add an email or a phone number so we can reply.",
  });
export type EnquiryFormValues = z.infer<typeof enquirySchema>;

export const testimonialFormSchema = z.object({
  customer_name: z.string().trim().min(2, "Enter the customer's name.").max(80),
  puppy_name: z.string().trim().max(60),
  rating: z.number().int().min(1).max(5),
  testimonial: z
    .string()
    .trim()
    .min(10, "Write at least 10 characters.")
    .max(1000, "Keep it under 1,000 characters."),
  customer_image: optionalUrl,
  approved: z.boolean(),
});
export type TestimonialFormValues = z.infer<typeof testimonialFormSchema>;

export const settingsFormSchema = z.object({
  site_name: z.string().trim().min(1, "Enter your adoption home's name.").max(80),
  hero_title: z.string().trim().max(120),
  hero_subtitle: z.string().trim().max(300),
  hero_image: optionalUrl,
  about_text: z.string().trim().max(2000),
  phone: z.string().trim().max(30),
  whatsapp: z.string().trim().max(30),
  email: z
    .string()
    .trim()
    .refine((v) => v === "" || z.string().email().safeParse(v).success, {
      message: "Enter a valid email.",
    }),
  location: z.string().trim().max(120),
  contact_hours: z.string().trim().max(120),
  instagram: optionalUrl,
  facebook: optionalUrl,
  tiktok: optionalUrl,
  youtube: optionalUrl,
});
export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export function settingsToForm(s: SiteSettings): SettingsFormValues {
  return {
    site_name: s.site_name,
    hero_title: s.hero_title ?? "",
    hero_subtitle: s.hero_subtitle ?? "",
    hero_image: s.hero_image ?? "",
    about_text: s.about_text ?? "",
    phone: s.phone ?? "",
    whatsapp: s.whatsapp ?? "",
    email: s.email ?? "",
    location: s.location ?? "",
    contact_hours: s.contact_hours ?? "",
    instagram: s.instagram ?? "",
    facebook: s.facebook ?? "",
    tiktok: s.tiktok ?? "",
    youtube: s.youtube ?? "",
  };
}

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const newPasswordSchema = z
  .object({
    password: z.string().min(10, "Use at least 10 characters."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "The passwords don't match.",
  });

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
