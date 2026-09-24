import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * The single browser Supabase client.
 *
 * Only the project URL and the PUBLISHABLE (anon) key are used here. Both are designed to be
 * public — Row Level Security in Postgres is what protects the data. The service-role key must
 * never be placed in a VITE_ variable.
 */
function normalizeSupabaseUrl(rawUrl: string | undefined): string | undefined {
  if (!rawUrl) return undefined;
  const trimmed = rawUrl.trim().replace(/\/+$/, "");
  return trimmed.replace(/\/rest\/v1\/?$/, "");
}

const url = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key && /^https?:\/\//.test(url));

/** New-style keys (sb_publishable_…) are opaque, not JWTs, so they must not be sent as a bearer token. */
function createSupabaseFetch(apiKey: string): typeof fetch {
  const isOpaqueKey = apiKey.startsWith("sb_publishable_") || apiKey.startsWith("sb_secret_");
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, name) => headers.set(name, value));
    }
    if (isOpaqueKey && headers.get("Authorization") === `Bearer ${apiKey}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", apiKey);
    return fetch(input, { ...init, headers });
  };
}

const resolvedKey = key ?? "not-configured";

// When env vars are missing we still create a (never-used) client so imports stay simple;
// every service checks `isSupabaseConfigured` first and falls back to demo data.
export const supabase = createClient<Database>(url ?? "http://localhost:54321", resolvedKey, {
  global: { fetch: createSupabaseFetch(resolvedKey) },
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export class NotConfiguredError extends Error {
  constructor() {
    super(
      "Supabase is not connected yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env file.",
    );
    this.name = "NotConfiguredError";
  }
}

export function assertConfigured(): void {
  if (!isSupabaseConfigured) throw new NotConfiguredError();
}
