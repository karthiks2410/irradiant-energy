/**
 * The frame every legal notice shares (src/components/pages/LegalPageShell.tsx): the hero's
 * eyebrow, the version line under the summary, and the contact block each notice ends with.
 *
 * The draft banner the shell shows outside production is not here: it is build scaffolding for
 * counsel, never rendered on the live site, so it stays in the component in English.
 */

export const legalShell = {
  eyebrow: "Legal",

  /**
   * The mono line in the hero. Each notice's body points the reader "to the top of this page" for
   * its version and effective date, so the line follows `status` in ./index.ts: a draft says so,
   * an approved notice prints both.
   */
  versionLine: {
    /** `{date}` is the effective date, written out in the reader's language. */
    approved: "Version {version} · Effective {date}",
    draft: "Draft version · Effective date to be confirmed",
  },

  questions: {
    heading: "Questions about this page",
    /** `{email}` and `{phone}` are links; `<grievanceLink>` goes to /contact#grievance. */
    body: "Write to {email} or call {phone}. For a privacy request or a complaint, use the <grievanceLink>grievance and privacy contact</grievanceLink> on our contact page.",
  },
} as const;
