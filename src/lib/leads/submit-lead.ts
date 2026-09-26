"use server";

/**
 * Lead submission for the estimate form, driven by `useActionState`.
 *
 * Order: validate → rate-limit → sales alert (must succeed) → customer acknowledgement
 * (failure tolerated) → success. No lead store exists yet (architecture.md OD-4), so the
 * sales alert is the record; if it cannot be sent the visitor is told to call or WhatsApp.
 * Nothing personal is logged: at most a salted hash of the email domain.
 */

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { after } from "next/server";
import { Resend } from "resend";
import { site } from "@/content/site";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/config";
import { getContent } from "@/i18n/content";
import {
  customerWhatsappHref,
  renderCustomerQuotation,
  renderLeadAlert,
  renderQuickEmailNote,
  type EmailLead,
} from "@/lib/leads/emails";
import { hashEmailDomain, logLeadEvent } from "@/lib/leads/log";
import { checkLeadRateLimit } from "@/lib/leads/rate-limit";
import { findBucket, labelFor, quickEstimate, summarise } from "@/lib/leads/quick";
import type { LeadFieldErrorCode } from "@/lib/leads/errors";
import { parseLeadForm, parseQuickLead, quickEmailSchema } from "@/lib/leads/schema";
import type { LeadActionState, LeadFormValues, QuickEmailState, QuickQuoteState } from "@/lib/leads/state";
import { buildEstimate, type Estimate } from "@/lib/solar/calc";

// The action-state contract (LeadActionState, initialLeadState) is exported from
// src/lib/leads/state.ts: a "use server" module may only export async functions.

// Refusals are codes, not sentences: one action id serves /en and /kn, and the wording lives in
// src/content/quote.ts where a reviewer can read it (architecture.md §6.12).

/**
 * Which language the form was filled in.
 *
 * A Server Action cannot read `next/root-params` — it has no route — so the page posts the
 * locale as a hidden field. It decides one thing: the language of the customer's
 * acknowledgement. Anything unrecognised falls back to English rather than throwing, because a
 * tampered field must not cost someone their enquiry.
 */
function localeOf(formData: FormData): Locale {
  const value = formData.get("locale");
  return typeof value === "string" && isLocale(value) ? value : DEFAULT_LOCALE;
}

// Sender and lead inbox fall back to the addresses in decisions.md D-009; they are not secrets.
// In Production they are never missing: next.config.ts imports lib/env.server.ts, which fails
// the build when any of RESEND_API_KEY / EMAIL_FROM / LEAD_EMAIL is absent.
const EMAIL_FROM = process.env.EMAIL_FROM || "do-not-reply@irradiantenergy.in";
const LEAD_EMAIL = process.env.LEAD_EMAIL || "leads@irradiantenergy.in";

/**
 * Entry point for `useActionState`. The body is wrapped so that an unexpected throw still
 * reaches the visitor as the contact-fallback message and still leaves a log line, instead
 * of bubbling to error.tsx with the lead lost and nothing recorded (architecture.md §10.5).
 */
export async function submitLead(_prev: LeadActionState, formData: FormData): Promise<LeadActionState> {
  try {
    return await handleLead(formData);
  } catch (err) {
    logLeadEvent("error", "lead_action_failed", {
      errorName: err instanceof Error ? err.name : "unknown",
      errorStatus: null,
    });
    return { ok: false, errorCode: "send", values: echoValues(formData) };
  }
}

