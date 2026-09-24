import { PageHeader } from "@/components/ui/PageHeader";
import { PuppyCard } from "@/components/ui/PuppyCard";
import { Stagger, StaggerItem } from "@/components/animations/Reveal";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { usePageTitle } from "@/hooks/usePageTitle";
import { usePuppies } from "@/hooks/usePuppies";
import { formatDate } from "@/lib/puppy-utils";
import { getErrorMessage } from "@/lib/utils";

export default function AdoptedPage() {
  usePageTitle("Adopted");
  const { data, isLoading, isError, error, refetch } = usePuppies(["ADOPTED"]);
  const puppies = data ?? [];

  return (
    <>
      <PageHeader
        title="Home at last"
        lead="Every one of these puppies now has a family, a bed and a favourite spot on the sofa."
      />
      <section className="container-page pb-28">
        {isLoading ? (
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="arch" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
        ) : puppies.length === 0 ? (
          <EmptyState
            title="No adoptions to show yet"
            description="Puppies that find their families will appear here."
          />
        ) : (
          <Stagger className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {puppies.map((puppy) => (
              <StaggerItem key={puppy.id}>
                <PuppyCard
                  puppy={puppy}
                  note={
                    puppy.adoption_date ? formatDate(puppy.adoption_date, "MMM yyyy") : "Adopted"
                  }
                />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </>
  );
}
