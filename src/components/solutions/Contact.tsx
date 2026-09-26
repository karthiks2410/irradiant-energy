import { ButtonLink } from "@/components/ui";
import { site, whatsappLink } from "@/content/site";

type Variant = "primary" | "light" | "outline" | "outline-light";

/**
 * WhatsApp CTA with a page-specific prefill (report §11.1 level 3). The prefill carries no
 * personal data — only the question the visitor is likely to be asking on this page.
 *
 * The label is a required prop rather than a default read from the content module: this button
 * appears on four pages, and each of them already holds the merged content for its locale
 * (`content.faqCardLabels.whatsappLabel`). A default imported here would always be the English
 * one, which is exactly the bug that makes a Kannada page half English.
 */
export function WhatsAppButton({
  text,
  label,
  variant = "outline",
  className = "",
}: {
  /** Page-specific prefill. Left out where no approved prefill exists. */
  text?: string;
  label: string;
  variant?: Variant;
  className?: string;
}) {
  return (
    <ButtonLink
      href={whatsappLink(text)}
      variant={variant}
      arrow={false}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {label}
    </ButtonLink>
  );
}

/** Call CTA. One link per number (report §11.1); opening hours are never shown (site.ts). */
export function CallLink({ label, className = "" }: { label: string; className?: string }) {
  const phone = site.contact.phonePrimary.value;
  return (
    <a
      href={`tel:${phone.tel}`}
      className={`inline-flex min-h-11 items-center gap-2 text-ui font-semibold text-green-700 underline-offset-4 transition-colors duration-200 hover:underline in-data-[surface=dark]:text-green-300 in-data-[surface=dark]:hover:text-white ${className}`}
    >
      {label}
      <span className="font-mono font-medium">{phone.display}</span>
    </a>
  );
}
