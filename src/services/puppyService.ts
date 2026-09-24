import { assertConfigured, isSupabaseConfigured, supabase } from "@/lib/supabase";
import { demoPuppies } from "@/lib/demo-data";
import { slugify } from "@/lib/puppy-utils";
import { removeStorageObjects } from "@/services/storageService";
import type { PuppyImage, PuppyInsert, PuppyStatus, PuppyWithImages } from "@/types/database";

const WITH_IMAGES = "*, puppy_images(*)";

function sortNested(puppies: PuppyWithImages[]): PuppyWithImages[] {
  return puppies.map((puppy) => ({
    ...puppy,
    puppy_images: [...(puppy.puppy_images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  }));
}

export async function listPuppies(statuses?: PuppyStatus[]): Promise<PuppyWithImages[]> {
  if (!isSupabaseConfigured) {
    return demoPuppies.filter((p) => !statuses || statuses.includes(p.status));
  }
  let query = supabase
    .from("puppies")
    .select(WITH_IMAGES)
    .order("created_at", { ascending: false });
  if (statuses && statuses.length > 0) query = query.in("status", statuses);
  const { data, error } = await query;
  if (error) throw error;
  return sortNested((data ?? []) as PuppyWithImages[]);
}

export async function getPuppyBySlug(slug: string): Promise<PuppyWithImages | null> {
  if (!isSupabaseConfigured) return demoPuppies.find((p) => p.slug === slug) ?? null;
  const { data, error } = await supabase
    .from("puppies")
    .select(WITH_IMAGES)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? (sortNested([data as PuppyWithImages])[0] ?? null) : null;
}

export async function getPuppyById(id: string): Promise<PuppyWithImages | null> {
  assertConfigured();
  const { data, error } = await supabase
    .from("puppies")
    .select(WITH_IMAGES)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? (sortNested([data as PuppyWithImages])[0] ?? null) : null;
}

/** Creates a puppy, retrying with a short suffix if the slug is already taken. */
export async function createPuppy(payload: Omit<PuppyInsert, "slug">): Promise<PuppyWithImages> {
  assertConfigured();
  const base = slugify(payload.name, payload.breed);
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const slug = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await supabase
      .from("puppies")
      .insert({ ...payload, slug })
      .select(WITH_IMAGES)
      .single();
    if (!error) return data as PuppyWithImages;
    if (error.code !== "23505") throw error; // 23505 = unique violation → try another slug
  }
  throw new Error("Couldn't create a unique link for this puppy. Try a slightly different name.");
}

export async function updatePuppy(id: string, payload: Omit<PuppyInsert, "slug">): Promise<void> {
  assertConfigured();
  // The slug is deliberately not changed on edit so existing shared links keep working.
  const { error } = await supabase.from("puppies").update(payload).eq("id", id);
  if (error) throw error;
}

export async function updatePuppyStatus(
  puppy: PuppyWithImages,
  status: PuppyStatus,
): Promise<void> {
  assertConfigured();
  const adoption_date =
    status === "ADOPTED" ? (puppy.adoption_date ?? new Date().toISOString().slice(0, 10)) : null;
  const { error } = await supabase
    .from("puppies")
    .update({ status, adoption_date })
    .eq("id", puppy.id);
  if (error) throw error;
}

export async function deletePuppy(puppy: PuppyWithImages): Promise<void> {
  assertConfigured();
  const paths = puppy.puppy_images
    .map((image) => image.storage_path)
    .filter((p): p is string => Boolean(p));
  const { error } = await supabase.from("puppies").delete().eq("id", puppy.id);
  if (error) throw error;
  await removeStorageObjects(paths); // best effort: the DB row is already gone
}

/* ---------------------------- images ---------------------------- */

export type NewImage = { image_url: string; storage_path: string };

export async function addPuppyImages(
  puppyId: string,
  images: NewImage[],
  startOrder: number,
  makeFirstPrimary: boolean,
): Promise<PuppyImage[]> {
  assertConfigured();
  if (images.length === 0) return [];
  const rows = images.map((image, index) => ({
    puppy_id: puppyId,
    image_url: image.image_url,
    storage_path: image.storage_path,
    sort_order: startOrder + index,
    is_primary: makeFirstPrimary && index === 0,
  }));
  const { data, error } = await supabase.from("puppy_images").insert(rows).select();
  if (error) throw error;
  return [...(data ?? [])].sort((a, b) => a.sort_order - b.sort_order);
}

export async function deletePuppyImage(image: PuppyImage): Promise<void> {
  assertConfigured();
  const { error } = await supabase.from("puppy_images").delete().eq("id", image.id);
  if (error) throw error;
  if (image.storage_path) await removeStorageObjects([image.storage_path]);
}

export async function setPrimaryImage(puppyId: string, imageId: string): Promise<void> {
  assertConfigured();
  const cleared = await supabase
    .from("puppy_images")
    .update({ is_primary: false })
    .eq("puppy_id", puppyId);
  if (cleared.error) throw cleared.error;
  const chosen = await supabase.from("puppy_images").update({ is_primary: true }).eq("id", imageId);
  if (chosen.error) throw chosen.error;
}
