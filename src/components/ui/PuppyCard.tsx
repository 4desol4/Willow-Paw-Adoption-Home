import { Link } from "react-router-dom";
import { Img } from "@/components/ui/Img";
import { StatusTag } from "@/components/ui/StatusTag";
import { formatFee, primaryImage, puppyAge, puppyAltText } from "@/lib/puppy-utils";
import { cn } from "@/lib/utils";
import type { PuppyWithImages } from "@/types/database";

interface PuppyCardProps {
  puppy: PuppyWithImages;
  priority?: boolean;
  className?: string;
  /** Replaces the adoption fee on the right, e.g. "Home since March". */
  note?: string;
}

export function PuppyCard({ puppy, priority = false, className, note }: PuppyCardProps) {
  const image = primaryImage(puppy.puppy_images);
  return (
    <Link to={`/puppies/${puppy.slug}`} data-cursor="View" className={cn("group block", className)}>
      <div className="arch relative">
        <Img
          src={image?.image_url}
          alt={puppyAltText(puppy)}
          className="h-full w-full"
          imgClassName="transition-transform duration-[900ms] ease-out group-hover:scale-105"
          priority={priority}
          sizes="(min-width: 1024px) 26rem, 80vw"
        />
        <StatusTag
          status={puppy.status}
          onImage
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
        />
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-display-sm">{puppy.name}</h3>
        <span className="text-sm font-semibold text-muted">
          {note ?? formatFee(puppy.adoption_fee)}
        </span>
      </div>
      <p className="mt-1 text-muted">{puppy.breed}</p>
      <p className="text-sm text-muted/80">
        {puppy.gender}, {puppyAge(puppy.date_of_birth)}
      </p>
    </Link>
  );
}
