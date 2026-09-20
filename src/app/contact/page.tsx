import Link from "next/link";
import { AccentedTitle } from "@/components/pages/AccentedTitle";
import { PlaceholderTag } from "@/components/pages/PlaceholderTag";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { ButtonLink, Card, Eyebrow, Section, SectionHeading } from "@/components/ui";
import { primaryCta, site, whatsappLink } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact us",
  description:
    "Call, WhatsApp or email Irradiant Energy about rooftop solar for your home, housing society or business — or ask us to call you back.",
  path: "/contact",
});

const { address, email, phonePrimary, phoneSecondary } = site.contact;

const phones = [phonePrimary.value, phoneSecondary.value];

/** Legacy global WhatsApp prefill (report §11.2), with the rename applied (D-001). */
const whatsappPrompt = `Hi! I'm interested in learning more about ${site.name} solar solutions.`;

/**
 * A plain Google Maps search link, never an embedded map: an iframe would load third-party code
 * and set identifiers before the visitor asks for it (docs/discovery/18 §9.3).
 */
const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.value.lines.join(", "))}`;

const contactLink =
  "inline-flex min-h-11 items-center font-display text-h3 font-semibold text-carbon underline-offset-4 transition-colors duration-200 ease-controlled hover:text-green-700 hover:underline";

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Contact", path: "/contact" }]} />

      <Section surface="dark" aria-labelledby="contact-hero-heading">
        {/* PROPOSED CONTENT — REQUIRES CLIENT APPROVAL: positioning copy, no promise of a response time. */}
        <SectionHeading
          id="contact-hero-heading"
          headingLevel={1}
          align="stacked"
          eyebrow="Contact"
          title={<AccentedTitle text="Talk to us about your roof." tail={2} />}
          lead="Call, message or write — whichever suits you. Tell us where you are and what you would like to power, and we will take it from there."
        />
      </Section>

      <Section surface="white" aria-labelledby="contact-ways-heading">
        <h2 id="contact-ways-heading" className="sr-only">
          Ways to reach us
        </h2>
        <div className="grid-page gap-y-12">
          <div className="col-span-4 md:col-span-8 lg:col-span-7">
            <ul className="space-y-10">
              <li>
                <Eyebrow>Call us</Eyebrow>
                {/* One tel: link per number — the legacy site wrapped both numbers in a single link. */}
                <ul className="mt-2">
                  {phones.map((phone) => (
                    <li key={phone.tel}>
                      <a href={`tel:${phone.tel}`} className={contactLink}>
                        {phone.display}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>

              <li>
                <Eyebrow>WhatsApp</Eyebrow>
                <p className="mt-2 text-body text-ink-2">
                  Send photos of your roof or your last electricity bill and we can start from there.
                </p>
                <ButtonLink
                  href={whatsappLink(whatsappPrompt)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4"
                  arrow={false}
                >
                  Message us on WhatsApp
                </ButtonLink>
              </li>

              <li>
                <Eyebrow>Email</Eyebrow>
                <p className="mt-2">
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
            <Card padding="lg">
              <Eyebrow>Our office</Eyebrow>
              <address className="mt-3 text-body not-italic text-ink-2">
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
                Open the address in Google Maps
              </a>
            </Card>
          </div>
        </div>
      </Section>

      <Section surface="canvas" id="grievance" aria-labelledby="contact-grievance-heading">
        <div className="max-w-prose">
          <Eyebrow>Privacy</Eyebrow>
          <h2 id="contact-grievance-heading" className="mt-4 font-display text-h3 font-bold text-carbon">
            Grievance and privacy contact
          </h2>
          <p className="mt-4 text-body text-ink-2">
            Write here if you want to know what personal information we hold about you, have it corrected or deleted,
            withdraw a consent you gave us, or complain about the way we handled your details.
          </p>
          <p className="mt-4 text-body text-ink-2">
            {site.legal.grievanceOfficer ? (
              <>
                {site.legal.grievanceOfficer.name} —{" "}
                <a
                  href={`mailto:${site.legal.grievanceOfficer.email}`}
                  className="font-medium text-green-700 underline underline-offset-2 hover:text-teal-900"
                >
                  {site.legal.grievanceOfficer.email}
                </a>
              </>
            ) : (
              <>
                <PlaceholderTag>Grievance contact to be named</PlaceholderTag> Email{" "}
                <a
                  href={`mailto:${email.value}`}
                  className="font-medium text-green-700 underline underline-offset-2 hover:text-teal-900"
                >
                  {email.value}
                </a>{" "}
                or call{" "}
                <a
                  href={`tel:${phonePrimary.value.tel}`}
                  className="font-medium text-green-700 underline underline-offset-2 hover:text-teal-900"
                >
                  {phonePrimary.value.display}
                </a>{" "}
                and say that it is a privacy request.
              </>
            )}
          </p>
          <p className="mt-4 text-body text-ink-2">
            Our{" "}
            <Link href="/privacy" className="font-medium text-green-700 underline underline-offset-2 hover:text-teal-900">
              privacy notice
            </Link>{" "}
            sets out what we collect through this site and why.
          </p>
        </div>
      </Section>

      <Section surface="dark" aria-labelledby="contact-cta-heading">
        <SectionHeading
          id="contact-cta-heading"
          align="center"
          title={<AccentedTitle text="Prefer a call back?" tail={2} />}
          lead="Send us your PIN code and a rough idea of your monthly electricity bill, and we will come back to you about your roof."
        />
        <div className="mt-10 flex justify-center">
          <ButtonLink href={primaryCta.href} variant="light">
            {primaryCta.label}
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
