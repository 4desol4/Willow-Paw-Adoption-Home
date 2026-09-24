import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];

export type PuppyStatus = Database["public"]["Enums"]["puppy_status"];

export type Puppy = Tables["puppies"]["Row"];
export type PuppyInsert = Tables["puppies"]["Insert"];
export type PuppyImage = Tables["puppy_images"]["Row"];
export type Testimonial = Tables["testimonials"]["Row"];
export type SiteSettings = Tables["site_settings"]["Row"];
export type Enquiry = Tables["enquiries"]["Row"];
export type EnquiryInsert = Tables["enquiries"]["Insert"];

export type PuppyWithImages = Puppy & { puppy_images: PuppyImage[] };
export type EnquiryWithPuppy = Enquiry & { puppies: Pick<Puppy, "name" | "slug"> | null };

export const PUPPY_STATUSES: PuppyStatus[] = ["AVAILABLE", "RESERVED", "ADOPTED"];
export const STATUS_LABEL: Record<PuppyStatus, string> = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  ADOPTED: "Adopted",
};
export const GENDERS = ["Female", "Male"] as const;
export type Gender = (typeof GENDERS)[number];
