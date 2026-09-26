// GENERATED FILE — do not edit. Written by scripts/build-kn-content.ts from
// docs/kannada/translations/kn-*.json. Regenerate with `npm run build:kn`.
//
// The calculator and /get-quote: controls, tiles, assumptions, the lead form and the customer email.
//
// Every key here is checked against the English module at compile time: a string the English
// side has and this file does not is a type error, and so is a key that no longer exists.
// Locale-neutral fields (href, id, slug, src, icon, status, source, numbers) are absent by
// construction — see FIXED_KEYS in src/i18n/translation.ts.

import { quotePage as english } from "@/content/quote";
import type { Translation } from "@/i18n/translation";

export const quotePage = {
  meta: {
    title: "ಸೋಲಾರ್ ಅಂದಾಜು ಕ್ಯಾಲ್ಕುಲೇಟರ್",
    description: "ಮನೆ, ಅಪಾರ್ಟ್\u200cಮೆಂಟ್ ಅಥವಾ ವ್ಯಾಪಾರಕ್ಕೆ ಚಾವಣಿ ಮೇಲಿನ ಸೋಲಾರ್ ಸಾಮರ್ಥ್ಯ ಲೆಕ್ಕ ಹಾಕಿ; ಅಂದಾಜು ವೆಚ್ಚ, ಉಳಿತಾಯ, ಹಣ ವಾಪಸ್ ಬರುವ ಅವಧಿ ನೋಡಿ; ನಂತರ ನಮ್ಮನ್ನು ಪ್ರಪೋಸಲ್ ಕೇಳಿ.",
  },
  breadcrumb: {
    navLabel: "ಪುಟದ ಹಾದಿ",
    home: "ಮುಖಪುಟ",
    current: "ಕ್ಯಾಲ್ಕುಲೇಟರ್",
  },
  hero: {
    eyebrow: "ಸೋಲಾರ್ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
    title: "ನಿಮ್ಮ ಮನೆ ಅಥವಾ ಕಟ್ಟಡಕ್ಕೆ ಸರಿಯಾದ ಸೋಲಾರ್ ವ್ಯವಸ್ಥೆಯ ಅಂದಾಜು ಪಡೆಯಿರಿ.",
    lead: "ನೀವು ಮುಂದುವರಿದಂತೆ ಅಂಕಿಅಂಶಗಳು ಬದಲಾಗುತ್ತವೆ.",
  },
  step1: {
    eyebrow: "ಹಂತ 1",
    heading: "ನಿಮ್ಮ ಕಟ್ಟಡ ಮತ್ತು ವಿದ್ಯುತ್ ಬಳಕೆ",
  },
  step2: {
    eyebrow: "ಹಂತ 2",
    title: "ನಿಮ್ಮ <accent>ಪ್ರಪೋಸಲ್</accent> ಪಡೆಯಿರಿ.",
    lead: "ನಿಮ್ಮ ವಿವರಗಳ ಜೊತೆಗೆ ಅಂದಾಜೂ ನಮಗೆ ಬರುತ್ತದೆ.",
  },
  aside: {
    heading: "ಮಾತನಾಡಬೇಕೇ?",
    whatsapp: "ನಮಗೆ WhatsApp ಮಾಡಿ",
  },
  controls: {
    segmentLegend: "ಎಲ್ಲಿ ಸೋಲಾರ್ ಹಾಕಿಸುತ್ತಿದ್ದೀರಿ?",
    billLabel: "ನಿಮ್ಮ ತಿಂಗಳ ವಿದ್ಯುತ್ ಬಿಲ್",
    billHint: "ಸೋಲಾರ್ ಅಳವಡಿಸುವ ಮೊದಲಿನ ಒಂದು ಸಾಮಾನ್ಯ ತಿಂಗಳು.",
    pincodeLabel: "ಪಿನ್ ಕೋಡ್",
    pincodeHint: "ನಿಮಗೆ ಯಾವ ವಿದ್ಯುತ್ ಕಂಪನಿ ಪೂರೈಸುತ್ತದೆ ಎಂದು ಖಚಿತವಾಗುತ್ತದೆ.",
    pincodeError: "6 ಅಂಕಿಯ ಪಿನ್ ಕೋಡ್ ನಮೂದಿಸಿ, ಉದಾಹರಣೆಗೆ 560001.",
    loadLabel: "ಮಂಜೂರಾದ ಲೋಡ್ (kW)",
  },
  segments: {
    home: "ಮನೆ ಅಥವಾ ವಿಲ್ಲಾ",
    "housing-society": "ಅಪಾರ್ಟ್\u200cಮೆಂಟ್ ಮತ್ತು ಗೇಟೆಡ್ ಕಮ್ಯುನಿಟಿಗಳು",
    commercial: "ಅಂಗಡಿ, ಕಚೇರಿ, ಕಾರ್ಖಾನೆ ಮತ್ತು ಗೋದಾಮು",
  },
  results: {
    heading: "ನಿಮ್ಮ ಅಂದಾಜು",
    recommendedLabel: "ಸೂಕ್ತ ಸೋಲಾರ್ ವ್ಯವಸ್ಥೆ",
    roofNeeded: "ಸುಮಾರು {sqft} ಚದರ ಅಡಿ ಚಾವಣಿ ಜಾಗ",
    monthlySavingsLabel: "ತಿಂಗಳ ಉಳಿತಾಯ",
    paybackLabel: "ಹಣ ವಾಪಸ್ ಬರುವ ಅವಧಿ",
    subsidyLabel: "ಪಿಎಂ ಸೂರ್ಯ ಘರ್ ಸಬ್ಸಿಡಿ",
    subsidyNote: "ಗರಿಷ್ಠ ಮಿತಿ",
    indicativeCostLabel: "ಅಂದಾಜು ವೆಚ್ಚ",
    assumptionsLabel: "ಲೆಕ್ಕದ ಆಧಾರಗಳು",
    disclaimer: "ಇದು ಮೇಲಿನ ಲೆಕ್ಕದ ಆಧಾರಗಳನ್ನು ಇಟ್ಟುಕೊಂಡು ಮಾಡಿದ ಅಂದಾಜು; ಕೊಟೇಷನ್ ಅಲ್ಲ, ಖಾತರಿಯೂ ಅಲ್ಲ.",
  },
  summary: {
    waitingHeading: "ನಿಮ್ಮ ಅಂದಾಜು",
    waitingNote: "ಅಂದಾಜು ನೋಡಲು ತಿಂಗಳ ಬಿಲ್ ನಮೂದಿಸಿ",
    kwp: "{kwp} kWp",
    perYear: "ವರ್ಷಕ್ಕೆ {amount} (ಅಂದಾಜು)",
    cta: "ಪ್ರಪೋಸಲ್ ಪಡೆಯಿರಿ",
  },
  format: {
    compactLakh: "₹{amount} ಲಕ್ಷ",
    compactCrore: "₹{amount} ಕೋಟಿ",
  },
  assumptions: {
    tariffSlabs: {
      label: "ವಿದ್ಯುತ್ ದರ",
      value: "ಬೆಸ್ಕಾಂ ಗೃಹ ಬಳಕೆ (LT-2(a)) ವಿದ್ಯುತ್ ಬಳಕೆ ಶುಲ್ಕ ಮಾತ್ರ (ನಿಮ್ಮ ಬಳಕೆಗೆ ಪ್ರತಿ ಯೂನಿಟ್\u200cಗೆ ಸರಾಸರಿ ₹{rate})",
    },
    tariffFlat: {
      label: "ವಿದ್ಯುತ್ ದರ",
      value: "ಪ್ರತಿ ಯೂನಿಟ್\u200cಗೆ ₹{rate} (ಒಂದೇ ಸರಾಸರಿ ದರ)",
    },
    tariffEntered: {
      label: "ವಿದ್ಯುತ್ ದರ",
      value: "₹{rate} per unit",
    },
    offset: {
      label: "ಸೋಲಾರ್ ಪೂರೈಸುವ ಪಾಲು",
      value: "ನಿಮ್ಮ ತಿಂಗಳ ಯೂನಿಟ್\u200cಗಳಲ್ಲಿ ಗರಿಷ್ಠ {offsetPct}%; ನಿಗದಿತ ಶುಲ್ಕ ಮತ್ತು ತೆರಿಗೆಗಳನ್ನು ಪಾವತಿಸಬೇಕಾಗುತ್ತದೆ",
    },
    exportCredit: {
      label: "ಗ್ರಿಡ್\u200cಗೆ ಕಳುಹಿಸಿದ ವಿದ್ಯುತ್\u200cಗೆ ಜಮೆ",
      value: "ಹೆಚ್ಚುವರಿ ಯೂನಿಟ್\u200cಗಳಿಗೆ ಜಮೆಯನ್ನು ಈ ಲೆಕ್ಕದಲ್ಲಿ ಸೇರಿಸಿಲ್ಲ",
    },
    generation: {
      label: "ಉತ್ಪಾದನೆ",
      value: "ವರ್ಷಕ್ಕೆ ಪ್ರತಿ kWp ಸಾಮರ್ಥ್ಯಕ್ಕೆ {yield} kWh",
    },
    installedCost: {
      label: "ಅಳವಡಿಕೆ ಸೇರಿದ ವೆಚ್ಚ",
      value: "ಸಬ್ಸಿಡಿಗೆ ಮೊದಲು, ಪ್ರತಿ kWp ಸಾಮರ್ಥ್ಯಕ್ಕೆ ₹{costPerKwp}",
    },
    subsidyHome: {
      label: "ಪಿಎಂ ಸೂರ್ಯ ಘರ್ ಸಬ್ಸಿಡಿ",
      value: "ಅರ್ಹ ಗೃಹ ಬಳಕೆ ವಿದ್ಯುತ್ ಸಂಪರ್ಕಗಳಿಗೆ: ಮೊದಲ {firstKw} kW ಸಾಮರ್ಥ್ಯದ ಪ್ರತಿ ಕಿಲೋವ್ಯಾಟ್\u200cಗೆ ₹{firstRate}, ಮುಂದಿನ {secondKw} kW ಸಾಮರ್ಥ್ಯದ ಪ್ರತಿ ಕಿಲೋವ್ಯಾಟ್\u200cಗೆ ₹{secondRate}, ಗರಿಷ್ಠ ₹{cap}ರವರೆಗೆ; ಸಬ್ಸಿಡಿಯನ್ನು ಸರ್ಕಾರ ನಿರ್ಧರಿಸಿ ಎಸ್ಕಾಂ ತಪಾಸಣೆಯ ನಂತರ ಪಾವತಿಸುತ್ತದೆ; ಯೋಜನೆಯ ಅವಧಿ {schemeEnd}ರವರೆಗೆ",
    },
    subsidySociety: {
      label: "ಪಿಎಂ ಸೂರ್ಯ ಘರ್ ಸಬ್ಸಿಡಿ",
      value: "ಸಾಮಾನ್ಯ ಬಳಕೆಯ ಸೌಲಭ್ಯಗಳಿಗೆ ಪ್ರತಿ ಕಿಲೋವ್ಯಾಟ್\u200cಗೆ ₹{ratePerKw}, ಪ್ರತಿ ಮನೆಗೆ ಗರಿಷ್ಠ {kwPerHouse} kW ಮತ್ತು ಒಟ್ಟು ಗರಿಷ್ಠ {maxKw} kW; ಸಬ್ಸಿಡಿಯನ್ನು ಸರ್ಕಾರ ನಿರ್ಧರಿಸಿ ಎಸ್ಕಾಂ ತಪಾಸಣೆಯ ನಂತರ ಪಾವತಿಸುತ್ತದೆ; ಯೋಜನೆಯ ಅವಧಿ {schemeEnd}ರವರೆಗೆ",
    },
    subsidyCommercial: {
      label: "ಪಿಎಂ ಸೂರ್ಯ ಘರ್ ಸಬ್ಸಿಡಿ",
      value: "ವಾಣಿಜ್ಯ ವಿದ್ಯುತ್ ಸಂಪರ್ಕಗಳಿಗೆ ಅನ್ವಯಿಸುವುದಿಲ್ಲ",
    },
    roofArea: {
      label: "ಚಾವಣಿ ವಿಸ್ತೀರ್ಣ",
      value: "ಪ್ರತಿ kWp ಸಾಮರ್ಥ್ಯಕ್ಕೆ {sqftPerKwp} ಚದರ ಅಡಿ",
    },
    projection: {
      label: "ಮುಂದಿನ ವರ್ಷಗಳ ಅಂದಾಜು",
      value: "{years} ವರ್ಷ, ವರ್ಷಕ್ಕೆ {tariffPct}% ದರ ಏರಿಕೆ ಮತ್ತು {degradationPct}% ಪ್ಯಾನೆಲ್ ಉತ್ಪಾದನೆ ಇಳಿಕೆ",
    },
  },
  citations: {
    bescomSlabs: "ಅಂದಾಜಿನ ಲೆಕ್ಕ; ನಿಮಗೆ ಅನ್ವಯಿಸುವ ದರವನ್ನು ಸ್ಥಳ ಭೇಟಿಯಲ್ಲಿ ನಿಮ್ಮ ಬಿಲ್\u200cನಲ್ಲಿ ನೋಡಿ ತೆಗೆದುಕೊಳ್ಳುತ್ತೇವೆ",
    nonDomesticTariff: "ಅಂದಾಜಿನ ಲೆಕ್ಕ; ನಿಮಗೆ ಅನ್ವಯಿಸುವ ದರ ನಿಮ್ಮ ಬೆಸ್ಕಾಂ ದರ ವರ್ಗ ಮತ್ತು ಬಿಲ್ ಮೇಲೆ ಅವಲಂಬಿಸಿರುತ್ತದೆ",
    enteredTariff: "Average tariff entered by you",
    offsetCap: "ನಮ್ಮ ಲೆಕ್ಕದ ಆಧಾರ",
    exportCredit: "ನೀವು ಗ್ರಿಡ್\u200cಗೆ ಕಳುಹಿಸಿದ ಹೆಚ್ಚುವರಿ ವಿದ್ಯುತ್\u200cಗೆ ನಿಮ್ಮ ಮೀಟರಿಂಗ್ ವ್ಯವಸ್ಥೆಯಂತೆ ಬೆಸ್ಕಾಂ ಲೆಕ್ಕ ಹೊಂದಾಣಿಕೆ ಮಾಡುತ್ತದೆ",
    specificYield: "ಕರ್ನಾಟಕಕ್ಕೆ ಬಳಸುವ ಸಾಮಾನ್ಯ ಅಂದಾಜು; ನಿಮ್ಮ ಚಾವಣಿಗೆ ತಕ್ಕ ಲೆಕ್ಕವನ್ನು ಸ್ಥಳ ಭೇಟಿಯಲ್ಲಿ ಮಾಡುತ್ತೇವೆ",
    installCost: "ಅಂದಾಜಿನ ಸಾಮಾನ್ಯ ದರ; ನಿಮ್ಮ ಬೆಲೆ ಸ್ಥಳ ಪರಿಶೀಲನೆ ಮತ್ತು ಲಿಖಿತ ಪ್ರಸ್ತಾವನೆಯಿಂದ ನಿರ್ಧಾರವಾಗುತ್ತದೆ",
    subsidy: "ಎಂಎನ್ಆರ್ಇ, Operational Guidelines for the CFA component of PM Surya Ghar: Muft Bijli Yojana, 2024ರ ಜುಲೈ 2ರ ಸೂಚನೆ, §4(h)",
    roofSqft: "ಅಂದಾಜಿನ ಲೆಕ್ಕ; ಬಳಸಬಹುದಾದ ವಿಸ್ತೀರ್ಣವನ್ನು ಸ್ಥಳ ಭೇಟಿಯಲ್ಲಿ ಅಳೆಯುತ್ತೇವೆ",
    tariffInflation: "ನಮ್ಮ ಲೆಕ್ಕದ ಆಧಾರ; ಮುಂದಿನ ವಿದ್ಯುತ್ ದರಗಳನ್ನು ಕೆಇಆರ್\u200cಸಿ ನಿಗದಿ ಮಾಡುತ್ತದೆ, ಅವುಗಳ ಬಗ್ಗೆ ಖಾತರಿ ನೀಡಲು ಸಾಧ್ಯವಿಲ್ಲ",
  },
  form: {
    labels: {
      yourName: "ನಿಮ್ಮ ಹೆಸರು",
      phone: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
      phoneHint: "10 ಅಂಕಿಯ ಭಾರತೀಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ.",
      email: "ಇಮೇಲ್ ವಿಳಾಸ",
      message: "ನಮಗೆ ತಿಳಿಸಬೇಕಾದ್ದು ಏನಾದರೂ ಇದೆಯೇ?",
      consent: "ನನ್ನ ವಿಚಾರಣೆಯ ಕುರಿತು ನನ್ನನ್ನು ಸಂಪರ್ಕಿಸಲು ನಾನು ಒಪ್ಪುತ್ತೇನೆ ಮತ್ತು <privacy>ಗೌಪ್ಯತಾ ಸೂಚನೆಯನ್ನು</privacy> ಓದಿದ್ದೇನೆ.",
      whatsappOptIn: "ಈ ವಿಚಾರಣೆಯ ಬಗ್ಗೆ ನೀವು WhatsApp ಮೂಲಕವೂ ನನ್ನನ್ನು ಸಂಪರ್ಕಿಸಬಹುದು.",
    },
    submit: "ವಿನಂತಿ ಕಳುಹಿಸಿ",
    submitPending: "ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ…",
    srSending: "ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ",
    sendingOff: "ನಮ್ಮ ಇಮೇಲ್ ಡೊಮೇನ್ ಪರಿಶೀಲನೆ ಆಗುವವರೆಗೆ ಇಲ್ಲಿಂದ ಕಳುಹಿಸುವುದನ್ನು ನಿಲ್ಲಿಸಲಾಗಿದೆ. ಮೇಲಿನ ಅಂಕಿಅಂಶಗಳು ಈಗಲೂ ಲಭ್ಯವಿವೆ; ಅವುಗಳನ್ನು WhatsApp ಅಥವಾ ಕೆಳಗಿನ ಫೋನ್ ಸಂಖ್ಯೆಯ ಮೂಲಕ ನಮಗೆ ತಿಳಿಸಿ.",
    successHeading: "ಧನ್ಯವಾದಗಳು — ನಿಮ್ಮ ವಿನಂತಿ ನಮಗೆ ತಲುಪಿದೆ.",
    successReference: "ನಿಮ್ಮ ರೆಫರೆನ್ಸ್ ಸಂಖ್ಯೆ <ref>{reference}</ref>. ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುವಾಗ ಇದನ್ನು ತಿಳಿಸಿ.",
    errorReference: "ನಿಮ್ಮ ರೆಫರೆನ್ಸ್ ಸಂಖ್ಯೆ <ref>{reference}</ref>. ಇದನ್ನು ತಿಳಿಸಿದರೆ ನಿಮ್ಮ ವಿವರಗಳಿಂದಲೇ ನಾವು ಮುಂದುವರಿಯಬಹುದು.",
    fallback: "ಮಾತನಾಡಬೇಕೇ? <whatsapp>ನಮಗೆ WhatsApp ಮಾಡಿ</whatsapp> ಅಥವಾ <tel>{phone}</tel> ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡಿ.",
    errorSummary: {
      yourName: "ನಿಮ್ಮ ಹೆಸರು",
      phone: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
      email: "ಇಮೇಲ್ ವಿಳಾಸ",
      message: "ನಿಮ್ಮ ಸಂದೇಶ",
      consent: "ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಲು ಅನುಮತಿ",
      whatsappOptIn: "WhatsApp ಅಪ್\u200cಡೇಟ್\u200cಗಳು",
      segment: "ನೀವು ಸೋಲಾರ್ ಹಾಕಿಸುವ ಕಟ್ಟಡ",
      pincode: "ಪಿನ್ ಕೋಡ್",
      monthlyBill: "ತಿಂಗಳ ವಿದ್ಯುತ್ ಬಿಲ್",
    },
    fieldErrors: {
      "name.required": "ನಿಮ್ಮ ಹೆಸರು ನಮೂದಿಸಿ",
      "name.tooLong": "ನಿಮ್ಮ ಹೆಸರು {max} ಅಕ್ಷರಗಳನ್ನು ಮೀರದಿರಲಿ",
      "name.lettersOnly": "ಅಕ್ಷರಗಳನ್ನು ಮಾತ್ರ ಬಳಸಿ",
      "phone.required": "ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ",
      "phone.invalid": "10 ಅಂಕಿಯ ಭಾರತೀಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ",
      "email.required": "ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸ ನಮೂದಿಸಿ",
      "email.tooLong": "ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸ {max} ಅಕ್ಷರಗಳನ್ನು ಮೀರದಿರಲಿ",
      "email.invalid": "ಸರಿಯಾದ ಇಮೇಲ್ ವಿಳಾಸ ನಮೂದಿಸಿ",
      "segment.invalid": "ಕಟ್ಟಡದ ಬಗೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ",
      "pincode.invalid": "6 ಅಂಕಿಯ ಪಿನ್ ಕೋಡ್ ನಮೂದಿಸಿ",
      "monthlyBill.notNumber": "ನಿಮ್ಮ ತಿಂಗಳ ಬಿಲ್ ಮೊತ್ತವನ್ನು ಸಂಖ್ಯೆಯಲ್ಲಿ ನಮೂದಿಸಿ",
      "monthlyBill.tooLarge": "ಈ ಬಿಲ್ ಮೊತ್ತ ತುಂಬಾ ಹೆಚ್ಚು ಕಾಣುತ್ತಿದೆ",
      "message.tooLong": "ನಿಮ್ಮ ಸಂದೇಶ {max} ಅಕ್ಷರಗಳನ್ನು ಮೀರದಿರಲಿ",
      "consent.required": "ಈ ವಿಚಾರಣೆಯ ಕುರಿತು ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಲು ದಯವಿಟ್ಟು ಒಪ್ಪಿಗೆ ನೀಡಿ",
      "billBucket.required": "ನಿಮ್ಮ ತಿಂಗಳ ಬಿಲ್ ಆಯ್ಕೆ ಮಾಡಿ",
    },
    formErrors: {
      send: "ಈಗ ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಕಳುಹಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಬದಲಿಗೆ WhatsApp ಮಾಡಿ ಅಥವಾ ನಮಗೆ ಕರೆ ಮಾಡಿ.",
      rateLimited: "ನಿಮ್ಮ ಕಡೆಯಿಂದ ನಮಗೆ ಹಲವು ವಿನಂತಿಗಳು ಬಂದಿವೆ. ದಯವಿಟ್ಟು ಬದಲಿಗೆ WhatsApp ಮಾಡಿ ಅಥವಾ ನಮಗೆ ಕರೆ ಮಾಡಿ.",
      tooFast: "ಇದು ಸ್ವಲ್ಪ ಬೇಗವೇ ಆಯಿತು. ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಕಳುಹಿಸಿ.",
      invalid: "ದಯವಿಟ್ಟು ಗುರುತಿಸಿರುವ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
      stale: "ಈ ಪುಟ ತೆರೆದಿರುವಾಗಲೇ ವೆಬ್\u200cಸೈಟ್ ಅಪ್\u200cಡೇಟ್ ಆಗಿದೆ. ಪುಟವನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಿ, ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಮತ್ತೆ ಕಳುಹಿಸಿ.",
    },
  },
  email: {
    subjectLine: "ನಿಮ್ಮ ಸೋಲಾರ್ ವಿಚಾರಣೆ ನಮಗೆ ತಲುಪಿದೆ ({reference})",
    subjectEstimate: "ನಿಮ್ಮ ಸೋಲಾರ್ ಅಂದಾಜು: {kwp} kWp, ವೆಚ್ಚ {netCost} ({reference})",
    heading: "ಧನ್ಯವಾದಗಳು, {firstName}. ನಿಮ್ಮ ವಿಚಾರಣೆ ನಮಗೆ ತಲುಪಿದೆ.",
    headingEstimate: "ಧನ್ಯವಾದಗಳು, {firstName}. ನಿಮ್ಮ ಸೋಲಾರ್ ಅಂದಾಜು ಇಲ್ಲಿದೆ.",
    intro: "ನಿಮ್ಮ ಚಾವಣಿ ಮೇಲೆ ಸೋಲಾರ್ ಹಾಕಿಸುವ ಬಗ್ಗೆ ನೀವು ವಿಚಾರಿಸಿದ್ದೀರಿ (ಕಟ್ಟಡದ ಬಗೆ: {segment}). ನಾವು ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ಸ್ಥಳ ಭೇಟಿ ನಿಗದಿಪಡಿಸಲು ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತೇವೆ. ಆ ಭೇಟಿಯಲ್ಲಿ ವ್ಯವಸ್ಥೆಯ ಅಂತಿಮ ಸಾಮರ್ಥ್ಯ ಮತ್ತು ಅಂಕಿಅಂಶಗಳನ್ನು ಖಚಿತಪಡಿಸಬಹುದು.",
    introEstimate: "ನಿಮ್ಮ ಚಾವಣಿ ಮೇಲೆ ಸೋಲಾರ್ ಹಾಕಿಸುವ ಬಗ್ಗೆ ನೀವು ವಿಚಾರಿಸಿದ್ದೀರಿ (ಕಟ್ಟಡದ ಬಗೆ: {segment}). ನೀವು ತಿಳಿಸಿದ ಮಾಹಿತಿಯ ಆಧಾರದ ಮೇಲೆ ಅಂದಾಜಿನ ಅಂಕಿಅಂಶಗಳು ಕೆಳಗಿವೆ. ನಾವು ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ಸ್ಥಳ ಭೇಟಿ ನಿಗದಿಪಡಿಸಲು ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತೇವೆ. ಆ ಭೇಟಿಯಲ್ಲಿ ವ್ಯವಸ್ಥೆಯ ಅಂತಿಮ ಸಾಮರ್ಥ್ಯ ಮತ್ತು ಅಂಕಿಅಂಶಗಳನ್ನು ಖಚಿತಪಡಿಸಬಹುದು.",
    estimateTitle: "ನಿಮ್ಮ ಸೋಲಾರ್ ಅಂದಾಜು",
    rowSystemSize: "ಸಾಮರ್ಥ್ಯ",
    rowCostBeforeSubsidy: "ಸಬ್ಸಿಡಿ ಕಳೆಯುವ ಮೊದಲಿನ ವೆಚ್ಚ",
    rowSubsidy: "ಪಿಎಂ ಸೂರ್ಯ ಘರ್ ಸಬ್ಸಿಡಿ",
    rowNetCost: "ಸಬ್ಸಿಡಿ ಕಳೆದ ನಂತರದ ವೆಚ್ಚ",
    rowMonthlySavings: "ತಿಂಗಳ ಉಳಿತಾಯ",
    savingsShare: "{amount} (ನಿಮ್ಮ ಬಿಲ್\u200cನ {share}%)",
    rowPayback: "ಹಣ ವಾಪಸ್ ಬರುವ ಅವಧಿ (ಸರಳ ಲೆಕ್ಕ)",
    paybackYears: "ಸುಮಾರು {years} ವರ್ಷ",
    rangeNoteMiddle: "ತಿಂಗಳ ಬಿಲ್ {bill} ಎಂದು ಇಟ್ಟುಕೊಂಡು ಲೆಕ್ಕ ಹಾಕಲಾಗಿದೆ; ಇದು {range} ವ್ಯಾಪ್ತಿಯ ಮಧ್ಯದ ಮೊತ್ತ. ವಾಸ್ತವದ ಅಂಕಿಅಂಶಗಳು ಸ್ಥಳ ಭೇಟಿಯಲ್ಲಿ ಖಚಿತವಾಗುತ್ತವೆ.",
    rangeNoteFloor: "ತಿಂಗಳ ಬಿಲ್ {bill} ಎಂದು ಇಟ್ಟುಕೊಂಡು ಲೆಕ್ಕ ಹಾಕಲಾಗಿದೆ; ಇದು “{range}” ವ್ಯಾಪ್ತಿಯ ಆರಂಭದ ಮೊತ್ತ. ಹಾಗಾಗಿ ಇವನ್ನು ಕನಿಷ್ಠ ಅಂಕಿಅಂಶಗಳೆಂದು ತಿಳಿಯಿರಿ. ವಾಸ್ತವದ ಅಂಕಿಅಂಶಗಳು ಸ್ಥಳ ಭೇಟಿಯಲ್ಲಿ ಖಚಿತವಾಗುತ್ತವೆ.",
    submittedTitle: "ನೀವು ಕಳುಹಿಸಿದ ವಿವರಗಳು",
    rowReference: "ರೆಫರೆನ್ಸ್ ಸಂಖ್ಯೆ",
    rowProperty: "ಕಟ್ಟಡದ ಬಗೆ",
    rowPincode: "ಪಿನ್ ಕೋಡ್",
    rowMonthlyBill: "ತಿಂಗಳ ಬಿಲ್",
    rowWhatsapp: "WhatsApp ಅಪ್\u200cಡೇಟ್\u200cಗಳು",
    notGiven: "ತಿಳಿಸಿಲ್ಲ",
    yes: "ಹೌದು",
    no: "ಇಲ್ಲ",
    talkNow: "ಈಗಲೇ ಮಾತನಾಡಬೇಕೇ? WhatsApp ಮೂಲಕ ನಮಗೆ ಮೆಸೇಜ್ ಮಾಡಿ, ನಿಮ್ಮ ರೆಫರೆನ್ಸ್ ಸಂಖ್ಯೆ ತಿಳಿಸಿ.",
    talkNowText: "ಈಗಲೇ ಮಾತನಾಡಬೇಕೇ? WhatsApp ಮೂಲಕ ನಮಗೆ ಮೆಸೇಜ್ ಮಾಡಿ, ನಿಮ್ಮ ರೆಫರೆನ್ಸ್ ಸಂಖ್ಯೆ ತಿಳಿಸಿ: {whatsappUrl}",
    whatsappButton: "WhatsApp ಮೂಲಕ ನಮಗೆ ಮೆಸೇಜ್ ಮಾಡಿ",
    contactLine: "ಈ ಇಮೇಲ್\u200cಗೆ ಉತ್ತರಿಸಿದರೆ ನಮಗೆ ತಲುಪುವುದಿಲ್ಲ. {phone} ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡಿ ಅಥವಾ {email} ವಿಳಾಸಕ್ಕೆ ಇಮೇಲ್ ಮಾಡಿ.",
    disclaimer: "ನಮ್ಮ ವೆಬ್\u200cಸೈಟ್\u200cನ ಕ್ಯಾಲ್ಕುಲೇಟರ್ ತೋರಿಸುವ ಅಂಕಿಅಂಶಗಳು ಅಂದಾಜು; ಕೊಟೇಷನ್ ಅಲ್ಲ, ಖಾತರಿಯೂ ಅಲ್ಲ. ಸಬ್ಸಿಡಿಯನ್ನು ಸರ್ಕಾರ ನಿರ್ಧರಿಸಿ, ಎಸ್ಕಾಂ ತಪಾಸಣೆಯ ನಂತರ ಪಾವತಿಸುತ್ತದೆ.",
    footer: "{site} ವೆಬ್\u200cಸೈಟ್\u200cನಲ್ಲಿ {datetime} ಸಮಯಕ್ಕೆ ನೀವು ಅಂದಾಜು ಫಾರ್ಮ್ ಕಳುಹಿಸಿ, ಈ ವಿಚಾರಣೆಯ ಕುರಿತು ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಲು ಒಪ್ಪಿಗೆ ನೀಡಿದ್ದರಿಂದ ಈ ಇಮೇಲ್ ನಿಮಗೆ ಬಂದಿದೆ. ಇದು ಪ್ರಚಾರದ ಇಮೇಲ್ ಅಲ್ಲ.",
    footerPopup: "{site} ವೆಬ್\u200cಸೈಟ್\u200cನಲ್ಲಿ {datetime} ಸಮಯಕ್ಕೆ ನೀವು ನಿಮ್ಮ ಅಂದಾಜನ್ನು ಇಮೇಲ್ ಮಾಡುವಂತೆ ಕೇಳಿ, ಈ ವಿಚಾರಣೆಯ ಕುರಿತು ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಲು ಒಪ್ಪಿಗೆ ನೀಡಿದ್ದರಿಂದ ಈ ಇಮೇಲ್ ನಿಮಗೆ ಬಂದಿದೆ. ಇದು ಪ್ರಚಾರದ ಇಮೇಲ್ ಅಲ್ಲ.",
    datetime: "{datetime} (IST)",
  },
  whatsappPrefill: "ನಮಸ್ಕಾರ, Irradiant Energy ವೆಬ್\u200cಸೈಟ್\u200cನಲ್ಲಿ ನಾನು ಸೋಲಾರ್ ವಿಚಾರಣೆ ಕಳುಹಿಸಿದ್ದೇನೆ (ರೆಫರೆನ್ಸ್ {reference}).",
} satisfies Translation<typeof english>;
