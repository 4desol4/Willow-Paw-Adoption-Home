import { Star } from "lucide-react";

export function Stars({ rating }: { rating: number }) {
  return (
    <span role="img" aria-label={`${rating} out of 5 stars`} className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden="true"
          className={n <= rating ? "h-4 w-4 fill-sun text-sun" : "h-4 w-4 text-line"}
        />
      ))}
    </span>
  );
}
