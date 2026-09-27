"use client";

import { QuickQuoteInline, type QuickQuoteCopy } from "@/components/quote/QuickQuote";
import { useHomeEstimate } from "./HomeEstimateProvider";

/**
 * The quote form in the home page's quote band, joined to the hero: the bill typed there arrives
 * here as a range to pre-select. Everything else is <QuickQuoteInline>, the popup's own form.
 */
export function HomeQuoteForm({ copy }: { copy: QuickQuoteCopy }) {
  const { handoff } = useHomeEstimate();
  return <QuickQuoteInline copy={copy} handoff={handoff} />;
}
