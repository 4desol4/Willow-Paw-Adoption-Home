import { Stagger, StaggerItem } from "@/components/animations/Reveal";
import { Img } from "@/components/ui/Img";
import { Stars } from "@/components/ui/Stars";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTestimonials } from "@/hooks/useTestimonials";
import { getErrorMessage } from "@/lib/utils";

export default function TestimonialsPage() {
  usePageTitle("Testimonials");
  const { data, isLoading, isError, error, refetch } = useTestimonials();
  const items = data ?? [];

  return (
    <>
      <PageHeader
        title="Words from our families"
        lead="Honest notes from people who took a puppy home."
      />
      <section className="container-page pb-28">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-56" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
        ) : items.length === 0 ? (
          <EmptyState
            title="No testimonials yet"
            description="Stories from our adopting families will appear here."
          />
        ) : (
          <Stagger className="columns-1 gap-6 md:columns-2 lg:columns-3">
            {items.map((item) => (
              <StaggerItem key={item.id} className="mb-6 break-inside-avoid">
                <figure className="rounded-3xl bg-surface p-7">
                  <Stars rating={item.rating} />
                  <blockquote className="mt-4 text-lg leading-relaxed">
                    {item.testimonial}
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <Img
                      src={item.customer_image}
                      alt=""
                      className="h-11 w-11 rounded-full"
                      sizes="44px"
                    />
                    <span>
                      <span className="block font-semibold">{item.customer_name}</span>
                      {item.puppy_name ? (
                        <span className="block text-sm text-muted">
                          Family of {item.puppy_name}
                        </span>
                      ) : null}
                    </span>
                  </figcaption>
                </figure>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </>
  );
}
