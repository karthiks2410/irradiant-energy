// GENERATED FILE — do not edit. Written by scripts/build-kn-content.ts from
// docs/kannada/translations/kn-*.json. Regenerate with `npm run build:kn`.
//
// The site-wide CTA, quoted by the header, the footer and three home bands.
//
// Every key here is checked against the English module at compile time: a string the English
// side has and this file does not is a type error, and so is a key that no longer exists.
// Locale-neutral fields (href, id, slug, src, icon, status, source, numbers) are absent by
// construction — see FIXED_KEYS in src/i18n/translation.ts.

import { primaryCta as english } from "@/content/site";
import type { Translation } from "@/i18n/translation";

export const primaryCta = {
  label: "ಉಚಿತ ಅಂದಾಜು ಪಡೆಯಿರಿ",
} satisfies Translation<typeof english>;
