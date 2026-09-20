import { useId, type ReactNode } from "react";
import { FieldError } from "./FieldError";
import { hintClass, labelClass } from "./FieldShell";

type FieldsetProps = {
  legend: string;
  /** Keep the legend for assistive tech but hide it visually. */
  hideLegend?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

/** Groups related controls (radio cards, paired inputs) with one legend, hint and error. */
export function Fieldset({ legend, hideLegend = false, hint, error, className = "", children }: FieldsetProps) {
  const base = useId();
  const hintId = hint ? `${base}-hint` : undefined;
  const errorId = error ? `${base}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <fieldset className={`min-w-0 ${className}`} aria-describedby={describedBy} aria-invalid={error ? true : undefined}>
      <legend className={hideLegend ? "sr-only" : labelClass}>{legend}</legend>
      {hint && (
        <p id={hintId} className={`mt-1 ${hintClass}`}>
          {hint}
        </p>
      )}
      <div className={hideLegend && !hint ? "" : "mt-3"}>{children}</div>
      {error && <FieldError id={errorId} className="mt-2">{error}</FieldError>}
    </fieldset>
  );
}
