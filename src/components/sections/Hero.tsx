import { useEffect, useMemo, useState, type PointerEvent } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { Pause, Play } from "lucide-react";
import { EASE } from "@/components/animations/motion";
import { Magnetic } from "@/components/animations/Magnetic";
import { TextReveal } from "@/components/animations/TextReveal";
import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/States";
import { useIntroReady } from "@/hooks/useIntro";
import { useFinePointer } from "@/hooks/useMediaQuery";
import { usePuppies } from "@/hooks/usePuppies";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { primaryImage, puppyAge } from "@/lib/puppy-utils";
import { cn, shortBrand } from "@/lib/utils";

interface Slide {
  key: string;
  name: string;
  image: string | null;
  href: string;
  breed: string;
  detail: string;
}

/**
 * The hero opens with the most characteristic thing on the site: an available puppy's name,
 * set huge and filled with their own photograph. It cycles through the litter; the photo drifts
 * inside the letters as the pointer moves.
 */
export function Hero() {
  const { settings } = useSiteSettings();
  const { data: puppies, isLoading } = usePuppies(["AVAILABLE"]);
  const ready = useIntroReady();
  const reduce = useReducedMotion();
  const fine = useFinePointer();

  const slides = useMemo<Slide[]>(() => {
    const fromPuppies = (puppies ?? [])
      .filter((p) => primaryImage(p.puppy_images))
      .slice(0, 6)
      .map((p) => ({
        key: p.id,
        name: p.name,
        image: primaryImage(p.puppy_images)?.image_url ?? null,
        href: `/puppies/${p.slug}`,
        breed: p.breed,
        detail: `${p.gender}, ${puppyAge(p.date_of_birth)}`,
      }));
    if (fromPuppies.length > 0) return fromPuppies;
    return [
      {
        key: "brand",
        name: shortBrand(settings.site_name),
        image: settings.hero_image,
        href: "/puppies",
        breed: "",
        detail: "",
      },
    ];
  }, [puppies, settings.site_name, settings.hero_image]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const slide = slides[index % count] ?? slides[0];

  useEffect(() => {
    if (reduce || paused || count < 2 || !ready) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), 4400);
    return () => window.clearInterval(id);
  }, [reduce, paused, count, ready]);

  // Pointer position (0..1) drives the photo drift inside the letters and a soft light behind them.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 60, damping: 20 });
  const sy = useSpring(py, { stiffness: 60, damping: 20 });
  const bgX = useTransform(sx, [0, 1], ["30%", "70%"]);
  const bgY = useTransform(sy, [0, 1], ["20%", "60%"]);
  const lightX = useTransform(sx, [0, 1], ["-25%", "25%"]);
  const lightY = useTransform(sy, [0, 1], ["-20%", "20%"]);

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!fine || reduce) return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  };

  if (!slide) return null;
  const length = Math.max(slide.name.length, 3);
  const fontSize = `min(${Math.min(28, 130 / length)}vw, 24rem)`;

  return (
    <section
      onPointerMove={onPointerMove}
      className="relative overflow-hidden pb-14 pt-28 sm:pt-36 lg:pt-40"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <motion.div
          style={reduce ? undefined : { x: lightX, y: lightY }}
          className="h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(closest-side,rgb(var(--sun)/0.2),transparent)]"
        />
      </div>

      <div className="container-page relative min-h-[9rem]">
        {ready ? (
          <>
            <TextReveal
              as="h1"
              text={settings.hero_title || "Find your perfect companion"}
              className="max-w-3xl font-display text-display-md"
            />
            {settings.hero_subtitle ? (
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.7, ease: EASE }}
                className="mt-4 max-w-xl text-lead text-muted"
              >
                {settings.hero_subtitle}
              </motion.p>
            ) : null}
          </>
        ) : null}
      </div>

      <div className="relative mt-8 sm:mt-10">
        {isLoading ? (
          <div className="container-page">
            <Skeleton className="h-40 w-full rounded-3xl sm:h-72" />
          </div>
        ) : ready ? (
          <Link
            to={slide.href}
            data-cursor="Meet"
            aria-label={slide.breed ? `Meet ${slide.name}, ${slide.breed}` : slide.name}
            className="relative block overflow-hidden rounded-none"
          >
            <AnimatePresence mode="popLayout" initial>
              <motion.span
                key={slide.key}
                aria-hidden="true"
                initial={{ y: "105%" }}
                animate={{ y: 0 }}
                exit={{ y: "-105%" }}
                transition={{ duration: 0.9, ease: EASE }}
                className="photo-type block select-none whitespace-nowrap px-4 py-[0.05em] text-center font-display font-extrabold uppercase leading-[0.92] tracking-[-0.045em]"
                style={{
                  fontSize,
                  backgroundImage: slide.image ? `url("${slide.image}")` : undefined,
                  backgroundSize: "cover",
                  backgroundPositionX: bgX,
                  backgroundPositionY: bgY,
                }}
              >
                {slide.name}
              </motion.span>
            </AnimatePresence>
          </Link>
        ) : null}
      </div>

      {ready ? (
        <div className="container-page relative mt-8 flex flex-wrap items-center justify-between gap-6">
          <div className="min-h-[3rem]">
            {slide.breed ? (
              <>
                <p className="font-display text-display-sm">{slide.breed}</p>
                <p className="text-muted">
                  {slide.detail}
                  {count > 0 && slide.key !== "brand" ? ", available now" : ""}
                </p>
              </>
            ) : null}
          </div>

          <div className="flex items-center gap-5">
            {count > 1 ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-label={paused ? "Resume automatic cycling" : "Pause automatic cycling"}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line transition-colors hover:bg-ink/5"
                >
                  {paused ? (
                    <Play aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    <Pause aria-hidden="true" className="h-4 w-4" />
                  )}
                </button>
                <div className="flex items-center" role="group" aria-label="Choose a puppy">
                  {slides.map((s, i) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Show ${s.name}`}
                      aria-current={i === index}
                      className="flex h-9 w-6 items-center justify-center"
                    >
                      <span
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300",
                          i === index ? "w-6 bg-ink" : "w-1.5 bg-ink/25",
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <Magnetic>
              <ButtonLink to={slide.href} size="lg" arrow>
                {slide.key === "brand" ? "See our puppies" : `Meet ${slide.name}`}
              </ButtonLink>
            </Magnetic>
          </div>
        </div>
      ) : null}
    </section>
  );
}
