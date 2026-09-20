/**
 * Lead form contract, shared by the server action (authoritative) and the form UI (hints).
 * Minimal fields (brand PDF p.69); consent is an explicit, unticked choice (DPDP, 17 §6.2).
 */

import { z } from "zod";
import { SEGMENTS } from "@/lib/solar/constants";
import { EMAIL_MAX, MESSAGE_MAX, NAME_MAX, ROOF_AREA_MAX_SQFT } from "./limits";

export const LEAD_FIELDS = [
  "name",
  "phone",
  "email",
  "segment",
  "pincode",
  "monthlyBill",
  "roofAreaSqft",
  "message",
  "consent",
  "whatsappOptIn",
] as const;
export type LeadField = (typeof LEAD_FIELDS)[number];

/** Minimum time between the form appearing and being submitted; bots post instantly. */
export const MIN_FILL_TIME_MS = 3_000;
/** Tolerated clock skew for the `startedAt` timestamp. */
const MAX_FUTURE_SKEW_MS = 60_000;

export { EMAIL_MAX, MESSAGE_MAX, NAME_MAX } from "./limits";

/** Letters and combining marks (covers Kannada), spaces, dots, apostrophes and hyphens. */
const NAME_RE = /^[\p{L}\p{M} .'-]+$/u;
/** 10-digit Indian mobile, optionally with +91 / 91 / 0 and spaces or dashes. */
const INDIAN_MOBILE_RE = /^(?:\+?91|0)?[6-9]\d{9}$/;
/** Stricter than a bare `@` check: a real TLD, no repeated dots, no spaces. */
const EMAIL_RE =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;
const PINCODE_RE = /^[1-9][0-9]{5}$/;

const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

/** FormData carries "on" for a ticked checkbox and nothing for an unticked one. */
const checkbox = z.preprocess(
  (v) => v === true || v === "on" || v === "true" || v === "1",
  z.boolean(),
);

export const leadSchema = z.object({
  name: z
    .string({ error: "Enter your name" })
    .trim()
    .min(2, "Enter your name")
    .max(NAME_MAX, `Keep your name under ${NAME_MAX} characters`)
    .regex(NAME_RE, "Use letters only"),
  phone: z
    .string({ error: "Enter your mobile number" })
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(INDIAN_MOBILE_RE, "Enter a 10-digit Indian mobile number"))
    .transform((v) => `+91${v.slice(-10)}`),
  email: z
    .string({ error: "Enter your email address" })
    .trim()
    .toLowerCase()
    .max(EMAIL_MAX, `Keep your email under ${EMAIL_MAX} characters`)
    .regex(EMAIL_RE, "Enter a valid email address"),
  segment: z.enum(SEGMENTS, { error: "Choose the type of property" }),
  pincode: z.preprocess(
    emptyToUndefined,
    z.string().trim().regex(PINCODE_RE, "Enter a 6-digit PIN code").optional(),
  ),
  monthlyBill: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: "Enter your monthly bill as a number" })
      .positive("Enter your monthly bill as a number")
      .max(1_00_00_000, "That bill looks too large")
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
  message: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(MESSAGE_MAX, `Keep your message under ${MESSAGE_MAX} characters`).optional(),
  ),
  consent: checkbox.pipe(z.literal(true, { error: "Please agree so we can contact you about this enquiry" })),
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
