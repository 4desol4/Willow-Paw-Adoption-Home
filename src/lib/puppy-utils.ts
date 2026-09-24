import {
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
  format,
  parseISO,
} from "date-fns";
import type { Puppy, PuppyImage } from "@/types/database";

export function puppyAge(dateOfBirth: string | null): string {
  if (!dateOfBirth) return "Age unknown";
  const dob = parseISO(dateOfBirth);
  const months = differenceInMonths(new Date(), dob);
  if (months >= 12) {
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? "s" : ""}`;
  }
  if (months >= 1) return `${months} month${months > 1 ? "s" : ""}`;
  const weeks = differenceInWeeks(new Date(), dob);
  if (weeks >= 1) return `${weeks} week${weeks > 1 ? "s" : ""}`;
  return `${Math.max(differenceInDays(new Date(), dob), 0)} days`;
}

export function ageInMonths(dateOfBirth: string | null): number {
  if (!dateOfBirth) return 999;
  return differenceInMonths(new Date(), parseISO(dateOfBirth));
}

export function formatDate(value: string | null, pattern = "d MMM yyyy"): string {
  if (!value) return "—";
  try {
    return format(parseISO(value), pattern);
  } catch {
    return "—";
  }
}

export function formatFee(fee: number | string | null): string {
  if (fee === null || fee === undefined || fee === "") return "Enquire";
  const value = typeof fee === "string" ? Number(fee) : fee;
  if (Number.isNaN(value)) return "Enquire";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function slugify(name: string, breed: string): string {
  return `${name}-${breed}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function primaryImage(images: PuppyImage[] | null | undefined): PuppyImage | null {
  if (!images || images.length === 0) return null;
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  return sorted.find((image) => image.is_primary) ?? sorted[0] ?? null;
}

export function sortImages(images: PuppyImage[] | null | undefined): PuppyImage[] {
  if (!images) return [];
  return [...images].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order,
  );
}

export function puppyAltText(puppy: Pick<Puppy, "name" | "breed">): string {
  return `${puppy.name}, a ${puppy.breed} puppy available for adoption`;
}
