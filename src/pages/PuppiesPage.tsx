import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE } from "@/components/animations/motion";
import { SelectField, TextField } from "@/components/forms/Fields";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { PuppyCard } from "@/components/ui/PuppyCard";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { usePageTitle } from "@/hooks/usePageTitle";
import { usePuppies } from "@/hooks/usePuppies";
import { cn, getErrorMessage } from "@/lib/utils";
import type { PuppyStatus } from "@/types/database";

type Sort = "newest" | "name" | "fee";
const STATUS_OPTIONS: { value: PuppyStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Available" },
  { value: "RESERVED", label: "Reserved" },
];

export default function PuppiesPage() {
  usePageTitle("Available puppies");
  const reduce = useReducedMotion();
  const { data, isLoading, isError, error, refetch } = usePuppies(["AVAILABLE", "RESERVED"]);
  const [status, setStatus] = useState<PuppyStatus>("AVAILABLE");
  const [breed, setBreed] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("newest");

  const puppies = useMemo(() => data ?? [], [data]);
  const breeds = useMemo(() => Array.from(new Set(puppies.map((p) => p.breed))).sort(), [puppies]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = puppies.filter(
      (p) =>
        p.status === status &&
        (breed === "" || p.breed === breed) &&
        (term === "" || `${p.name} ${p.breed} ${p.color ?? ""}`.toLowerCase().includes(term)),
    );
    if (sort === "name") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "fee")
      return [...list].sort(
        (a, b) => Number(a.adoption_fee ?? Infinity) - Number(b.adoption_fee ?? Infinity),
      );
    return list;
  }, [puppies, status, breed, search, sort]);

  const clear = () => {
    setBreed("");
    setSearch("");
  };

  return (
    <>
      <PageHeader
        title="Puppies looking for a home"
        lead="Every puppy is vet-checked and raised in our home. Filter by breed, or just browse."
      />
      <section className="container-page pb-28">
        <div className="mb-10 grid gap-4 md:grid-cols-[auto_1fr_1fr_1fr] md:items-end">
          <div role="group" aria-label="Status" className="flex gap-2">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={status === option.value}
                onClick={() => setStatus(option.value)}
                className={cn(
                  "h-12 rounded-full border px-5 text-sm font-semibold transition-colors",
                  status === option.value
                    ? "border-sun bg-sun text-[#121E38]"
                    : "border-line hover:border-ink/40",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <TextField
            label="Search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, breed or colour"
          />
          <SelectField label="Breed" value={breed} onChange={(e) => setBreed(e.target.value)}>
            <option value="">All breeds</option>
            {breeds.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Sort by"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
          >
            <option value="newest">Newest first</option>
            <option value="name">Name</option>
            <option value="fee">Adoption fee, low to high</option>
          </SelectField>
        </div>

        <p className="mb-8 text-muted" role="status" aria-live="polite">
          {isLoading
            ? "Loading puppies"
            : `${visible.length} ${visible.length === 1 ? "puppy" : "puppies"} shown`}
        </p>

        {isLoading ? (
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="arch" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
        ) : visible.length === 0 ? (
          <EmptyState
            title={
              puppies.length === 0
                ? "No puppies are listed right now"
                : "No puppy matches those filters"
            }
            description={
              puppies.length === 0
                ? "New litters are added as soon as they're ready. Ask us who's coming next."
                : "Try a different breed or clear the search."
            }
            action={
              puppies.length === 0 ? (
                <ButtonLink to="/contact" variant="outline">
                  Ask about upcoming litters
                </ButtonLink>
              ) : (
                <button
                  type="button"
                  onClick={clear}
                  className="font-semibold underline underline-offset-4"
                >
                  Clear filters
                </button>
              )
            }
          />
        ) : (
          <motion.ul
            layout={!reduce}
            className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {visible.map((puppy, index) => (
                <motion.li
                  key={puppy.id}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="lg:[&:nth-child(3n+2)]:mt-14"
                >
                  <PuppyCard puppy={puppy} priority={index < 3} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </section>
    </>
  );
}
