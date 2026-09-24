import type { ReactNode } from "react";

export function AdminPage({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md">{title}</h1>
          {description ? <p className="mt-2 max-w-xl text-muted">{description}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </div>
  );
}
