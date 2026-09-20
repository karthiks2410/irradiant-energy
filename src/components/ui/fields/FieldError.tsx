import type { ReactNode } from "react";
import { ErrorIcon } from "../Icons";

type FieldErrorProps = {
  /** Referenced by the control's aria-describedby. */
  id?: string;
  className?: string;
  children: ReactNode;
};

/** Icon + text, never colour alone (brand PDF p.47). Announce form-level failures with a role="alert" summary, not here. */
export function FieldError({ id, className = "", children }: FieldErrorProps) {
  return (
    <p id={id} className={`flex items-start gap-2 text-small font-medium text-error in-data-[surface=dark]:text-error-tint ${className}`}>
      <ErrorIcon className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
