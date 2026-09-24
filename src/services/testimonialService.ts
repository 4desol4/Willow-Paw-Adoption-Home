import { assertConfigured, isSupabaseConfigured, supabase } from "@/lib/supabase";
import { demoTestimonials } from "@/lib/demo-data";
import type { Testimonial } from "@/types/database";
import type { TestimonialFormValues } from "@/lib/validation";

export async function listApprovedTestimonials(): Promise<Testimonial[]> {
  if (!isSupabaseConfigured) return demoTestimonials;
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Owner only: RLS returns unapproved rows just to the owner. */
export async function listAllTestimonials(): Promise<Testimonial[]> {
  assertConfigured();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

function toRow(values: TestimonialFormValues) {
  return {
    customer_name: values.customer_name.trim(),
    puppy_name: values.puppy_name.trim() || null,
    rating: values.rating,
    testimonial: values.testimonial.trim(),
    customer_image: values.customer_image.trim() || null,
    approved: values.approved,
  };
}

export async function createTestimonial(values: TestimonialFormValues): Promise<void> {
  assertConfigured();
  const { error } = await supabase.from("testimonials").insert(toRow(values));
  if (error) throw error;
}

export async function updateTestimonial(id: string, values: TestimonialFormValues): Promise<void> {
  assertConfigured();
  const { error } = await supabase.from("testimonials").update(toRow(values)).eq("id", id);
  if (error) throw error;
}

export async function setTestimonialApproved(id: string, approved: boolean): Promise<void> {
  assertConfigured();
  const { error } = await supabase.from("testimonials").update({ approved }).eq("id", id);
  if (error) throw error;
}

export async function deleteTestimonial(id: string): Promise<void> {
  assertConfigured();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) throw error;
}
