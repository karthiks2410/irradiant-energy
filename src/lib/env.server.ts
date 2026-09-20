/**
 * Server environment validation (architecture.md §10.2).
 *
 * Server-only: nothing here is `NEXT_PUBLIC_`, so this module must be imported only from
 * server code (it is imported by the lead action). `src/lib/env.ts` stays client-safe.
 *
 * This used to fail a Production build when mail was not configured, so that a deployment which
 * could not capture a lead never went live. It no longer does (owner decision, 2026-09-20):
 * Resend cannot send until irradiantenergy.in is verified with it and the domain is on registrar
 * hold, so the guard was keeping the whole site off production over a facility that could not
 * work yet.
 *
 * `leadEmailEnv` is null when it is not configured, and `mailConfigured` below is what the quote
 * page reads to disable its form rather than let someone fill in a form that cannot be sent.
 */

import { z } from "zod";

const leadEmailEnvSchema = z.object({
  /** Resend API key. Secret; set per environment (D-012), never committed. */
  RESEND_API_KEY: z.string({ error: "RESEND_API_KEY is required to send lead emails" }).min(1, "RESEND_API_KEY is required to send lead emails"),
  /** Verified Resend sender. No default in production: the sender domain move is deferred (D-011). */
  EMAIL_FROM: z.email("EMAIL_FROM must be an email address"),
  /** Lead inbox: leads@ in Production, admin@ in Preview (D-012). */
  LEAD_EMAIL: z.email("LEAD_EMAIL must be an email address"),
});

export type LeadEmailEnv = z.infer<typeof leadEmailEnvSchema>;

function parseLeadEmailEnv() {
  return leadEmailEnvSchema.safeParse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    LEAD_EMAIL: process.env.LEAD_EMAIL,
  });
}

/**
 * Outside Production (local, Preview, CI, tests) the variables stay optional, so the rest of
 * the site can be built and reviewed without mail credentials. Preview deliberately keeps
 * building: D-012 gives it its own key and points LEAD_EMAIL at admin@.
 */
const result = parseLeadEmailEnv();

/** Mail configuration, or `null` when it is not set up. */
export const leadEmailEnv: LeadEmailEnv | null = result.success ? result.data : null;

/** Whether the quote form can actually deliver. Read by the page to enable or disable it. */
export const mailConfigured = result.success;
