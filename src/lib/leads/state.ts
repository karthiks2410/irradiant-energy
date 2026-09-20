/**
 * Action-state contract between `submitLead` (src/app/get-quote/actions.ts) and the quote form.
 * Lives outside the "use server" module because that file may only export async functions.
 */

import type { LeadField } from "./schema";

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
      /** Form-level message; shown in an alert region. */
      error: string;
      fieldErrors?: LeadFieldErrors;
      values?: LeadFormValues;
    };

export const initialLeadState: LeadActionState = { ok: null };
