// GENERATED FILE — do not edit. Written by scripts/build-kn-content.ts from
// docs/kannada/translations/kn-*.json. Regenerate with `npm run build:kn`.
//
// Header, footer and mobile-sheet navigation. `solutions` is nav[2], so it is not overlaid twice.
//
// Every key here is checked against the English module at compile time: a string the English
// side has and this file does not is a type error, and so is a key that no longer exists.
// Locale-neutral fields (href, id, slug, src, icon, status, source, numbers) are absent by
// construction — see FIXED_KEYS in src/i18n/translation.ts.

import { nav as english } from "@/content/site";
import type { Translation } from "@/i18n/translation";

export const nav = [
  {
    label: "ಮುಖಪುಟ",
  },
  {
    label: "ನಮ್ಮ ಬಗ್ಗೆ",
  },
  {
    label: "ಸೇವೆಗಳು",
    items: [
      {
        label: "ಮನೆಗಳು",
        description: "ಸ್ವತಂತ್ರ ಮನೆಗಳು ಮತ್ತು ವಿಲ್ಲಾಗಳು",
      },
      {
        label: "ಅಪಾರ್ಟ್\u200cಮೆಂಟ್\u200cಗಳು",
        description: "ಅಪಾರ್ಟ್\u200cಮೆಂಟ್ ಮತ್ತು ಗೇಟೆಡ್ ಕಮ್ಯುನಿಟಿಗಳು",
      },
      {
        label: "ವ್ಯಾಪಾರ ಮತ್ತು ಉದ್ಯಮ",
        description: "ಅಂಗಡಿ, ಕಚೇರಿ, ಕಾರ್ಖಾನೆ ಮತ್ತು ಗೋದಾಮು",
      },
    ],
  },
  {
    label: "ಕ್ಯಾಲ್ಕುಲೇಟರ್",
  },
  {
    label: "ಸಂಪರ್ಕಿಸಿ",
  },
] satisfies Translation<typeof english>;
