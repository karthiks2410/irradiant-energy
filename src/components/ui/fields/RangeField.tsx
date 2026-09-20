"use client";

import { useState, type ChangeEvent } from "react";
import { FieldShell, hintClass } from "./FieldShell";

const indian = new Intl.NumberFormat("en-IN");

type RangeFieldProps = {
  id: string;
  name: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  /** Uncontrolled start value (defaults to min). */
  defaultValue?: number;
  /** Controlled value; pair with onValueChange. */
  value?: number;
  onValueChange?: (value: number) => void;
  /** Formats the live value; client callers only (functions cannot cross from Server Components). */
  formatValue?: (value: number) => string;
  /** Declarative formatting for Server Component callers: en-IN grouping with a prefix/suffix. */
  prefix?: string;
  suffix?: string;
  /** Captions under the track ends. */
  minLabel?: string;
  maxLabel?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
};

/** Native range input with a live <output> in the data face and aria-valuetext for the formatted value. */
export function RangeField({
  id,
  name,
  label,
  min,
  max,
  step = 1,
  defaultValue,
  value,
  onValueChange,
  formatValue,
  prefix = "",
  suffix = "",
  minLabel,
  maxLabel,
  hint,
  error,
  disabled,
  className,
}: RangeFieldProps) {
  const [internal, setInternal] = useState(defaultValue ?? min);
  const current = value ?? internal;
  const formatted = formatValue ? formatValue(current) : `${prefix}${indian.format(current)}${suffix}`;

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    setInternal(next);
    onValueChange?.(next);
  };

  return (
    <FieldShell id={id} label={label} hint={hint} error={error} className={className}>
      {(a11y) => (
        <div>
          <output htmlFor={id} className="block font-mono text-data font-medium text-carbon tabular-nums in-data-[surface=dark]:text-white">
            {formatted}
          </output>
          <input
            id={id}
            name={name}
            type="range"
            min={min}
            max={max}
            step={step}
            value={current}
            onChange={onChange}
            disabled={disabled}
            aria-valuetext={formatted}
            {...a11y}
            className="mt-2 block h-11 w-full cursor-pointer accent-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
          />
          {(minLabel || maxLabel) && (
            <div className={`flex justify-between font-mono text-label ${hintClass}`}>
              <span>{minLabel}</span>
              <span>{maxLabel}</span>
            </div>
          )}
        </div>
      )}
    </FieldShell>
  );
}
