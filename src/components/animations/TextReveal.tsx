import { createElement, Fragment } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE } from "./motion";

interface TextRevealProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  delay?: number;
  stagger?: number;
}

/** Words rise out of a mask. Screen readers get the plain sentence; the animated copy is hidden from them. */
export function TextReveal({
  text,
  as = "h2",
  className,
  delay = 0,
  stagger = 0.05,
}: TextRevealProps) {
  const reduce = useReducedMotion();
  const words = text.split(" ").filter(Boolean);
  return createElement(
    as,
    { className },
    <span className="sr-only">{text}</span>,
    <span aria-hidden="true">
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span className="inline-block -mb-[0.14em] overflow-hidden pb-[0.14em] align-bottom">
            <motion.span
              className="inline-block"
              initial={reduce ? false : { y: "115%" }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.8, delay: delay + index * stagger, ease: EASE }}
            >
              {word}
            </motion.span>
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>,
  );
}
