/**
 * Email templates for the lead pipeline: the internal alert and the customer acknowledgement.
 * HTML plus plain text, brand colours (globals.css), every user value HTML-escaped, and links
 * only to fixed `siteUrl` paths, never to anything derived from the request (05 §6.2).
 * Email clients cannot load the brand web fonts, so the templates use a system stack.
 *
 * The two emails have different readers and therefore different languages.
 *
 * - The **customer acknowledgement** is written in the language the form was filled in. Someone
 *   who has just read a Kannada page and typed into a Kannada form should not get an English
 *   email back. It reads its copy from `getContent(locale).quote.email`, and the `<html lang>`
 *   follows, so a mail client renders it with the right font stack.
 * - The **internal alert** stays English, always. Its reader is the sales team, it is a work
 *   item rather than copy, and half of what it carries — flags, engine version — is not prose
 *   at all. It gains one row saying which language the enquiry came in, so whoever calls back
 *   knows what to expect (docs/kannada/research/architecture.md §6.12).
 *
 * Numbers and dates stay en-IN in both: lakh/crore grouping is how a reader in Karnataka reads
 * a rupee figure, and `kn-IN` would group in thousands (§6.7).
 */

import { isConfirmed, site, whatsappLink } from "@/content/site";
import { DEFAULT_LOCALE, LOCALE_NAME, type Locale } from "@/i18n/config";
import { getContent } from "@/i18n/content";
import { fill } from "@/i18n/format";
import { HTML_LANG } from "@/i18n/config";
import { siteUrl } from "@/lib/env";
import type { Estimate } from "@/lib/solar/calc";
import { SEGMENT_LABELS } from "@/lib/solar/constants";
import { formatInr } from "@/lib/solar/format";
import type { Lead } from "./schema";

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export interface LeadEmailContext {
  lead: Lead;
  /** Short reference quoted in both emails and in logs. */
  reference: string;
  /** When the form carried a bill, the server-side recompute for the sales team. */
  estimate: Estimate | null;
  /** Submission time, shown as the consent timestamp. */
  submittedAt: Date;
  /** The language the form was filled in; it decides the acknowledgement's language only. */
  locale: Locale;
}

const COLOR = {
  teal: "#02342b",
  green: "#04783f", // green-700: the only green allowed behind white text at button size
  canvas: "#f6f7f2",
  white: "#ffffff",
  carbon: "#18211f",
  grey: "#69746f",
  mist: "#e7ebe5",
} as const;

/**
 * A system stack: mail clients cannot load the brand web fonts. `Noto Sans Kannada` leads the
 * Kannada faces a desktop or phone client is likely to have; anything that has none of them
 * falls through to the client's own default, which still renders the script.
 */
const FONT =
  "Inter, 'Segoe UI', Roboto, Helvetica, Arial, 'Noto Sans Kannada', 'Tunga', 'Nirmala UI', sans-serif";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Only the confirmed contact facts go into emails; unconfirmed ones are left out rather than shown. */
function contactLines(): { phone: string | null; email: string | null; whatsapp: string | null } {
  const { phonePrimary, email, whatsapp } = site.contact;
  return {
    phone: isConfirmed(phonePrimary.status) ? phonePrimary.value.display : null,
    email: isConfirmed(email.status) ? email.value : null,
    whatsapp: isConfirmed(whatsapp.status) ? whatsapp.value : null,
  };
}

const stamp = (d: Date) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(d);

/** The zone suffix is the only part of a timestamp that is words, so it is the only part that moves. */
const formatDate = (d: Date, template = "{datetime} IST") => fill(template, { datetime: stamp(d) });

