import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, MessageCircle } from "lucide-react";
import { Reveal } from "@/components/animations/Reveal";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { ButtonLink, ExternalButton } from "@/components/ui/Button";
import { Img } from "@/components/ui/Img";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { StatusTag } from "@/components/ui/StatusTag";
import { usePageTitle } from "@/hooks/usePageTitle";
import { usePuppyBySlug } from "@/hooks/usePuppies";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { puppyEnquiryMessage, whatsappLink } from "@/lib/contact";
import { formatDate, formatFee, puppyAge, puppyAltText, sortImages } from "@/lib/puppy-utils";
import { cn, getErrorMessage } from "@/lib/utils";

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="grid gap-1 border-b border-line py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
      <dt className="text-sm font-semibold text-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

export default function PuppyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: puppy, isLoading, isError, error, refetch } = usePuppyBySlug(slug);
  const { settings } = useSiteSettings();
  usePageTitle(puppy ? `${puppy.name}, ${puppy.breed}` : undefined);

  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const images = puppy ? sortImages(puppy.puppy_images) : [];
  const current = images[selected] ?? images[0];

  useEffect(() => setSelected(0), [slug]);

  const step = useCallback(
    (direction: 1 | -1) =>
      setSelected((i) => (i + direction + images.length) % Math.max(images.length, 1)),
    [images.length],
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox, step]);

  if (isLoading) {
    return (
      <div className="container-page grid gap-10 pb-28 pt-32 sm:pt-40 lg:grid-cols-2">
        <Skeleton className="arch" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-3/4" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container-page pb-28 pt-32 sm:pt-40">
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      </div>
    );
  }

  if (!puppy) {
    return (
      <div className="container-page pb-28 pt-32 sm:pt-40">
        <EmptyState
          title="We couldn't find that puppy"
          description="The link may be old, or the puppy may have been removed."
          action={<ButtonLink to="/puppies">See available puppies</ButtonLink>}
        />
      </div>
    );
  }

  const canEnquire = puppy.status !== "ADOPTED";

  return (
    <article className="container-page pb-28 pt-28 sm:pt-36">
      <Link
        to="/puppies"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        All puppies
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal preset="scale">
            <button
              type="button"
              onClick={() => setLightbox(true)}
              data-cursor="Zoom"
              aria-label={`Enlarge photo of ${puppy.name}`}
              className="arch block w-full"
            >
              <Img
                src={current?.image_url}
                alt={puppyAltText(puppy)}
                className="h-full w-full"
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
            </button>
          </Reveal>
          {images.length > 1 ? (
            <ul className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <li key={image.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelected(index)}
                    aria-label={`Show photo ${index + 1} of ${images.length}`}
                    aria-current={index === selected}
                    className={cn(
                      "block h-20 w-20 overflow-hidden rounded-2xl border-2 transition-colors",
                      index === selected
                        ? "border-sun"
                        : "border-transparent opacity-70 hover:opacity-100",
                    )}
                  >
                    <Img src={image.image_url} alt="" className="h-full w-full" sizes="80px" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <StatusTag status={puppy.status} />
          <h1 className="mt-4 font-display text-display-xl">{puppy.name}</h1>
          <p className="mt-3 text-lead text-muted">
            {puppy.breed}, {puppy.gender.toLowerCase()}, {puppyAge(puppy.date_of_birth)} old
          </p>
          {puppy.description ? (
            <p className="mt-8 max-w-xl text-lead">{puppy.description}</p>
          ) : null}

          <dl className="mt-10">
            <DetailRow label="Adoption fee" value={formatFee(puppy.adoption_fee)} />
            <DetailRow label="Colour" value={puppy.color} />
            <DetailRow label="Weight" value={puppy.weight} />
            <DetailRow label="Temperament" value={puppy.temperament} />
            <DetailRow label="Vaccinations" value={puppy.vaccination_status} />
            <DetailRow label="Health" value={puppy.health_information} />
            <DetailRow label="Location" value={puppy.location} />
            {puppy.status === "ADOPTED" ? (
              <DetailRow label="Went home" value={formatDate(puppy.adoption_date)} />
            ) : null}
          </dl>

          {canEnquire ? (
            <div className="mt-10 flex flex-wrap gap-3">
              <ExternalButton
                variant="sun"
                size="lg"
                newTab
                href={whatsappLink(settings.whatsapp, puppyEnquiryMessage(puppy))}
              >
                <MessageCircle aria-hidden="true" className="h-5 w-5" />
                Ask about {puppy.name} on WhatsApp
              </ExternalButton>
            </div>
          ) : (
            <div className="mt-10 rounded-3xl bg-surface p-6">
              <p className="font-display text-display-sm">{puppy.name} has found a family.</p>
              <p className="mt-2 text-muted">See who else is waiting to meet you.</p>
              <ButtonLink to="/puppies" className="mt-5" arrow>
                Available puppies
              </ButtonLink>
            </div>
          )}
        </div>
      </div>

      {canEnquire ? (
        <section
          className="mt-24 rounded-[2rem] bg-surface p-6 sm:p-12"
          aria-labelledby="enquire-heading"
        >
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 id="enquire-heading" className="font-display text-display-md">
                Ask about {puppy.name}
              </h2>
              <p className="mt-3 max-w-sm text-muted">
                Tell us a little about your home and we'll reply with everything you need to know.
              </p>
            </div>
            <EnquiryForm puppy={{ id: puppy.id, name: puppy.name }} />
          </div>
        </section>
      ) : null}

      <Modal
        open={lightbox}
        onClose={() => setLightbox(false)}
        title={`Photos of ${puppy.name}`}
        size="full"
        hideTitle
      >
        <div className="flex h-full items-center justify-center p-4 sm:p-10">
          {current ? (
            <img
              src={current.image_url}
              alt={puppyAltText(puppy)}
              className="max-h-full max-w-full rounded-2xl object-contain"
            />
          ) : null}
        </div>
        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-bg/90 text-ink transition-colors hover:bg-sun"
            >
              <ArrowLeft aria-hidden="true" className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-bg/90 text-ink transition-colors hover:bg-sun"
            >
              <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </Modal>
    </article>
  );
}
