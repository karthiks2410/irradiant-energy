"use client";

import { useEffect, useState } from "react";
import { useChromeUi } from "@/components/i18n/UiProvider";
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
 * While the banner is unanswered the page is held still (owner direction, 2026-09-20). That takes
 * three things, because any one alone leaves a way through: `overflow: hidden` on <html> via the
 * `data-scroll-locked` attribute, Lenis stopping its own rAF loop when it sees that attribute, and
 * the rest of the document going `inert` so a keyboard visitor cannot tab into a page they cannot
 * scroll. The attribute is the shared signal because the pieces that react to it are nowhere near
 * each other in the tree.
 *
 * Focus handling, in full:
 * - The banner takes focus when it appears, traps it while the page is locked, and hands focus back
 *   on the way out (see ConsentBanner).
 * - The preferences dialog is modal, so the platform traps focus inside it and returns focus to
 *   whatever opened it: the footer link, the /cookies button, or the banner's Manage button.
 * - The outcome of a choice is read out by the polite status region at the bottom of this file,
 *   rather than by a focus move to a message nobody asked to read.
 */
export function ConsentManager() {
  // The consent question is the one thing on the page DPDP §6(3) requires in the language the
  // reader chose, so it reads the same per-locale chrome the rest of the page does.
  const { consent } = useChromeUi();
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

  // The banner is showing and nothing else has replaced it: hold the page still.
  const locked = hydrated && record === null && !settingsOpen;

  useEffect(() => {
    if (!locked) return;
    const root = document.documentElement;
    root.setAttribute("data-scroll-locked", "");
    // Everything except the banner goes inert, so tab and the pointer cannot reach a page that
    // will not move. The banner mounts after these, so it is untouched.
    const outside = [document.getElementById("main"), document.querySelector("header"), document.querySelector("footer")];
    for (const node of outside) node?.setAttribute("inert", "");
    return () => {
      root.removeAttribute("data-scroll-locked");
      for (const node of outside) node?.removeAttribute("inert");
    };
  }, [locked]);

  const openSettings = () => {
    setDraft(record ?? DEFAULT_CHOICE);
    setSettingsOpen(true);
  };

  const decide = (choice: ConsentChoice) => {
    saveConsent(choice);
    setSettingsOpen(false);
    setStatus(choice.analytics ? consent.saved.accepted : consent.saved.refused);
  };

  return (
    <>
      {locked && (
        <ConsentBanner
          copy={consent.banner}
          onAccept={() => decide(ACCEPT_ALL)}
          onReject={() => decide(REJECT_ALL)}
          onManage={openSettings}
        />
      )}

      {hydrated && (
        <ConsentSettings
          copy={consent.settings}
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
