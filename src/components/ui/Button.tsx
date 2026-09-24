import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { Link, type LinkProps } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "sun" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface StyleProps {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  className?: string;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-bg hover:bg-sun hover:text-[#121E38]",
  sun: "bg-sun text-[#121E38] hover:brightness-95",
  outline: "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-bg",
  ghost: "text-ink hover:bg-ink/5",
  danger: "bg-coral text-bg hover:brightness-95",
};

const SIZES: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-[0.95rem]",
  lg: "h-14 px-8 text-base",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  block = false,
  className,
}: StyleProps = {}) {
  return cn(
    "group relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold",
    "transition duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
    SIZES[size],
    VARIANTS[variant],
    block && "w-full",
    className,
  );
}

const Arrow = () => (
  <ArrowUpRight
    aria-hidden="true"
    className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
  />
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, StyleProps {
  /** idle → loading → success. The label stays put; only the leading icon changes. */
  state?: "idle" | "loading" | "success";
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant,
    size,
    block,
    className,
    state = "idle",
    icon,
    children,
    disabled,
    type = "button",
    ...rest
  },
  ref,
) {
  const lead =
    state === "loading" ? (
      <Loader2 key="loading" aria-hidden="true" className="h-4 w-4 animate-spin" />
    ) : state === "success" ? (
      <Check key="success" aria-hidden="true" className="h-4 w-4" />
    ) : icon ? (
      <span key="icon">{icon}</span>
    ) : null;

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || state === "loading"}
      aria-busy={state === "loading"}
      className={buttonStyles({ variant, size, block, className })}
      {...rest}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {lead ? (
          <motion.span
            key={state}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15 }}
            className="inline-flex"
          >
            {lead}
          </motion.span>
        ) : null}
      </AnimatePresence>
      <span>{children}</span>
    </button>
  );
});

interface ButtonLinkProps extends Omit<LinkProps, "className">, StyleProps {
  arrow?: boolean;
}

/** In-app navigation styled as a button. */
export function ButtonLink({
  variant,
  size,
  block,
  className,
  arrow,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={buttonStyles({ variant, size, block, className })} {...rest}>
      {children}
      {arrow ? <Arrow /> : null}
    </Link>
  );
}

interface ExternalButtonProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className">, StyleProps {
  arrow?: boolean;
  newTab?: boolean;
}

/** Plain links (tel:, mailto:, WhatsApp, social) styled as a button. */
export function ExternalButton({
  variant,
  size,
  block,
  className,
  arrow,
  newTab,
  children,
  ...rest
}: ExternalButtonProps) {
  const target = newTab ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <a className={buttonStyles({ variant, size, block, className })} {...target} {...rest}>
      {children}
      {arrow ? <Arrow /> : null}
    </a>
  );
}
