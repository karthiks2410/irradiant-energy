"use client";

import type { ReactNode } from "react";
import { useConsentGranted } from "@/components/consent/useConsent";
import type { OptionalCategory } from "@/lib/consent";

/**
 * Renders its children only while the visitor has granted the category. It renders nothing on the
 * server and nothing before an answer, so a gated script cannot be requested first and asked about
 * afterwards (docs/discovery/18 §9.5.9).
 *
 * **Nothing is gated today.** No analytics provider is installed, no dependency was added, and this
 * component has no call sites yet — switching one on is the owner's decision, not a build decision
 * (see the owner to-dos in the handoff). When that decision is made, the whole change is:
 *
 *     // src/app/layout.tsx
 *     <ConsentGate category="analytics">
 *       <Analytics />           // whichever provider was chosen
 *     </ConsentGate>
 *
 * plus naming the provider in the Analytics card of ConsentSettings and on /cookies, and bumping
 * CONSENT_VERSION so that everyone who answered the earlier, provider-less question is asked again.
 *
 * Withdrawal works by unmounting: the provider's component is removed the moment consent is
 * withdrawn. A provider that leaves cookies behind also needs those cleared — do that in the
 * provider's own wrapper when there is one to clear.
 */
export function ConsentGate({ category, children }: { category: OptionalCategory; children: ReactNode }) {
  return useConsentGranted(category) ? <>{children}</> : null;
}
