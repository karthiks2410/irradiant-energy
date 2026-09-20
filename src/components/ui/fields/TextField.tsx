import type { ComponentProps } from "react";
import { controlClass, FieldShell } from "./FieldShell";

type TextFieldProps = Omit<ComponentProps<"input">, "id" | "name" | "className" | "aria-describedby" | "aria-invalid" | "children"> & {
  id: string;
  name: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  /** Static adornment inside the field, e.g. "+91" or "₹". Decorative: put the unit in the label too. */
  prefix?: string;
  suffix?: string;
  className?: string;
};

const adornment = "pointer-events-none absolute inset-y-0 flex items-center font-mono text-ui text-grey-600";

/** Set type, inputMode and autoComplete on every field (tel + tel-national, email, postal-code, numeric…). */
export function TextField({ id, name, label, hint, error, optional, prefix, suffix, className, type = "text", ...input }: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      {(a11y) => (
        <div className="relative">
          {prefix && (
            <span aria-hidden="true" className={`${adornment} left-4`}>
              {prefix}
            </span>
          )}
          <input
            id={id}
            name={name}
            type={type}
            {...input}
            {...a11y}
            className={`${controlClass} ${prefix ? "pl-12" : ""} ${suffix ? "pr-14" : ""}`}
          />
          {suffix && (
            <span aria-hidden="true" className={`${adornment} right-4`}>
              {suffix}
            </span>
          )}
        </div>
      )}
    </FieldShell>
  );
}
