import { Link } from "@/components/i18n/LocaleLink";
import { LanguageSwitch } from "@/components/i18n/LanguageSwitch";
import { isNavGroup, nav, primaryCta } from "@/content/site";
import { LogoLockup } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { HeaderContact } from "./HeaderContact";
import { HeaderShell } from "./HeaderShell";
import { MobileMenu } from "./MobileMenu";
import { NavLinkItem } from "./NavLinkItem";
import { SolutionsMenu } from "./SolutionsMenu";

export function SiteHeader() {
  return (
    <HeaderShell>
      <div className="container-page flex min-h-(--header-h) items-center justify-between gap-3 py-1.5 lg:gap-5">
        {/* No aria-label here: <LogoLockup> is role="img" with its own name, so the link is named
            "Irradiant Energy", which matches the visible wordmark. An extra label would override the
            content and no longer match what users see (axe label-content-name-mismatch). */}
        <Link href="/" className="shrink-0">
          <LogoLockup className="h-[42px] w-auto lg:h-12" />
        </Link>

        {/* data-header-nav / data-header-menu is what globals.css uses to hand 1024–1279 over to
            the sheet in Kannada only, where the inline nav plus the right cluster overflows the
            bar (layout-risks.md B1). English keeps its inline nav at every width it had it. */}
        <nav aria-label="Main" data-header-nav className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.label}>
                {isNavGroup(item) ? <SolutionsMenu group={item} /> : <NavLinkItem href={item.href} label={item.label} />}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 md:gap-2 lg:gap-2.5">
          <HeaderContact />

          {/* From lg the switch sits in the bar; below that it is the first row of the mobile
              sheet, so a phone visitor is never without it (the owner's prototype hid it below
              1120px and offered nothing in its place). */}
          <LanguageSwitch className="hidden lg:inline-flex" />

          {/* The wrapper carries the display utility, not the pill: ButtonLink's own
              `inline-flex` is emitted after `.hidden` in the Tailwind stylesheet, so a
              `hidden` passed through className loses the cascade and the CTA stays on
              screen at phone widths — pushing the menu button out of the viewport. */}
          <span className="hidden sm:inline-flex">
            <ButtonLink href={primaryCta.href}>{primaryCta.label}</ButtonLink>
          </span>
          <MobileMenu />
        </div>
      </div>
    </HeaderShell>
  );
}
