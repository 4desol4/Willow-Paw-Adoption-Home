import { Suspense, type ReactNode } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import {
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  PawPrint,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/navigation/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useEnquiries } from "@/hooks/useEnquiries";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { isSupabaseConfigured } from "@/lib/supabase";
import { cn, getErrorMessage, shortBrand } from "@/lib/utils";

function FullScreenMessage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="font-display text-display-md">{title}</h1>
        <div className="mt-4 space-y-4 text-muted">{children}</div>
      </div>
    </div>
  );
}

/** Route guard. The database enforces the real permissions; this only decides what the interface shows. */
export function RequireOwner() {
  const { loading, session, isOwner, signOut } = useAuth();
  const location = useLocation();

  if (!isSupabaseConfigured) {
    return (
      <FullScreenMessage title="Connect Supabase to use the admin area">
        <p>
          Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env file, then restart
          the dev server.
        </p>
        <ButtonLink to="/" variant="outline">
          Back to the site
        </ButtonLink>
      </FullScreenMessage>
    );
  }
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status">
        <span className="sr-only">Checking your session</span>
        <PawPrint aria-hidden="true" className="h-8 w-8 animate-pulse text-accent" />
      </div>
    );
  }
  if (!session) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (!isOwner) {
    return (
      <FullScreenMessage title="This account isn't an owner">
        <p>
          You're signed in as {session.user.email}, but that account hasn't been given owner access.
        </p>
        <Button variant="outline" onClick={() => void signOut()}>
          Sign out
        </Button>
      </FullScreenMessage>
    );
  }
  return <AdminShell />;
}

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/puppies", label: "Puppies", icon: PawPrint, end: false },
  { to: "/admin/enquiries", label: "Enquiries", icon: Inbox, end: false },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote, end: false },
  { to: "/admin/settings", label: "Settings", icon: Settings, end: false },
];

function AdminShell() {
  const { user, signOut } = useAuth();
  const { settings } = useSiteSettings();
  const { data: enquiries } = useEnquiries();
  const newCount = (enquiries ?? []).filter((e) => e.status === "new").length;

  const onSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="bg-inverse text-inverse-fg lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="flex items-center justify-between px-5 py-4 lg:block lg:py-6">
          <Link to="/admin" className="font-display text-xl font-bold">
            {shortBrand(settings.site_name)}
            <span className="block text-xs font-medium text-inverse-fg/60">Owner area</span>
          </Link>
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
        </div>
        <nav
          aria-label="Admin"
          className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0"
        >
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors lg:rounded-xl",
                  isActive ? "bg-sun text-[#121E38]" : "text-inverse-fg/80 hover:bg-inverse-fg/10",
                )
              }
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {label}
              {label === "Enquiries" && newCount > 0 ? (
                <span
                  className="rounded-full bg-coral px-2 py-0.5 text-xs text-bg"
                  aria-label={`${newCount} new`}
                >
                  {newCount}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>
        <div className="hidden space-y-3 border-t border-inverse-fg/15 p-5 lg:block">
          <p className="truncate text-sm text-inverse-fg/60">{user?.email}</p>
          <div className="flex items-center justify-between">
            <Link to="/" className="text-sm font-semibold hover:text-sun">
              View site
            </Link>
            <ThemeToggle />
          </div>
          <button
            type="button"
            onClick={() => void onSignOut()}
            className="flex items-center gap-2 text-sm font-semibold hover:text-sun"
          >
            <LogOut aria-hidden="true" className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <main id="main" className="min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <Suspense
          fallback={
            <p role="status" className="text-muted">
              Loading
            </p>
          }
        >
          <Outlet />
        </Suspense>
        <div className="mt-12 flex gap-4 lg:hidden">
          <Link to="/" className="text-sm font-semibold underline">
            View site
          </Link>
          <button
            type="button"
            onClick={() => void onSignOut()}
            className="text-sm font-semibold underline"
          >
            Sign out
          </button>
        </div>
      </main>
    </div>
  );
}
