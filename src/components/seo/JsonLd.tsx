import { isConfirmed, site, type Fact } from "@/content/site";
import { absoluteUrl, socialImage } from "@/lib/seo";

/**
 * Structured data (report §13.4; docs/discovery/16-seo-deep-dive.md §4.3). Every value comes from
 * content/site.ts. Contact facts appear only once the owner has confirmed them: flipping a fact's
 * status there is all it takes to add the field here. geo and opening hours are never guessed;
 * they come from the owner (Google Business Profile pin, confirmed hours).
 *
 * <JsonLd/> is mounted once in the root layout. Pages add <BreadcrumbJsonLd/> and, where they
 * show a visible FAQ, <FaqJsonLd/>.
 */

type JsonLd = Record<string, unknown>;

function confirmed<T>(fact: Fact<T>): T | undefined {
  return isConfirmed(fact.status) ? fact.value : undefined;
}

function JsonLdScript({ data }: { data: JsonLd }) {
  // "<" is escaped so no string in the graph can close the script tag (Next JSON-LD guide).
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
  );
}

const organizationId = absoluteUrl("/#organization");
const businessId = absoluteUrl("/#business");
const websiteId = absoluteUrl("/#website");

function siteGraph(): JsonLd {
  const homeUrl = absoluteUrl("/");
  const telephone = confirmed(site.contact.phonePrimary)?.tel;
  const email = confirmed(site.contact.email);
  const address = confirmed(site.contact.address);

  const contact = {
    ...(telephone && { telephone }),
    ...(email && { email }),
    ...(address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: address.lines[0],
        addressLocality: address.locality,
        addressRegion: address.region,
        postalCode: address.postalCode,
        addressCountry: address.country,
      },
    }),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: site.name,
        // The legacy name stays permanently for entity continuity through the rename (D-001).
        alternateName: site.legacyName,
        url: homeUrl,
        logo: absoluteUrl("/apple-icon"),
        sameAs: site.social.map((profile) => profile.href),
        ...contact,
        ...(telephone && {
          contactPoint: [{ "@type": "ContactPoint", telephone, contactType: "sales", areaServed: "IN", availableLanguage: ["en"] }],
        }),
      },
      {
        // The most specific LocalBusiness subtype schema.org offers for a solar installer. Google
        // requires `address` for local rich results; it appears once the owner confirms it.
        "@type": "HomeAndConstructionBusiness",
        "@id": businessId,
        name: site.name,
        parentOrganization: { "@id": organizationId },
        url: homeUrl,
        image: absoluteUrl(socialImage.openGraphPath),
        areaServed: { "@type": "City", name: "Bengaluru" },
        ...contact,
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: site.name,
        alternateName: site.legacyName,
        url: homeUrl,
        inLanguage: "en-IN",
        publisher: { "@id": organizationId },
      },
    ],
  };
}

/** Site-wide Organization, local business and WebSite nodes. Mount once, in the root layout. */
export function JsonLd() {
  return <JsonLdScript data={siteGraph()} />;
}

export interface BreadcrumbItem {
  name: string;
  path: `/${string}`;
}

/** Mirrors the visible breadcrumb trail. Home is added automatically; pass the rest in order. */
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const trail: BreadcrumbItem[] = [{ name: "Home", path: "/" }, ...items];
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: absoluteUrl(item.path),
        })),
      }}
    />
  );
}

export interface FaqItem {
  question: string;
  /** Plain text, identical to the answer shown on the page. */
  answer: string;
}

/**
 * Google stopped showing FAQ rich results on 2026-05-07, so this earns no SERP feature; it still
 * describes the page for other engines and AI answer surfaces. Google's rule stands regardless:
 * the markup must mirror question-and-answer content that is visible and server-rendered.
 */
export function FaqJsonLd({ faqs }: { faqs: FaqItem[] }) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }}
    />
  );
}
