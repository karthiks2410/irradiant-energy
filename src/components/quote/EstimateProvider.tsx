"use client";

/**
 * Shared state for the /get-quote flow: the controls write it, the results panel, the mobile
 * summary bar and the lead form's hidden fields read it. It wraps server-rendered children, so
 * all the page copy still comes from page.tsx and only the interactive parts hydrate.
 */

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { buildEstimate, billBounds, type Estimate } from "@/lib/solar/calc";
import type { Segment } from "@/lib/solar/constants";

const PINCODE_RE = /^[1-9][0-9]{5}$/;

interface EstimateContextValue {
  segment: Segment;
  setSegment: (segment: Segment) => void;
  monthlyBill: number;
  setMonthlyBill: (value: number) => void;
  /** Raw digits as typed; only a complete, valid PIN code reaches the engine. */
  pincode: string;
  setPincode: (value: string) => void;
  pincodeError?: string;
  roofArea: string;
  setRoofArea: (value: string) => void;
  estimate: Estimate;
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
    pincodeError: pincode.length === 6 && !pincodeComplete ? "Enter a 6-digit PIN code" : undefined,
    roofArea,
    setRoofArea,
    estimate,
  };

  return <EstimateContext value={value}>{children}</EstimateContext>;
}
