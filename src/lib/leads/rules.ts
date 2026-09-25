/**
 * Field rules for the lead forms, with no dependencies.
 *
 * The server schema (src/lib/leads/schema.ts) is authoritative and builds on these; the quick
 * quote popup uses the same patterns and messages to check a field when the visitor leaves it.
 * They live here, rather than in the schema, so the client can use them without pulling zod into
 * the browser bundle, and so a field cannot pass in the browser and fail on the server for a
 * different reason (or with different words).
 */

import type { LeadFieldErrorCode } from "./errors";
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

/*
 * The checks return CODES, not sentences (src/lib/leads/errors.ts): the page words them in its own
 * language, exactly as it words the server's answer, so a Kannada visitor never sees English.
 */

/** Spaces and dashes are how people type phone numbers; the pattern ignores them. */
export const compactPhone = (value: string) => value.trim().replace(/[\s-]/g, "");

export function checkName(value: string): LeadFieldErrorCode | undefined {
  const v = value.trim();
  if (v.length < 2) return "name.required";
  if (v.length > NAME_MAX) return "name.tooLong";
  if (!NAME_RE.test(v)) return "name.lettersOnly";
  return undefined;
}

export function checkPhone(value: string): LeadFieldErrorCode | undefined {
  if (value.trim() === "") return "phone.required";
  return INDIAN_MOBILE_RE.test(compactPhone(value)) ? undefined : "phone.invalid";
}

export function checkPincode(value: string): LeadFieldErrorCode | undefined {
  return PINCODE_RE.test(value.trim()) ? undefined : "pincode.invalid";
}

export function checkEmail(value: string): LeadFieldErrorCode | undefined {
  const v = value.trim();
  if (v === "") return "email.required";
  if (v.length > EMAIL_MAX) return "email.tooLong";
  return EMAIL_RE.test(v) ? undefined : "email.invalid";
}
