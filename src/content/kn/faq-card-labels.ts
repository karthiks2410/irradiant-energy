// GENERATED FILE — do not edit. Written by scripts/build-kn-content.ts from
// docs/kannada/translations/kn-*.json. Regenerate with `npm run build:kn`.
//
// The two buttons on the "Still have questions?" card, also used by the home page's closing band.
//
// Every key here is checked against the English module at compile time: a string the English
// side has and this file does not is a type error, and so is a key that no longer exists.
// Locale-neutral fields (href, id, slug, src, icon, status, source, numbers) are absent by
// construction — see FIXED_KEYS in src/i18n/translation.ts.

import { faqCardLabels as english } from "@/content/solutions/shared";
import type { Translation } from "@/i18n/translation";

export const faqCardLabels = {
  whatsappLabel: "WhatsApp ಮೂಲಕ ಚಾಟ್ ಮಾಡಿ",
  callLabel: "ನಮಗೆ ಕರೆ ಮಾಡಿ",
} satisfies Translation<typeof english>;
