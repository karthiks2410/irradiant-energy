/**
 * Email templates for the lead pipeline: the internal alert and the customer acknowledgement.
 * HTML plus plain text, brand colours (globals.css), every user value HTML-escaped, and links
 * only to fixed `siteUrl` paths, never to anything derived from the request (05 §6.2).
 * Email clients cannot load the brand web fonts, so the templates use a system stack.
 */

import { isConfirmed, site, whatsappLink } from "@/content/site";
import { siteUrl } from "@/lib/env";
import type { Estimate } from "@/lib/solar/calc";
import { SEGMENT_LABELS } from "@/lib/solar/constants";
import { formatInr } from "@/lib/solar/format";
import type { Lead } from "./schema";

const logoUrl = `${siteUrl}/images/email/ie-logo-white.png`;

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

const FONT = "Inter, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

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

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(d) +
  " IST";

function layout(title: string, bodyHtml: string, footerHtml: string): string {
  return `<!doctype html>
<html lang="en">
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
<img src="${logoUrl}" alt="${escapeHtml(site.name)}" width="240" height="57" style="display:block;border:0;outline:none;max-width:240px;height:auto;" />
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

function estimateCard(estimate: Estimate): string {
  const pairs = customerEstimateRows(estimate);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-radius:8px;background:${COLOR.canvas};border:1px solid ${COLOR.mist};">
<tr><td style="padding:20px 24px;">
<h2 style="margin:0 0 12px;font-size:18px;font-weight:700;color:${COLOR.teal};">Your solar estimate</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;">${pairs
    .map(
      ([k, v], i) =>
        `<tr><td style="padding:8px 0;${i < pairs.length - 1 ? `border-bottom:1px solid ${COLOR.mist};` : ""}color:${COLOR.grey};vertical-align:top;width:45%;">${escapeHtml(k)}</td><td style="padding:8px 0;${i < pairs.length - 1 ? `border-bottom:1px solid ${COLOR.mist};` : ""}vertical-align:top;font-weight:600;color:${COLOR.carbon};">${escapeHtml(v)}</td></tr>`,
    )
    .join("")}</table>
</td></tr></table>`;
}

const textEstimateCard = (estimate: Estimate) => ["YOUR SOLAR ESTIMATE", textRows(customerEstimateRows(estimate))].join("\n");

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

