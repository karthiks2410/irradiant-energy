/**
 * Lead form contract, shared by the server action (authoritative) and the form UI (hints).
 * Minimal fields (brand PDF p.69); consent is an explicit, unticked choice (DPDP, 17 §6.2).
 *
 * Every message here is a CODE, not a sentence. The action that runs this schema is one function
 * shared by the English and the Kannada trees, so it cannot answer in a language; the form looks
 * the wording up in the copy it was handed (src/lib/leads/errors.ts, and
 * docs/kannada/research/architecture.md §6.12). The codes are also stabler than prose: rewording
 * an error no longer edits this file.
 */

import { z } from "zod";
import { SEGMENTS } from "@/lib/solar/constants";
import { EMAIL_MAX, MESSAGE_MAX, NAME_MAX, ROOF_AREA_MAX_SQFT } from "./limits";
import type { LeadFieldErrorCode } from "./errors";
import { ALL_BUCKET_IDS, findBucket } from "./quick";
import { EMAIL_RE, INDIAN_MOBILE_RE, NAME_RE, PINCODE_RE, REFERENCE_RE } from "./rules";

export const LEAD_FIELDS = [
  "name",
  "phone",
  "email",
  "segment",
  "pincode",
  "monthlyBill",
  "roofAreaSqft",
  "sanctionedLoadKw",
  "message",
  "consent",
  "whatsappOptIn",
] as const;
export type LeadField = (typeof LEAD_FIELDS)[number];

export type { LeadFieldErrorCode } from "./errors";

/** Minimum time between the form appearing and being submitted; bots post instantly. */
export const MIN_FILL_TIME_MS = 3_000;
/** Tolerated clock skew for the `startedAt` timestamp. */
const MAX_FUTURE_SKEW_MS = 60_000;

export { EMAIL_MAX, MESSAGE_MAX, NAME_MAX } from "./limits";


const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

/** Identity, but it types the string as a code the copy is guaranteed to have a sentence for. */
const code = (value: LeadFieldErrorCode): string => value;

/** FormData carries "on" for a ticked checkbox and nothing for an unticked one. */
const checkbox = z.preprocess(
  (v) => v === true || v === "on" || v === "true" || v === "1",
  z.boolean(),
);

export const leadSchema = z.object({
  name: z
    .string({ error: code("name.required") })
    .trim()
    .min(2, code("name.required"))
    .max(NAME_MAX, code("name.tooLong"))
    .regex(NAME_RE, code("name.lettersOnly")),
  phone: z
    .string({ error: code("phone.required") })
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(INDIAN_MOBILE_RE, code("phone.invalid")))
    .transform((v) => `+91${v.slice(-10)}`),
  email: z
    .string({ error: code("email.required") })
    .trim()
    .toLowerCase()
    .max(EMAIL_MAX, code("email.tooLong"))
    .regex(EMAIL_RE, code("email.invalid")),
  segment: z.enum(SEGMENTS, { error: code("segment.invalid") }),
  pincode: z.preprocess(
    emptyToUndefined,
    z.string().trim().regex(PINCODE_RE, code("pincode.invalid")).optional(),
  ),
  monthlyBill: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: code("monthlyBill.notNumber") })
      .positive(code("monthlyBill.notNumber"))
      .max(1_00_00_000, code("monthlyBill.tooLarge"))
      .optional(),
  ),
  /**
   * Usable roof area from the calculator. It caps the system size, so the server has to
   * recompute with it or the sales alert quotes a bigger system than the visitor was shown.
   * It is never typed into the lead form itself, so a bad value is dropped rather than
   * surfaced as an error against a field that is not on screen.
   */
  roofAreaSqft: z.preprocess(
    emptyToUndefined,
    z.coerce.number().positive().max(ROOF_AREA_MAX_SQFT).optional().catch(undefined),
  ),
  sanctionedLoadKw: z.preprocess(
    emptyToUndefined,
    z.coerce.number().positive().max(1000).optional().catch(undefined),
  ),
  message: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(MESSAGE_MAX, code("message.tooLong")).optional(),
  ),
  consent: checkbox.pipe(z.literal(true, { error: code("consent.required") })),
  whatsappOptIn: checkbox.default(false),
  /** Honeypot: hidden from people, filled by bots. */
  website: z.preprocess(emptyToUndefined, z.undefined({ error: "spam" })),
  /** Epoch milliseconds set when the form appeared. */
  startedAt: z.coerce.number({ error: "timing" }).refine(Number.isFinite, "timing"),
});

export type LeadInput = z.input<typeof leadSchema>;
export type Lead = z.output<typeof leadSchema>;

export type LeadParseResult =
  | { kind: "ok"; lead: Lead }
  | { kind: "spam" }
  | { kind: "too-fast" }
  /** Values are `LeadFieldErrorCode`s; the form turns them into sentences. */
  | { kind: "invalid"; fieldErrors: Partial<Record<LeadField, string>> };

