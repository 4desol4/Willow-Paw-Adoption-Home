import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { EASE } from "@/components/animations/motion";
import { Reveal } from "@/components/animations/Reveal";
import { Img } from "@/components/ui/Img";
import { useTestimonials } from "@/hooks/useTestimonials";

export function TestimonialReader() {
  const { data } = useTestimonials();
  const [index, setIndex] = useState(0);
  const items = data ?? [];
  const current = items[index % Math.max(items.length, 1)];
  if (!current) return null;

  const go = (direction: 1 | -1) => setIndex((i) => (i + direction + items.length) % items.length);
  const buttonClass =
    "flex h-12 w-12 items-center justify-center rounded-full border border-line transition-colors hover:bg-ink hover:text-bg";

  return (
    <section className="container-page py-24 sm:py-36" aria-label="What families say">
      <Reveal>
        <div className="grid gap-10 lg:grid-cols-[0.5fr_1.5fr] lg:gap-20">
          <div className="flex items-center gap-4 lg:flex-col lg:items-start">
            <Img
              src={current.customer_image}
              alt={`${current.customer_name}`}
              className="h-24 w-24 rounded-full lg:h-40 lg:w-40"
              sizes="160px"
            />
            <div>
              <p className="font-display text-display-sm">{current.customer_name}</p>
              {current.puppy_name ? (
                <p className="text-muted">Family of {current.puppy_name}</p>
              ) : null}
            </div>
          </div>

          <div>
            <div className="min-h-[14rem]" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.blockquote
                  key={current.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="font-display text-[clamp(1.5rem,3.2vw,2.75rem)] font-semibold leading-[1.15] tracking-tight"
                >
                  {current.testimonial}
                </motion.blockquote>
              </AnimatePresence>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {items.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Previous testimonial"
                    className={buttonClass}
                  >
                    <ArrowLeft aria-hidden="true" className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Next testimonial"
                    className={buttonClass}
                  >
                    <ArrowRight aria-hidden="true" className="h-5 w-5" />
                  </button>
                  <span className="text-sm text-muted">
                    {(index % items.length) + 1} of {items.length}
                  </span>
                </>
              ) : null}
              <Link
                to="/testimonials"
                className="ml-auto font-semibold underline underline-offset-4 hover:text-accent"
              >
                Read them all
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
