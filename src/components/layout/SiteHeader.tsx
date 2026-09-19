import Link from "next/link";
import { isNavGroup, nav, primaryCta } from "@/content/site";
import { LogoLockup } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { HeaderShell } from "./HeaderShell";
import { MobileMenu } from "./MobileMenu";
import { NavLinkItem } from "./NavLinkItem";
import { SolutionsMenu } from "./SolutionsMenu";

export function SiteHeader() {
  return (
    <HeaderShell>
      <div className="container-page flex h-full items-center justify-between gap-6">
        <Link href="/" aria-label="Irradiant Energy — home" className="shrink-0">
          <LogoLockup className="h-[42px] w-auto lg:h-12" />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.label}>
                {isNavGroup(item) ? <SolutionsMenu group={item} /> : <NavLinkItem href={item.href} label={item.label} />}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <ButtonLink href={primaryCta.href} className="hidden sm:inline-flex">
            {primaryCta.label}
          </ButtonLink>
          <MobileMenu />
        </div>
      </div>
    </HeaderShell>
  );
}
