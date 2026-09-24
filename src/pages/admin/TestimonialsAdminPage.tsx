import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CheckField, SelectField, TextAreaField, TextField } from "@/components/forms/Fields";
import { AdminPage } from "@/components/ui/AdminPage";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { Stars } from "@/components/ui/Stars";
import { useFormState } from "@/hooks/useFormState";
import { usePageTitle } from "@/hooks/usePageTitle";
import { testimonialKeys, useAdminTestimonials } from "@/hooks/useTestimonials";
import { fieldErrors, testimonialFormSchema, type TestimonialFormValues } from "@/lib/validation";
import { cn, getErrorMessage } from "@/lib/utils";
import {
  createTestimonial,
  deleteTestimonial,
  setTestimonialApproved,
  updateTestimonial,
} from "@/services/testimonialService";
import type { Testimonial } from "@/types/database";

const validate = (values: TestimonialFormValues) => {
  const result = testimonialFormSchema.safeParse(values);
  return result.success ? {} : fieldErrors(result.error);
};

function TestimonialForm({ item, onDone }: { item: Testimonial | null; onDone: () => void }) {
  const queryClient = useQueryClient();
  const form = useFormState<TestimonialFormValues>(
    {
      customer_name: item?.customer_name ?? "",
      puppy_name: item?.puppy_name ?? "",
      rating: item?.rating ?? 5,
      testimonial: item?.testimonial ?? "",
      customer_image: item?.customer_image ?? "",
      approved: item?.approved ?? true,
    },
    validate,
  );

  const save = useMutation({
    mutationFn: () =>
      item ? updateTestimonial(item.id, form.values) : createTestimonial(form.values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success(item ? "Testimonial updated" : "Testimonial added");
      onDone();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <form
      noValidate
      className="mt-6 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (form.submit()) save.mutate();
      }}
    >
      <TextField label="Customer name" required {...form.bind("customer_name")} />
      <TextField label="Puppy's name" {...form.bind("puppy_name")} />
      <SelectField
        label="Rating"
        value={String(form.values.rating)}
        onChange={(e) => form.set("rating", Number(e.target.value))}
      >
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {n} {n === 1 ? "star" : "stars"}
          </option>
        ))}
      </SelectField>
      <TextAreaField label="Testimonial" required rows={4} {...form.bind("testimonial")} />
      <TextField
        label="Photo link (optional)"
        type="url"
        placeholder="https://"
        {...form.bind("customer_image")}
      />
      <CheckField
        label="Show on the website"
        checked={form.values.approved}
        onChange={(e) => form.set("approved", e.target.checked)}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" state={save.isPending ? "loading" : "idle"}>
          Save
        </Button>
      </div>
    </form>
  );
}

export default function TestimonialsAdminPage() {
  usePageTitle("Manage testimonials");
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useAdminTestimonials();
  const [editing, setEditing] = useState<Testimonial | "new" | null>(null);
  const [toDelete, setToDelete] = useState<Testimonial | null>(null);

  const approve = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      setTestimonialApproved(id, approved),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["testimonials"] }),
    onError: (err) => toast.error(getErrorMessage(err)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteTestimonial(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: testimonialKeys.all });
      void queryClient.invalidateQueries({ queryKey: testimonialKeys.approved });
      setToDelete(null);
      toast.success("Testimonial deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const items = data ?? [];

  return (
    <AdminPage
      title="Testimonials"
      description="Only approved testimonials appear on the website."
      action={
        <Button onClick={() => setEditing("new")}>
          <Plus aria-hidden="true" className="h-4 w-4" /> Add testimonial
        </Button>
      }
    >
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No testimonials yet"
          description="Add one from a family you've matched with a puppy."
        />
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn("rounded-3xl border border-line p-6", !item.approved && "bg-surface")}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{item.customer_name}</p>
                  <p className="text-sm text-muted">
                    {item.puppy_name ? `Family of ${item.puppy_name}` : "No puppy named"}
                  </p>
                </div>
                <Stars rating={item.rating} />
              </div>
              <p className="mt-4">{item.testimonial}</p>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <CheckField
                  label="Show on the website"
                  checked={item.approved}
                  disabled={approve.isPending}
                  onChange={(e) => approve.mutate({ id: item.id, approved: e.target.checked })}
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(item)}
                    aria-label={`Edit testimonial from ${item.customer_name}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink/10"
                  >
                    <Pencil aria-hidden="true" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(item)}
                    aria-label={`Delete testimonial from ${item.customer_name}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-coral hover:bg-coral/10"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add a testimonial" : "Edit testimonial"}
        size="lg"
      >
        {editing !== null ? (
          <TestimonialForm
            key={editing === "new" ? "new" : editing.id}
            item={editing === "new" ? null : editing}
            onDone={() => setEditing(null)}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this testimonial?"
        message={`The testimonial from ${toDelete?.customer_name ?? "this customer"} will be removed for good.`}
        confirmLabel="Delete"
        loading={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
        onClose={() => setToDelete(null)}
      />
    </AdminPage>
  );
}
