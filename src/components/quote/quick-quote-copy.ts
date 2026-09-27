import type { Content } from "@/i18n/content";
import type { QuickQuoteCopy } from "./QuickQuote";

/**
 * Every word the quick-quote form prints, in the page's language, for either surface: the popup in
 * the layout and the form on the home page. One builder, so the two can never word the same field
 * differently.
 *
 * Server-side on purpose: it reads the merged content, which a client module may not import
 * (scripts/check-client-content.ts); the result travels to the client islands as a prop.
 */
export function quickQuoteCopy(content: Content): QuickQuoteCopy {
  return {
    ...content.ui.quickQuote,
    fieldErrors: content.quote.form.fieldErrors,
    formErrors: content.quote.form.formErrors,
    segmentNames: content.ui.calculator.segments,
  };
}
