/**
 * What the lead pipeline can refuse, as codes rather than sentences.
 *
 * The Server Action is one function shared by both locale trees (one action id, one endpoint),
 * so it cannot answer in a language: it does not know which page the form was on until it reads
 * the request, and returning English from a Kannada page would put an untranslated sentence in
 * front of the reader at the worst possible moment. It therefore returns a code, and the form
 * looks the wording up in the copy its Server Component handed it
 * (docs/kannada/research/architecture.md §6.12).
 *
 * Dependency-free on purpose, like `limits.ts` beside it: the zod schema and the client form both
 * import it, and the client must not pull zod into the browser bundle.
 */

import { EMAIL_MAX, MESSAGE_MAX, NAME_MAX } from "./limits";

/** A refusal against one field, shown under the control and listed in the error summary. */
export const LEAD_FIELD_ERROR_CODES = [
  "name.required",
  "name.tooLong",
  "name.lettersOnly",
  "phone.required",
  "phone.invalid",
  "email.required",
  "email.tooLong",
  "email.invalid",
  "segment.invalid",
  "pincode.invalid",
  "monthlyBill.notNumber",
  "monthlyBill.tooLarge",
  "message.tooLong",
  "consent.required",
  /** Quick-quote popup: no bill range chosen. */
  "billBucket.required",
] as const;

export type LeadFieldErrorCode = (typeof LEAD_FIELD_ERROR_CODES)[number];

/** A refusal against the whole submission, shown in the alert region above the form. */
// "stale": the page was opened before a deploy and its Server Action no longer exists (the forms
// catch that in the browser; see src/components/quote/stale-resume.ts).
export const LEAD_FORM_ERROR_CODES = ["send", "rateLimited", "tooFast", "invalid", "stale"] as const;

export type LeadFormErrorCode = (typeof LEAD_FORM_ERROR_CODES)[number];

/**
 * The `{max}` in the three length messages.
 *
 * The limit belongs to the schema, not to the translation, so it is filled at render time from
 * the same constants the schema enforces — a reviewer can move the number around the sentence
 * but cannot change it.
 */
export const LEAD_ERROR_PARAMS: Partial<Record<LeadFieldErrorCode, Readonly<Record<string, number>>>> = {
  "name.tooLong": { max: NAME_MAX },
  "email.tooLong": { max: EMAIL_MAX },
  "message.tooLong": { max: MESSAGE_MAX },
};

const FIELD_CODES = new Set<string>(LEAD_FIELD_ERROR_CODES);

/** Narrows a string that came back from zod to a code the copy is guaranteed to have. */
export const isLeadFieldErrorCode = (value: string): value is LeadFieldErrorCode => FIELD_CODES.has(value);
