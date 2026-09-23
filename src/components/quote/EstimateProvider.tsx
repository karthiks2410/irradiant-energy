"use client";

/**
 * Shared state for the /get-quote flow: the controls write it, the results panel, the mobile
 * summary bar and the lead form's hidden fields read it. It wraps server-rendered children, so
 * all the page copy still comes from page.tsx and only the interactive parts hydrate.
 *
 * The PIN code is optional, and the figures do not wait for it.
 *
 * It used to gate them, on the stated grounds that it "decides which tariffs the engine applies".
 * It does not. Every tariff and yield constant the engine holds is statewide, so at the same bill
 * a 560001, a 570001, a 110001 and no PIN at all return the same 3.50 kWp, 5,749 kWh, ₹37,800 and
 * 3.5-year payback — only the caveat in `flags` differs. The gate was therefore withholding a
 * complete, correct estimate behind a field that changed nothing (owner decision, 2026-09-20,
 * reversing owner review round 2 point 8).
 *
 * What the PIN still does is narrow the disclosure: with one, the estimate can say whether BESCOM
 * actually serves that band; without one it says plainly that Karnataka (BESCOM) tariffs were
 * assumed. That is a refinement, not a precondition.
 *
 * If per-ESCOM tariffs or regional yields are ever added, the PIN starts changing the numbers and
 * this decision has to be revisited.
 */

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { buildEstimate, billBounds, type Estimate } from "@/lib/solar/calc";
import type { Segment } from "@/lib/solar/constants";

/** The engine's own rule (resolveRegion), restated so the field can validate before it calls. */
const PINCODE_RE = /^[1-9][0-9]{5}$/;

interface EstimateContextValue {
  segment: Segment;
  setSegment: (segment: Segment) => void;
  monthlyBill: number;
  setMonthlyBill: (value: number) => void;
  /** Raw digits as typed; only a complete, valid PIN code reaches the engine. Optional. */
  pincode: string;
  setPincode: (value: string) => void;
  /** Called when the field is left, so an untouched empty field is not reported as an error. */
  touchPincode: () => void;
  pincodeError?: string;
  roofArea: string;
  setRoofArea: (value: string) => void;
  /** Always present: the bill alone is enough. Null only if the bill itself is unusable. */
  estimate: Estimate | null;
}

const EstimateContext = createContext<EstimateContextValue | null>(null);

export function useEstimate(): EstimateContextValue {
  const value = useContext(EstimateContext);
  if (!value) throw new Error("useEstimate must be used inside <EstimateProvider>");
  return value;
}

export function EstimateProvider({
  initialSegment,
  pincodeError,
  children,
}: {
  initialSegment: Segment;
  /**
   * What to say when the PIN code does not parse. It arrives as a prop rather than sitting here
   * as a literal: this module hydrates, and a client bundle may not reach a content module
   * (scripts/check-client-content.ts), so an inline string could only ever be English.
   */
  pincodeError: string;
  children: ReactNode;
}) {
  const [segment, setSegmentState] = useState<Segment>(initialSegment);
  const [monthlyBill, setMonthlyBill] = useState(() => billBounds(initialSegment).default);
  const [pincode, setPincode] = useState("");
  const [pincodeTouched, setPincodeTouched] = useState(false);
  const [roofArea, setRoofArea] = useState("");

  /** Bill ranges differ per segment, so the bill restarts at the new segment's typical value. */
  const setSegment = (next: Segment) => {
    setSegmentState(next);
    setMonthlyBill(billBounds(next).default);
  };

  const pincodeComplete = PINCODE_RE.test(pincode);
  const roofAreaSqft = Number(roofArea);

  const estimate = useMemo(
    () =>
      buildEstimate({
        segment,
        monthlyBillInr: monthlyBill,
        // A half-typed PIN is not a location: it would resolve to the wrong band and claim a
        // precision that is not there, so only a complete one is handed over.
        pincode: pincodeComplete ? pincode : undefined,
        roofAreaSqft: roofAreaSqft > 0 ? roofAreaSqft : undefined,
      }),
    [segment, monthlyBill, pincode, pincodeComplete, roofAreaSqft],
  );

  const value: EstimateContextValue = {
    segment,
    setSegment,
    monthlyBill,
    setMonthlyBill,
    pincode,
    setPincode,
    touchPincode: () => setPincodeTouched(true),
    // Six typed digits that still do not parse (a leading zero) are a mistake straight away;
    // anything shorter waits until the visitor has left the field.
    pincodeError: !pincodeComplete && (pincodeTouched || pincode.length === 6) ? pincodeError : undefined,
    roofArea,
    setRoofArea,
    estimate,
  };

  return <EstimateContext value={value}>{children}</EstimateContext>;
}
