import type { ReactNode } from "react";
import { FieldError } from "./FieldError";

/** ARIA wiring handed to the control by FieldShell. Spread it onto the input. */
export type ControlA11y = {
  "aria-describedby"?: string;
  "aria-invalid"?: true;
};

export const labelClass = "text-ui font-medium text-carbon in-data-[surface=dark]:text-white";
export const hintClass = "text-small text-grey-600 in-data-[surface=dark]:text-on-dark-muted";

/**
 * Shared control styling: 16px text (no iOS zoom), 48px tall, grey-600 border (≥3:1), the global 2px teal
 * focus ring, and an error state that keeps its width (ring instead of a thicker border).
 */
export const controlClass =
  "min-h-12 w-full rounded-md border border-grey-600 bg-white px-4 text-ui text-carbon transition-colors duration-200 placeholder:text-grey-600 focus-visible:border-teal-900 aria-invalid:border-error aria-invalid:ring-1 aria-invalid:ring-error aria-invalid:ring-inset disabled:cursor-not-allowed disabled:bg-canvas disabled:text-grey-600";

export type FieldShellProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  /** Optional fields are marked; required is the default and carries no mark. */
  optional?: boolean;
  /** The marker's own wording, so a localised page can pass its own. */
  optionalLabel?: string;
  className?: string;
  children: (a11y: ControlA11y) => ReactNode;
};

/** Visible label above, hint below the label, error below the control, all linked by aria-describedby. */
export function FieldShell({
  id,
  label,
  hint,
  error,
  optional = false,
  // Localised callers pass `ui.fields.optionalMarker`; the default keeps every other call site
  // rendering exactly what it rendered before this prop existed.
  optionalLabel = "(optional)",
  className = "",
  children,
}: FieldShellProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`grid gap-2 ${className}`}>
      <label htmlFor={id} className={labelClass}>
        {label}
        {optional && <span className={`ml-2 font-normal ${hintClass}`}>{optionalLabel}</span>}
      </label>
      {hint && (
        <p id={hintId} className={`-mt-1 ${hintClass}`}>
          {hint}
        </p>
      )}
      {children({ "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}
