"use client";

import { useEffect, useState } from "react";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { ConsentSettings } from "@/components/consent/ConsentSettings";
import { useConsentRecord, useIsHydrated } from "@/components/consent/useConsent";
import {
  ACCEPT_ALL,
  CONSENT_SETTINGS_EVENT,
  DEFAULT_CHOICE,
  REJECT_ALL,
  getConsentSnapshot,
  saveConsent,
  type ConsentChoice,
} from "@/lib/consent";

/**
 * The single mount point for the consent UI. Add it once, in the root layout, after the footer.
 *
 * It renders nothing on the server and nothing at all once the visitor has answered — the lasting
 * cost on an answered visit is this small island plus the stored preference.
 *
 * Focus handling, in full:
 * - The banner takes focus when it appears and does not trap it, and it hands focus back on the way
 *   out (see ConsentBanner).
 * - The preferences dialog is modal, so the platform traps focus inside it and returns focus to
 *   whatever opened it: the footer link, the /cookies button, or the banner's Manage button.
 * - The outcome of a choice is read out by the polite status region at the bottom of this file,
 *   rather than by a focus move to a message nobody asked to read.
 */
export function ConsentManager() {
  const record = useConsentRecord();
  const hydrated = useIsHydrated();
  const [settingsOpen, setSettingsOpen] = useState(false);
  /** The answer being edited in the dialog. Seeded from the stored one each time it opens. */
  const [draft, setDraft] = useState<ConsentChoice>(DEFAULT_CHOICE);
  const [status, setStatus] = useState("");

  // "Cookie settings", from the footer or anywhere else (lib/consent.ts openConsentSettings).
  // The store is read here rather than closed over, so the dialog always opens on what is stored.
  useEffect(() => {
    const open = () => {
      setDraft(getConsentSnapshot() ?? DEFAULT_CHOICE);
      setSettingsOpen(true);
    };
    window.addEventListener(CONSENT_SETTINGS_EVENT, open);
    return () => window.removeEventListener(CONSENT_SETTINGS_EVENT, open);
  }, []);

  const openSettings = () => {
    setDraft(record ?? DEFAULT_CHOICE);
    setSettingsOpen(true);
  };

  const decide = (choice: ConsentChoice) => {
    saveConsent(choice);
    setSettingsOpen(false);
    setStatus(
      choice.analytics
        ? "Saved. Analytics is allowed. You can change this any time from Cookie settings in the footer."
        : "Saved. Analytics is refused, so nothing is measured. You can change this any time from Cookie settings in the footer.",
    );
  };

  return (
    <>
      {hydrated && record === null && !settingsOpen && (
        <ConsentBanner
          onAccept={() => decide(ACCEPT_ALL)}
          onReject={() => decide(REJECT_ALL)}
          onManage={openSettings}
        />
      )}

      {hydrated && (
        <ConsentSettings
          open={settingsOpen}
          value={draft}
          onChange={setDraft}
          onSave={() => decide(draft)}
          onRejectAll={() => decide(REJECT_ALL)}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {/* Mounted from the start so the message that lands here is announced, not swallowed. */}
      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>
    </>
  );
}
