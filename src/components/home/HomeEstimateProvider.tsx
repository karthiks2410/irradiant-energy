"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { QuickQuoteHandoff } from "@/components/quote/QuickQuote";
import { billBounds } from "@/lib/solar/calc";

/**
 * The hero's bill, handed to the quote form further down the home page.
 *
 * The hero's "See my estimate" does not compute anything: it takes the visitor to the quote form
 * (components/home/HomeQuote.tsx) with the range their bill falls in already chosen and the cursor
 * in the first field. The two are six sections apart in the DOM and cannot share state any other
 * way. Children are passed through, so everything between them stays a Server Component and only
 * the two islands that read this hydrate.
 *
 * It used to carry the whole home calculator's inputs (property type, PIN, the sanctioned-load
 * focus request). The calculator band is gone (owner decision, 2026-09-27: the figures now come
 * after the contact details, as in the popup), so only the bill and the hand-off are left.
 */
interface HomeEstimateValue {
  /** Raw text, because it is typed: it only becomes a range once it parses to a positive number. */
  bill: string;
  setBill: (bill: string) => void;
  /** What the quote form is asked to take; `request` goes up with every "See my estimate". */
  handoff: QuickQuoteHandoff;
  requestEstimate: () => void;
}

const HomeEstimateContext = createContext<HomeEstimateValue | null>(null);

export function useHomeEstimate(): HomeEstimateValue {
  const value = useContext(HomeEstimateContext);
  if (!value) throw new Error("useHomeEstimate must be used inside <HomeEstimateProvider>");
  return value;
}

const positive = (value: string): number | null => {
  const parsed = Number(value);
  return value !== "" && Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export function HomeEstimateProvider({ children }: { children: ReactNode }) {
  // The hero opens on a typical home bill, as it always has; the visitor sees it and can change it.
  const [bill, setBill] = useState(() => String(billBounds("home").default));
  const [handoff, setHandoff] = useState<QuickQuoteHandoff>({ bill: null, request: 0 });

  const value = useMemo<HomeEstimateValue>(
    () => ({
      bill,
      setBill,
      handoff,
      requestEstimate: () => setHandoff((prev) => ({ bill: positive(bill), request: prev.request + 1 })),
    }),
    [bill, handoff],
  );

  return <HomeEstimateContext.Provider value={value}>{children}</HomeEstimateContext.Provider>;
}
