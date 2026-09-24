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

/** PROPOSED CONTENT — REQUIRES CLIENT APPROVAL. Validation microcopy; it makes no claim. */
const PINCODE_ERROR = "Enter a 6-digit PIN code, for example 560001.";

interface EstimateContextValue {
  segment: Segment;
  setSegment: (segment: Segment) => void;
  monthlyBill: number;
  setMonthlyBill: (value: number) => void;
  pincode: string;
  setPincode: (value: string) => void;
  touchPincode: () => void;
  pincodeError?: string;
  sanctionedLoad: string;
  setSanctionedLoad: (value: string) => void;
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
  const [sanctionedLoad, setSanctionedLoad] = useState("");

  /** Bill ranges differ per segment, so the bill restarts at the new segment's typical value. */
  const setSegment = (next: Segment) => {
    setSegmentState(next);
    setMonthlyBill(billBounds(next).default);
  };

  const pincodeComplete = PINCODE_RE.test(pincode);
  const sanctionedLoadKw = Number(sanctionedLoad);

  const estimate = useMemo(
    () =>
      sanctionedLoadKw > 0
        ? buildEstimate({
            segment,
            monthlyBillInr: monthlyBill,
            pincode: pincodeComplete ? pincode : undefined,
            sanctionedLoadKw,
          })
        : null,
    [segment, monthlyBill, pincode, pincodeComplete, sanctionedLoadKw],
  );

  const value: EstimateContextValue = {
    segment,
    setSegment,
    monthlyBill,
    setMonthlyBill,
    pincode,
    setPincode,
    touchPincode: () => setPincodeTouched(true),
    pincodeError: !pincodeComplete && (pincodeTouched || pincode.length === 6) ? PINCODE_ERROR : undefined,
    sanctionedLoad,
    setSanctionedLoad,
    estimate,
  };

  return <EstimateContext value={value}>{children}</EstimateContext>;
}
