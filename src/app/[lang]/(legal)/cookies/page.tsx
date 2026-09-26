// DRAFT — FOR COUNSEL REVIEW (docs/discovery/17, 18)
//
// This page describes what the site does TODAY: no analytics, no advertising tags, no third-party
// embeds. Fonts are self-hosted by the framework and maps are plain links, so no third-party
// request is made on page load.
//
// A consent banner IS shown (owner instruction, review round 2), and it asks the one question the
// site could honestly ask: permission in advance, before any measurement exists. Every word here
// has to match what src/components/consent/* actually does — the old site's banner described GA4
// and Google Ads that were never loaded while Vercel Analytics ran regardless of the answer
// (docs/discovery/17 §2.6, 18 §9.6), and that is the failure this page exists to avoid repeating.
//
// IF ANYTHING CHANGES — Vercel Web Analytics, a tag manager, a pixel, an embedded map or video —
// update this page, the Analytics card in ConsentSettings and the privacy notice FIRST, put the
// tracker behind <ConsentGate>, and bump CONSENT_VERSION so every earlier answer is asked again.
// Do not switch on a tracker and describe it later.
//
// The page is noindex until counsel approves it.

import { Link } from "@/components/i18n/LocaleLink";
import { CookieSettingsPanel } from "@/components/consent/CookieSettingsPanel";
import { LegalPageShell } from "@/components/pages/LegalPageShell";
import { isLegalPageIndexable } from "@/content/legal";
import { CONSENT_COOKIE_DAYS, CONSENT_COOKIE_NAME } from "@/lib/consent";
import { langParams } from "@/i18n/registry";
import { getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export const generateStaticParams = () => langParams("cookies");

export async function generateMetadata() {
  return pageMetadata({
    title: "Cookies and analytics",
    description:
      "This site loads no analytics and no advertising cookies. What we ask you in the privacy banner, what your answer stores, and what would change if we ever add measurement.",
    path: "/cookies",
    locale: await getLocale(),
    // Draft until counsel approves it (src/content/legal.ts); the sitemap reads the same flag.
    noindex: !isLegalPageIndexable("cookies"),
  });
}

export default function CookiesPage() {
  return (
    <LegalPageShell
      slug="cookies"
      summary="We do not track you here. This page explains what that means and what the privacy banner asks."
    >
      <h2>What cookies are</h2>
      <p>
        A cookie is a small file a website asks your browser to keep. This page also covers other browser storage, such
        as local storage.
      </p>

      <h2>What this site uses today</h2>
      <ul>
        <li>
          <strong>No analytics.</strong> We do not measure visits with Google Analytics or any similar service, and no
          measurement script runs on these pages. The Analytics switch in your preferences is there for the day that
          changes; while it is off, nothing loads.
        </li>
        <li>
          <strong>No advertising or social pixels.</strong> Nothing here builds an advertising audience.
        </li>
        <li>
          <strong>Your privacy answer.</strong> If you answer the banner, we keep one first-party cookie named{" "}
          <strong>{CONSENT_COOKIE_NAME}</strong> for {CONSENT_COOKIE_DAYS} days. It records your answer, the date and a
          version number — no name, no identifier, nothing that describes you. Delete it and we simply ask again.
        </li>
        <li>
          <strong>No third-party fonts or icons loaded from other companies.</strong> The typefaces are served from
          this site, so your browser does not have to ask anyone else for them.
        </li>
        <li>
          <strong>Security checks.</strong> Our hosting provider may set a short-lived cookie if it needs to confirm
          that a request comes from a person rather than an automated tool. It is used only to protect the site.
        </li>
      </ul>
      <p>
        Separately from cookies, our hosting provider keeps a technical record of each request, described in our{" "}
        <Link href="/privacy">privacy notice</Link>.
      </p>

      <h2>What the privacy banner asks, and why</h2>
      <p>
        Nothing that needs permission loads here today, so the banner asks one question, once and in advance: may we
        count visits if we ever switch measurement on?
      </p>
      <p>
        Whichever answer you give, the site behaves exactly the same. While the banner is unanswered, nothing optional
        loads, which is the same thing that happens if you refuse.
      </p>
      <p>
        Accept and Reject are the same button in two colours, the same size, side by side. Refusing has to be exactly
        as easy as accepting, so there is no pre-ticked box, no &ldquo;are you sure?&rdquo;, and no close button that
        quietly counts as a yes.
      </p>

      <h2 id="cookie-settings">Your choice, and changing it</h2>
      <p>
        You can change your answer whenever you like: use <strong>Cookie settings</strong> in the footer of any page,
        or the button below. Withdrawing is one action, and it takes effect immediately.
      </p>
      <CookieSettingsPanel />

      <h2>Maps, videos and other embedded content</h2>
      <p>
        We do not embed maps, videos or social feeds. Where a map or another website is useful, we link to it instead,
        so nothing loads until you follow the link.
      </p>

      <h2>Controlling cookies yourself</h2>
      <p>
        Every browser lets you see, block and delete cookies and site data, usually under privacy or site settings.
        On this site, blocking them will not stop you reading a page or sending us an enquiry. The only effect here is
        that we cannot remember your answer, so the banner asks again on every page.
      </p>

      <h2>Changes to this page</h2>
      <p>
        If what we use changes, we will update this page before the change goes live. The version and effective date
        appear at the top.
      </p>
    </LegalPageShell>
  );
}
