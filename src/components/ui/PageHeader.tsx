import type { ReactNode } from "react";
import { TextReveal } from "@/components/animations/TextReveal";
import { Reveal } from "@/components/animations/Reveal";

/** Opening block for inner pages. Leaves room for the fixed navigation bar. */
export function PageHeader({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <header className="container-page pb-10 pt-32 sm:pb-14 sm:pt-44">
      <TextReveal as="h1" text={title} className="max-w-5xl font-display text-display-lg" />
      {lead ? (
        <Reveal delay={0.25} className="mt-6 max-w-2xl">
          <p className="text-lead text-muted">{lead}</p>
        </Reveal>
      ) : null}
      {children ? <div className="mt-8">{children}</div> : null}
    </header>
  );
}