function layout(title: string, bodyHtml: string, footerHtml: string, lang: string = HTML_LANG.en): string {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${COLOR.canvas};font-family:${FONT};color:${COLOR.carbon};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.canvas};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${COLOR.white};border:1px solid ${COLOR.mist};">
<tr><td style="background:${COLOR.teal};padding:20px 28px;">
<span style="font-size:18px;font-weight:700;letter-spacing:0.02em;color:${COLOR.white};">${escapeHtml(site.name)}</span>
</td></tr>
<tr><td style="padding:28px 28px 8px;font-size:16px;line-height:1.6;">
${bodyHtml}
</td></tr>
<tr><td style="padding:16px 28px 28px;border-top:1px solid ${COLOR.mist};font-size:13px;line-height:1.5;color:${COLOR.grey};">
${footerHtml}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;"><tr><td style="background:${COLOR.green};border-radius:999px;">
<a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 24px;font-size:16px;font-weight:600;color:${COLOR.white};text-decoration:none;">${escapeHtml(label)}</a>
</td></tr></table>`;
}

function rows(pairs: ReadonlyArray<readonly [string, string]>): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;font-size:15px;">${pairs
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;color:${COLOR.grey};vertical-align:top;width:40%;">${escapeHtml(k)}</td><td style="padding:6px 0;vertical-align:top;">${escapeHtml(v)}</td></tr>`,
    )
    .join("")}</table>`;
}

const textRows = (pairs: ReadonlyArray<readonly [string, string]>) => pairs.map(([k, v]) => `${k}: ${v}`).join("\n");

/**
 * How the alert names the language the enquiry came in. English, with the Kannada endonym beside
 * it: the row is read by the sales team, and the endonym is what they will see on the website.
 * Not copy, so it is not in a content module and is not translated.
 */
const ENQUIRY_LANGUAGE: Record<Locale, string> = { en: "English", kn: `Kannada (${LOCALE_NAME.kn})` };

function estimateRows(estimate: Estimate): ReadonlyArray<readonly [string, string]> {
  return [
    ["Recommended size", `${estimate.systemKwp} kWp (${estimate.monthlyKwh} kWh/month at ₹${estimate.tariff.averageInrPerKwh}/unit)`],
    ["Annual generation", `${estimate.annualGenerationKwh.toLocaleString("en-IN")} kWh`],
    ["Cost before subsidy", formatInr(estimate.grossCostInr)],
    ["PM Surya Ghar subsidy", formatInr(estimate.subsidyInr)],
    ["Net cost", formatInr(estimate.netCostInr)],
    ["Savings", `${formatInr(estimate.monthlySavingsInr)}/month, ${formatInr(estimate.annualSavingsInr)}/year (${Math.round(estimate.savingsShareOfBill * 100)}% of the bill)`],
    ["Simple payback", estimate.paybackYears === null ? "—" : `${estimate.paybackYears} years`],
    ["Flags", estimate.flags.length ? estimate.flags.join(", ") : "none"],
    ["Engine", estimate.engineVersion],
  ];
}

/**
 * Fill a template into HTML: the literal text is escaped, the named values are raw fragments.
 *
 * It exists because two acknowledgement lines put a LINK inside a sentence — the site address in
 * the footer, the email address in the contact line — and the sentence is one reviewer row, so
 * the anchor has to be dropped into a hole rather than concatenated around a fragment.
 */
function htmlTemplate(template: string, values: Readonly<Record<string, string>>): string {
  let out = "";
  let last = 0;
  for (const match of template.matchAll(/\{(\w+)\}/g)) {
    out += escapeHtml(template.slice(last, match.index));
    out += values[match[1]] ?? escapeHtml(match[0]);
    last = match.index + match[0].length;
  }
  return out + escapeHtml(template.slice(last));
}

/** Internal alert to LEAD_EMAIL. Carries the consent flags so sales act within them (17 §6.3). */
export function renderLeadAlert(ctx: LeadEmailContext): EmailContent {
  const { lead, reference, estimate, submittedAt } = ctx;
  const segment = SEGMENT_LABELS[lead.segment];
  const customerWhatsapp = lead.whatsappOptIn ? `https://wa.me/${lead.phone.replace(/\D/g, "")}` : null;

  const contact: ReadonlyArray<readonly [string, string]> = [
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["Email", lead.email],
    ["WhatsApp opt-in", lead.whatsappOptIn ? "Yes" : "No — do not message on WhatsApp"],
    // Which language this enquiry was sent in, so whoever calls back knows what to expect and
    // can see that the acknowledgement they received was in that language too (§6.12).
    ["Language", ENQUIRY_LANGUAGE[ctx.locale]],
    ["Consent to contact", `Given ${formatDate(submittedAt)} on the estimate form`],
  ];
  const enquiry: ReadonlyArray<readonly [string, string]> = [
    ["Property", segment],
    ["PIN code", lead.pincode ?? "not given"],
    ["Monthly bill", lead.monthlyBill === undefined ? "not given" : formatInr(lead.monthlyBill)],
    ["Message", lead.message ?? "—"],
  ];

  const subject = `New solar enquiry ${reference} · ${segment}${estimate ? ` · ${estimate.systemKwp} kWp est.` : ""}`;

  const html = layout(
    subject,
    `<h1 style="margin:0 0 8px;font-size:22px;line-height:1.3;color:${COLOR.teal};">New solar enquiry</h1>
<p style="margin:0;color:${COLOR.grey};">Reference ${escapeHtml(reference)}</p>
<h2 style="margin:24px 0 0;font-size:16px;color:${COLOR.teal};">Contact</h2>
${rows(contact)}
<h2 style="margin:8px 0 0;font-size:16px;color:${COLOR.teal};">Enquiry</h2>
${rows(enquiry)}
${
  estimate
    ? `<h2 style="margin:8px 0 0;font-size:16px;color:${COLOR.teal};">Estimate (recomputed on the server)</h2>${rows(estimateRows(estimate))}`
    : ""
}
${customerWhatsapp ? button("WhatsApp the customer", customerWhatsapp) : button("Call the customer", `tel:${lead.phone}`)}`,
    `Sent automatically by the estimate form on ${escapeHtml(siteUrl)}. Replying to this email goes to the customer.`,
  );

  const text = [
    `New solar enquiry ${reference}`,
    "",
    "CONTACT",
    textRows(contact),
    "",
    "ENQUIRY",
    textRows(enquiry),
    ...(estimate ? ["", "ESTIMATE (recomputed on the server)", textRows(estimateRows(estimate))] : []),
    "",
    customerWhatsapp ? `WhatsApp the customer: ${customerWhatsapp}` : `Call the customer: ${lead.phone}`,
    "",
    `Sent automatically by the estimate form on ${siteUrl}. Replying to this email goes to the customer.`,
  ].join("\n");

  return { subject, html, text };
}

