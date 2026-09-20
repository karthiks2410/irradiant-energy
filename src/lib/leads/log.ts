/**
 * Structured, PII-free logging for the lead pipeline (architecture.md §10.5).
 * Only the fields named here are ever written; no names, phones, addresses, message text,
 * form bodies or raw provider error objects.
 */

import { createHash } from "node:crypto";

export interface LeadLogFields {
  /** Short lead reference, safe to correlate with the emails. */
  reference?: string;
  segment?: string;
  /** Salted, truncated hash of the email domain (never the address). */
  emailDomainHash?: string;
  errorName?: string;
  errorStatus?: number | null;
  retryAfterSeconds?: number;
  engineVersion?: string;
}

/**
 * Application salt so the hash is not a bare lookup of common domains. Not a secret: the
 * hash only has to stop casual reading of logs, and adding an env var would widen the config surface.
 */
const DOMAIN_HASH_SALT = "irradiant-energy-lead-log";

export function hashEmailDomain(email: string): string {
  const domain = email.slice(email.lastIndexOf("@") + 1).toLowerCase();
  return createHash("sha256").update(`${DOMAIN_HASH_SALT}:${domain}`).digest("hex").slice(0, 8);
}

export function logLeadEvent(level: "info" | "warn" | "error", event: string, fields: LeadLogFields = {}): void {
  const entry = { ts: new Date().toISOString(), level, event, ...fields };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}
