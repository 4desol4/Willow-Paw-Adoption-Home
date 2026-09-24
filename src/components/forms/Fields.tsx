import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  error?: string | undefined;
  hint?: string;
  /** Shown after the visitor has touched the field and it passes validation. */
  valid?: boolean;
}

const controlClass = (error: string | undefined, valid: boolean | undefined) =>
  cn(
    "w-full rounded-field border bg-bg px-4 py-3 text-base text-ink placeholder:text-muted/70",
    "transition-colors duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-60",
    error ? "border-coral" : valid ? "border-leaf/60" : "border-line hover:border-ink/40",
  );

function Shell({
  id,
  label,
  error,
  hint,
  required,
  children,
}: FieldProps & { id: string; required: boolean | undefined; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
        {required ? <span className="text-coral"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-coral">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const describedBy = (id: string, error?: string, hint?: string) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;

export function TextField({
  label,
  error,
  hint,
  valid,
  className,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Shell id={id} label={label} error={error} hint={hint} required={props.required}>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={cn(controlClass(error, valid), valid && "pr-11", className)}
          {...props}
        />
        {valid && !error ? (
          <Check
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-leaf"
          />
        ) : null}
      </div>
    </Shell>
  );
}

export function TextAreaField({
  label,
  error,
  hint,
  valid,
  className,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Shell id={id} label={label} error={error} hint={hint} required={props.required}>
      <textarea
        id={id}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(controlClass(error, valid), "resize-y", className)}
        {...props}
      />
    </Shell>
  );
}

export function SelectField({
  label,
  error,
  hint,
  valid,
  className,
  children,
  ...props
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <Shell id={id} label={label} error={error} hint={hint} required={props.required}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(controlClass(error, valid), className)}
        {...props}
      >
        {children}
      </select>
    </Shell>
  );
}

export function CheckField({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        className="mt-1 h-5 w-5 rounded border-line accent-[rgb(var(--accent))]"
        {...props}
      />
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {hint ? <span className="mt-0.5 block font-normal text-muted">{hint}</span> : null}
      </label>
    </div>
  );
}
