import { useCallback, useMemo, useState, type ChangeEvent } from "react";

type StringKeys<T> = { [K in keyof T]: T[K] extends string ? K : never }[keyof T] & string;
type FieldEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

/**
 * Tiny controlled-form helper. `validate` must be a stable function (define it at module scope) and
 * return `{ fieldName: message }`. Errors appear once a field is touched or the form was submitted.
 */
export function useFormState<T extends object>(
  initial: T,
  validate: (values: T) => Record<string, string>,
) {
  const [values, setValues] = useState<T>(initial);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => validate(values), [values, validate]);

  const set = useCallback(<K extends keyof T>(name: K, value: T[K]) => {
    setValues((previous) => ({ ...previous, [name]: value }));
  }, []);

  const bind = <K extends StringKeys<T>>(name: K) => ({
    name,
    value: String(values[name]),
    error: submitted || touched[name] ? errors[name] : undefined,
    valid: touched[name] === true && errors[name] === undefined && String(values[name]) !== "",
    onChange: (event: FieldEvent) => set(name, event.target.value as unknown as T[K]),
    onBlur: () => setTouched((previous) => ({ ...previous, [name]: true })),
  });

  /** Marks the form submitted; returns true when there are no errors. */
  const submit = (): boolean => {
    setSubmitted(true);
    return Object.keys(errors).length === 0;
  };

  const reset = (next?: T) => {
    setValues(next ?? initial);
    setTouched({});
    setSubmitted(false);
  };

  return { values, set, bind, submit, reset, errors };
}
