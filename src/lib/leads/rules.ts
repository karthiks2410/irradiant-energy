/**
 * Field rules for the lead forms, with no dependencies.
 *
 * The server schema (src/lib/leads/schema.ts) is authoritative and builds on these; the quick
 * quote popup uses the same patterns and messages to check a field when the visitor leaves it.
 * They live here, rather than in the schema, so the client can use them without pulling zod into
 * the browser bundle, and so a field cannot pass in the browser and fail on the server for a
 * different reason (or with different words).
 */

import { EMAIL_MAX, NAME_MAX } from "./limits";

/** Letters and combining marks (covers Kannada), spaces, dots, apostrophes and hyphens. */
export const NAME_RE = /^[\p{L}\p{M} .'-]+$/u;
/** 10-digit Indian mobile, optionally with +91 / 91 / 0 and spaces or dashes. */
export const INDIAN_MOBILE_RE = /^(?:\+?91|0)?[6-9]\d{9}$/;
/** Stricter than a bare `@` check: a real TLD, no repeated dots, no spaces. */
export const EMAIL_RE =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;
export const PINCODE_RE = /^[1-9][0-9]{5}$/;
/** The lead reference minted by the action: IE- and six characters from an unambiguous alphabet. */
export const REFERENCE_RE = /^IE-[A-HJ-NP-Z2-9]{6}$/;

export const LEAD_MESSAGES = {
  name: "Enter your name",
  nameTooLong: `Keep your name under ${NAME_MAX} characters`,
  nameLetters: "Use letters only",
  phoneMissing: "Enter your mobile number",
  phone: "Enter a 10-digit Indian mobile number",
  emailMissing: "Enter your email address",
  emailTooLong: `Keep your email under ${EMAIL_MAX} characters`,
  email: "Enter a valid email address",
  segment: "Choose the type of property",
  pincode: "Enter a 6-digit PIN code",
  billRange: "Choose your monthly bill",
  consent: "Please agree so we can contact you about this enquiry",
} as const;

/** Spaces and dashes are how people type phone numbers; the pattern ignores them. */
export const compactPhone = (value: string) => value.trim().replace(/[\s-]/g, "");

export function checkName(value: string): string | undefined {
  const v = value.trim();
  if (v.length < 2) return LEAD_MESSAGES.name;
  if (v.length > NAME_MAX) return LEAD_MESSAGES.nameTooLong;
  if (!NAME_RE.test(v)) return LEAD_MESSAGES.nameLetters;
  return undefined;
}

export function checkPhone(value: string): string | undefined {
  return INDIAN_MOBILE_RE.test(compactPhone(value)) ? undefined : LEAD_MESSAGES.phone;
}

export function checkPincode(value: string): string | undefined {
  return PINCODE_RE.test(value.trim()) ? undefined : LEAD_MESSAGES.pincode;
}

export function checkEmail(value: string): string | undefined {
  const v = value.trim();
  if (v === "") return LEAD_MESSAGES.emailMissing;
  if (v.length > EMAIL_MAX) return LEAD_MESSAGES.emailTooLong;
  return EMAIL_RE.test(v) ? undefined : LEAD_MESSAGES.email;
}
