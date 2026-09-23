/**
 * The Kannada overlays, gathered.
 *
 * Hand-written — everything else in this folder is generated (`npm run build:kn`) and the
 * generator refuses to overwrite a file that does not carry its header, so this list survives a
 * regeneration. Adding a module means adding it to `MODULES` in scripts/build-kn-content.ts and
 * to this file.
 *
 * Nothing here is typed again: each overlay already carries `satisfies Translation<typeof …>`
 * against its English original, which is where parity is enforced.
 */

export { homePage } from "./home";
export { site } from "./site";
export { nav } from "./nav";
export { primaryCta } from "./primary-cta";
export { projectImages } from "./images";
export { homeFaq } from "./faq-home";
export { faqCardLabels } from "./faq-card-labels";
export { ui } from "./ui";
