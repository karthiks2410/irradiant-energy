/**
 * Visitor-facing wording for each engine flag.
 *
 * These explain what the calculator did, not what Irradiant promises; the numbers they qualify
 * are listed with their sources under "Assumptions".
 *
 * It lives beside the engine rather than in `src/components/quote/copy.ts`, where it used to,
 * because both the /get-quote islands and the home page's calculator panel need it and neither
 * may import a content module: the strings now reach `src/content/ui.ts` (which can be overlaid
 * in Kannada) and travel to the islands as props. The engine still owns the keys.
 */

import type { EstimateFlag } from "@/lib/solar/calc";

export const flagNotes: Record<EstimateFlag, string> = {
  "bill-defaulted": "Set your monthly bill to see figures for your own usage.",
  "bill-clamped": "Your bill is outside this calculator's range, so the nearest value was used.",
  "kwh-clamped": "Your usage is outside this calculator's range, so the nearest value was used.",
  "tariff-assumed-karnataka": "This estimate uses Karnataka (BESCOM) tariffs.",
  "tariff-assumed-bescom":
    "This PIN code may be served by another supplier; the estimate uses BESCOM tariffs.",
  "tariff-assumed-flat":
    "Society and business tariffs depend on a connection category a bill amount can't identify, so a flat average tariff is used.",
  "size-minimum-applied": "This calculator does not size systems below 1 kWp.",
  "size-capped-segment": "Capped at this calculator's largest size for this property type.",
  "size-capped-roof": "Capped by the roof area you entered.",
  "subsidy-not-applicable": "The PM Surya Ghar subsidy does not apply to commercial connections.",
  "subsidy-house-count-unknown": "Shown as an upper limit: the society subsidy also depends on the number of homes.",
};
