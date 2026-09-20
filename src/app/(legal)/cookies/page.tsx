// DRAFT — FOR COUNSEL REVIEW (docs/discovery/17, 18)
//
// This page describes what the site does TODAY: no analytics, no advertising tags, no third-party
// embeds, so there is nothing to ask consent for and no banner (docs/discovery/18 §9.1–§9.3).
// Fonts are self-hosted by the framework and maps are plain links, so no third-party request is
// made on page load.
//
// IF ANYTHING CHANGES — Vercel Web Analytics, a tag manager, a pixel, an embedded map or video —
// this page and the privacy notice must be updated first, and a consent mechanism added before the
// tracker ships. Do not switch on a tracker and describe it later.
//
// The page is noindex until counsel approves it.

import Link from "next/link";
import { LegalPageShell } from "@/components/pages/LegalPageShell";
import { isLegalPageIndexable } from "@/content/legal";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Cookies and analytics",
  description:
    "This site uses no analytics or advertising cookies, so there is nothing to consent to. What that means, and what would change if we ever add them.",
  path: "/cookies",
  // Draft until counsel approves it (src/content/legal.ts); the sitemap reads the same flag.
  noindex: !isLegalPageIndexable("cookies"),
});

const { email } = site.contact;

export default function CookiesPage() {
  return (
    <LegalPageShell
      slug="cookies"
      summary="We do not track you here. This page explains what that means and what we would do if that ever changed."
    >
      <h2>The short version</h2>
      <p>
        This site does not use analytics cookies, advertising cookies or any third-party tracking script. Nothing
        follows you from page to page or across other websites. That is why you are not being asked to accept
        anything.
      </p>

      <h2>What cookies are</h2>
      <p>
        A cookie is a small file a website asks your browser to keep. Sites use them to remember a choice you made, to
        keep you signed in, or — most often — to count and follow visitors. Browsers can also store data in other ways,
        such as local storage, and the same thinking applies to those.
      </p>

      <h2>What this site uses today</h2>
      <ul>
        <li>
          <strong>No analytics.</strong> We do not measure visits with Google Analytics or any similar service, and no
          measurement script runs on these pages.
        </li>
        <li>
          <strong>No advertising or social pixels.</strong> Nothing here builds an advertising audience.
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
        Separately from cookies, our hosting provider keeps a technical record of each request — the internet address
        your device is using, the browser and device type, the page requested and the time. That is described in our{" "}
        <Link href="/privacy">privacy notice</Link>.
      </p>

      <h2>Why there is no cookie banner</h2>
      <p>
        A banner exists to ask permission for tracking. Since we do not track, there is nothing to ask for, and a
        banner would only be noise. If we ever add measurement or advertising tools, we will ask you before they load,
        make refusing as easy as accepting, add a way to change your mind later, and describe on this page exactly what
        each tool does.
      </p>

      <h2>Maps, videos and other embedded content</h2>
      <p>
        We do not embed maps, videos or social feeds, because an embed loads another company&rsquo;s code into the page
        whether you use it or not. Where a map or another website is useful, we link to it instead, so nothing loads
        until you choose to follow the link.
      </p>

      <h2>Controlling cookies yourself</h2>
      <p>
        Every browser lets you see, block and delete cookies and site data, usually under privacy or site settings.
        Blocking everything can stop parts of some websites working — on this site it will not stop you reading a page
        or sending us an enquiry.
      </p>

      <h2>Changes to this page</h2>
      <p>
        If what we use changes, we will update this page before the change goes live. The version and the date it
        takes effect appear at the top.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this page: <a href={`mailto:${email.value}`}>{email.value}</a>, or use our{" "}
        <Link href="/contact">contact page</Link>.
      </p>
    </LegalPageShell>
  );
}
