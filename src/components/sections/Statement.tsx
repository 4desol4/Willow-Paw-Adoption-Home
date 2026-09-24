import { ScrollWords } from "@/components/animations/ScrollWords";

export function Statement() {
  return (
    <section className="container-page py-28 sm:py-40">
      <ScrollWords
        className="max-w-5xl font-display text-[clamp(2rem,5vw,4.25rem)] font-bold leading-[1.08] tracking-tight"
        text="Every puppy here is vet-checked, vaccinated and raised underfoot in our home, so the one who comes to yours already knows what a family sounds like."
      />
    </section>
  );
}
