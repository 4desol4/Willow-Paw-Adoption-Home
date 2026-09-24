import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { PawPrint } from "lucide-react";
import { toast } from "sonner";
import { TextField } from "@/components/forms/Fields";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useFormState } from "@/hooks/useFormState";
import { usePageTitle } from "@/hooks/usePageTitle";
import { fieldErrors, loginSchema } from "@/lib/validation";
import { isSupabaseConfigured } from "@/lib/supabase";
import { sendMagicLink, sendPasswordReset, signInWithPassword } from "@/services/authService";

type Mode = "password" | "magic" | "forgot";
type Values = { email: string; password: string };

const validate = (values: Values) => {
  const result = loginSchema.safeParse(values);
  return result.success ? {} : fieldErrors(result.error);
};

const COPY: Record<Mode, { title: string; button: string }> = {
  password: { title: "Owner sign in", button: "Sign in" },
  magic: { title: "Email me a sign-in link", button: "Send link" },
  forgot: { title: "Reset your password", button: "Send reset link" },
};

export default function LoginPage() {
  usePageTitle("Owner sign in");
  const { loading, isOwner } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/admin";
  const form = useFormState<Values>({ email: "", password: "" }, validate);
  const [mode, setMode] = useState<Mode>("password");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && isOwner) return <Navigate to={from} replace />;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const emailOnly = mode !== "password";
    const emailError = form.errors["email"];
    const ok = emailOnly ? (form.submit(), emailError === undefined) : form.submit();
    if (!ok) return;
    setBusy(true);
    try {
      if (mode === "password") {
        await signInWithPassword(form.values.email.trim(), form.values.password);
        toast.success("Signed in");
      } else if (mode === "magic") {
        await sendMagicLink(form.values.email.trim());
        setSent(true);
      } else {
        await sendPasswordReset(form.values.email.trim());
        setSent(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(
        /invalid login/i.test(message)
          ? "That email and password don't match."
          : "We couldn't complete that. Check your details and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setSent(false);
    setError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md rounded-[2rem] bg-bg p-8 shadow-[0_30px_80px_-30px_rgba(18,30,56,0.35)] sm:p-10">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"
        >
          <PawPrint aria-hidden="true" className="h-4 w-4" /> Back to the site
        </Link>
        <h1 className="mt-6 font-display text-display-md">{COPY[mode].title}</h1>

        {!isSupabaseConfigured ? (
          <p role="alert" className="mt-6 rounded-2xl bg-sun/25 p-4 text-sm">
            Supabase isn't connected yet. Add your project URL and publishable key to{" "}
            <code>.env</code>, then restart the dev server.
          </p>
        ) : null}

        {sent ? (
          <div role="status" className="mt-6 space-y-2 rounded-2xl bg-leaf/10 p-5">
            <p className="font-semibold">Check your inbox.</p>
            <p className="text-sm text-muted">
              If that address belongs to an owner account, a link is on its way.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              required
              {...form.bind("email")}
            />
            {mode === "password" ? (
              <TextField
                label="Password"
                type="password"
                autoComplete="current-password"
                required
                {...form.bind("password")}
              />
            ) : null}
            {error ? (
              <p role="alert" className="text-sm text-coral">
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              size="lg"
              block
              state={busy ? "loading" : "idle"}
              disabled={!isSupabaseConfigured}
            >
              {COPY[mode].button}
            </Button>
          </form>
        )}

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          {mode !== "password" ? (
            <button
              type="button"
              onClick={() => switchMode("password")}
              className="underline underline-offset-4"
            >
              Use my password
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => switchMode("magic")}
                className="underline underline-offset-4"
              >
                Email me a link
              </button>
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="underline underline-offset-4"
              >
                Forgot password
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
