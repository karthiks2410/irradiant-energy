"use client";

import { useEffect } from "react";
import { useConsentRecord, useIsHydrated } from "@/components/consent/useConsent";
import { captureFirstTouch, clearFirstTouch } from "@/lib/leads/first-touch";

/**
 * Remembers how this visit began — landing page, campaign tags, referring site — for the lead
 * alert's "How they found us", and only while the visitor allows analytics
 * (src/lib/leads/first-touch.ts). Renders nothing.
 *
 * Mounted by the root layout next to <GoogleAnalytics>, i.e. only in a build that runs analytics,
 * because that is where the privacy notice describes it. Like <GoogleAnalytics>, it follows the
 * answer itself: allowed → remember (once per tab); anything else once hydrated → forget.
 */
export function LeadSourceCapture() {
  const record = useConsentRecord();
  const hydrated = useIsHydrated();
  const granted = record?.analytics === true;

  useEffect(() => {
    if (!hydrated) return;
    if (granted) captureFirstTouch();
    else clearFirstTouch();
  }, [hydrated, granted]);

  return null;
}
