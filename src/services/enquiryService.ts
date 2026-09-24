import { assertConfigured, isSupabaseConfigured, supabase } from "@/lib/supabase";
import { enquiryMailtoLink } from "@/lib/contact";
import type { EnquiryWithPuppy } from "@/types/database";
import type { EnquiryFormValues } from "@/lib/validation";

/**
 * Anyone may submit; only the owner can read. There is deliberately no `.select()` after the
 * insert: visitors have no SELECT permission, so asking for the row back would fail under RLS.
 */
export async function submitEnquiry(
  values: EnquiryFormValues,
  puppyId: string | null,
): Promise<void> {
  if (!isSupabaseConfigured) {
    // Demo mode: pretend it worked so the flow can be reviewed without a backend.
    await new Promise((resolve) => setTimeout(resolve, 700));
    return;
  }
  const { error } = await supabase.from("enquiries").insert({
    name: values.name.trim(),
    email: values.email.trim() || null,
    phone: values.phone.trim() || null,
    message: values.message.trim(),
    puppy_id: puppyId,
    source: puppyId ? "puppy" : "contact",
  });
  if (error) throw error;

  if (typeof window !== "undefined") {
    try {
      const { data, error: settingsError } = await supabase
        .from("site_settings")
        .select("email")
        .limit(1)
        .maybeSingle();
      if (!settingsError && data?.email) {
        const mailto = enquiryMailtoLink(data.email, {
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          message: values.message.trim(),
          puppyName: puppyId ? undefined : undefined,
        });
        window.location.href = mailto;
      }
    } catch {
      // Ignore mail-client errors so the saved enquiry still counts.
    }
  }
}

export async function listEnquiries(): Promise<EnquiryWithPuppy[]> {
  assertConfigured();
  const { data, error } = await supabase
    .from("enquiries")
    .select("*, puppies(name, slug)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as EnquiryWithPuppy[];
}

export async function setEnquiryHandled(id: string, handled: boolean): Promise<void> {
  assertConfigured();
  const { error } = await supabase
    .from("enquiries")
    .update({
      status: handled ? "handled" : "new",
      handled_at: handled ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteEnquiry(id: string): Promise<void> {
  assertConfigured();
  const { error } = await supabase.from("enquiries").delete().eq("id", id);
  if (error) throw error;
}
