/**
 * The one delegated click listener behind click_call, click_whatsapp, click_email, click_social and
 * switch_language.
 *
 * One listener on the document, in the capture phase, instead of a handler on every link: the links
 * live in Server Components (header, footer, pages) that cannot take an onClick, new links are
 * counted without anyone remembering to wire them, and a handler that stops propagation cannot
 * hide a click from it. What a click counts as is decided by `describeLinkClick`
 * (src/lib/events.ts), which reads only the link's scheme and host and a location label — never
 * the number, the address or a WhatsApp prefill.
 *
 * Where a link sits comes from `data-track-location` on the link or any ancestor: the header, the
 * footer, the WhatsApp bubble, the quote popup and the results after a submission are marked; the
 * contact page counts as "contact" and anything else as "page".
 *
 * `track` sends nothing without consent, so installing this early is harmless; the analytics
 * component installs it only once the visitor has allowed analytics all the same.
 */

import { describeLinkClick } from "@/lib/events";
import { track } from "@/lib/gtag";

export const TRACK_LOCATION_ATTR = "data-track-location";

function onLinkActivated(event: MouseEvent): void {
  // A middle click opens the link in a new tab without a `click` event.
  if (event.type === "auxclick" && event.button !== 1) return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  const anchor = target.closest("a[href]");
  if (!anchor) return;
  const call = describeLinkClick({
    href: anchor.getAttribute("href") ?? "",
    marked: anchor.closest(`[${TRACK_LOCATION_ATTR}]`)?.getAttribute(TRACK_LOCATION_ATTR),
    pathname: window.location.pathname,
    switchTo: anchor.closest("[data-language-switch]") ? anchor.getAttribute("lang") : null,
  });
  if (call) track(call.name, call.params);
}

/** Start counting link clicks. Returns the function that stops it. */
export function installClickTracking(): () => void {
  if (typeof document === "undefined") return () => {};
  document.addEventListener("click", onLinkActivated, true);
  document.addEventListener("auxclick", onLinkActivated, true);
  return () => {
    document.removeEventListener("click", onLinkActivated, true);
    document.removeEventListener("auxclick", onLinkActivated, true);
  };
}
