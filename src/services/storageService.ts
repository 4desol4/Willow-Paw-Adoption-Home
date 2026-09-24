import { assertConfigured, supabase } from "@/lib/supabase";

export const MEDIA_BUCKET = "media";
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_IMAGES_PER_PUPPY = 10;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
export const ACCEPTED_IMAGE_TYPES = Object.keys(EXTENSIONS);

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type))
    return `${file.name}: use a JPG, PNG or WebP image.`;
  if (file.size > MAX_IMAGE_BYTES) return `${file.name}: must be smaller than 8 MB.`;
  return null;
}

/** Downscales large photos in the browser (max 2000 px, WebP) so uploads and page loads stay fast. */
async function prepareImage(file: File): Promise<{ blob: Blob; type: string }> {
  if (file.size < 1_500_000) return { blob: file, type: file.type };
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return { blob: file, type: file.type };
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.85),
    );
    return blob && blob.size < file.size
      ? { blob, type: "image/webp" }
      : { blob: file, type: file.type };
  } catch {
    return { blob: file, type: file.type };
  }
}

export type UploadedFile = { image_url: string; storage_path: string };

export async function uploadImage(file: File, folder: string): Promise<UploadedFile> {
  assertConfigured();
  const problem = validateImageFile(file);
  if (problem) throw new Error(problem);
  const { blob, type } = await prepareImage(file);
  const extension = EXTENSIONS[type] ?? "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, blob, { cacheControl: "31536000", contentType: type, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { image_url: data.publicUrl, storage_path: path };
}

export async function removeStorageObjects(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove(paths);
  if (error) console.warn("Could not delete some files from storage:", error.message);
}
