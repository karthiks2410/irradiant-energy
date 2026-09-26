// GENERATED FILE — do not edit. Written by scripts/build-kn-content.ts from
// docs/kannada/translations/kn-*.json. Regenerate with `npm run build:kn`.
//
// The frame the three legal notices share: eyebrow, version line and the closing contact block.
//
// Every key here is checked against the English module at compile time: a string the English
// side has and this file does not is a type error, and so is a key that no longer exists.
// Locale-neutral fields (href, id, slug, src, icon, status, source, numbers) are absent by
// construction — see FIXED_KEYS in src/i18n/translation.ts.

import { legalShell as english } from "@/content/legal/shell";
import type { Translation } from "@/i18n/translation";

export const legalShell = {
  eyebrow: "ಕಾನೂನು ಮಾಹಿತಿ",
  versionLine: {
    approved: "ಆವೃತ್ತಿ {version} · ಜಾರಿ ದಿನಾಂಕ {date}",
    draft: "ಕರಡು ಆವೃತ್ತಿ · ಜಾರಿ ದಿನಾಂಕ ಇನ್ನೂ ದೃಢಪಡಬೇಕಿದೆ",
  },
  questions: {
    heading: "ಈ ಪುಟದ ಬಗ್ಗೆ ಪ್ರಶ್ನೆಗಳು",
    body: "{email} ವಿಳಾಸಕ್ಕೆ ಬರೆಯಿರಿ ಅಥವಾ {phone} ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡಿ. ಗೌಪ್ಯತೆಗೆ ಸಂಬಂಧಿಸಿದ ವಿನಂತಿ ಅಥವಾ ದೂರು ಇದ್ದರೆ, ನಮ್ಮ ಸಂಪರ್ಕ ಪುಟದಲ್ಲಿರುವ <grievanceLink>ಕುಂದುಕೊರತೆ ಮತ್ತು ಗೌಪ್ಯತೆ ವಿಚಾರಕ್ಕೆ ಸಂಪರ್ಕ ವ್ಯಕ್ತಿಯ</grievanceLink> ವಿವರಗಳನ್ನು ಬಳಸಿ.",
  },
} satisfies Translation<typeof english>;
