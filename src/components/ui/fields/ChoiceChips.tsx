import type { ChangeEventHandler } from "react";
import { Fieldset } from "./Fieldset";

export type ChoiceChipOption = { value: string; label: string };

type ChoiceChipsProps = {
  name: string;
  legend: string;
  options: ChoiceChipOption[];
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  required?: boolean;
  error?: string;
  className?: string;
};

/**
 * Short single-choice answers as pills — bill ranges, property types — where a RadioCard would be
 * taller than the question deserves. Same native radios and the same selected state as RadioCards
 * (teal border and ring, soft-green fill), so the two read as one family. The dot is hidden
 * because the whole pill is the target and the fill already says which one is chosen; the native
 * input keeps arrow-key navigation and the focus ring.
 */
export function ChoiceChips({ name, legend, options, value, onChange, required, error, className }: ChoiceChipsProps) {
  return (
    <Fieldset legend={legend} error={error} className={className}>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={id}
              className="relative inline-flex min-h-11 cursor-pointer items-center rounded-full border border-grey-600 bg-white px-4 text-ui font-medium text-carbon transition-colors duration-200 hover:border-teal-900 has-checked:border-teal-900 has-checked:bg-soft-green has-checked:ring-1 has-checked:ring-teal-900 has-checked:ring-inset has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-teal-900"
            >
              <input
                id={id}
                name={name}
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={onChange}
                required={required}
                className="absolute inset-0 cursor-pointer appearance-none rounded-full outline-none"
              />
              <span className="relative">{option.label}</span>
            </label>
          );
        })}
      </div>
    </Fieldset>
  );
}
