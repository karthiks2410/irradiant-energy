"use client";

import { RadioCards, RangeField, TextField } from "@/components/ui";
import { formatInr } from "@/lib/solar/format";
import { billBounds } from "@/lib/solar/calc";
import { parseSegment, segmentOptions } from "./copy";
import { FieldRow, fieldCell, fieldCellNoHelper } from "./FieldRow";
import { useEstimate } from "./EstimateProvider";

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
    sanctionedLoad,
    setSanctionedLoad,
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
          className={fieldCellNoHelper}
          id="estimate-load"
          name="estimate-load"
          label="Sanctioned load (kW)"
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
    </div>
  );
}
