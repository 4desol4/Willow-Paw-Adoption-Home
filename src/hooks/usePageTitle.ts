import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

/** Sets the browser tab title: "Page | Site name" (or just the site name when no page title is given). */
export function usePageTitle(title?: string) {
  const { settings } = useSiteSettings();
  useEffect(() => {
    document.title = title ? `${title} | ${settings.site_name}` : settings.site_name;
  }, [title, settings.site_name]);
}
