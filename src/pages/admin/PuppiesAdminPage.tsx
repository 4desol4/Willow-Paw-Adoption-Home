import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPage } from "@/components/ui/AdminPage";
import { ButtonLink } from "@/components/ui/Button";
import { Img } from "@/components/ui/Img";
import { ConfirmDialog } from "@/components/ui/Modal";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { usePageTitle } from "@/hooks/usePageTitle";
import { puppyKeys, usePuppies } from "@/hooks/usePuppies";
import { formatFee, primaryImage } from "@/lib/puppy-utils";
import { getErrorMessage } from "@/lib/utils";
import { deletePuppy, updatePuppyStatus } from "@/services/puppyService";
import {
  PUPPY_STATUSES,
  STATUS_LABEL,
  type PuppyStatus,
  type PuppyWithImages,
} from "@/types/database";

export default function PuppiesAdminPage() {
  usePageTitle("Manage puppies");
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = usePuppies();
  const [toDelete, setToDelete] = useState<PuppyWithImages | null>(null);

  const statusMutation = useMutation({
    mutationFn: ({ puppy, status }: { puppy: PuppyWithImages; status: PuppyStatus }) =>
      updatePuppyStatus(puppy, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: puppyKeys.all });
      toast.success("Status updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (puppy: PuppyWithImages) => deletePuppy(puppy),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: puppyKeys.all });
      setToDelete(null);
      toast.success("Puppy deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const puppies = data ?? [];

  return (
    <AdminPage
      title="Puppies"
      description="Add, edit and update every listing. Changes go live straight away."
      action={
        <ButtonLink to="/admin/puppies/new">
          <Plus aria-hidden="true" className="h-4 w-4" /> Add a puppy
        </ButtonLink>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : puppies.length === 0 ? (
        <EmptyState
          title="No puppies yet"
          description="Add your first listing to get started."
          action={<ButtonLink to="/admin/puppies/new">Add a puppy</ButtonLink>}
        />
      ) : (
        <ul className="divide-y divide-line rounded-3xl border border-line">
          {puppies.map((puppy) => {
            const image = primaryImage(puppy.puppy_images);
            return (
              <li
                key={puppy.id}
                className="grid items-center gap-4 p-4 sm:grid-cols-[4rem_1fr_auto_auto]"
              >
                <Img src={image?.image_url} alt="" className="h-16 w-16 rounded-2xl" sizes="64px" />
                <div className="min-w-0">
                  <Link to={`/puppies/${puppy.slug}`} className="font-semibold hover:underline">
                    {puppy.name}
                  </Link>
                  <p className="truncate text-sm text-muted">
                    {puppy.breed}, {formatFee(puppy.adoption_fee)}
                  </p>
                </div>
                <div>
                  <label htmlFor={`status-${puppy.id}`} className="sr-only">
                    Status for {puppy.name}
                  </label>
                  <select
                    id={`status-${puppy.id}`}
                    value={puppy.status}
                    disabled={statusMutation.isPending}
                    onChange={(e) =>
                      statusMutation.mutate({ puppy, status: e.target.value as PuppyStatus })
                    }
                    className="rounded-field border border-line bg-bg px-3 py-2 text-sm font-semibold"
                  >
                    {PUPPY_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABEL[status]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-1">
                  <Link
                    to={`/admin/puppies/${puppy.id}/edit`}
                    aria-label={`Edit ${puppy.name}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink/10"
                  >
                    <Pencil aria-hidden="true" className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setToDelete(puppy)}
                    aria-label={`Delete ${puppy.name}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-coral hover:bg-coral/10"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title={`Delete ${toDelete?.name ?? "this puppy"}?`}
        message="The listing and all of its photos will be removed. This can't be undone."
        confirmLabel="Delete puppy"
        loading={deleteMutation.isPending}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete)}
        onClose={() => setToDelete(null)}
      />
    </AdminPage>
  );
}
