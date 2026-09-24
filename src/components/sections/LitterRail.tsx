import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { TextReveal } from "@/components/animations/TextReveal";
import { ButtonLink } from "@/components/ui/Button";
import { PuppyCard } from "@/components/ui/PuppyCard";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePuppies } from "@/hooks/usePuppies";
import { getErrorMessage } from "@/lib/utils";
import type { PuppyWithImages } from "@/types/database";

const CARD = "w-[min(78vw,24rem)] shrink-0";

function RailHeader({ count }: { count: number }) {
  return (
    <div className="container-page flex flex-wrap items-end justify-between gap-6">
      <div>
        <TextReveal as="h2" text="Available now" className="font-display text-display-lg" />
        <p className="mt-3 text-lead text-muted">
          {count === 0
            ? "New puppies are listed as soon as they're ready."
            : `${count} ${count === 1 ? "puppy is" : "puppies are"} ready to meet their family.`}
        </p>
      </div>
      <ButtonLink to="/puppies" variant="outline">
        See every puppy
      </ButtonLink>
    </div>
  );
}

/** Desktop: the section pins while vertical scrolling slides the cards sideways. */
function PinnedRail({ puppies }: { puppies: PuppyWithImages[] }) {
  const outerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setDistance(Math.max(track.scrollWidth - window.innerWidth, 0));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [puppies.length]);

  const { scrollYProgress } = useScroll({ target: outerRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const line = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={outerRef}
      style={{ height: `calc(100vh + ${distance}px)` }}
      aria-label="Available puppies"
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center gap-10 overflow-hidden pt-16">
        <RailHeader count={puppies.length} />
        <motion.div ref={trackRef} style={{ x }} className="flex w-max gap-8 px-[var(--gutter)]">
          {puppies.map((puppy) => (
            <PuppyCard key={puppy.id} puppy={puppy} className={CARD} />
          ))}
        </motion.div>
        <div className="container-page">
          <div className="h-px w-full bg-line">
            <motion.div style={{ scaleX: line }} className="h-px origin-left bg-ink" />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Touch, tablet and reduced-motion: a native, swipeable scroller. */
function SwipeRail({ puppies }: { puppies: PuppyWithImages[] }) {
  return (
    <section className="py-20 sm:py-28" aria-label="Available puppies">
      <RailHeader count={puppies.length} />
      <div className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[var(--gutter)] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {puppies.map((puppy) => (
          <PuppyCard key={puppy.id} puppy={puppy} className={`${CARD} snap-start`} />
        ))}
      </div>
    </section>
  );
}

export function LitterRail() {
  const { data, isLoading, isError, error, refetch } = usePuppies(["AVAILABLE"]);
  const desktop = useMediaQuery("(min-width: 1024px)");
  const reduce = useReducedMotion();

  if (isLoading) {
    return (
      <section className="container-page py-20">
        <Skeleton className="mb-10 h-16 w-72" />
        <div className="flex gap-6 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="arch w-[min(78vw,24rem)] shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="container-page py-20">
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      </section>
    );
  }

  const puppies = data ?? [];
  if (puppies.length === 0) {
    return (
      <section className="container-page py-20">
        <EmptyState
          title="No puppies are listed right now"
          description="New litters are added as soon as they're ready. Message us and we'll tell you who's coming next."
          action={
            <Link to="/contact" className="font-semibold underline underline-offset-4">
              Ask about upcoming litters
            </Link>
          }
        />
      </section>
    );
  }

  return desktop && !reduce ? <PinnedRail puppies={puppies} /> : <SwipeRail puppies={puppies} />;
}
