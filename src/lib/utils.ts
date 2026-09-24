import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Extracts a readable message from Error, PostgrestError, or unknown throwables. */
export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

/** "Golden Paws Adoption Home" → "Golden Paws" for tight spaces like the nav bar. */
export function shortBrand(name: string): string {
  const short = name.replace(/\s+adoption\s+home$/i, "").trim();
  return short || name;
}
