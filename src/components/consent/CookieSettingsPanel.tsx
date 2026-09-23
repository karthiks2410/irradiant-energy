"use client";

import { useConsentRecord, useIsHydrated } from "@/components/consent/useConsent";
import { secondaryButton } from "@/components/consent/styles";
import { useLocale } from "@/components/i18n/LocaleLink";
import { Template } from "@/components/i18n/Template";
import { useChromeUi } from "@/components/i18n/UiProvider";
import { HREFLANG } from "@/i18n/config";
import { openConsentSettings } from "@/lib/consent";

/**
 * The stable place to see and change the answer: `/cookies#cookie-settings`, which is where the
 * footer's Cookie settings link points when JavaScript has not run.
 *
 * It states the answer currently stored before offering to change it, because "withdraw consent"
 * is meaningless if you cannot first see what you consented to. Until it has mounted it shows the
 * same neutral line the server rendered, so the panel never flickers between two answers.
 *
 * It reads its strings from <UiProvider> rather than taking them as props: /cookies borrows this
 * component from the consent module, and threading the same object through that page as well
 * would be a second place to keep right.
 */
export function CookieSettingsPanel() {
  const { consent } = useChromeUi();
  const locale = useLocale();
  const record = useConsentRecord();
  const hydrated = useIsHydrated();

  const answer = !hydrated
    ? consent.panel.loading
    : record === null
      ? consent.panel.unanswered
      : record.analytics
        ? consent.panel.allowed
        : consent.panel.refused;

  // The date is written in the reader's language ("22 ಸೆಪ್ಟೆಂಬರ್ 2026"), unlike the money and
  // system figures, which stay en-IN in both locales so the digit grouping matches the bill
  // (docs/kannada/research/architecture.md §6.7). UTC so the server and the client agree.
  const decidedAt =
    hydrated && record
      ? new Intl.DateTimeFormat(HREFLANG[locale], {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        }).format(new Date(record.decidedAt))
      : null;

  return (
    <div className="mt-6 rounded-md border border-mist bg-canvas p-5 sm:p-6">
      <p className="text-small text-ink-2">{answer}</p>
      {decidedAt && (
        <p className="mt-2 font-label text-label text-grey-600 uppercase">
          <Template text={consent.panel.answeredAt} values={{ date: decidedAt }} />
        </p>
      )}
      <button type="button" onClick={() => openConsentSettings()} className={`${secondaryButton} mt-4 sm:w-auto`}>
        {consent.panel.open}
      </button>
    </div>
  );
}