async function handleLead(formData: FormData): Promise<LeadActionState> {
  const values = echoValues(formData);
  const locale = localeOf(formData);
  const parsed = parseLeadForm(formData);
  const reference = newReference();

  if (parsed.kind === "spam") {
    // A filled honeypot is a bot: answer as if it worked and send nothing.
    logLeadEvent("warn", "lead_spam_dropped", { reference });
    return { ok: true, reference, whatsappHref: customerWhatsappHref(reference, locale) };
  }
  if (parsed.kind === "too-fast") {
    logLeadEvent("warn", "lead_too_fast", { reference });
    return { ok: false, errorCode: "tooFast", values };
  }
  if (parsed.kind === "invalid") {
    return { ok: false, errorCode: "invalid", fieldErrors: parsed.fieldErrors, values };
  }
  const lead = parsed.lead;

  const decision = await checkLeadRateLimit(await clientIp());
  if (!decision.allowed) {
    logLeadEvent("warn", "lead_rate_limited", { reference, retryAfterSeconds: decision.retryAfterSeconds });
    return { ok: false, errorCode: "rateLimited", values };
  }

  // Production can now ship without a key (owner decision, 2026-09-20: Resend cannot send until
  // the domain is verified, and the domain is on registrar hold). So this path is live, not just
  // a local convenience, and it has to leave the visitor somewhere rather than nowhere: it hands
  // back the same reference the email would have quoted and a WhatsApp link carrying it. The
  // developer hint is keyed on NODE_ENV, not VERCEL_ENV, so a Preview visitor — Preview is a
  // production build — never sees an internal instruction.
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logLeadEvent("error", "lead_email_unconfigured", { reference });
    return {
      ok: false,
      errorCode: "send",
      devMessage:
        process.env.NODE_ENV === "production"
          ? undefined
          : "Email is not configured: set RESEND_API_KEY in .env.local (see .env.example).",
      whatsappHref: customerWhatsappHref(reference, locale),
      reference,
      values,
    };
  }

  const estimate: Estimate | null =
    lead.monthlyBill === undefined
      ? null
      : buildEstimate({
          segment: lead.segment,
          pincode: lead.pincode,
          monthlyBillInr: lead.monthlyBill,
          roofAreaSqft: lead.roofAreaSqft,
          sanctionedLoadKw: lead.sanctionedLoadKw,
        });
  const context = { lead, reference, estimate, submittedAt: new Date(), locale };
  const resend = new Resend(apiKey);
  const logFields = {
    reference,
    segment: lead.segment,
    emailDomainHash: hashEmailDomain(lead.email),
    engineVersion: estimate?.engineVersion,
  };

  const alert = renderLeadAlert(context);
  const alertResult = await send(resend, {
    from: `${site.name} <${EMAIL_FROM}>`,
    to: LEAD_EMAIL,
    replyTo: lead.email,
    subject: alert.subject,
    html: alert.html,
    text: alert.text,
    idempotencyKey: `lead-alert/${reference}`,
  });
  if (!alertResult.ok) {
    logLeadEvent("error", "lead_alert_failed", { ...logFields, ...alertResult.error });
    // Nothing durable holds this enquiry, so the only way it survives is if the visitor carries
    // it to us. The WhatsApp link is pre-filled with their reference, which is the same one the
    // email would have quoted, so a rescued enquiry can still be matched up.
    return { ok: false, errorCode: "send", whatsappHref: customerWhatsappHref(reference, locale), reference, values };
  }
  logLeadEvent("info", "lead_alert_sent", logFields);

  // The visitor does not need to wait for their acknowledgement; a failure only gets logged.
  after(async () => {
    const ack = renderCustomerQuotation(context);
    const ackResult = await send(resend, {
      from: `${site.name} <${EMAIL_FROM}>`,
      to: lead.email,
      subject: ack.subject,
      html: ack.html,
      text: ack.text,
      idempotencyKey: `lead-ack/${reference}`,
    });
    if (ackResult.ok) logLeadEvent("info", "lead_ack_sent", logFields);
    else logLeadEvent("warn", "lead_ack_failed", { ...logFields, ...ackResult.error });
  });

  return { ok: true, reference, whatsappHref: customerWhatsappHref(reference, locale) };
}

interface SendRequest {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
}

type SendResult = { ok: true } | { ok: false; error: { errorName: string; errorStatus: number | null } };

/**
 * Statuses worth trying again: the request was fine and the far end was briefly not. A 4xx that
 * is not 408 or 429 means the request itself is wrong, and repeating it only wastes the visitor's
 * time. A thrown error carries no status and is almost always a network blip, so it retries too.
 */
function worthRetrying(status: number | null): boolean {
  if (status === null) return true;
  if (status === 408 || status === 429) return true;
  return status >= 500;
}

/** Attempts, and the wait before each retry. Short, because someone is watching a spinner. */
const SEND_RETRY_DELAYS_MS = [400, 1200];

/**
 * Wraps the SDK so callers only ever see an error name and status, never the raw object.
 *
 * It retries a transient failure twice before giving up. A dropped connection or a moment of
 * provider trouble used to lose the enquiry outright: the lead log is deliberately PII-free
 * (lib/leads/log.ts), so nothing anywhere holds the name, number or message once the send fails.
 * Every attempt reuses the same idempotency key, so a retry after a response we never saw cannot
 * deliver the mail twice.
 */
async function send(resend: Resend, request: SendRequest): Promise<SendResult> {
  const { idempotencyKey, ...payload } = request;
  let last: SendResult = { ok: false, error: { errorName: "not-attempted", errorStatus: null } };

  for (let attempt = 0; attempt <= SEND_RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, SEND_RETRY_DELAYS_MS[attempt - 1]));
    }
    try {
      const { error } = await resend.emails.send(payload, { idempotencyKey });
      if (!error) return { ok: true };
      last = { ok: false, error: { errorName: error.name, errorStatus: error.statusCode } };
    } catch (err) {
      last = { ok: false, error: { errorName: err instanceof Error ? err.name : "unknown", errorStatus: null } };
    }
    if (last.ok || !worthRetrying(last.error.errorStatus)) break;
  }
  return last;
}

