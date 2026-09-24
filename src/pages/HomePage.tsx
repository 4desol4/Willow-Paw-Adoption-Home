import { AdoptionSteps } from "@/components/sections/AdoptionSteps";
import { Hero } from "@/components/sections/Hero";
import { LitterRail } from "@/components/sections/LitterRail";
import { Statement } from "@/components/sections/Statement";
import { TestimonialReader } from "@/components/sections/TestimonialReader";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function HomePage() {
  usePageTitle();
  return (
    <>
      <Hero />
      <Statement />
      <LitterRail />
      <AdoptionSteps />
      <TestimonialReader />
    </>
  );
}
