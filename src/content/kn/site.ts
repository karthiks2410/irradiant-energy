// GENERATED FILE — do not edit. Written by scripts/build-kn-content.ts from
// docs/kannada/translations/kn-*.json. Regenerate with `npm run build:kn`.
//
// Business facts stay English-owned; only the tagline and the site description are copy.
//
// Every key here is checked against the English module at compile time: a string the English
// side has and this file does not is a type error, and so is a key that no longer exists.
// Locale-neutral fields (href, id, slug, src, icon, status, source, numbers) are absent by
// construction — see FIXED_KEYS in src/i18n/translation.ts.

import { site as english } from "@/content/site";
import type { FixedKey, Translation } from "@/i18n/translation";

export const site = {
  tagline: "Energy Made Intelligent",
  description: "ಕರ್ನಾಟಕದಾದ್ಯಂತ ಮನೆ, ಅಪಾರ್ಟ್\u200cಮೆಂಟ್ ಮತ್ತು ವ್ಯಾಪಾರ ಕಟ್ಟಡಗಳ ಚಾವಣಿ ಮೇಲೆ ಸೋಲಾರ್ — ವಿನ್ಯಾಸ, ಅಳವಡಿಕೆ ಮತ್ತು ಬೆಂಬಲ.",
} satisfies Translation<typeof english, FixedKey | "contact" | "legal" | "social" | "legacyName">;