/** Human-readable reference such as IE-7K3QX2; random, so it reveals nothing about volume. */
function newReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `IE-${out}`;
}

/** First hop of x-forwarded-for (set by Vercel), used only as the rate-limit key. */
async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip") || "unknown";
}

function echoValues(formData: FormData): LeadFormValues {
  const text = (key: string) => {
    const v = formData.get(key);
    return typeof v === "string" ? v : "";
  };
  return {
    name: text("name"),
    phone: text("phone"),
    email: text("email"),
    segment: text("segment"),
    pincode: text("pincode"),
    monthlyBill: text("monthlyBill"),
    message: text("message"),
    whatsappOptIn: formData.get("whatsappOptIn") !== null,
    consent: formData.get("consent") !== null,
  };
}

/* ---------------------------------------------------------------------------
   Quick quote popup

   Same pipeline as the estimate form — validation, rate limit, the sales alert as the only record,
   PII-free logs, error CODES rather than sentences — with two differences: no email is collected,
   and the bill is a range. The visitor sees the estimate as ranges straight away, in their
   language; the sales alert carries one representative figure, says which one, and stays English.
   --------------------------------------------------------------------------- */

export async function submitQuickQuote(_prev: QuickQuoteState, formData: FormData): Promise<QuickQuoteState> {
  try {
    return await handleQuickQuote(formData);
  } catch (err) {
    logLeadEvent("error", "lead_action_failed", {
      errorName: err instanceof Error ? err.name : "unknown",
      errorStatus: null,
    });
    return { ok: false, errorCode: "send" };
  }
}

async function handleQuickQuote(formData: FormData): Promise<QuickQuoteState> {
  const locale = localeOf(formData);
  const parsed = parseQuickLead(formData);
  const reference = newReference();

  if (parsed.kind === "spam") {
    logLeadEvent("warn", "lead_spam_dropped", { reference });
    return { ok: false, errorCode: "send" };
  }
  if (parsed.kind === "too-fast") {
    logLeadEvent("warn", "lead_too_fast", { reference });
    return { ok: false, errorCode: "tooFast" };
  }
  if (parsed.kind === "invalid") {
    return { ok: false, errorCode: "invalid", fieldErrors: parsed.fieldErrors };
  }
  const quick = parsed.lead;

  const decision = await checkLeadRateLimit(await clientIp());
  if (!decision.allowed) {
    logLeadEvent("warn", "lead_rate_limited", { reference, retryAfterSeconds: decision.retryAfterSeconds });
    return { ok: false, errorCode: "rateLimited" };
  }

  // The schema already checked the bucket belongs to the segment.
  const bucket = findBucket(quick.segment, quick.billBucket)!;
  const estimate = quickEstimate(quick.segment, bucket, quick.pincode);
  const words = getContent(locale).ui.quickQuote.ranges;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Local development without mail keys: show the result and send nothing, so the whole popup
    // can be clicked through on a laptop. NODE_ENV is "production" under `next start` and on every
    // Vercel build, so a deployed site never takes this branch.
    if (process.env.NODE_ENV !== "production") {
      logLeadEvent("info", "lead_dry_run", { reference });
      return {
        ok: true,
        reference,
        whatsappHref: customerWhatsappHref(reference, locale),
        summary: summarise(quick.segment, quick.billBucket, estimate, words),
      };
    }
    logLeadEvent("error", "lead_email_unconfigured", { reference });
    return { ok: false, errorCode: "send", whatsappHref: customerWhatsappHref(reference, locale), reference };
  }

  const lead: EmailLead = {
    name: quick.name,
    phone: quick.phone,
    segment: quick.segment,
    pincode: quick.pincode,
    consent: quick.consent,
    // The popup asks for a WhatsApp number and its consent names WhatsApp, so this is given.
    whatsappOptIn: true,
    website: undefined,
    startedAt: quick.startedAt,
  };
  const context = {
    lead,
    reference,
    estimate: estimate.representative,
    submittedAt: new Date(),
    // The alert is English whatever the page language, so its bill range is written in English.
    locale,
    source: "quick quote popup" as const,
    billRange: {
      label: labelFor(quick.segment, quick.billBucket)!,
      representativeBillInr: estimate.representativeBillInr,
      openEnded: bucket.max === null,
    },
  };

  const alert = renderLeadAlert(context);
  const alertResult = await send(new Resend(apiKey), {
    from: `${site.name} <${EMAIL_FROM}>`,
    to: LEAD_EMAIL,
    subject: alert.subject,
    html: alert.html,
    text: alert.text,
    idempotencyKey: `lead-alert/${reference}`,
  });
  const logFields = { reference, segment: quick.segment, engineVersion: estimate.representative.engineVersion };
  if (!alertResult.ok) {
    logLeadEvent("error", "lead_alert_failed", { ...logFields, ...alertResult.error });
    return { ok: false, errorCode: "send", whatsappHref: customerWhatsappHref(reference, locale), reference };
  }
  logLeadEvent("info", "lead_alert_sent", logFields);

  return {
    ok: true,
    reference,
    whatsappHref: customerWhatsappHref(reference, locale),
    summary: summarise(quick.segment, quick.billBucket, estimate, words),
  };
}

