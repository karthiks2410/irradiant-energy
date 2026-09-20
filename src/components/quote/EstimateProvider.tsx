"use client";

/**
 * Shared state for the /get-quote flow: the controls write it, the results panel, the mobile
 * summary bar and the lead form's hidden fields read it. It wraps server-rendered children, so
 * all the page copy still comes from page.tsx and only the interactive parts hydrate.
 *
 * The PIN code is required (owner review round 2, point 8): it decides which tariffs the engine
 * applies, so until a valid one is present `estimate` is null and the page shows a prompt rather
 * than a Karnataka (BESCOM) estimate for a visitor who may be nowhere near Karnataka.
 */

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { buildEstimate, billBounds, type Estimate } from "@/lib/solar/calc";
import type { Segment } from "@/lib/solar/constants";

/** The engine's own rule (resolveRegion), restated so the field can validate before it calls. */
const PINCODE_RE = /^[1-9][0-9]{5}$/;

/** PROPOSED CONTENT — REQUIRES CLIENT APPROVAL. Validation microcopy; it makes no claim. */
const PINCODE_ERROR = "Enter a 6-digit PIN code, for example 560001.";

interface EstimateContextValue {
  segment: Segment;
  setSegment: (segment: Segment) => void;
  monthlyBill: number;
  setMonthlyBill: (value: number) => void;
  /** Raw digits as typed; only a complete, valid PIN code reaches the engine. */
  pincode: string;
  setPincode: (value: string) => void;
  /** Called when the field is left, so an untouched empty field is not reported as an error. */
  touchPincode: () => void;
  pincodeError?: string;
  roofArea: string;
  setRoofArea: (value: string) => void;
  /** null until the PIN code is valid: no PIN, no figures. */
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
  children,
}: {
  initialSegment: Segment;
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
      pincodeComplete
        ? buildEstimate({
            segment,
            monthlyBillInr: monthlyBill,
            pincode,
            roofAreaSqft: roofAreaSqft > 0 ? roofAreaSqft : undefined,
          })
        : null,
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
    pincodeError: !pincodeComplete && (pincodeTouched || pincode.length === 6) ? PINCODE_ERROR : undefined,
    roofArea,
    setRoofArea,
    estimate,
  };

  return <EstimateContext value={value}>{children}</EstimateContext>;
}
