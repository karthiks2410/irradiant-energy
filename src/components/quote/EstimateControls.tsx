"use client";

/**
 * Step 1 inputs. Deliberately not a <form>: nothing is submitted here, the figures update as
 * the visitor types and the values travel to step 2 as hidden fields.
 *
 * The PIN code is optional: it narrows the tariff disclosure rather than changing any figure
 * estimate uses — and the pair of text fields sits in a <FieldRow> so the two inputs stay level
 * however their helper text wraps, and however long the PIN code's error message is.
 */

import { RadioCards, RangeField, TextField } from "@/components/ui";
import { formatInr } from "@/lib/solar/format";
import { billBounds } from "@/lib/solar/calc";
import { parseSegment, segmentOptions } from "./copy";
import { FieldRow, fieldCell } from "./FieldRow";
import { useEstimate } from "./EstimateProvider";

/** Keeps a numeric field to digits and a sane length while it is being typed. */
const digits = (value: string, max: number) => value.replace(/\D/g, "").slice(0, max);

export function EstimateControls() {
  const {
    segment,
    setSegment,
    monthlyBill,
    setMonthlyBill,
    pincode,
    setPincode,
    touchPincode,
    pincodeError,
    roofArea,
    setRoofArea,
  } = useEstimate();
  const bounds = billBounds(segment);

  return (
    <div className="grid gap-8">
      <RadioCards
        name="estimate-segment"
        legend="What are you putting solar on?"
        options={segmentOptions}
        value={segment}
        onChange={(event) => setSegment(parseSegment(event.target.value))}
        columns={3}
      />

      <RangeField
        id="estimate-bill"
        name="estimate-bill"
        label="Your monthly electricity bill"
        min={bounds.min}
        max={bounds.max}
        step={bounds.step}
        value={monthlyBill}
        onValueChange={setMonthlyBill}
        formatValue={(value) => formatInr(value)}
        minLabel={formatInr(bounds.min, { compact: true })}
        maxLabel={formatInr(bounds.max, { compact: true })}
        hint="Use a typical month, before any solar."
      />

      <FieldRow gap="roomy">
        <TextField
          className={fieldCell}
          id="estimate-pincode"
          name="estimate-pincode"
          label="PIN code"
          optional
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          value={pincode}
          onChange={(event) => setPincode(digits(event.target.value, 6))}
          onBlur={touchPincode}
          error={pincodeError}
          hint="Confirms which supplier serves you."
        />
        <TextField
          className={fieldCell}
          id="estimate-roof"
          name="estimate-roof"
          label="Usable roof area (sq ft)"
          optional
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={7}
          value={roofArea}
          onChange={(event) => setRoofArea(digits(event.target.value, 7))}
          hint="Leave empty if you are not sure."
        />
      </FieldRow>
    </div>
  );
}
