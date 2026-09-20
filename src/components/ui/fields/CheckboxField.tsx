import type { ComponentProps, ReactNode } from "react";
import { FieldError } from "./FieldError";
import { hintClass } from "./FieldShell";

type CheckboxFieldProps = Omit<
  ComponentProps<"input">,
  "type" | "id" | "name" | "className" | "defaultChecked" | "aria-describedby" | "aria-invalid" | "children"
> & {
  id: string;
  name: string;
  /** ReactNode so the consent text can link to the privacy notice. */
  label: ReactNode;
  hint?: string;
  error?: string;
  className?: string;
};

/**
 * Native checkbox in a 44px-tall label. `defaultChecked` is deliberately not accepted: consent boxes are
 * never pre-ticked (report §11.5, DPDP). One checkbox per purpose.
 */
export function CheckboxField({ id, name, label, hint, error, className = "", ...input }: CheckboxFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`grid gap-1 ${className}`}>
      <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-body text-carbon in-data-[surface=dark]:text-white">
        <input
          id={id}
          name={name}
          type="checkbox"
          {...input}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-teal-900 disabled:cursor-not-allowed"
        />
        <span>{label}</span>
      </label>
      {hint && (
        <p id={hintId} className={`pl-8 ${hintClass}`}>
          {hint}
        </p>
      )}
      {error && <FieldError id={errorId} className="pl-8">{error}</FieldError>}
    </div>
  );
}