/**
 * The popup's optional second step. Nothing stores the first step, so the visitor's own fields come
 * back with the reference; they are re-validated like any other input. Only the customer email, in
 * the visitor's language, and a short English note to sales are sent — both about this enquiry.
 */
export async function emailQuickQuote(_prev: QuickEmailState, formData: FormData): Promise<QuickEmailState> {
  try {
    const locale = localeOf(formData);
    const raw = Object.fromEntries(
      ["reference", "name", "segment", "pincode", "billBucket", "email"].map((key) => {
        const value = formData.get(key);
        return [key, typeof value === "string" ? value : undefined];
      }),
    );
    const parsed = quickEmailSchema.safeParse(raw);
    if (!parsed.success) {
      const emailIssue = parsed.error.issues.find((issue) => issue.path[0] === "email");
      return emailIssue
        ? { ok: false, errorCode: "invalid", fieldError: emailIssue.message as LeadFieldErrorCode }
        : { ok: false, errorCode: "send" };
    }
    const request = parsed.data;

    const decision = await checkLeadRateLimit(await clientIp());
    if (!decision.allowed) {
      logLeadEvent("warn", "lead_rate_limited", { reference: request.reference, retryAfterSeconds: decision.retryAfterSeconds });
      return { ok: false, errorCode: "rateLimited" };
    }
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // Same local dry run as submitQuickQuote: nothing is sent.
      if (process.env.NODE_ENV !== "production") {
        logLeadEvent("info", "lead_dry_run", { reference: request.reference });
        return { ok: true };
      }
      logLeadEvent("error", "lead_email_unconfigured", { reference: request.reference });
      return { ok: false, errorCode: "send" };
    }

    const bucket = findBucket(request.segment, request.billBucket)!;
    const estimate = quickEstimate(request.segment, bucket, request.pincode);
    const words = getContent(locale).ui.quickQuote.ranges;
    const context = {
      lead: {
        name: request.name,
        phone: "",
        email: request.email,
        segment: request.segment,
        pincode: request.pincode,
        consent: true as const,
        whatsappOptIn: true,
        website: undefined,
        startedAt: 0,
      },
      reference: request.reference,
      estimate: estimate.representative,
      submittedAt: new Date(),
      locale,
      source: "quick quote popup" as const,
      // The customer's email names the range in their own language.
      billRange: {
        label: labelFor(request.segment, request.billBucket, words)!,
        representativeBillInr: estimate.representativeBillInr,
        openEnded: bucket.max === null,
      },
    };
    const resend = new Resend(apiKey);
    const logFields = { reference: request.reference, segment: request.segment, emailDomainHash: hashEmailDomain(request.email) };

    const quotation = renderCustomerQuotation(context);
    const sent = await send(resend, {
      from: `${site.name} <${EMAIL_FROM}>`,
      to: request.email,
      subject: quotation.subject,
      html: quotation.html,
      text: quotation.text,
      idempotencyKey: `lead-ack/${request.reference}`,
    });
    if (!sent.ok) {
      logLeadEvent("warn", "lead_ack_failed", { ...logFields, ...sent.error });
      return { ok: false, errorCode: "send" };
    }
    logLeadEvent("info", "lead_ack_sent", logFields);

    // Sales already has the enquiry; this only adds the address. A failure here is logged, not shown.
    after(async () => {
      const note = renderQuickEmailNote(request.reference, request.name, request.email);
      const result = await send(resend, {
        from: `${site.name} <${EMAIL_FROM}>`,
        to: LEAD_EMAIL,
        replyTo: request.email,
        subject: note.subject,
        html: note.html,
        text: note.text,
        idempotencyKey: `lead-email-note/${request.reference}`,
      });
      if (!result.ok) logLeadEvent("warn", "lead_alert_failed", { ...logFields, ...result.error });
    });

    return { ok: true };
  } catch (err) {
    logLeadEvent("error", "lead_action_failed", { errorName: err instanceof Error ? err.name : "unknown", errorStatus: null });
    return { ok: false, errorCode: "send" };
  }
}
