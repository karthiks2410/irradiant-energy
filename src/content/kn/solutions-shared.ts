// GENERATED FILE — do not edit. Written by scripts/build-kn-content.ts from
// docs/kannada/translations/kn-*.json. Regenerate with `npm run build:kn`.
//
// The /solutions hub plus the frames and the bare nouns the three audience pages share.
//
// Every key here is checked against the English module at compile time: a string the English
// side has and this file does not is a type error, and so is a key that no longer exists.
// Locale-neutral fields (href, id, slug, src, icon, status, source, numbers) are absent by
// construction — see FIXED_KEYS in src/i18n/translation.ts.

import { solutionsShared as english } from "@/content/solutions/shared";
import type { Translation } from "@/i18n/translation";

export const solutionsShared = {
  hub: {
    meta: {
      title: "ಕರ್ನಾಟಕದಾದ್ಯಂತ ಸೋಲಾರ್ ಸೇವೆಗಳು",
      description: "ಕರ್ನಾಟಕದಾದ್ಯಂತ ಮನೆ, ಅಪಾರ್ಟ್\u200cಮೆಂಟ್ ಮತ್ತು ವ್ಯಾಪಾರ ಕಟ್ಟಡಗಳ ಚಾವಣಿ ಮೇಲೆ ಸೋಲಾರ್. ಕೆಲಸ ಹೇಗೆ ನಡೆಯುತ್ತದೆ, ಯಾವ ವ್ಯವಸ್ಥೆ ಸೂಕ್ತ ಎಂದು ನೋಡಲು ನಿಮ್ಮ ಕಟ್ಟಡದ ಬಗೆ ಆಯ್ಕೆ ಮಾಡಿ.",
    },
    breadcrumb: "ಸೇವೆಗಳು",
    sectionLabel: "ಗ್ರಾಹಕರ ವರ್ಗದ ಪ್ರಕಾರ ಸೋಲಾರ್ ಸೇವೆಗಳು",
    cardCta: "ನಿಮ್ಮ {noun} ಸೋಲಾರ್ ಆಯ್ಕೆಗಳನ್ನು ನೋಡಿ",
  },
  segmentNoun: {
    home: "ಮನೆಗೆ",
    "housing-society": "ಅಪಾರ್ಟ್\u200cಮೆಂಟ್\u200cಗೆ",
    commercial: "ವ್ಯಾಪಾರಕ್ಕೆ",
  },
  heroSecondaryLabel: "ನಿಮಗೆ ಯಾವ ವ್ಯವಸ್ಥೆ ಸೂಕ್ತ ಎಂದು ನೋಡಿ",
  systemTypes: {
    copy: {
      eyebrow: "ನಿಮಗೆ ತಕ್ಕ ಆಯ್ಕೆ",
      title: "ನಿಮ್ಮ {noun} ಯಾವ ಸೋಲಾರ್ ವ್ಯವಸ್ಥೆ ಸೂಕ್ತ?",
      lead: "ಯಾವುದು ಸರಿ ಎಂದು ಗೊತ್ತಾಗುತ್ತಿಲ್ಲವೇ? ಕರೆಯಲ್ಲೇ ಸರಿಯಾದ ಆಯ್ಕೆ ಮಾಡಲು ನಮ್ಮ ತಂಡ ನಿಮಗೆ ನೆರವಾಗುತ್ತದೆ.",
    },
    items: [
      {
        label: "ಆನ್-ಗ್ರಿಡ್",
        plainName: "ಗ್ರಿಡ್ ಸಂಪರ್ಕದಲ್ಲೇ ಇರಿ, ಹೆಚ್ಚುವರಿ ವಿದ್ಯುತ್ ಮಾರಿ",
        description: "Connected to utility grid, export excess power",
        plainDescription: "ನಿಮ್ಮ ಚಾವಣಿಯ ವಿದ್ಯುತ್ ಮನೆಗೆ ಬಳಕೆಯಾಗುತ್ತದೆ; ಹೆಚ್ಚುವರಿ ವಿದ್ಯುತ್ ಗ್ರಿಡ್\u200cಗೆ ಹೋಗಿ ಬಿಲ್\u200cನಲ್ಲಿ ಜಮಾ ಆಗುತ್ತದೆ. ಸ್ಥಿರ ವಿದ್ಯುತ್ ಪೂರೈಕೆ ಇರುವ ಮನೆಗಳಿಗೆ ಹೆಚ್ಚು ಜನಪ್ರಿಯ.",
      },
      {
        label: "ಆಫ್-ಗ್ರಿಡ್",
        plainName: "ಬ್ಯಾಟರಿಯೊಂದಿಗೆ ಸಂಪೂರ್ಣ ಸ್ವತಂತ್ರರಾಗಿ",
        description: "Independent system with battery backup",
        plainDescription: "ನಿಮ್ಮ ಚಾವಣಿ ಮತ್ತು ಬ್ಯಾಟರಿ ಪ್ಯಾಕ್. ಕರೆಂಟ್ ಹೋದಾಗಲೂ ಗ್ರಿಡ್ ಮೇಲೆ ಅವಲಂಬನೆ ಇಲ್ಲವೇ ಇಲ್ಲ. ವಿದ್ಯುತ್ ಸರಿಯಾಗಿ ಬರದ ಅಥವಾ ದೂರದ ಜಾಗಗಳಿಗೆ ಸೂಕ್ತ.",
      },
      {
        label: "ಹೈಬ್ರಿಡ್",
        plainName: "ಎರಡರ ಅನುಕೂಲವೂ ಒಟ್ಟಿಗೆ — ವಿದ್ಯುತ್ ಮತ್ತು ಬ್ಯಾಕಪ್",
        description: "Best of both - grid + battery storage",
        plainDescription: "ಹಗಲಿನಲ್ಲಿ ಸೋಲಾರ್ ವಿದ್ಯುತ್ ಬಳಸಿ, ಹೆಚ್ಚುವರಿಯನ್ನು ಬ್ಯಾಟರಿಯಲ್ಲಿ ಸಂಗ್ರಹಿಸಿ, ಅಗತ್ಯವಿದ್ದಾಗ ಮಾತ್ರ ಗ್ರಿಡ್\u200cನಿಂದ ವಿದ್ಯುತ್ ಬಳಸಿ. ಇದು ಅತ್ಯಂತ ವಿಶ್ವಾಸಾರ್ಹ ಆಯ್ಕೆ.",
      },
    ],
  },
  closingCta: {
    title: "ನಿಮಗೆ ಎಷ್ಟು ಉಳಿತಾಯವಾಗಬಹುದು, ನೋಡೋಣವೇ?",
    accent: "ಎಷ್ಟು ಉಳಿತಾಯವಾಗಬಹುದು",
    lead: "ಉಚಿತ ಸ್ಥಳ ಭೇಟಿ. ಉಚಿತ ಕೊಟೇಷನ್. ಯಾವುದೇ ಒತ್ತಾಯವಿಲ್ಲ.",
  },
  whatsappPrompts: {
    home: {
      text: "ನಮಸ್ಕಾರ! ಮನೆಯ ಸೋಲಾರ್ ಬಗ್ಗೆ ನನಗೊಂದು ಪ್ರಶ್ನೆ ಇದೆ — ಸಹಾಯ ಮಾಡುತ್ತೀರಾ?",
    },
    "housing-society": {
      text: "ನಮಸ್ಕಾರ! ನಮ್ಮ ಸಂಘ ಚಾವಣಿ ಮೇಲೆ ಸೋಲಾರ್ ಹಾಕಿಸುವ ಬಗ್ಗೆ ಯೋಚಿಸುತ್ತಿದೆ — ವಾರ್ಷಿಕ ಮಹಾಸಭೆಯಲ್ಲಿ ಮಂಡಿಸಬಹುದಾದ ಪ್ರಸ್ತಾವನೆ ಕಳುಹಿಸಿಕೊಡುತ್ತೀರಾ?",
    },
    commercial: {
      text: "ನಮಸ್ಕಾರ! ನಮ್ಮ ವ್ಯಾಪಾರ ಸಂಸ್ಥೆ ಚಾವಣಿ ಮೇಲೆ ಸೋಲಾರ್ ಹಾಕಿಸುವ ಬಗ್ಗೆ ಯೋಚಿಸುತ್ತಿದೆ — ನಮ್ಮ ಕಟ್ಟಡಕ್ಕೆ CAPEX ಮತ್ತು OPEX ಹೋಲಿಕೆ ಕಳುಹಿಸಿಕೊಡುತ್ತೀರಾ?",
    },
  },
} satisfies Translation<typeof english>;
