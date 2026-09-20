import type { ComponentProps } from "react";
import { ChevronDownIcon } from "../Icons";
import { controlClass, FieldShell } from "./FieldShell";

export type SelectOption = { value: string; label: string; disabled?: boolean };

type SelectFieldProps = Omit<
  ComponentProps<"select">,
  "id" | "name" | "className" | "aria-describedby" | "aria-invalid" | "children" | "multiple"
> & {
  id: string;
  name: string;
  label: string;
  options: SelectOption[];
  /** Disabled first option, selected until the user chooses (pair with required). */
  placeholder?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
};

/** Native <select> (best mobile behaviour, free a11y) with the brand chevron. */
export function SelectField({ id, name, label, options, placeholder, hint, error, optional, className, ...select }: SelectFieldProps) {
  const uncontrolled = select.value === undefined;
  const defaultValue = uncontrolled ? (select.defaultValue ?? (placeholder ? "" : undefined)) : undefined;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      {(a11y) => (
        <div className="relative">
          <select id={id} name={name} {...select} defaultValue={defaultValue} {...a11y} className={`${controlClass} appearance-none pr-12`}>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-teal-900" />
        </div>
      )}
    </FieldShell>
  );
}
