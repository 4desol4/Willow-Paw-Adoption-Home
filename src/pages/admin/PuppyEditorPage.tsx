import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ImageManager, type Cover, type PendingImage } from "@/components/forms/ImageManager";
import { SelectField, TextAreaField, TextField } from "@/components/forms/Fields";
import { AdminPage } from "@/components/ui/AdminPage";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { useFormState } from "@/hooks/useFormState";
import { usePageTitle } from "@/hooks/usePageTitle";
import { puppyKeys, usePuppyById } from "@/hooks/usePuppies";
import {
  fieldErrors,
  puppyFormSchema,
  toPuppyPayload,
  type PuppyFormValues,
} from "@/lib/validation";
import { getErrorMessage } from "@/lib/utils";
import {
  addPuppyImages,
  createPuppy,
  deletePuppyImage,
  setPrimaryImage,
  updatePuppy,
} from "@/services/puppyService";
import { uploadImage } from "@/services/storageService";
import {
  GENDERS,
  PUPPY_STATUSES,
  STATUS_LABEL,
  type PuppyImage,
  type PuppyWithImages,
} from "@/types/database";

const validate = (values: PuppyFormValues) => {
  const result = puppyFormSchema.safeParse(values);
  return result.success ? {} : fieldErrors(result.error);
};

const EMPTY: PuppyFormValues = {
  name: "",
  breed: "",
  gender: "Female",
  date_of_birth: "",
  color: "",
  weight: "",
  location: "",
  description: "",
  temperament: "",
  health_information: "",
  vaccination_status: "",
  adoption_fee: "",
  status: "AVAILABLE",
  adoption_date: "",
};

function toFormValues(puppy: PuppyWithImages): PuppyFormValues {
  return {
    name: puppy.name,
    breed: puppy.breed,
    gender: puppy.gender === "Male" ? "Male" : "Female",
    date_of_birth: puppy.date_of_birth ?? "",
    color: puppy.color ?? "",
    weight: puppy.weight ?? "",
    location: puppy.location ?? "",
    description: puppy.description ?? "",
    temperament: puppy.temperament ?? "",
    health_information: puppy.health_information ?? "",
    vaccination_status: puppy.vaccination_status ?? "",
    adoption_fee: puppy.adoption_fee === null ? "" : String(puppy.adoption_fee),
    status: puppy.status,
    adoption_date: puppy.adoption_date ?? "",
  };
}

