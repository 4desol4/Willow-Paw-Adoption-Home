import { Parallax } from "@/components/animations/Parallax";
import { Reveal, Stagger, StaggerItem } from "@/components/animations/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Img } from "@/components/ui/Img";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const PROMISES = [
  {
    title: "Vet-checked before they leave",
    text: "Every puppy is examined, dewormed and vaccinated on schedule. You receive the records on collection day.",
  },
  {
    title: "Raised underfoot, not in a kennel",
    text: "Puppies grow up around people, noise and children, so they arrive at your door confident and used to family life.",
  },
  {
    title: "We stay in touch",
    text: "Adopting isn't the end of the conversation. We follow up after a few weeks and answer questions for as long as you have them.",
  },
];

export default function AboutPage() {
  usePageTitle("About");
  const { settings } = useSiteSettings();

  return (
    <>
      <PageHeader title="Warm homes, healthy beginnings." />
      <section className="container-page grid gap-12 pb-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="max-w-xl text-lead">{settings.about_text}</p>
          </Reveal>
          <Reveal
            delay={0.1}
            className="mt-12 grid max-w-xl grid-cols-2 gap-8 border-t border-line pt-8"
          >
            <div>
              <p className="font-display text-display-lg">120+</p>
              <p className="text-muted">successful adoptions</p>
            </div>
            <div>
              <p className="font-display text-display-lg">1:1</p>
              <p className="text-muted">family matching support</p>
            </div>
          </Reveal>
        </div>
        <Reveal preset="scale">
          <div className="arch">
            <Parallax className="h-full" speed={36}>
              <Img
                src={settings.hero_image}
                alt={`${settings.site_name}`}
                className="h-full w-full scale-[1.15]"
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            </Parallax>
          </div>
        </Reveal>
      </section>

      <section className="bg-surface py-24">
        <div className="container-page">
          <Stagger className="grid gap-10 md:grid-cols-3">
            {PROMISES.map((promise) => (
              <StaggerItem key={promise.title}>
                <h2 className="font-display text-display-sm">{promise.title}</h2>
                <p className="mt-3 text-muted">{promise.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="mt-14">
            <ButtonLink to="/puppies" size="lg" arrow>
              Meet the puppies
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
