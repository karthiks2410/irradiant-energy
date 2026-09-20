import type { ChangeEventHandler, ReactNode } from "react";
import { Fieldset } from "./Fieldset";

export type RadioCardOption = {
  value: string;
  label: string;
  description?: string;
  /** Monoline SVG, sized to 24px. */
  icon?: ReactNode;
  disabled?: boolean;
};

type RadioCardsProps = {
  name: string;
  legend: string;
  hideLegend?: boolean;
  options: RadioCardOption[];
  /** Uncontrolled initial selection. Leave unset to start with nothing selected. */
  defaultValue?: string;
  /** Controlled selection; client callers only, with onChange. */
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  required?: boolean;
  columns?: 1 | 2 | 3;
  hint?: string;
  error?: string;
  className?: string;
};

const columnClasses = { 1: "grid-cols-1", 2: "grid-cols-1 sm:grid-cols-2", 3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" } as const;

/** Native radios inside card labels: the dot stays visible, arrow keys work, selection shows as border + fill. */
export function RadioCards({
  name,
  legend,
  hideLegend,
  options,
  defaultValue,
  value,
  onChange,
  required,
  columns = 3,
  hint,
  error,
  className,
}: RadioCardsProps) {
  const controlled = value !== undefined;
  return (
    <Fieldset legend={legend} hideLegend={hideLegend} hint={hint} error={error} className={className}>
      <div className={`grid gap-3 ${columnClasses[columns]}`}>
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          const descriptionId = option.description ? `${id}-description` : undefined;
          return (
            <label
              key={option.value}
              htmlFor={id}
              className="flex min-h-16 cursor-pointer items-start gap-3 rounded-md border border-grey-600 bg-white p-4 text-carbon transition-colors duration-200 hover:border-teal-900 has-checked:border-teal-900 has-checked:bg-soft-green has-checked:ring-1 has-checked:ring-teal-900 has-checked:ring-inset has-disabled:cursor-not-allowed has-disabled:opacity-60"
            >
              <input
                id={id}
                name={name}
                type="radio"
                value={option.value}
                checked={controlled ? value === option.value : undefined}
                defaultChecked={controlled ? undefined : defaultValue === option.value}
                onChange={onChange}
                required={required}
                disabled={option.disabled}
                aria-describedby={descriptionId}
                className="mt-0.5 size-5 shrink-0 cursor-pointer accent-teal-900"
              />
              {option.icon && (
                <span aria-hidden="true" className="shrink-0 text-teal-900 [&>svg]:size-6">
                  {option.icon}
                </span>
              )}
              <span className="flex flex-col gap-1">
                <span className="text-ui font-medium">{option.label}</span>
                {option.description && (
                  <span id={descriptionId} className="text-small text-grey-600">
                    {option.description}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </Fieldset>
  );
}
