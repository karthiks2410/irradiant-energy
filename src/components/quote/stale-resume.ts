/**
 * Recovery for a deploy that lands while a form is open.
 *
 * Every build gives its Server Actions new IDs. A page opened before a deploy still posts to the
 * old ID, the new server has no such action, and Next throws "Failed to find Server Action" in the
 * browser. Uncaught, that replaced the whole site with the global error screen — seen live on
 * 2026-09-26, when the owner pressed "See my estimate" minutes after a deploy. Vercel's Skew
 * Protection would route the old page to its own deployment, but it needs a Pro plan (this is Hobby).
 *
 * So the forms catch it, as the Next guide advises ("surface the error as a retry path in the UI
 * rather than a hard failure", node_modules/next/dist/docs/01-app/02-guides/server-actions.md):
 * the popup keeps what the visitor typed, reloads onto the new build and reopens itself filled in.
 *
 * The consent tick is NOT carried over: consent boxes are never pre-ticked (CheckboxField, DPDP), so
 * the visitor ticks it again and the notice says so.
 *
 * sessionStorage, not localStorage: it stays in this tab, and the record is removed the moment it
 * is read, so a name and phone number never outlive the reload that needed them.
 */

import { SEGMENTS, type Segment } from "@/lib/solar/constants";

const KEY = "ie:quick-quote-resume";
/** Long enough for a slow reload on a phone; short enough that a stale record never surprises anyone. */
const MAX_AGE_MS = 10 * 60 * 1000;

export type ResumeIntent = "quote" | "site-visit";

export interface QuickQuoteResume {
  /** The page it was filled in on; it reopens only there. */
  path: string;
  intent: ResumeIntent;
  segment: Segment;
  name: string;
  phone: string;
  pincode: string;
  billBucket: string;
  /** The original opening time, so the bot check does not see a two-second resubmit as a bot. */
  startedAt: number;
  savedAt: number;
}

/** True when the browser is online and the record was stored, i.e. a reload can recover. */
export function saveQuickQuoteResume(record: Omit<QuickQuoteResume, "savedAt">): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return false;
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...record, savedAt: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

/**
 * What this page load took, kept for the life of the page. React runs a mount effect twice in
 * development (StrictMode), and a remount could do the same: the second run must get the same
 * record back, not the empty storage the first run left, or the popup reopens and shuts again.
 */
let taken: { path: string; record: QuickQuoteResume | null } | undefined;

/** Reads and removes the record; null unless it was saved on this page in the last ten minutes. */
export function takeQuickQuoteResume(path: string): QuickQuoteResume | null {
  if (taken) return taken.path === path ? taken.record : null;
  const record = readOnce(path);
  taken = { path, record };
  return record;
}

function readOnce(path: string): QuickQuoteResume | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    const r = JSON.parse(raw) as Partial<QuickQuoteResume>;
    const fresh = typeof r.savedAt === "number" && Date.now() - r.savedAt < MAX_AGE_MS;
    const valid =
      r.path === path &&
      (r.intent === "quote" || r.intent === "site-visit") &&
      SEGMENTS.includes(r.segment as Segment) &&
      [r.name, r.phone, r.pincode, r.billBucket].every((v) => typeof v === "string") &&
      typeof r.startedAt === "number";
    return fresh && valid ? (r as QuickQuoteResume) : null;
  } catch {
    return null;
  }
}
