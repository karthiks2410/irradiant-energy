/**
 * Action-state contract between `submitLead` (src/lib/leads/submit-lead.ts) and the quote form.
 * Lives outside the "use server" module because that file may only export async functions.
 */

import type { LeadFormErrorCode } from "./errors";
import type { LeadField } from "./schema";

/**
 * Codes, not sentences (src/lib/leads/errors.ts). The action serves both locale trees from one
 * endpoint, so the form looks the wording up in the copy its page handed it.
 */
export type LeadFieldErrors = Partial<Record<LeadField, string>>;

/** What the form re-renders after a failed submit so nothing typed is lost (also without JS). */
export interface LeadFormValues {
  name: string;
  phone: string;
  email: string;
  segment: string;
  pincode: string;
  monthlyBill: string;
  message: string;
  whatsappOptIn: boolean;
  consent: boolean;
}

export type LeadActionState =
  /** Nothing submitted yet. */
  | { ok: null }
  | {
      ok: true;
      /** Short reference quoted in both emails, for the success message. */
      reference: string;
      /** Customer-to-company WhatsApp link, prefilled with the reference. */
      whatsappHref: string;
    }
  | {
      ok: false;
      /** Which form-level refusal this is; shown in an alert region, worded by the form. */
      errorCode: LeadFormErrorCode;
      /**
       * A developer hint shown instead of the worded message, outside production only — today,
       * "set RESEND_API_KEY in .env.local". It is an instruction to whoever is running the site,
       * not copy for a visitor, so it stays English and is never translated.
       */
      devMessage?: string;
      /**
       * Set only when the enquiry was valid and we could not deliver it. Nothing durable holds
       * the lead at that point — the lead log is deliberately PII-free — so this carries the
       * reference into WhatsApp and lets the visitor finish the contact themselves rather than
       * meeting a dead end.
       */
      whatsappHref?: string;
      /** Present alongside `whatsappHref`: the reference to quote when they get in touch. */
      reference?: string;
      fieldErrors?: LeadFieldErrors;
      values?: LeadFormValues;
    };

export const initialLeadState: LeadActionState = { ok: null };