function PuppyForm({ puppy }: { puppy: PuppyWithImages | null }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useFormState<PuppyFormValues>(puppy ? toFormValues(puppy) : EMPTY, validate);
  const [existing, setExisting] = useState<PuppyImage[]>(puppy?.puppy_images ?? []);
  const [removed, setRemoved] = useState<PuppyImage[]>([]);
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [cover, setCover] = useState<Cover>(() => {
    const primary = puppy?.puppy_images.find((image) => image.is_primary) ?? puppy?.puppy_images[0];
    return primary ? { kind: "existing", id: primary.id } : null;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // If the puppy row is created but a later step fails, a retry must update it rather than create a duplicate.
  const savedId = useRef<string | null>(puppy?.id ?? null);

  const removeExisting = (image: PuppyImage) => {
    setExisting((list) => list.filter((i) => i.id !== image.id));
    setRemoved((list) => [...list, image]);
    if (cover?.kind === "existing" && cover.id === image.id) setCover(null);
  };
  const removePending = (id: string) => {
    setPending((list) => {
      const target = list.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return list.filter((i) => i.id !== id);
    });
    if (cover?.kind === "pending" && cover.id === id) setCover(null);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!form.submit()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    try {
      const payload = toPuppyPayload(form.values);
      let puppyId = savedId.current;
      if (puppyId) {
        await updatePuppy(puppyId, payload);
      } else {
        puppyId = (await createPuppy(payload)).id;
        savedId.current = puppyId;
      }

      for (const image of removed) await deletePuppyImage(image);
      setRemoved([]);

      const uploaded = [];
      for (const item of pending) uploaded.push(await uploadImage(item.file, `puppies/${puppyId}`));
      const startOrder = existing.reduce((max, image) => Math.max(max, image.sort_order + 1), 0);
      const inserted = await addPuppyImages(puppyId, uploaded, startOrder, false);

      // Work out which photo is the cover: the chosen one, else the first available.
      let coverId: string | null = null;
      if (cover?.kind === "existing") coverId = cover.id;
      if (cover?.kind === "pending")
        coverId = inserted[pending.findIndex((i) => i.id === cover.id)]?.id ?? null;
      coverId ??= existing[0]?.id ?? inserted[0]?.id ?? null;
      if (coverId) await setPrimaryImage(puppyId, coverId);

      await queryClient.invalidateQueries({ queryKey: puppyKeys.all });
      pending.forEach((item) => URL.revokeObjectURL(item.preview));
      toast.success(puppy ? "Puppy updated" : "Puppy added");
      navigate("/admin/puppies");
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error("Couldn't save everything. See the message above the button.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-10">
      <section className="grid gap-5 sm:grid-cols-2" aria-label="Basics">
        <TextField label="Name" required {...form.bind("name")} />
        <TextField label="Breed" required {...form.bind("breed")} />
        <SelectField label="Gender" {...form.bind("gender")}>
          {GENDERS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </SelectField>
        <TextField label="Date of birth" type="date" {...form.bind("date_of_birth")} />
        <TextField label="Colour" {...form.bind("color")} />
        <TextField label="Weight" placeholder="e.g. 6.2 kg" {...form.bind("weight")} />
        <TextField label="Location" {...form.bind("location")} />
        <TextField
          label="Adoption fee (₦)"
          type="number"
          min={0}
          step="1000"
          inputMode="numeric"
          {...form.bind("adoption_fee")}
        />
        <SelectField label="Status" {...form.bind("status")}>
          {PUPPY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </SelectField>
        {form.values.status === "ADOPTED" ? (
          <TextField
            label="Adoption date"
            type="date"
            hint="Leave blank to use today."
            {...form.bind("adoption_date")}
          />
        ) : null}
      </section>

      <section className="space-y-5" aria-label="Details">
        <TextAreaField label="Description" rows={4} {...form.bind("description")} />
        <TextAreaField label="Temperament" rows={2} {...form.bind("temperament")} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Vaccination status" {...form.bind("vaccination_status")} />
          <TextField label="Health information" {...form.bind("health_information")} />
        </div>
      </section>

      <section aria-labelledby="photos">
        <h2 id="photos" className="mb-4 font-display text-display-sm">
          Photos
        </h2>
        <ImageManager
          existing={existing}
          pending={pending}
          cover={cover}
          disabled={saving}
          onAdd={(items) => {
            setPending((list) => [...list, ...items]);
            setCover((current) => current ?? { kind: "pending", id: items[0]?.id ?? "" });
          }}
          onRemoveExisting={removeExisting}
          onRemovePending={removePending}
          onCover={setCover}
        />
      </section>

      {error ? (
        <p role="alert" className="rounded-2xl bg-coral/10 p-4 text-coral">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" state={saving ? "loading" : "idle"}>
          {saving ? "Saving" : "Save puppy"}
        </Button>
        <ButtonLink to="/admin/puppies" variant="ghost" size="lg">
          Cancel
        </ButtonLink>
      </div>
    </form>
  );
}

export default function PuppyEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error, refetch } = usePuppyById(id);
  usePageTitle(id ? "Edit puppy" : "Add a puppy");

  return (
    <AdminPage
      title={id ? "Edit puppy" : "Add a puppy"}
      action={
        <Link
          to="/admin/puppies"
          className="flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> All puppies
        </Link>
      }
    >
      {id && isLoading ? (
        <Skeleton className="h-96" />
      ) : id && isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : id && !data ? (
        <EmptyState
          title="That puppy doesn't exist"
          action={<ButtonLink to="/admin/puppies">Back to puppies</ButtonLink>}
        />
      ) : (
        <PuppyForm key={data?.id ?? "new"} puppy={data ?? null} />
      )}
    </AdminPage>
  );
}
