import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { EASE } from "@/components/animations/motion";
import { TextReveal } from "@/components/animations/TextReveal";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "Say hello",
    text: "Message us on WhatsApp or send an enquiry. Tell us about your home, your family and the kind of dog you have in mind.",
  },
  {
    title: "Meet the puppy",
    text: "Come and spend time with the puppy you like. Ask us anything about health, temperament and daily routine.",
  },
  {
    title: "Reserve",
    text: "When you're both sure, we reserve the puppy for you and finish the paperwork together.",
  },
  {
    title: "Bring them home",
    text: "You collect your puppy with their vaccination and health records. A few weeks later we check in to see how everyone is settling.",
  },
];

function Step({
  index,
  title,
  text,
  onActive,
}: {
  index: number;
  title: string;
  text: string;
  onActive: (index: number) => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  return (
    <li
      ref={ref}
      className={cn(
        "flex flex-col justify-center py-10 transition-opacity duration-500 lg:min-h-[48vh]",
        inView ? "opacity-100" : "lg:opacity-35",
      )}
    >
      <span className="font-display text-5xl font-extrabold text-accent lg:hidden">
        {index + 1}
      </span>
      <h3 className="mt-2 font-display text-display-md lg:mt-0">{title}</h3>
      <p className="mt-4 max-w-md text-lead text-muted">{text}</p>
    </li>
  );
}

/** Sticky storytelling: the heading and current step number stay put while the steps scroll past. */
export function AdoptionSteps() {
  const [active, setActive] = useState(0);
  const onActive = useCallback((index: number) => setActive(index), []);

  return (
    <section className="bg-surface py-24 sm:py-32">
      <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:h-[calc(100vh-10rem)] lg:self-start">
          <TextReveal as="h2" text="How adopting works" className="font-display text-display-lg" />
          <p className="mt-5 max-w-sm text-lead text-muted">
            Four steps, at your pace. Nobody rushes a decision that lasts fifteen years.
          </p>
          <div
            aria-hidden="true"
            className="relative mt-10 hidden h-[clamp(9rem,22vw,16rem)] overflow-hidden lg:block"
          >
            <AnimatePresence mode="popLayout">
              <motion.span
                key={active}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-100%" }}
                transition={{ duration: 0.6, ease: EASE }}
                className="absolute left-0 top-0 font-display text-[clamp(9rem,22vw,16rem)] font-extrabold leading-[0.85] text-sun"
              >
                {active + 1}
              </motion.span>
            </AnimatePresence>
          </div>
          <p
            className="sr-only"
            aria-live="polite"
          >{`Step ${active + 1} of ${STEPS.length}: ${STEPS[active]?.title ?? ""}`}</p>
        </div>
        <ol>
          {STEPS.map((step, index) => (
            <Step
              key={step.title}
              index={index}
              title={step.title}
              text={step.text}
              onActive={onActive}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
