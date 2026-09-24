import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { fetchIsOwner, getSession, signOut as signOutService } from "@/services/authService";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  /** True only when the signed-in user has the `owner` role in `user_roles`. */
  isOwner: boolean;
  /** True until the session AND the role lookup have both resolved. */
  loading: boolean;
  /** True after the user arrives from a password-reset email link. */
  recovering: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionReady, setSessionReady] = useState(!isSupabaseConfigured);
  const [isOwner, setIsOwner] = useState(false);
  const [ownerReady, setOwnerReady] = useState(true);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    // Keep this callback synchronous: awaiting other Supabase calls inside it can deadlock the client.
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      setSessionReady(true);
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
    });
    getSession()
      .then((current) => setSession(current))
      .catch(() => setSession(null))
      .finally(() => setSessionReady(true));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;

  useEffect(() => {
    if (!userId) {
      setIsOwner(false);
      setOwnerReady(true);
      return;
    }
    let cancelled = false;
    setOwnerReady(false);
    fetchIsOwner(userId)
      .then((value) => !cancelled && setIsOwner(value))
      .catch(() => !cancelled && setIsOwner(false))
      .finally(() => !cancelled && setOwnerReady(true));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const signOut = useCallback(async () => {
    await signOutService();
    setRecovering(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isOwner,
      loading: !sessionReady || !ownerReady,
      recovering,
      signOut,
    }),
    [session, isOwner, sessionReady, ownerReady, recovering, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
