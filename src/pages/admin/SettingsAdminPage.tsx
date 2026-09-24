import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TextAreaField, TextField } from "@/components/forms/Fields";
import { AdminPage } from "@/components/ui/AdminPage";
import { Button } from "@/components/ui/Button";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { useFormState } from "@/hooks/useFormState";
import { usePageTitle } from "@/hooks/usePageTitle";
import { siteSettingsKey } from "@/hooks/useSiteSettings";
import {
  fieldErrors,
  settingsFormSchema,
  settingsToForm,
  type SettingsFormValues,
} from "@/lib/validation";
import { getErrorMessage } from "@/lib/utils";
import { fetchSiteSettings, updateSiteSettings } from "@/services/settingsService";
import { removeStorageObjects, uploadImage } from "@/services/storageService";
import type { SiteSettings } from "@/types/database";

const validate = (values: SettingsFormValues) => {
  const result = settingsFormSchema.safeParse(values);
  return result.success ? {} : fieldErrors(result.error);
};

function SettingsForm({ settings }: { settings: SiteSettings }) {
  const queryClient = useQueryClient();
  const form = useFormState<SettingsFormValues>(settingsToForm(settings), validate);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const uploadedPath = useRef<string | null>(null);

  const save = useMutation({
    mutationFn: () => updateSiteSettings(settings.id, form.values),
    onSuccess: () => {
      uploadedPath.current = null;
      void queryClient.invalidateQueries({ queryKey: siteSettingsKey });
      toast.success("Settings saved");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onPickImage = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadImage(file, "site");
      if (uploadedPath.current) void removeStorageObjects([uploadedPath.current]); // drop an earlier unsaved upload
      uploadedPath.current = uploaded.storage_path;
      form.set("hero_image", uploaded.image_url);
      toast.success("Photo uploaded. Save to publish it.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <form
      noValidate
      className="space-y-10"
      onSubmit={(event) => {
        event.preventDefault();
        if (!form.submit()) {
          toast.error("Please fix the highlighted fields.");
          return;
        }
        save.mutate();
      }}
    >
      <section className="grid gap-5 sm:grid-cols-2" aria-labelledby="brand">
        <h2 id="brand" className="font-display text-display-sm sm:col-span-2">
          Brand and home page
        </h2>
        <TextField label="Adoption home name" required {...form.bind("site_name")} />
        <TextField label="Home page headline" {...form.bind("hero_title")} />
        <div className="sm:col-span-2">
          <TextField label="Home page subheading" {...form.bind("hero_subtitle")} />
        </div>
        <div className="sm:col-span-2">
          <TextField
            label="Main photo link"
            type="url"
            hint="Paste a link, or upload a photo below."
            {...form.bind("hero_image")}
          />
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              state={uploading ? "loading" : "idle"}
              onClick={() => fileRef.current?.click()}
            >
              Upload a photo
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => void onPickImage(e.target.files?.[0])}
            />
          </div>
        </div>
        <div className="sm:col-span-2">
          <TextAreaField label="About text" rows={5} {...form.bind("about_text")} />
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2" aria-labelledby="contact">
        <h2 id="contact" className="font-display text-display-sm sm:col-span-2">
          Contact details
        </h2>
        <TextField label="Phone" type="tel" {...form.bind("phone")} />
        <TextField
          label="WhatsApp number"
          type="tel"
          hint="Digits with country code, e.g. 2348012345678"
          {...form.bind("whatsapp")}
        />
        <TextField label="Email" type="email" {...form.bind("email")} />
        <TextField label="Location" {...form.bind("location")} />
        <div className="sm:col-span-2">
          <TextField label="Opening hours" {...form.bind("contact_hours")} />
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2" aria-labelledby="social">
        <h2 id="social" className="font-display text-display-sm sm:col-span-2">
          Social links
        </h2>
        <TextField
          label="Instagram"
          type="url"
          placeholder="https://"
          {...form.bind("instagram")}
        />
        <TextField label="Facebook" type="url" placeholder="https://" {...form.bind("facebook")} />
        <TextField label="TikTok" type="url" placeholder="https://" {...form.bind("tiktok")} />
        <TextField label="YouTube" type="url" placeholder="https://" {...form.bind("youtube")} />
      </section>

      <Button type="submit" size="lg" state={save.isPending ? "loading" : "idle"}>
        Save settings
      </Button>
    </form>
  );
}

export default function SettingsAdminPage() {
  usePageTitle("Settings");
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: siteSettingsKey,
    queryFn: fetchSiteSettings,
  });
  const seeded = data && data.id !== "demo-settings" ? data : null;

  return (
    <AdminPage title="Settings" description="These details appear across the whole website.">
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : !seeded ? (
        <ErrorState message="No settings row exists in the database yet. Run the seed from the first migration (the INSERT INTO site_settings statement) and reload." />
      ) : (
        <SettingsForm key={seeded.updated_at} settings={seeded} />
      )}
    </AdminPage>
  );
}
