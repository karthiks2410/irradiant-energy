// DRAFT — FOR COUNSEL REVIEW. The notice's text is in src/content/legal/cookies.ts, with the rule
// that matters most: it describes what the site actually does, so a tracker is described there
// (and put behind the consent answer) before it is switched on, never after. Google Analytics is
// described in both builds, and the one sentence that depends on whether this build has a
// measurement ID follows `analyticsEnabled` (src/lib/analytics.ts). <LegalPageShell> renders it in
// the page's language.

import { CookieSettingsPanel } from "@/components/consent/CookieSettingsPanel";
import { LegalPageShell } from "@/components/pages/LegalPageShell";
import { isLegalPageIndexable } from "@/content/legal";
import { getContent } from "@/i18n/content";
import { gaMeasurementId } from "@/lib/analytics";
import { CONSENT_COOKIE_DAYS, CONSENT_COOKIE_NAME } from "@/lib/consent";
import { langParams } from "@/i18n/registry";
import { getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export const generateStaticParams = () => langParams("cookies");

export async function generateMetadata() {
  const locale = await getLocale();
  const { title, description } = getContent(locale).legal.cookies;
  return pageMetadata({
    title,
    description,
    path: "/cookies",
    locale,
    // Draft until counsel approves it (src/content/legal/index.ts); the sitemap reads the same flag.
    noindex: !isLegalPageIndexable("cookies"),
  });
}

/** GA4 names its second cookie after the measurement ID without the "G-": _ga_ABC123. */
const containerCookie = `_ga_${gaMeasurementId ? gaMeasurementId.slice(2) : "…"}`;

export default function CookiesPage() {
  return (
    <LegalPageShell
      slug="cookies"
      // The cookies' names are identifiers and their lifetime a number: facts from lib/consent.ts
      // and lib/analytics.ts, the same in every language. The _ga cookies share CONSENT_COOKIE_DAYS
      // (lib/gtag.ts), so one {days} serves both.
      values={{ cookieName: CONSENT_COOKIE_NAME, days: CONSENT_COOKIE_DAYS, gaCookie: containerCookie }}
      // "…or the button below": the panel sits straight under the section that says so.
      after={{ "cookie-settings": <CookieSettingsPanel /> }}
    />
  );
}
