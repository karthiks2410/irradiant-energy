"use client";

/**
 * Step 1 inputs. Deliberately not a <form>: nothing is submitted here, the figures update as
 * the visitor types and the values travel to step 2 as hidden fields.
 *
 * Order after the redesign (#14): property type, then PIN code and sanctioned load side by side,
 * then the bill. The sanctioned load, read off the electricity bill, caps the system size in
 * place of the old roof-area field. The PIN code is optional: it narrows the tariff disclosure
 * rather than changing any figure. The pair of text fields sits in a <FieldRow> so the two inputs
 * stay level however their helper text wraps, and however long the PIN code's error message is.
 *
 * Every word arrives as a prop. This is a client island, so importing a content module would
 * put both languages' copy in the browser bundle (scripts/check-client-content.ts).
 */

import { RadioCards, RangeField, TextField } from "@/components/ui";
import type { QuotePage } from "@/content/quote";
import type { Segment } from "@/lib/solar/constants";
import { formatInr } from "@/lib/solar/format";
import { billBounds } from "@/lib/solar/calc";
import { parseSegment, segmentOptions } from "./copy";
import { FieldRow, fieldCell, fieldCellNoHelper } from "./FieldRow";
import { useEstimate } from "./EstimateProvider";

/** Keeps a numeric field to digits and a sane length while it is being typed. */
const digits = (value: string, max: number) => value.replace(/\D/g, "").slice(0, max);

export interface EstimateControlsCopy {
  controls: QuotePage["controls"];
  /** Property-type names; the descriptions under them are `segments`. */
  segmentLabels: Readonly<Record<Segment, string>>;
  segments: QuotePage["segments"];
  /** "(optional)" beside an optional field's label. */
  optionalMarker: string;
  /** How the slider's end labels name a lakh and a crore. */
  format: QuotePage["format"];
}

export function EstimateControls({ copy }: { copy: EstimateControlsCopy }) {
  const {
    segment,
    setSegment,
    monthlyBill,
    setMonthlyBill,
    pincode,
    setPincode,
    touchPincode,
    pincodeError,
    sanctionedLoad,
    setSanctionedLoad,
  } = useEstimate();
  const bounds = billBounds(segment);
  const { controls } = copy;
  const compact = { lakh: copy.format.compactLakh, crore: copy.format.compactCrore };

  return (
    <div className="grid gap-8">
      <RadioCards
        name="estimate-segment"
        legend={controls.segmentLegend}
        options={segmentOptions(copy.segmentLabels, copy.segments)}
        value={segment}
        onChange={(event) => setSegment(parseSegment(event.target.value))}
        columns={3}
      />

      <FieldRow gap="roomy">
        <TextField
          className={fieldCell}
          id="estimate-pincode"
          name="estimate-pincode"
          label={controls.pincodeLabel}
          optional
          optionalLabel={copy.optionalMarker}
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          value={pincode}
          onChange={(event) => setPincode(digits(event.target.value, 6))}
          onBlur={touchPincode}
          error={pincodeError}
          hint={controls.pincodeHint}
        />
        <TextField
          className={fieldCellNoHelper}
          id="estimate-load"
          name="estimate-load"
          label={controls.loadLabel}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          value={sanctionedLoad}
          onChange={(event) => setSanctionedLoad(digits(event.target.value, 4))}
        />
      </FieldRow>

      <RangeField
        id="estimate-bill"
        name="estimate-bill"
        label={controls.billLabel}
        min={bounds.min}
        max={bounds.max}
        step={bounds.step}
        value={monthlyBill}
        onValueChange={setMonthlyBill}
        formatValue={(value) => formatInr(value)}
        minLabel={formatInr(bounds.min, { compact })}
        maxLabel={formatInr(bounds.max, { compact })}
        hint={controls.billHint}
      />

    </div>
  );
}
