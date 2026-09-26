/**
 * Where an enquiry came from: the lead source that rides with each form as one hidden field and
 * ends up in the internal lead alert ("How they found us") and the lead register — and nowhere
 * else. It is never in the customer's email and never sent to Google.
 *
 * What it holds, and when (the browser side is src/lib/leads/first-touch.ts):
 * - `page` — the page the enquiry was sent from. Always: it is part of the enquiry itself.
 * - `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` — the campaign tags of the
 *   link that brought the visitor. With analytics consent, those of the first page of the visit;
 *   without it, only the ones in the address at the moment of sending.
 * - `landing` and `referrer` — the first page of the visit and the website that sent them there
 *   (its host only). Only with analytics consent.
 *
 * Pure and framework-free: the browser builds the value with it and the server action validates it
 * with it, so both sides agree on the same allow-list. The server treats the field as hostile — it
 * arrives from the visitor's browser like any other form value.
 */

/** The form field that carries it. */
export const LEAD_SOURCE_FIELD = "leadSource";

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
export type UtmKey = (typeof UTM_KEYS)[number];

export const LEAD_SOURCE_KEYS = ["page", "landing", "referrer", ...UTM_KEYS] as const;
export type LeadSourceKey = (typeof LEAD_SOURCE_KEYS)[number];

export type LeadSource = Partial<Record<LeadSourceKey, string>>;

/** Longest accepted value per key. Short on purpose: these are labels, not text. */
export const LEAD_SOURCE_LIMITS: Readonly<Record<LeadSourceKey, number>> = {
  page: 120,
  landing: 120,
  referrer: 100,
  utm_source: 80,
  utm_medium: 80,
  utm_campaign: 100,
  utm_content: 100,
  utm_term: 100,
};

/** A raw field longer than this is not ours, and is ignored whole. */
const MAX_FIELD_LENGTH = 2_000;

const EMAIL_LIKE = /[^\s@]+@[^\s@]+\.[^\s@]+/;
/**
 * Ten or more digits, allowing the spaces, dots, dashes and brackets people put in numbers: a
 * mobile number with or without +91, or a landline with its STD code. A dated campaign tag such
 * as "diwali-2026-10-15" (eight digits) still passes.
 */
const PHONE_LIKE = /(?:\d[\s().+-]*){10,}/;
/** Six digits in a row: a PIN code (and any longer run, which covers an unspaced number). */
const PIN_LIKE = /\d{6}/;

/**
 * True for a value that could be someone's email address, phone number or PIN code. Such a value is
 * dropped, not trimmed: a campaign tag has no reason to carry one, and a legacy link that put a
 * name or a number into the address must not carry it into the lead register.
 */
export function looksPersonal(value: string): boolean {
  return EMAIL_LIKE.test(value) || PHONE_LIKE.test(value) || PIN_LIKE.test(value) || value.includes("@");
}

/** A site path: starts with "/", no query or fragment, only the characters our slugs use. */
const PATH_RE = /^\/[A-Za-z0-9/_.-]*$/;
/** A bare host name. */
const HOST_RE = /^(?=.{1,100}$)[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;

/** Control characters and angle brackets; the rest of a campaign tag is kept as written. */
const UNSAFE_CHARS = /[\u0000-\u001f\u007f<>]/g;

/** One value, cleaned and checked, or undefined when it cannot be accepted. */
export function cleanSourceValue(key: LeadSourceKey, raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  let value = raw.replace(UNSAFE_CHARS, " ").replace(/\s+/g, " ").trim();
  if (!value) return undefined;

  if (key === "page" || key === "landing") {
    value = value.split(/[?#]/)[0];
    if (!PATH_RE.test(value)) return undefined;
  } else if (key === "referrer") {
    value = value.toLowerCase();
    if (!HOST_RE.test(value)) return undefined;
  }
  if (value.length > LEAD_SOURCE_LIMITS[key]) value = value.slice(0, LEAD_SOURCE_LIMITS[key]).trim();
  if (!value || looksPersonal(value)) return undefined;
  return value;
}

/** Keeps the allow-listed keys with acceptable values; everything else is dropped. */
export function cleanLeadSource(input: Readonly<Record<string, unknown>>): LeadSource {
  const out: LeadSource = {};
  for (const key of LEAD_SOURCE_KEYS) {
    const value = cleanSourceValue(key, input[key]);
    if (value !== undefined) out[key] = value;
  }
  return out;
}

/**
 * The server's reading of the posted field. Never throws: a missing, oversized or malformed field
 * is simply an enquiry with no known source, because a tampered field must not cost anyone their
 * enquiry.
 */
export function parseLeadSource(raw: unknown): LeadSource {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > MAX_FIELD_LENGTH) return {};
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null || Array.isArray(data)) return {};
    return cleanLeadSource(data as Record<string, unknown>);
  } catch {
    return {};
  }
}

/** The utm_* tags of a query string, cleaned. */
export function utmFromSearch(search: string): LeadSource {
  const params = new URLSearchParams(search);
  const found: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) found[key] = value;
  }
  return cleanLeadSource(found);
}

/**
 * Source, medium and campaign in the terms GA4 uses, for the alert and the lead register:
 * campaign tags when the link had them; otherwise the referring site as a referral; otherwise
 * "direct or unknown" — which is also what a visit without analytics consent looks like.
 */
export function summariseLeadSource(source: LeadSource): { source: string; medium: string; campaign: string } {
  if (source.utm_source || source.utm_medium || source.utm_campaign) {
    return {
      source: source.utm_source ?? "(not set)",
      medium: source.utm_medium ?? "(not set)",
      campaign: source.utm_campaign ?? "",
    };
  }
  if (source.referrer) return { source: source.referrer, medium: "referral", campaign: "" };
  return { source: "direct or unknown", medium: "", campaign: "" };
}