/** Reads the raw form, applies the schema, and classifies the outcome for the action. */
export function parseLeadForm(formData: FormData, now: number = Date.now()): LeadParseResult {
  const raw: Record<string, FormDataEntryValue | undefined> = {};
  for (const key of [...LEAD_FIELDS, "website", "startedAt"]) {
    const value = formData.get(key);
    raw[key] = typeof value === "string" ? value : undefined;
  }

  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<LeadField, string>> = {};
    let spam = false;
    let timing = false;
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "website") spam = true;
      else if (field === "startedAt") timing = true;
      else if (typeof field === "string" && isLeadField(field) && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    if (spam) return { kind: "spam" };
    if (timing) return { kind: "too-fast" };
    return { kind: "invalid", fieldErrors };
  }

  const elapsed = now - parsed.data.startedAt;
  if (elapsed < MIN_FILL_TIME_MS && elapsed > -MAX_FUTURE_SKEW_MS) return { kind: "too-fast" };
  if (elapsed <= -MAX_FUTURE_SKEW_MS) return { kind: "too-fast" };

  return { kind: "ok", lead: parsed.data };
}

const isLeadField = (key: string): key is LeadField => (LEAD_FIELDS as readonly string[]).includes(key);

/* ---------------------------------------------------------------------------
   Quick quote (the header popup)

   Four fields and consent, no email: phone first, click and go (owner decision, 2026-09-25).
   The bill arrives as a bucket id, and the bucket must belong to the chosen property type —
   a business bucket posted with "home" is rejected rather than silently mis-estimated. The
   phone doubles as the WhatsApp number the visitor gave, and the consent wording on the popup
   covers a phone or WhatsApp follow-up about this enquiry, so the WhatsApp opt-in is implied by
   that one affirmative tick rather than asked for twice.
   --------------------------------------------------------------------------- */

export const QUICK_LEAD_FIELDS = ["name", "phone", "segment", "pincode", "billBucket", "consent"] as const;
export type QuickLeadField = (typeof QUICK_LEAD_FIELDS)[number];

export const quickLeadSchema = z
  .object({
    name: leadSchema.shape.name,
    phone: leadSchema.shape.phone,
    segment: leadSchema.shape.segment,
    pincode: z.string({ error: "pincode.invalid" }).trim().regex(PINCODE_RE, "pincode.invalid"),
    billBucket: z.enum(ALL_BUCKET_IDS as [string, ...string[]], { error: "billBucket.required" }),
    consent: leadSchema.shape.consent,
    website: leadSchema.shape.website,
    startedAt: leadSchema.shape.startedAt,
  })
  .superRefine((value, ctx) => {
    if (!findBucket(value.segment, value.billBucket)) {
      ctx.addIssue({ code: "custom", path: ["billBucket"], message: "billBucket.required" });
    }
  });

export type QuickLead = z.output<typeof quickLeadSchema>;

export type QuickLeadParseResult =
  | { kind: "ok"; lead: QuickLead }
  | { kind: "spam" }
  | { kind: "too-fast" }
  | { kind: "invalid"; fieldErrors: Partial<Record<QuickLeadField, LeadFieldErrorCode>> };

export function parseQuickLead(formData: FormData, now: number = Date.now()): QuickLeadParseResult {
  const raw: Record<string, FormDataEntryValue | undefined> = {};
  for (const key of [...QUICK_LEAD_FIELDS, "website", "startedAt"]) {
    const value = formData.get(key);
    raw[key] = typeof value === "string" ? value : undefined;
  }

  const parsed = quickLeadSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<QuickLeadField, LeadFieldErrorCode>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "website") return { kind: "spam" };
      if (field === "startedAt") return { kind: "too-fast" };
      if (typeof field === "string" && (QUICK_LEAD_FIELDS as readonly string[]).includes(field)) {
        // Every message in these schemas is a LeadFieldErrorCode, never a sentence.
        fieldErrors[field as QuickLeadField] ??= issue.message as LeadFieldErrorCode;
      }
    }
    return { kind: "invalid", fieldErrors };
  }

  const elapsed = now - parsed.data.startedAt;
  if (elapsed < MIN_FILL_TIME_MS || elapsed <= -MAX_FUTURE_SKEW_MS) return { kind: "too-fast" };
  return { kind: "ok", lead: parsed.data };
}

/**
 * The optional second step: "Email me the full breakdown". It re-sends the quick lead's fields
 * (there is no lead store to look them up from) plus the reference the first step returned and
 * the address. Asking for it after the figures are on screen is the consent act for this one
 * email; it enrols nobody in anything else.
 */
export const quickEmailSchema = z
  .object({
    reference: z.string().regex(REFERENCE_RE, "reference"),
    name: leadSchema.shape.name,
    segment: leadSchema.shape.segment,
    pincode: z.string().trim().regex(PINCODE_RE, "pincode.invalid"),
    billBucket: z.enum(ALL_BUCKET_IDS as [string, ...string[]], { error: "billBucket.required" }),
    email: leadSchema.shape.email,
  })
  .superRefine((value, ctx) => {
    if (!findBucket(value.segment, value.billBucket)) {
      ctx.addIssue({ code: "custom", path: ["billBucket"], message: "billBucket.required" });
    }
  });

export type QuickEmailRequest = z.output<typeof quickEmailSchema>;
