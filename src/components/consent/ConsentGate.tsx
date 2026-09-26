"use client";

import type { ReactNode } from "react";
import { useConsentGranted } from "@/components/consent/useConsent";
import type { OptionalCategory } from "@/lib/consent";

/**
 * Renders its children only while the visitor has granted the category. It renders nothing on the
 * server and nothing before an answer, so a gated script cannot be requested first and asked about
 * afterwards (docs/discovery/18 §9.5.9).
 *
 * Use it for content that can simply disappear, such as an embed. Withdrawal works by unmounting,
 * so it is the wrong tool for a script that cannot be unloaded: Google Analytics is therefore NOT
 * behind this gate but follows the answer itself (components/analytics/GoogleAnalytics.tsx), so a
 * withdrawal can switch gtag.js off and delete its cookies.
 *
 * Adding a new provider of either kind: name it in the Analytics card of ConsentSettings and on
 * /cookies first, and bump CONSENT_VERSION so everyone who answered the earlier question is asked
 * again.
 */
export function ConsentGate({ category, children }: { category: OptionalCategory; children: ReactNode }) {
  return useConsentGranted(category) ? <>{children}</> : null;
}
