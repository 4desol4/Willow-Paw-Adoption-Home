import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { TextField } from "@/components/forms/Fields";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useFormState } from "@/hooks/useFormState";
import { usePageTitle } from "@/hooks/usePageTitle";
import { fieldErrors, newPasswordSchema } from "@/lib/validation";
import { updatePassword } from "@/services/authService";

type Values = { password: string; confirm: string };
const validate = (values: Values) => {
  const result = newPasswordSchema.safeParse(values);
  return result.success ? {} : fieldErrors(result.error);
};

/** Landing page for the link in the password-reset email. Supabase signs the user in with a recovery session first. */
export default function ResetPasswordPage() {
  usePageTitle("Choose a new password");
  const { loading, session } = useAuth();
  const navigate = useNavigate();
  const form = useFormState<Values>({ password: "", confirm: "" }, validate);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.submit()) return;
    setBusy(true);
    try {
      await updatePassword(form.values.password);
      toast.success("Password updated");
      navigate("/admin", { replace: true });
    } catch {
      toast.error("We couldn't update the password. The link may have expired; request a new one.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md rounded-[2rem] bg-bg p-8 sm:p-10">
        <h1 className="font-display text-display-md">Choose a new password</h1>
        {!loading && !session ? (
          <div role="alert" className="mt-6 space-y-4">
            <p className="text-muted">This reset link has expired or was already used.</p>
            <Link to="/admin/login" className="font-semibold underline underline-offset-4">
              Request a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
            <TextField
              label="New password"
              type="password"
              autoComplete="new-password"
              hint="At least 10 characters."
              required
              {...form.bind("password")}
            />
            <TextField
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              required
              {...form.bind("confirm")}
            />
            <Button type="submit" size="lg" block state={busy ? "loading" : "idle"}>
              Save password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
