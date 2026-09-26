"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useConsentRecord, useIsHydrated } from "@/components/consent/useConsent";
import { disableAnalytics, enableAnalytics, trackPageView } from "@/lib/gtag";

/**
 * Google Analytics 4, behind the visitor's analytics answer. Renders nothing.
 *
 * The root layout mounts it only when this build has a measurement ID (src/lib/analytics.ts), and
 * it requests gtag.js only once the stored answer says analytics is allowed. On the server, during
 * hydration and while the question is unanswered, it does nothing at all: no script, no cookie, no
 * request to Google.
 *
 * It is not wrapped in <ConsentGate>, deliberately. A gate unmounts its children when consent goes,
 * but gtag.js cannot be unloaded, so an unmount would stop nothing; and an unmount for any other
 * reason must not be mistaken for a withdrawal. So this component stays mounted and follows the
 * answer itself:
 * - allowed → load and configure once, then count each page view;
 * - anything else, once hydrated (refused, withdrawn, unanswered, or an answer to an older
 *   CONSENT_VERSION) → the kill switch and the `_ga` cookies deleted. That is a no-op for a visitor
 *   who never allowed it, and it removes cookies left by an answer that has since lapsed.
 */
export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const record = useConsentRecord();
  const hydrated = useIsHydrated();
  const pathname = usePathname();
  const granted = record?.analytics === true;

  // Declared before the page-view effect: effects run in order, so the first page view is sent
  // after gtag is configured, in the same commit that granted consent.
  useEffect(() => {
    // Before hydration the answer always reads as "none", which must not delete a real grant's
    // cookies on every page load.
    if (!hydrated) return;
    if (granted) enableAnalytics(measurementId);
    else disableAnalytics(measurementId);
  }, [hydrated, granted, measurementId]);

  useEffect(() => {
    if (granted) trackPageView(pathname);
  }, [granted, pathname]);

  return null;
}
