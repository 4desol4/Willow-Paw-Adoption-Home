import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";

/** A paragraph whose words light up as you scroll through it. */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ").filter(Boolean);

  if (reduce) return <p className={className}>{text}</p>;

  return (
    <p ref={ref} className={className}>
      {words.map((word, index) => (
        <Word
          key={`${word}-${index}`}
          progress={scrollYProgress}
          range={[index / words.length, (index + 1) / words.length]}
        >
          {word}
        </Word>
      ))}
    </p>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <>
      <motion.span style={{ opacity }} className="inline-block">
        {children}
      </motion.span>{" "}
    </>
  );
}
