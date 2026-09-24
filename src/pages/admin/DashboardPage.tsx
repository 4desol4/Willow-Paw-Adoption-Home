import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { AdminPage } from "@/components/ui/AdminPage";
import { ButtonLink } from "@/components/ui/Button";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { useAdminTestimonials } from "@/hooks/useTestimonials";
import { useEnquiries } from "@/hooks/useEnquiries";
import { usePageTitle } from "@/hooks/usePageTitle";
import { usePuppies } from "@/hooks/usePuppies";
import { formatDate } from "@/lib/puppy-utils";
import { getErrorMessage } from "@/lib/utils";

function Stat({ label, value, to }: { label: string; value: number; to: string }) {
  return (
    <Link to={to} className="rounded-3xl bg-surface p-6 transition-colors hover:bg-sun/20">
      <p className="font-display text-display-lg">{value}</p>
      <p className="text-muted">{label}</p>
    </Link>
  );
}

export default function DashboardPage() {
  usePageTitle("Dashboard");
  const puppies = usePuppies();
  const testimonials = useAdminTestimonials();
  const enquiries = useEnquiries();

  if (puppies.isError)
    return (
      <ErrorState message={getErrorMessage(puppies.error)} onRetry={() => void puppies.refetch()} />
    );

  const list = puppies.data ?? [];
  const count = (status: string) => list.filter((p) => p.status === status).length;
  const newEnquiries = (enquiries.data ?? []).filter((e) => e.status === "new");
  const pending = (testimonials.data ?? []).filter((t) => !t.approved).length;

  return (
    <AdminPage
      title="Dashboard"
      description="A quick look at the home."
      action={
        <ButtonLink to="/admin/puppies/new">
          <Plus aria-hidden="true" className="h-4 w-4" /> Add a puppy
        </ButtonLink>
      }
    >
      {puppies.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Available puppies" value={count("AVAILABLE")} to="/admin/puppies" />
          <Stat label="Reserved" value={count("RESERVED")} to="/admin/puppies" />
          <Stat label="Adopted" value={count("ADOPTED")} to="/admin/puppies" />
          <Stat label="New enquiries" value={newEnquiries.length} to="/admin/enquiries" />
          <Stat label="Testimonials awaiting approval" value={pending} to="/admin/testimonials" />
        </div>
      )}

      <section className="mt-12" aria-labelledby="recent">
        <h2 id="recent" className="font-display text-display-sm">
          Newest enquiries
        </h2>
        {newEnquiries.length === 0 ? (
          <p className="mt-3 text-muted">Nothing waiting for a reply.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-3xl border border-line">
            {newEnquiries.slice(0, 5).map((enquiry) => (
              <li
                key={enquiry.id}
                className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-4"
              >
                <span>
                  <span className="font-semibold">{enquiry.name}</span>
                  {enquiry.puppies ? (
                    <span className="text-muted"> asked about {enquiry.puppies.name}</span>
                  ) : null}
                </span>
                <span className="text-sm text-muted">{formatDate(enquiry.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminPage>
  );
}
