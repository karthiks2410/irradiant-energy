import { Fragment } from "react";
import { fillParts, type TemplateValues } from "@/i18n/format";

/**
 * Render a `{placeholder}` template as JSX.
 *
 * Use it wherever a sentence has a value in the middle of it — "Call {phone}",
 * "{groupLabel} · Rooftop solar", "Message {siteName} on WhatsApp". The alternative,
 * `Call {phone}` written straight into JSX, hard-codes English word order: in Kannada the
 * number comes first and the verb last.
 *
 * It renders the pieces as separate children rather than one joined string, which keeps the
 * markup React already emits for the English version of the same line. React writes a
 * `<!-- -->` separator between two adjacent text children, so `Call {phone.display}` in JSX
 * produces `Call <!-- -->+91 98457 94343`; joining the template into one string would drop that
 * separator and change English bytes for no reason.
 *
 * No `"use client"`: it is a plain function of its props, so it renders on the server inside a
 * Server Component and inside a client island alike.
 */
export function Template({ text, values }: { text: string; values: TemplateValues }) {
  return fillParts(text, values).map((part, index) => <Fragment key={index}>{part}</Fragment>);
}