function customerEstimateRows(estimate: Estimate): ReadonlyArray<readonly [string, string]> {
  return [
    ["System size", `${estimate.systemKwp} kWp`],
    ["Cost before subsidy", formatInr(estimate.grossCostInr)],
    ["PM Surya Ghar subsidy", formatInr(estimate.subsidyInr)],
    ["Net cost (after subsidy)", formatInr(estimate.netCostInr)],
    ["Monthly savings", `${formatInr(estimate.monthlySavingsInr)} (${Math.round(estimate.savingsShareOfBill * 100)}% of your bill)`],
    ["Simple payback", estimate.paybackYears === null ? "—" : `~${estimate.paybackYears} years`],
  ];
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
 * Customer quotation email. Includes the estimate figures when available, so the customer
 * receives the numbers they saw on the calculator. No free text from the form; a consent
 * reference in the footer (brand PDF p.70, 17 §6.3).
 */
export function renderCustomerQuotation(ctx: LeadEmailContext): EmailContent {
  const { lead, reference, estimate, submittedAt } = ctx;
  const segment = SEGMENT_LABELS[lead.segment].toLowerCase();
  const contact = contactLines();
  const firstName = lead.name.split(/\s+/)[0];
  const whatsappHref = customerWhatsappHref(reference);

  const received: ReadonlyArray<readonly [string, string]> = [
    ["Reference", reference],
    ["Property", SEGMENT_LABELS[lead.segment]],
    ["PIN code", lead.pincode ?? "not given"],
    ["Monthly bill", lead.monthlyBill === undefined ? "not given" : formatInr(lead.monthlyBill)],
    ["WhatsApp updates", lead.whatsappOptIn ? "Yes" : "No"],
  ];

  const address = site.contact.address;
  const addressLine = isConfirmed(address.status) ? address.value.lines.join(", ") : null;
  const legalName = site.legal.entityName;

  const subject = estimate
    ? `Your solar estimate: ${estimate.systemKwp} kWp at ${formatInr(estimate.netCostInr)} (${reference})`
    : `We have your solar enquiry (${reference})`;

  const html = layout(
    subject,
    `<h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:${COLOR.teal};">Thanks, ${escapeHtml(firstName)}. ${estimate ? "Here’s your solar estimate." : "We have your enquiry."}</h1>
<p style="margin:0 0 12px;">You asked about rooftop solar for your ${escapeHtml(segment)}. ${estimate ? "Below are the indicative figures based on what you told us. " : ""}We will review the details and get in touch to arrange a site visit so the final system size and figures can be confirmed.</p>
${estimate ? estimateCard(estimate) : ""}
<h2 style="margin:${estimate ? "8" : "24"}px 0 8px;font-size:16px;color:${COLOR.teal};">What you submitted</h2>
${rows(received)}
<p style="margin:16px 0 4px;">Prefer to talk now? Message us on WhatsApp and quote your reference.</p>
${button("Message us on WhatsApp", whatsappHref)}
<p style="margin:0;color:${COLOR.grey};font-size:14px;">${[
      contact.phone ? `Call ${escapeHtml(contact.phone)}` : null,
      contact.email ? `email <a href="mailto:${escapeHtml(contact.email)}" style="color:${COLOR.green};">${escapeHtml(contact.email)}</a>` : null,
    ]
      .filter(Boolean)
      .join(" or ")}.</p>
<p style="margin:16px 0 0;color:${COLOR.grey};font-size:14px;">Any figures shown by the calculator on our website are estimates, not a quote or a guarantee. Subsidies are decided and paid by the Government after DISCOM inspection.</p>`,
    `<p style="margin:0 0 8px;">You are receiving this because you submitted the estimate form on <a href="${escapeHtml(siteUrl)}" style="color:${COLOR.green};">${escapeHtml(siteUrl.replace(/^https?:\/\//, ""))}</a> on ${escapeHtml(formatDate(submittedAt))} and agreed to be contacted about this enquiry. It is not a marketing email.</p>
<p style="margin:0;">${escapeHtml(legalName ?? site.name)}${addressLine ? ` · ${escapeHtml(addressLine)}` : ""}</p>`,
  );

  const text = [
    `Thanks, ${firstName}. ${estimate ? "Here’s your solar estimate." : "We have your enquiry."}`,
    "",
    `You asked about rooftop solar for your ${segment}. ${estimate ? "Below are the indicative figures based on what you told us. " : ""}We will review the details and get in touch to arrange a site visit so the final system size and figures can be confirmed.`,
    "",
    ...(estimate ? [textEstimateCard(estimate), ""] : []),
    "WHAT YOU SUBMITTED",
    textRows(received),
    "",
    `Prefer to talk now? Message us on WhatsApp and quote your reference: ${whatsappHref}`,
    [contact.phone ? `Call ${contact.phone}` : null, contact.email ? `email ${contact.email}` : null].filter(Boolean).join(" or "),
    "",
    "Any figures shown by the calculator on our website are estimates, not a quote or a guarantee. Subsidies are decided and paid by the Government after DISCOM inspection.",
    "",
    `You are receiving this because you submitted the estimate form on ${siteUrl} on ${formatDate(submittedAt)} and agreed to be contacted about this enquiry. It is not a marketing email.`,
    `${legalName ?? site.name}${addressLine ? ` · ${addressLine}` : ""}`,
  ].join("\n");

  return { subject, html, text };
}

/** Customer-to-company WhatsApp link; the prefill carries only the reference, never personal data. */
export function customerWhatsappHref(reference: string): string {
  return whatsappLink(`Hi, I sent a solar enquiry on the Irradiant Energy website (ref ${reference}).`);
}
