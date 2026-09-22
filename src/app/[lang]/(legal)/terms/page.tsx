// DRAFT — FOR COUNSEL REVIEW (docs/discovery/17, 18)
//
// Website-use terms only: this site sells nothing and takes no payment, so there is no order,
// cancellation or refund flow to cover. The points that matter for this build are that the
// calculator produces an estimate rather than an offer, and that nothing here may cut away a
// visitor's statutory rights. Counsel to confirm the governing-law and jurisdiction wording and
// the liability limits. The page is noindex until counsel approves it.

import { Link } from "@/components/i18n/LocaleLink";
import { LegalPageShell } from "@/components/pages/LegalPageShell";
import { PlaceholderTag } from "@/components/pages/PlaceholderTag";
import { isLegalPageIndexable } from "@/content/legal";
import { site } from "@/content/site";
import { langParams } from "@/i18n/registry";
import { getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export const generateStaticParams = () => langParams("terms");

export async function generateMetadata() {
  return pageMetadata({
    title: "Terms of use",
    description:
      "The terms for using the Irradiant Energy website, including why the savings calculator gives an estimate rather than a quotation or a guarantee.",
    path: "/terms",
    locale: await getLocale(),
    // Draft until counsel approves it (src/content/legal.ts); the sitemap reads the same flag.
    noindex: !isLegalPageIndexable("terms"),
  });
}

export default function TermsPage() {
  return (
    <LegalPageShell
      slug="terms"
      summary="The rules for using this website, and what our published figures do and do not promise."
    >
      <h2>About these terms</h2>
      <p>
        These terms apply when you use this website. If you do not agree with them, please do not use the site. They
        cover the website only — any work we do for you is covered by a separate written agreement.
      </p>
      <p>
        The site is operated by {site.name}
        {site.legal.entityName ? `, a brand of ${site.legal.entityName}` : ""}.{" "}
        {!site.legal.entityName && <PlaceholderTag>Legal entity name to be confirmed</PlaceholderTag>}
      </p>

      <h2>What this site is for</h2>
      <p>
        This site describes our rooftop solar services and lets you work out a rough idea of what a system might do for
        you. It is information, not financial, tax, legal, engineering or other professional advice, and you should not
        treat it as the basis for a decision on its own.
      </p>

      <h2>Estimates are not offers</h2>
      <p>
        The savings calculator produces an <strong>estimate</strong>. It is worked out from the figures you enter and
        from the assumptions we publish next to the result. It is not a quotation, an offer, a contract or a guarantee
        of any outcome.
      </p>
      <p>What you actually get depends on things the calculator cannot see, including:</p>
      <ul>
        <li>what a site survey finds — the roof area, its condition, structure, orientation and shading;</li>
        <li>your electricity distribution company&rsquo;s approval and the metering arrangement it allows;</li>
        <li>the equipment finally chosen and its price at the time;</li>
        <li>your tariff and how much electricity you actually use;</li>
        <li>the government schemes and rules in force when the system is installed.</li>
      </ul>
      <p>
        Government subsidies are decided, approved and paid by the government and your distribution company, not by us.
        We can help you with the paperwork, but we cannot promise that a subsidy will be granted or when it will
        arrive.
      </p>
      <p>
        We only make a firm commitment on price, equipment, timing or performance in a written proposal or contract
        signed for {site.name}.
      </p>

      <h2>Sending us an enquiry</h2>
      <p>
        Sending an enquiry or asking for an estimate does not create a contract between us. Please give us accurate
        details — our estimate and advice depend on them. How we handle your details is set out in our{" "}
        <Link href="/privacy">privacy notice</Link>.
      </p>
      <p>
        Please do not use this site or its forms to send unlawful, abusive or misleading content, to attempt to
        interfere with the site, or to collect data from it automatically.
      </p>

      <h2>Our content</h2>
      <p>
        The text, images, diagrams, layout, logo and name on this site belong to us or to the people we licensed them
        from. You may read the pages, print them and share links for your own use. Copying, republishing or reusing
        them for anything else needs our written permission first.
      </p>

      <h2>Links to other websites</h2>
      <p>
        We link to other websites: government scheme pages, distribution-company pages and map services. We do not
        control them and we are not responsible for their content or their practices.
      </p>

      <h2>Availability and accuracy</h2>
      <p>
        We cannot promise this site will always be available, complete or free of errors. Prices, scheme details and
        tariffs change, and pages may be out of date between updates. We may change, move or remove any part of the
        site at any time.
      </p>

      <h2>Our responsibility to you</h2>
      <p>
        As far as the law allows, we are not responsible for any loss that comes from relying on the information on
        this site, from the site being unavailable, or from anything on a website we link to.
      </p>
      <p>
        Nothing in these terms removes or limits anything that cannot be removed or limited by law, and nothing here
        takes away your rights as a consumer or your right to complain to an authority.
      </p>

      <h2>Governing law</h2>
      {/* Counsel to confirm the forum clause; "courts at Bengaluru" follows docs/discovery/18 §10.1.
          This one stays Bengaluru deliberately even though the business now describes itself as
          serving Karnataka: a forum clause names the court with jurisdiction over the registered
          office, not the area the company sells into. */}
      <p>
        These terms are governed by the law of India, and the courts at Bengaluru, Karnataka deal with any dispute
        about them.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms. The version and effective date appear at the top of this page, and the version on
        the site when you use it is the one that applies.
      </p>
    </LegalPageShell>
  );
}
