import { useEffect, useRef } from "react";
import { ImagePlus, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Img } from "@/components/ui/Img";
import { MAX_IMAGES_PER_PUPPY, validateImageFile } from "@/services/storageService";
import { cn } from "@/lib/utils";
import type { PuppyImage } from "@/types/database";

export type PendingImage = { id: string; file: File; preview: string };
export type Cover = { kind: "existing"; id: string } | { kind: "pending"; id: string } | null;

interface ImageManagerProps {
  existing: PuppyImage[];
  pending: PendingImage[];
  cover: Cover;
  disabled?: boolean;
  onAdd: (files: PendingImage[]) => void;
  onRemoveExisting: (image: PuppyImage) => void;
  onRemovePending: (id: string) => void;
  onCover: (cover: Cover) => void;
}

/** Choose photos (uploaded to Supabase Storage when the puppy is saved), pick a cover, remove extras. */
export function ImageManager({
  existing,
  pending,
  cover,
  disabled,
  onAdd,
  onRemoveExisting,
  onRemovePending,
  onCover,
}: ImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const total = existing.length + pending.length;

  // Release preview URLs when the component goes away.
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  useEffect(
    () => () => pendingRef.current.forEach((item) => URL.revokeObjectURL(item.preview)),
    [],
  );

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const accepted: PendingImage[] = [];
    for (const file of Array.from(list)) {
      if (total + accepted.length >= MAX_IMAGES_PER_PUPPY) {
        toast.error(`A puppy can have up to ${MAX_IMAGES_PER_PUPPY} photos.`);
        break;
      }
      const problem = validateImageFile(file);
      if (problem) {
        toast.error(problem);
        continue;
      }
      accepted.push({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file) });
    }
    if (accepted.length > 0) onAdd(accepted);
    if (inputRef.current) inputRef.current.value = "";
  };

  const tile = (
    key: string,
    src: string,
    isCover: boolean,
    onMakeCover: () => void,
    onRemove: () => void,
    label: string,
  ) => (
    <li key={key} className="relative">
      <Img
        src={src}
        alt=""
        className={cn(
          "aspect-square rounded-2xl border-2",
          isCover ? "border-sun" : "border-transparent",
        )}
        sizes="160px"
      />
      {isCover ? (
        <span className="absolute left-2 top-2 rounded-full bg-sun px-2 py-0.5 text-xs font-bold text-[#121E38]">
          Cover
        </span>
      ) : null}
      <div className="absolute inset-x-2 bottom-2 flex justify-between">
        {!isCover ? (
          <button
            type="button"
            onClick={onMakeCover}
            disabled={disabled}
            aria-label={`Make ${label} the cover photo`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-bg/90 text-ink hover:bg-sun"
          >
            <Star aria-hidden="true" className="h-4 w-4" />
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Remove ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-bg/90 text-coral hover:bg-coral hover:text-bg"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </li>
  );

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {existing.map((image, index) =>
          tile(
            image.id,
            image.image_url,
            cover?.kind === "existing" && cover.id === image.id,
            () => onCover({ kind: "existing", id: image.id }),
            () => onRemoveExisting(image),
            `saved photo ${index + 1}`,
          ),
        )}
        {pending.map((item, index) =>
          tile(
            item.id,
            item.preview,
            cover?.kind === "pending" && cover.id === item.id,
            () => onCover({ kind: "pending", id: item.id }),
            () => onRemovePending(item.id),
            `new photo ${index + 1}`,
          ),
        )}
        {total < MAX_IMAGES_PER_PUPPY ? (
          <li>
            <button
              type="button"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFiles(e.dataTransfer.files);
              }}
              className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line text-sm font-semibold text-muted transition-colors hover:border-accent hover:text-ink"
            >
              <ImagePlus aria-hidden="true" className="h-6 w-6" />
              Add photos
            </button>
          </li>
        ) : null}
      </ul>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="mt-3 text-sm text-muted">
        JPG, PNG or WebP, up to 8 MB each, {MAX_IMAGES_PER_PUPPY} photos at most. Large photos are
        resized before upload.
      </p>
    </div>
  );
}
