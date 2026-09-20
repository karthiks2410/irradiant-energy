"use client";

import { useConsentRecord, useIsHydrated } from "@/components/consent/useConsent";
import { secondaryButton } from "@/components/consent/styles";
import { openConsentSettings } from "@/lib/consent";

/**
 * The stable place to see and change the answer: `/cookies#cookie-settings`, which is where the
 * footer's Cookie settings link points when JavaScript has not run.
 *
 * It states the answer currently stored before offering to change it, because "withdraw consent"
 * is meaningless if you cannot first see what you consented to. Until it has mounted it shows the
 * same neutral line the server rendered, so the panel never flickers between two answers.
 */
export function CookieSettingsPanel() {
  const record = useConsentRecord();
  const hydrated = useIsHydrated();

  const answer = !hydrated
    ? "Reading your saved choice…"
    : record === null
      ? "You have not answered yet. Until you do, nothing optional is loaded — refusing is the state you are already in."
      : record.analytics
        ? "Analytics: allowed. Nothing is loaded today, so nothing is being measured; if measurement is switched on, this answer lets it run."
        : "Analytics: refused. Nothing is loaded, and nothing will load while this answer stands.";

  const decidedAt =
    hydrated && record
      ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
          new Date(record.decidedAt),
        )
      : null;

  return (
    <div className="mt-6 rounded-md border border-mist bg-canvas p-5 sm:p-6">
      <p className="text-small text-ink-2">{answer}</p>
      {decidedAt && <p className="mt-2 font-mono text-label text-grey-600 uppercase">Answered {decidedAt}</p>}
      <button type="button" onClick={() => openConsentSettings()} className={`${secondaryButton} mt-4 sm:w-auto`}>
        Open cookie settings
      </button>
    </div>
  );
}
