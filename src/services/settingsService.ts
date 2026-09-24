import { assertConfigured, isSupabaseConfigured, supabase } from "@/lib/supabase";
import { fallbackSettings } from "@/lib/demo-data";
import type { SiteSettings } from "@/types/database";
import type { SettingsFormValues } from "@/lib/validation";

export async function fetchSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured) return fallbackSettings;
  const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
  if (error) throw error;
  return data ?? fallbackSettings;
}

export async function updateSiteSettings(id: string, values: SettingsFormValues): Promise<void> {
  assertConfigured();
  const nullable = (v: string) => (v.trim() === "" ? null : v.trim());
  const { error } = await supabase
    .from("site_settings")
    .update({
      site_name: values.site_name.trim(),
      hero_title: nullable(values.hero_title),
      hero_subtitle: nullable(values.hero_subtitle),
      hero_image: nullable(values.hero_image),
      about_text: nullable(values.about_text),
      phone: nullable(values.phone),
      whatsapp: nullable(values.whatsapp),
      email: nullable(values.email),
      location: nullable(values.location),
      contact_hours: nullable(values.contact_hours),
      instagram: nullable(values.instagram),
      facebook: nullable(values.facebook),
      tiktok: nullable(values.tiktok),
      youtube: nullable(values.youtube),
    })
    .eq("id", id);
  if (error) throw error;
}
