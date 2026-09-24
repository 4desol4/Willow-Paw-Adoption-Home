import type { ReactNode } from "react";
import { AlertTriangle, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative overflow-hidden rounded-2xl bg-line/50", className)}
    >
      <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-bg/60 to-transparent" />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-16 text-center",
        className,
      )}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sun/25 text-ink">
        <PawPrint aria-hidden="true" className="h-6 w-6" />
      </span>
      <h3 className="mt-5 font-display text-display-sm">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-muted">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center rounded-3xl border border-coral/40 bg-coral/5 px-6 py-14 text-center",
        className,
      )}
    >
      <AlertTriangle aria-hidden="true" className="h-7 w-7 text-coral" />
      <h3 className="mt-4 font-display text-display-sm">We couldn't load this</h3>
      <p className="mt-2 max-w-md text-muted">{message}</p>
      {onRetry ? (
        <Button className="mt-6" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
