import { Link } from "@/components/i18n/LocaleLink";
import { AccentedTitle } from "@/components/pages/AccentedTitle";
import { PageHero } from "@/components/pages/PageHero";
import { PlaceholderTag } from "@/components/pages/PlaceholderTag";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { ClosingCtaBand } from "@/components/solutions/ClosingCta";
import { ButtonLink, Card, Eyebrow, Section } from "@/components/ui";
import { site, whatsappLink } from "@/content/site";
import { getContent } from "@/i18n/content";
import { fill } from "@/i18n/format";
import { langParams } from "@/i18n/registry";
import { getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export const generateStaticParams = () => langParams("contact");

export async function generateMetadata() {
  const locale = await getLocale();
  const { meta } = getContent(locale).contact;
  return pageMetadata({ title: meta.title, description: meta.description, path: "/contact", locale });
}

const { address, email, phonePrimary, phoneSecondary } = site.contact;

const phones = [phonePrimary.value, phoneSecondary.value];

/**
 * A plain Google Maps search link, never an embedded map: an iframe would load third-party code
 * and set identifiers before the visitor asks for it (docs/discovery/18 §9.3).
 */
const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.value.lines.join(", "))}`;

const contactLink =
  "inline-flex min-h-11 items-center font-display text-h3 font-semibold text-carbon underline-offset-4 transition-colors duration-200 ease-controlled hover:text-green-700 hover:underline";

const inlineLink = "font-medium text-green-700 underline underline-offset-2 hover:text-teal-900";

/** Each way in is one row on a shared hairline rhythm, so no route looks more official than another. */
const contactRow = "border-t border-mist pt-8 first:border-t-0 first:pt-0";

/**
 * The text on either side of a `{hole}` in a sentence that wraps an ELEMENT — a link, a phone
 * number that has to stay clickable — with the space that abuts the hole taken off.
 *
 * The page then writes `{before}{" "}<a …/>{" "}{after}`, which is the same child sequence React
 * emitted when the sentence was three JSX children with the link welded into the middle: the
 * space stays its own child, so the `<!-- -->` separators in the English markup do not move.
 * What changes is that each locale now decides where in its own sentence the hole sits.
 */
function around(template: string, name: string): [string, string] {
  const [before = "", after = ""] = template.split(`{${name}}`);
  return [before.replace(/ $/, ""), after.replace(/^ /, "")];
}

export default async function ContactPage() {
  const content = getContent(await getLocale());
  const { breadcrumb, hero, ways, grievance, callBack } = content.contact;
  const whatsappPrompt = fill(ways.whatsapp.prefill, { siteName: site.name });
  const [noticeBefore, noticeAfter] = around(grievance.privacyNotice, "privacyNoticeLink");
  const [fallbackHead, fallbackTail] = around(grievance.fallback, "email");
  const [fallbackMiddle, fallbackEnd] = around(fallbackTail, "phone");

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: breadcrumb, path: "/contact" }]} />

      {/* PROPOSED CONTENT — REQUIRES CLIENT APPROVAL: positioning copy, no promise of a response time. */}
      <PageHero
        current={breadcrumb}
        title={<AccentedTitle text={hero.title} tail={2} accent={hero.accent} />}
        lead={hero.lead}
      />

      <Section surface="white" aria-labelledby="contact-ways-heading">
        <div className="grid-page items-start gap-y-12">
          <div className="col-span-4 md:col-span-8 lg:col-span-7">
            {/* The heading used to be screen-reader-only, which left the column opening on a bare
                list of numbers. It is the section's subject, so it is on the page now. */}
            <h2 id="contact-ways-heading" className="font-display text-h2 font-bold">
              {ways.heading}
            </h2>

            <ul className="mt-10 space-y-8">
              <li className={contactRow}>
                <Eyebrow>{ways.callEyebrow}</Eyebrow>
                {/* One tel: link per number — the legacy site wrapped both numbers in a single link. */}
                <ul className="mt-3">
                  {phones.map((phone) => (
                    <li key={phone.tel}>
                      <a href={`tel:${phone.tel}`} className={contactLink}>
                        {phone.display}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>

              <li className={contactRow}>
                <Eyebrow>{ways.whatsapp.eyebrow}</Eyebrow>
                <p className="mt-3 max-w-[62ch] text-body text-ink-2">{ways.whatsapp.body}</p>
                <ButtonLink
                  href={whatsappLink(whatsappPrompt)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5"
                  arrow={false}
                >
                  {ways.whatsapp.button}
                </ButtonLink>
              </li>

              <li className={contactRow}>
                <Eyebrow>{ways.emailEyebrow}</Eyebrow>
                <p className="mt-3">
                  <a href={`mailto:${email.value}`} className={contactLink}>
                    {email.value}
                  </a>
                </p>
              </li>
            </ul>
          </div>

          <div className="col-span-4 md:col-span-8 lg:col-span-5">
            {/*
             * No opening-hours line anywhere on the site: the owner's instruction of 2026-09-19
             * (src/content/site.ts) rules out both published hours and any "always available"
             * claim. Whether visitors can come to the office is likewise unconfirmed, so the card
             * says only where we are.
             */}
            <Card padding="lg" className="border-t-2 border-t-green-500">
              <Eyebrow rule={false}>{ways.office.eyebrow}</Eyebrow>
              <address className="mt-4 text-body not-italic text-ink-2">
                {address.value.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-11 items-center font-medium text-green-700 underline underline-offset-4 transition-colors duration-200 ease-controlled hover:text-teal-900"
              >
                {ways.office.mapsLink}
              </a>
            </Card>
          </div>
        </div>
      </Section>

      <Section surface="canvas" id="grievance" aria-labelledby="contact-grievance-heading">
        <div className="max-w-prose">
          <h2 id="contact-grievance-heading" className="font-display text-h3 font-bold text-carbon">
            {grievance.heading}
          </h2>
          <p className="mt-4 text-body text-ink-2">{grievance.body}</p>
          <p className="mt-4 text-body text-ink-2">
            {site.legal.grievanceOfficer ? (
              // A name and an address, not a sentence: the em dash is punctuation between two
              // facts, so there is nothing here to translate.
              <>
                {site.legal.grievanceOfficer.name} —{" "}
                <a href={`mailto:${site.legal.grievanceOfficer.email}`} className={inlineLink}>
                  {site.legal.grievanceOfficer.email}
                </a>
              </>
            ) : (
              <>
                {/* Development scaffolding; nothing in this branch renders while site.ts names an
                    officer, but the sentence is translated all the same. */}
                <PlaceholderTag>Grievance contact to be named</PlaceholderTag>{" "}
                {fallbackHead}{" "}
                <a href={`mailto:${email.value}`} className={inlineLink}>
                  {email.value}
                </a>{" "}
                {fallbackMiddle}{" "}
                <a href={`tel:${phonePrimary.value.tel}`} className={inlineLink}>
                  {phonePrimary.value.display}
                </a>{" "}
                {fallbackEnd}
              </>
            )}
          </p>
          <p className="mt-4 text-body text-ink-2">
            {noticeBefore}{" "}
            <Link href="/privacy" className={inlineLink}>
              {grievance.privacyNoticeLink}
            </Link>{" "}
            {noticeAfter}
          </p>
        </div>
      </Section>

      {/* The phone numbers are the subject of this page, so the shared band drops its call link. */}
      <ClosingCtaBand
        content={content}
        copy={callBack}
        primary={content.primaryCta}
        whatsappText={whatsappPrompt}
        showCall={false}
      />
    </>
  );
}
