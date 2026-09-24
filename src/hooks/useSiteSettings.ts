import { useQuery } from "@tanstack/react-query";
import { fallbackSettings } from "@/lib/demo-data";
import { fetchSiteSettings } from "@/services/settingsService";

export const siteSettingsKey = ["site-settings"] as const;

/** Always returns usable settings: the demo copy is shown until (or if) the real row loads. */
export function useSiteSettings() {
  const query = useQuery({
    queryKey: siteSettingsKey,
    queryFn: fetchSiteSettings,
    staleTime: 5 * 60_000,
  });
  return { settings: query.data ?? fallbackSettings, isLoading: query.isLoading };
}
