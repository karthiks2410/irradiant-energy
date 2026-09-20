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
import { isProduction } from "@/lib/env";
import { customerWhatsappHref, renderCustomerAcknowledgement, renderLeadAlert } from "@/lib/leads/emails";
import { hashEmailDomain, logLeadEvent } from "@/lib/leads/log";
import { checkLeadRateLimit } from "@/lib/leads/rate-limit";
import { parseLeadForm } from "@/lib/leads/schema";
import type { LeadActionState, LeadFormValues } from "@/lib/leads/state";
import { buildEstimate, type Estimate } from "@/lib/solar/calc";

// The action-state contract (LeadActionState, initialLeadState) is exported from
// src/lib/leads/state.ts: a "use server" module may only export async functions.

const CONTACT_FALLBACK = "please WhatsApp or call us instead.";
const ERROR_SEND = `We couldn't send your request right now — ${CONTACT_FALLBACK}`;
const ERROR_RATE_LIMITED = `We've received several requests from your connection — ${CONTACT_FALLBACK}`;
const ERROR_TOO_FAST = "That was quick. Please check your details and submit again.";
const ERROR_INVALID = "Please check the highlighted fields.";

// Sender and lead inbox fall back to the addresses in decisions.md D-009; they are not secrets.
const EMAIL_FROM = process.env.EMAIL_FROM || "do-not-reply@irradiantenergy.in";
const LEAD_EMAIL = process.env.LEAD_EMAIL || "leads@irradiantenergy.in";

export async function submitLead(_prev: LeadActionState, formData: FormData): Promise<LeadActionState> {
  const values = echoValues(formData);
  const parsed = parseLeadForm(formData);
  const reference = newReference();

  if (parsed.kind === "spam") {
    // A filled honeypot is a bot: answer as if it worked and send nothing.
    logLeadEvent("warn", "lead_spam_dropped", { reference });
    return { ok: true, reference, whatsappHref: customerWhatsappHref(reference) };
  }
  if (parsed.kind === "too-fast") {
    logLeadEvent("warn", "lead_too_fast", { reference });
    return { ok: false, error: ERROR_TOO_FAST, values };
  }
  if (parsed.kind === "invalid") {
    return { ok: false, error: ERROR_INVALID, fieldErrors: parsed.fieldErrors, values };
  }
  const lead = parsed.lead;

  const decision = await checkLeadRateLimit(await clientIp());
  if (!decision.allowed) {
    logLeadEvent("warn", "lead_rate_limited", { reference, retryAfterSeconds: decision.retryAfterSeconds });
    return { ok: false, error: ERROR_RATE_LIMITED, values };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logLeadEvent("error", "lead_email_unconfigured", { reference });
    return {
      ok: false,
      error: isProduction ? ERROR_SEND : "Email is not configured: set RESEND_API_KEY in .env.local (see .env.example).",
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
          // Carried from the calculator: it caps the system size, so leaving it out would put a
          // larger system in the sales alert than the visitor saw on screen.
          roofAreaSqft: lead.roofAreaSqft,
        });
  const context = { lead, reference, estimate, submittedAt: new Date() };
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
    return { ok: false, error: ERROR_SEND, values };
  }
  logLeadEvent("info", "lead_alert_sent", logFields);

  // The visitor does not need to wait for their acknowledgement; a failure only gets logged.
  after(async () => {
    const ack = renderCustomerAcknowledgement(context);
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

  return { ok: true, reference, whatsappHref: customerWhatsappHref(reference) };
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

/** Wraps the SDK so callers only ever see an error name and status, never the raw object. */
async function send(resend: Resend, request: SendRequest): Promise<SendResult> {
  const { idempotencyKey, ...payload } = request;
  try {
    const { error } = await resend.emails.send(payload, { idempotencyKey });
    if (error) return { ok: false, error: { errorName: error.name, errorStatus: error.statusCode } };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: { errorName: err instanceof Error ? err.name : "unknown", errorStatus: null } };
  }
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
