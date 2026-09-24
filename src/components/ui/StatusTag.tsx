import { cn } from "@/lib/utils";
import { STATUS_LABEL, type PuppyStatus } from "@/types/database";

const TONE: Record<PuppyStatus, string> = {
  AVAILABLE: "bg-leaf/10 text-leaf",
  RESERVED: "bg-sun/25 text-ink",
  ADOPTED: "bg-ink/5 text-muted",
};
const DOT: Record<PuppyStatus, string> = {
  AVAILABLE: "bg-leaf",
  RESERVED: "bg-sun",
  ADOPTED: "bg-muted",
};

export function StatusTag({
  status,
  onImage = false,
  className,
}: {
  status: PuppyStatus;
  onImage?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        onImage ? "bg-bg/90 text-ink backdrop-blur" : TONE[status],
        className,
      )}
    >
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", DOT[status])} />
      {STATUS_LABEL[status]}
    </span>
  );
}
