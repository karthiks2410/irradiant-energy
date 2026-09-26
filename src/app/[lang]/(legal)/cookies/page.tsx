// DRAFT — FOR COUNSEL REVIEW. The notice's text is in src/content/legal/cookies.ts, with the rule
// that matters most: it describes what the site does TODAY, so a tracker is described there (and
// put behind <ConsentGate>) before it is switched on, never after. <LegalPageShell> renders it in
// the page's language.

import { CookieSettingsPanel } from "@/components/consent/CookieSettingsPanel";
import { LegalPageShell } from "@/components/pages/LegalPageShell";
import { isLegalPageIndexable } from "@/content/legal";
import { getContent } from "@/i18n/content";
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

export default function CookiesPage() {
  return (
    <LegalPageShell
      slug="cookies"
      // The cookie's name is an identifier and its lifetime a number: facts from lib/consent.ts,
      // the same in every language.
      values={{ cookieName: CONSENT_COOKIE_NAME, days: CONSENT_COOKIE_DAYS }}
      // "…or the button below": the panel sits straight under the section that says so.
      after={{ "cookie-settings": <CookieSettingsPanel /> }}
    />
  );
}
