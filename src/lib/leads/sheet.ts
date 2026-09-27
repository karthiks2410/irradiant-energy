/**
 * The lead register: every enquiry, one row in a Google Sheet in the company's Google Workspace.
 *
 * Why it exists: the sales alert email was the only record of an enquiry (architecture.md OD-4), so
 * following leads up meant searching an inbox. The register gives the team one list to work from —
 * a Status and a Notes column they fill in themselves — without adding a database to the site.
 *
 * How it works: after the alert email has gone, the server action posts the lead to a Google Apps
 * Script web app bound to the Sheet (integrations/google-sheet/Code.gs), with a shared token. The
 * script checks the token, appends the row (or updates the row with the same Reference) and
 * neutralises anything a spreadsheet could read as a formula. Setup is in
 * integrations/google-sheet/README.md.
 *
 * The rules this module keeps:
 * - Server only. LEAD_SHEET_URL and LEAD_SHEET_TOKEN are never NEXT_PUBLIC_; the token is a secret.
 * - Optional. If either variable is missing, nothing is posted and a PII-free line is logged.
 * - Never in the visitor's way. The caller schedules it with `after()`, so the visitor's answer does
 *   not wait for it; each attempt gives up after SHEET_TIMEOUT_MS, a failure is tried once more
 *   (`recordInSheet`; the script's upsert makes that safe), and nothing here throws. A failure only
 *   logs `lead_sheet_failed` with the reference — the alert email already holds the enquiry.
 * - Logs carry the reference and an error name or status, never a field of the lead.
 */

import { SEGMENT_LABELS } from "@/lib/solar/constants";
import { formatInr } from "@/lib/solar/format";
import { leadFormKind, type LeadEmailContext, type LeadFormKind } from "./emails";
import { logLeadEvent } from "./log";
import { summariseLeadSource } from "./source";

/**
 * Apps Script answers in one to three seconds when warm, but a script that has not run for a while
 * starts cold: on the live site the first attempt at 4 s timed out and the retry succeeded
 * (IE-QA3LVT, 2026-09-27). With a few leads a day it is usually cold, so wait long enough for that.
 * Nobody waits on this: it runs in `after()`, well inside the function's time limit.
 */
export const SHEET_TIMEOUT_MS = 10_000;

/**
 * The register's columns, in order, exactly as the Apps Script writes its header row. Status and
 * Notes belong to the sales team: the script fills Status with "New" on a new row and never
 * overwrites either.
 */
export const SHEET_COLUMNS = [
  "Received (IST)",
  "Reference",
  "Form",
  "Language",
  "Name",
  "Phone",
  "Email",
  "PIN code",
  "Property",
  "Monthly bill",
  "Sanctioned load (kW)",
  "Estimated system (kWp)",
  "WhatsApp OK",
  "Source",
  "Medium",
  "Campaign",
  "Landing page",
  "Enquiry page",
  "Status",
  "Notes",
] as const;

export type SheetColumn = (typeof SHEET_COLUMNS)[number];

/** What the site sends for one enquiry: every column except the two the team owns. */
export type SheetLeadRow = Record<Exclude<SheetColumn, "Status" | "Notes">, string>;

export type SheetRequest =
  | { action: "append"; row: SheetLeadRow }
  /** The popup's "email me the breakdown" step: fill in the Email of the row with this reference. */
  | { action: "email"; reference: string; email: string };

export interface SheetConfig {
  url: string;
  token: string;
}

/** The register's address and token, or null when it is not set up (then nothing is posted). */
export function sheetConfig(env: Readonly<Record<string, string | undefined>> = process.env): SheetConfig | null {
  const url = env.LEAD_SHEET_URL?.trim();
  const token = env.LEAD_SHEET_TOKEN?.trim();
  if (!url || !token) return null;
  try {
    const parsed = new URL(url);
    // HTTPS only, so the token never crosses the network in the clear. Plain http is accepted for
    // a local mock on this machine, which is how the integration is tested.
    const local = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && local)) return null;
  } catch {
    return null;
  }
  return { url, token };
}

