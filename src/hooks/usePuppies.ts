import { useQuery } from "@tanstack/react-query";
import { getPuppyById, getPuppyBySlug, listPuppies } from "@/services/puppyService";
import type { PuppyStatus } from "@/types/database";

export const puppyKeys = {
  all: ["puppies"] as const,
  list: (statuses?: PuppyStatus[]) => ["puppies", "list", statuses?.join(",") ?? "all"] as const,
  bySlug: (slug: string) => ["puppies", "slug", slug] as const,
  byId: (id: string) => ["puppies", "id", id] as const,
};

export function usePuppies(statuses?: PuppyStatus[]) {
  return useQuery({
    queryKey: puppyKeys.list(statuses),
    queryFn: () => listPuppies(statuses),
    staleTime: 60_000,
  });
}

export function usePuppyBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: puppyKeys.bySlug(slug ?? ""),
    queryFn: () => getPuppyBySlug(slug ?? ""),
    enabled: Boolean(slug),
    staleTime: 60_000,
  });
}

export function usePuppyById(id: string | undefined) {
  return useQuery({
    queryKey: puppyKeys.byId(id ?? ""),
    queryFn: () => getPuppyById(id ?? ""),
    enabled: Boolean(id),
  });
}