/**
 * One-time acknowledgement to the customer, in the language they filled the form in.
 *
 * No figures, no promises about timing, no free text from the form; a consent reference in the
 * footer (brand PDF p.70, 17 §6.3). Every sentence is a template from `content.quote.email`, so
 * the Kannada version is the reviewers' wording rather than an English sentence with the nouns
 * swapped — and the property type is named from `ui.calculator.segments`, the same words the
 * calculator used.
 */
export function renderCustomerAcknowledgement(ctx: LeadEmailContext): EmailContent {
  const { lead, reference, submittedAt, locale = DEFAULT_LOCALE } = ctx;
  const content = getContent(locale);
  const copy = content.quote.email;
  const segmentLabel = content.ui.calculator.segments[lead.segment];
  // A no-op in Kannada, which has no case; in English it turns "Housing society" into the noun
  // the sentence needs ("…solar for your housing society").
  const segment = segmentLabel.toLowerCase();
  const contact = contactLines();
  const firstName = lead.name.split(/\s+/)[0];
  const whatsappHref = customerWhatsappHref(reference, locale);
  const when = formatDate(submittedAt, copy.datetime);

  const received: ReadonlyArray<readonly [string, string]> = [
    [copy.rowReference, reference],
    [copy.rowProperty, segmentLabel],
    [copy.rowPincode, lead.pincode ?? copy.notGiven],
    [copy.rowMonthlyBill, lead.monthlyBill === undefined ? copy.notGiven : formatInr(lead.monthlyBill)],
    [copy.rowWhatsapp, lead.whatsappOptIn ? copy.yes : copy.no],
  ];

  const address = site.contact.address;
  const addressLine = isConfirmed(address.status) ? address.value.lines.join(", ") : null;
  const legalName = site.legal.entityName;

  const subject = fill(copy.subjectLine, { reference });

  /**
   * "Call {phone} or email {email}." names both routes in one sentence, so it needs both. If
   * either fact is ever unconfirmed the line is left out rather than half-written: a fragment
   * assembled in code could only be assembled in English, and the WhatsApp button above it is
   * still a way through.
   */
  const bothContacts = contact.phone !== null && contact.email !== null;
  const contactHtml = bothContacts
    ? `<p style="margin:0;color:${COLOR.grey};font-size:14px;">${htmlTemplate(copy.contactLine, {
        phone: escapeHtml(contact.phone!),
        email: `<a href="mailto:${escapeHtml(contact.email!)}" style="color:${COLOR.green};">${escapeHtml(contact.email!)}</a>`,
      })}</p>`
    : "";
  const contactText = bothContacts ? fill(copy.contactLine, { phone: contact.phone!, email: contact.email! }) : "";

  const html = layout(
    subject,
    `<h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:${COLOR.teal};">${escapeHtml(fill(copy.heading, { firstName }))}</h1>
<p style="margin:0 0 12px;">${escapeHtml(fill(copy.intro, { segment }))}</p>
${rows(received)}
<p style="margin:0 0 4px;">${escapeHtml(copy.talkNow)}</p>
${button(copy.whatsappButton, whatsappHref)}
${contactHtml}
<p style="margin:16px 0 0;color:${COLOR.grey};font-size:14px;">${escapeHtml(copy.disclaimer)}</p>`,
    `<p style="margin:0 0 8px;">${htmlTemplate(copy.footer, {
      site: `<a href="${escapeHtml(siteUrl)}" style="color:${COLOR.green};">${escapeHtml(siteUrl.replace(/^https?:\/\//, ""))}</a>`,
      datetime: escapeHtml(when),
    })}</p>
<p style="margin:0;">${escapeHtml(legalName ?? site.name)}${addressLine ? ` · ${escapeHtml(addressLine)}` : ""}</p>`,
    HTML_LANG[locale],
  );

  const text = [
    fill(copy.heading, { firstName }),
    "",
    fill(copy.intro, { segment }),
    "",
    textRows(received),
    "",
    fill(copy.talkNowText, { whatsappUrl: whatsappHref }),
    contactText,
    "",
    copy.disclaimer,
    "",
    fill(copy.footer, { site: siteUrl, datetime: when }),
    `${legalName ?? site.name}${addressLine ? ` · ${addressLine}` : ""}`,
  ].join("\n");

  return { subject, html, text };
}

/**
 * Customer-to-company WhatsApp link; the prefill carries only the reference, never personal data.
 *
 * The prefill is a message the CUSTOMER sends, so it is written in their language — they are the
 * one who will see it sitting in the compose box.
 */
export function customerWhatsappHref(reference: string, locale: Locale = DEFAULT_LOCALE): string {
  return whatsappLink(fill(getContent(locale).quote.whatsappPrefill, { reference }));
}
