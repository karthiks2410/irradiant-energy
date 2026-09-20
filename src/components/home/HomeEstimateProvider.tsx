"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { billBounds, type Segment } from "@/lib/solar/calc";

/**
 * The three inputs the home page's estimate rests on, shared between the hero and the calculator
 * band so the hero can start the estimate and the calculator can finish it.
 *
 * It exists because those two are six sections apart in the DOM and cannot hold the state between
 * them any other way. Children are passed through, so everything between the two stays a Server
 * Component and only the two islands that read this hydrate.
 *
 * Only the inputs live here. The estimate itself is derived where it is shown, so nothing
 * recomputes for a section that is not displaying a figure.
 */
interface HomeEstimateValue {
  segment: Segment;
  setSegment: (segment: Segment) => void;
  /** Raw text, because it is typed: the engine only sees it once it parses to a positive number. */
  bill: string;
  setBill: (bill: string) => void;
  /** Raw text as typed; a PIN code is extracted from it, so "560001" and "Anekal 562106" both work. */
  location: string;
  setLocation: (location: string) => void;
}

const HomeEstimateContext = createContext<HomeEstimateValue | null>(null);

export function useHomeEstimate(): HomeEstimateValue {
  const value = useContext(HomeEstimateContext);
  if (!value) throw new Error("useHomeEstimate must be used inside <HomeEstimateProvider>");
  return value;
}

export function HomeEstimateProvider({ children }: { children: ReactNode }) {
  const [segment, setSegmentState] = useState<Segment>("home");
  const [bill, setBill] = useState(() => String(billBounds("home").default));
  const [location, setLocation] = useState("");

  const value = useMemo<HomeEstimateValue>(
    () => ({
      segment,
      // Bill ranges differ per segment, so the bill restarts at the new segment's typical value.
      setSegment: (next) => {
        setSegmentState(next);
        setBill(String(billBounds(next).default));
      },
      bill,
      setBill,
      location,
      setLocation,
    }),
    [segment, bill, location],
  );

  return <HomeEstimateContext.Provider value={value}>{children}</HomeEstimateContext.Provider>;
}
