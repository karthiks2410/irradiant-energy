"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { languageOf } from "@/lib/events";
import { track } from "@/lib/gtag";
import { billBandFor } from "@/lib/leads/quick";
import type { Segment } from "@/lib/solar/constants";

/** How long the inputs must rest before the use is counted, so the band is the one they settled on. */
const SETTLE_MS = 1_200;

/**
 * use_calculator, once per page view, after the visitor's first real change to a calculator input
 * (analytics consent only; src/lib/gtag.ts `track`). The provider calls the returned `markUsed`
 * from its setters, so defaults and remounts never count as use. The event waits for the inputs to
 * rest, then reports the property type and the bill's RANGE id — never the typed amount, the PIN
 * code or the sanctioned load.
 *
 * "Once per page view" is this hook's lifetime: the calculator's provider mounts with the page and
 * unmounts when the visitor leaves it.
 */
export function useCalculatorUse(segment: Segment, bill: number | null): () => void {
  const [used, setUsed] = useState(false);
  const sent = useRef(false);

  useEffect(() => {
    if (!used || sent.current) return;
    const timer = window.setTimeout(() => {
      // Only a send that happened counts: without consent `track` does nothing, and the next change
      // after the visitor allows analytics may still be counted on this page.
      sent.current = track("use_calculator", {
        property_type: segment,
        bill_band: billBandFor(segment, bill),
        site_language: languageOf(window.location.pathname),
      });
    }, SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [used, segment, bill]);

  return useCallback(() => setUsed(true), []);
}
