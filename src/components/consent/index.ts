/**
 * Consent UI. The store itself is framework-free and lives in src/lib/consent.ts.
 *
 * - `<ConsentManager />` — mount once, in the root layout, after the footer.
 * - `<CookieSettingsLink />` — the persistent re-open point, for the footer's Legal column.
 * - `<CookieSettingsPanel />` — the same control with the current answer, for /cookies.
 * - `<ConsentGate category="analytics">` — wrap anything that may only load after an opt-in.
 */
export { ConsentBanner } from "./ConsentBanner";
export { ConsentGate } from "./ConsentGate";
export { ConsentManager } from "./ConsentManager";
export { ConsentSettings } from "./ConsentSettings";
export { CookieSettingsLink } from "./CookieSettingsLink";
export { CookieSettingsPanel } from "./CookieSettingsPanel";
export { useConsentGranted, useConsentRecord } from "./useConsent";
