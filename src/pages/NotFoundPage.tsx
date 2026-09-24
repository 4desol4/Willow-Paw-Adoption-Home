import { ButtonLink } from "@/components/ui/Button";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function NotFoundPage() {
  usePageTitle("Page not found");
  return (
    <section className="container-page flex min-h-screen flex-col items-start justify-center pb-20 pt-32">
      <h1 className="font-display text-display-xl">Lost the scent.</h1>
      <p className="mt-6 max-w-md text-lead text-muted">
        That page doesn't exist any more, or the link has a typo.
      </p>
      <ButtonLink to="/" size="lg" className="mt-8">
        Back to the home page
      </ButtonLink>
    </section>
  );
}
