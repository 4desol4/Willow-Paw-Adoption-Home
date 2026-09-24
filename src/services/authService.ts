import type { Session } from "@supabase/supabase-js";
import { assertConfigured, supabase } from "@/lib/supabase";

export async function signInWithPassword(email: string, password: string): Promise<void> {
  assertConfigured();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

/** Magic links never create accounts: only an existing owner account can receive one. */
export async function sendMagicLink(email: string): Promise<void> {
  assertConfigured();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/admin` },
  });
  if (error) throw error;
}

export async function sendPasswordReset(email: string): Promise<void> {
  assertConfigured();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/reset-password`,
  });
  if (error) throw error;
}

export async function updatePassword(password: string): Promise<void> {
  assertConfigured();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/** Reads the caller's own role row (allowed by RLS). Real authorisation is enforced by the database policies, not this check. */
export async function fetchIsOwner(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "owner")
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}
