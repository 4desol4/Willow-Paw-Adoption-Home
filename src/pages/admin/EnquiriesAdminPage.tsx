import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPage } from "@/components/ui/AdminPage";
import { ConfirmDialog } from "@/components/ui/Modal";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { enquiryKeys, useEnquiries } from "@/hooks/useEnquiries";
import { usePageTitle } from "@/hooks/usePageTitle";
import { mailtoLink, telLink, whatsappLink } from "@/lib/contact";
import { formatDate } from "@/lib/puppy-utils";
import { cn, getErrorMessage } from "@/lib/utils";
import { deleteEnquiry, setEnquiryHandled } from "@/services/enquiryService";
import type { EnquiryWithPuppy } from "@/types/database";

type Filter = "new" | "handled" | "all";

export default function EnquiriesAdminPage() {
  usePageTitle("Enquiries");
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useEnquiries();
  const [filter, setFilter] = useState<Filter>("new");
  const [toDelete, setToDelete] = useState<EnquiryWithPuppy | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: enquiryKeys.all });
  const handle = useMutation({
    mutationFn: ({ id, handled }: { id: string; handled: boolean }) =>
      setEnquiryHandled(id, handled),
    onSuccess: () => void refresh(),
    onError: (err) => toast.error(getErrorMessage(err)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteEnquiry(id),
    onSuccess: () => {
      void refresh();
      setToDelete(null);
      toast.success("Enquiry deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const all = data ?? [];
  const items = all.filter((e) => filter === "all" || e.status === filter);
  const tabs: { value: Filter; label: string }[] = [
    { value: "new", label: `New (${all.filter((e) => e.status === "new").length})` },
    { value: "handled", label: "Handled" },
    { value: "all", label: "All" },
  ];

  return (
    <AdminPage title="Enquiries" description="Messages sent from the contact form and puppy pages.">
      <div role="group" aria-label="Filter" className="mb-6 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            aria-pressed={filter === tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              "h-10 rounded-full border px-4 text-sm font-semibold",
              filter === tab.value
                ? "border-sun bg-sun text-[#121E38]"
                : "border-line hover:border-ink/40",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          title={filter === "new" ? "You're all caught up" : "Nothing here"}
          description="New messages will appear as soon as someone writes to you."
        />
      ) : (
        <ul className="space-y-4">
          {items.map((enquiry) => (
            <li
              key={enquiry.id}
              className={cn(
                "rounded-3xl border border-line p-6",
                enquiry.status === "handled" && "bg-surface",
              )}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">
                  {enquiry.name}
                  {enquiry.puppies ? (
                    <span className="font-normal text-muted">
                      {" "}
                      asked about{" "}
                      <Link to={`/puppies/${enquiry.puppies.slug}`} className="underline">
                        {enquiry.puppies.name}
                      </Link>
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-muted">{formatDate(enquiry.created_at)}</p>
              </div>
              <p className="mt-3 whitespace-pre-wrap">{enquiry.message}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold">
                {enquiry.email ? (
                  <a
                    className="underline underline-offset-4"
                    href={mailtoLink(enquiry.email, "Your enquiry")}
                  >
                    {enquiry.email}
                  </a>
                ) : null}
                {enquiry.phone ? (
                  <>
                    <a className="underline underline-offset-4" href={telLink(enquiry.phone)}>
                      {enquiry.phone}
                    </a>
                    <a
                      className="underline underline-offset-4"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={whatsappLink(
                        enquiry.phone,
                        `Hello ${enquiry.name}, thank you for your enquiry.`,
                      )}
                    >
                      WhatsApp
                    </a>
                  </>
                ) : null}
                <span className="ml-auto flex gap-1">
                  <button
                    type="button"
                    disabled={handle.isPending}
                    onClick={() =>
                      handle.mutate({ id: enquiry.id, handled: enquiry.status !== "handled" })
                    }
                    className="flex h-10 items-center gap-2 rounded-full px-4 hover:bg-ink/10"
                  >
                    {enquiry.status === "handled" ? (
                      <Undo2 aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <Check aria-hidden="true" className="h-4 w-4" />
                    )}
                    {enquiry.status === "handled" ? "Mark as new" : "Mark as handled"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(enquiry)}
                    aria-label={`Delete enquiry from ${enquiry.name}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-coral hover:bg-coral/10"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this enquiry?"
        message={`The message from ${toDelete?.name ?? "this visitor"} will be removed for good.`}
        confirmLabel="Delete"
        loading={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
        onClose={() => setToDelete(null)}
      />
    </AdminPage>
  );
}
