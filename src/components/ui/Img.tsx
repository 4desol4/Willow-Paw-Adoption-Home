import { useEffect, useRef, useState } from "react";
import { PawPrint } from "lucide-react";
import { buildSrcSet, resizeImage } from "@/lib/images";
import { cn } from "@/lib/utils";

interface ImgProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  position?: string;
}

/** Lazy, responsive image with a quiet placeholder and a graceful fallback if the file is missing. */
export function Img({
  src,
  alt,
  className,
  imgClassName,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority = false,
  position,
}: ImgProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    const element = ref.current;
    setLoaded(Boolean(element?.complete && element.naturalWidth > 0));
  }, [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn("flex items-center justify-center bg-surface text-muted", className)}
      >
        <PawPrint aria-hidden="true" className="h-8 w-8 opacity-40" />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-surface", className)}>
      <img
        ref={ref}
        src={resizeImage(src, 1200)}
        srcSet={buildSrcSet(src)}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        style={position ? { objectPosition: position } : undefined}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-700",
          loaded ? "opacity-100" : "opacity-0",
          imgClassName,
        )}
      />
    </div>
  );
}
