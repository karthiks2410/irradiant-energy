/**
 * Server environment validation (architecture.md §10.2).
 *
 * Server-only: nothing here is `NEXT_PUBLIC_`, so this module must be imported only from
 * server code (it is imported by the lead action). `src/lib/env.ts` stays client-safe.
 *
 * The lead pipeline has no store yet (architecture.md OD-4), so the sales alert *is* the
 * record of a lead. A Production deployment missing one of these variables would therefore
 * drop every enquiry silently, one `{ok:false}` at a time. `next.config.ts` imports this
 * module, so the check runs during `next build`: a Production build without mail credentials
 * fails, the bad deployment never goes live, and the previous one keeps serving. A running
 * deployment is never taken down by this — the action keeps its call-or-WhatsApp fallback.
 */

import { z } from "zod";
import { isProduction } from "./env";

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

if (isProduction && !result.success) {
  // Names the variable and what is wrong with it: this message is read once, by whoever is
  // looking at a red Vercel build at the moment they least want a puzzle.
  const problems = result.error.issues.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`);
  throw new Error(
    `Invalid server environment for the lead pipeline — ${problems.join("; ")}. ` +
      "Set RESEND_API_KEY, EMAIL_FROM and LEAD_EMAIL on the Vercel project (Production); " +
      "see .env.example and decisions.md D-012.",
  );
}

/** Mail configuration, or `null` when it is not set up (never in Production; see above). */
export const leadEmailEnv: LeadEmailEnv | null = result.success ? result.data : null;