/** "2026-09-26 21:41:05": IST, in a form Google Sheets reads as a date and time. */
export function istTimestamp(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

const FORM_COLUMN: Record<LeadFormKind, string> = {
  calculator: "Calculator",
  popup: "Popup",
  site_visit: "Site visit",
  home: "Home page",
};

/**
 * One enquiry as a register row, from the same context the alert email is written from, so the
 * two can never disagree. Values are plain text; the Apps Script makes anything that starts like
 * a formula (the +91 phone number, for one) inert before it writes the cell.
 */
export function sheetRowFor(ctx: LeadEmailContext): SheetLeadRow {
  const { lead, reference, estimate, submittedAt, locale } = ctx;
  const found = ctx.leadSource ?? {};
  const { source, medium, campaign } = summariseLeadSource(found);
  return {
    "Received (IST)": istTimestamp(submittedAt),
    Reference: reference,
    Form: FORM_COLUMN[leadFormKind(ctx)],
    Language: locale === "kn" ? "Kannada" : "English",
    Name: lead.name,
    Phone: lead.phone,
    Email: lead.email ?? "",
    "PIN code": lead.pincode ?? "",
    Property: SEGMENT_LABELS[lead.segment],
    // A quick-quote lead (popup or home page) gives a range, never a figure; the register shows it as given.
    "Monthly bill": ctx.billRange ? ctx.billRange.label : lead.monthlyBill === undefined ? "" : formatInr(lead.monthlyBill),
    "Sanctioned load (kW)": lead.sanctionedLoadKw === undefined ? "" : String(lead.sanctionedLoadKw),
    "Estimated system (kWp)": estimate ? String(estimate.systemKwp) : "",
    "WhatsApp OK": lead.whatsappOptIn ? "Yes" : "No",
    Source: source,
    Medium: medium,
    Campaign: campaign,
    "Landing page": found.landing ?? "",
    "Enquiry page": found.page ?? "",
  };
}

export type SheetOutcome = "ok" | "skipped" | "failed";

/**
 * Post one request to the register. Resolves with what happened and never rejects; every outcome
 * is logged without personal data. `fetchImpl` and `config` exist for the tests.
 */
export async function postToSheet(
  request: SheetRequest,
  {
    config = sheetConfig(),
    fetchImpl = fetch,
    timeoutMs = SHEET_TIMEOUT_MS,
  }: { config?: SheetConfig | null; fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<SheetOutcome> {
  const reference = request.action === "append" ? request.row.Reference : request.reference;
  if (!config) {
    logLeadEvent("info", "lead_sheet_skipped", { reference });
    return "skipped";
  }
  try {
    const response = await fetchImpl(config.url, {
      method: "POST",
      // text/plain is what Apps Script reads without complaint; the body is JSON all the same.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ token: config.token, ...request }),
      // Apps Script answers from script.googleusercontent.com after a redirect.
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
    if (!response.ok) {
      logLeadEvent("warn", "lead_sheet_failed", { reference, errorName: "http", errorStatus: response.status });
      return "failed";
    }
    // The script reports its own refusals (a wrong token, a busy lock) in the body with a 200.
    let answer: unknown;
    try {
      answer = await response.json();
    } catch {
      answer = null;
    }
    const ok = typeof answer === "object" && answer !== null && (answer as { ok?: unknown }).ok === true;
    if (!ok) {
      const code = typeof answer === "object" && answer !== null ? (answer as { error?: unknown }).error : undefined;
      logLeadEvent("warn", "lead_sheet_failed", {
        reference,
        // The script's own short codes ("unauthorized", "busy", "not-found"); anything else is "bad-response".
        errorName: typeof code === "string" && /^[a-z-]{1,24}$/.test(code) ? code : "bad-response",
        errorStatus: response.status,
      });
      return "failed";
    }
    logLeadEvent("info", "lead_sheet_ok", { reference });
    return "ok";
  } catch (err) {
    logLeadEvent("warn", "lead_sheet_failed", {
      reference,
      errorName: err instanceof Error ? err.name : "unknown",
      errorStatus: null,
    });
    return "failed";
  }
}

/** The wait before the one retry: long enough for a busy lock or a cold start to clear. */
export const SHEET_RETRY_DELAY_MS = 2_000;

/**
 * `postToSheet`, and once more after a short wait if it failed. Safe to repeat: the script updates
 * the row with the same Reference instead of adding a second one, and an email it already holds is
 * accepted again. The retry also covers the popup's email step arriving while the enquiry's own
 * row is still being written.
 */
export async function recordInSheet(
  request: SheetRequest,
  options: Parameters<typeof postToSheet>[1] & { retryDelayMs?: number } = {},
): Promise<SheetOutcome> {
  const { retryDelayMs = SHEET_RETRY_DELAY_MS, ...rest } = options;
  const first = await postToSheet(request, rest);
  if (first !== "failed") return first;
  await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
  return postToSheet(request, rest);
}
