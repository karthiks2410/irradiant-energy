import { Link } from "@/components/i18n/LocaleLink";
import { LanguageSwitch } from "@/components/i18n/LanguageSwitch";
import { isNavGroup, site, whatsappLink } from "@/content/site";
import type { Content } from "@/i18n/content";
import { fill } from "@/i18n/format";
import { LogoLockup } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { HeaderContact } from "./HeaderContact";
import { HeaderShell } from "./HeaderShell";
import { MobileMenu } from "./MobileMenu";
import { NavLinkItem } from "./NavLinkItem";
import { SolutionsMenu } from "./SolutionsMenu";

export function SiteHeader({ content }: { content: Content }) {
  const { nav, primaryCta, ui } = content;

  return (
    <HeaderShell>
      <div className="container-page flex min-h-(--header-h) items-center justify-between gap-3 py-1.5 lg:gap-5">
        {/* No aria-label here: <LogoLockup> is role="img" with its own name, so the link is named
            "Irradiant Energy", which matches the visible wordmark. An extra label would override the
            content and no longer match what users see (axe label-content-name-mismatch). */}
        <Link href="/" className="shrink-0">
          <LogoLockup className="h-[42px] w-auto lg:h-12" />
        </Link>

        {/*
         * xl, not lg (layout-risks.md B1). At 1024–1279 the inline nav and the right-hand cluster
         * do not fit: measured on the pre-change build, the header's inner container is 1084px
         * wide inside 1024px, so the CTA is clipped by the viewport edge — before any Kannada or
         * any language switch. Kannada makes it worse (its nav items wrapped to two lines inside a
         * fixed-height bar), and the M4 fix that stops the CTA wrapping makes it worse again,
         * because a pill that cannot wrap cannot get narrower.
         *
         * So 1024–1279 uses the sheet, which fits both languages comfortably. This is the one
         * place English rendering changes beyond the URL prefix, and it changes from clipped to
         * not clipped.
         */}
        <nav aria-label={ui.header.navLabel} className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.label}>
                {isNavGroup(item) ? (
                  <SolutionsMenu group={item} labels={ui.solutionsMenu} />
                ) : (
                  <NavLinkItem href={item.href} label={item.label} />
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 md:gap-2 lg:gap-2.5">
          <HeaderContact phone={content.site.contact.phonePrimary.value} srLabel={ui.header.callSrLabel} />

          {/*
           * From xl the switch sits in the bar, beside the phone and the CTA; below that it is the
           * first thing in the mobile sheet, so nobody is ever without it — the owner's prototype
           * hid it below 1120px and offered nothing in its place.
           *
           * The display utility is on this wrapper, not on the pill: Tailwind emits `.inline-flex`
           * after `.hidden`, so a `hidden` passed through className loses the cascade and the pill
           * stays on screen at every width. That is not hypothetical — it pushed the menu button
           * 43px off a 360px screen until this wrapper was added. Same reason the CTA below has one.
           */}
          <span className="hidden xl:inline-flex">
            <LanguageSwitch />
          </span>

          {/* The wrapper carries the display utility, not the pill: ButtonLink's own
              `inline-flex` is emitted after `.hidden` in the Tailwind stylesheet, so a
              `hidden` passed through className loses the cascade and the CTA stays on
              screen at phone widths — pushing the menu button out of the viewport. */}
          <span className="hidden sm:inline-flex">
            <ButtonLink href={primaryCta.href}>{primaryCta.label}</ButtonLink>
          </span>
          <MobileMenu
            copy={{
              nav,
              primaryCta,
              labels: ui.mobileMenu,
              phone: content.site.contact.phonePrimary.value,
              // Built here, where the merged copy is: the sheet hydrates and must not reach for a
              // content module of its own.
              whatsappHref: whatsappLink(fill(ui.mobileMenu.whatsappPrefill, { siteName: site.name })),
            }}
          />
        </div>
      </div>
    </HeaderShell>
  );
}
