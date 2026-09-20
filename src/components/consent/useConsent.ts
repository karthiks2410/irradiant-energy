"use client";

import { useSyncExternalStore } from "react";
import {
  getConsentSnapshot,
  getServerConsentSnapshot,
  subscribeConsent,
  type ConsentCategory,
  type ConsentRecord,
} from "@/lib/consent";

/**
 * React bindings for the consent store (src/lib/consent.ts).
 *
 * useSyncExternalStore is the right primitive here: the server snapshot is always null, so the
 * server HTML never depends on a cookie (pages stay static) and the client fills the answer in
 * after hydration without a mismatch warning.
 */

/** The stored answer, or null when the visitor has not answered the current consent version. */
export function useConsentRecord(): ConsentRecord | null {
  return useSyncExternalStore(subscribeConsent, getConsentSnapshot, getServerConsentSnapshot);
}

/** True only when the category is actually granted. Unanswered counts as not granted. */
export function useConsentGranted(category: ConsentCategory): boolean {
  const record = useConsentRecord();
  if (category === "necessary") return true;
  return record?.[category] === true;
}

const neverChanges = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * False while rendering on the server and through hydration, true from the commit after it.
 *
 * The consent answer lives in a cookie the server never reads, so anything that depends on it has
 * to wait for the client — otherwise the banner flashes on every visit from someone who already
 * answered. This is the store-shaped version of a `mounted` flag: no state, no effect, no cascading
 * render.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(neverChanges, onClient, onServer);
}
