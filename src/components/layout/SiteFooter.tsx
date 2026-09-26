import { Link } from "@/components/i18n/LocaleLink";
import type { ReactNode } from "react";
import { isConfirmed, whatsappLink } from "@/content/site";
import type { Content } from "@/i18n/content";
import { fill } from "@/i18n/format";
import { showPlaceholders } from "@/lib/env";
import { LogoLockup } from "@/components/brand/Logo";
import { CookieSettingsLink } from "@/components/consent";
import { SocialLinks } from "@/components/ui/SocialIcons";

function Placeholder({ children }: { children: string }) {
  if (!showPlaceholders) return null;
  return <span className="font-label text-label text-yellow-400 uppercase">[{children}]</span>;
}

const footerLink =
  "inline-flex min-h-11 items-center text-white/85 transition-colors hover:text-white";

function FooterColumn({
  title,
  links,
  children,
}: {
  title: string;
  links: readonly { readonly label: string; readonly href: string }[];
  /** Extra rows for the column, appended after `links` (the Legal column's consent control). */
  children?: ReactNode;
}) {
  return (
    <div>
      <h2 className="font-label text-eyebrow font-medium text-yellow-400 uppercase">{title}</h2>
      <ul className="mt-4 space-y-1">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={footerLink}>
              {l.label}
            </Link>
          </li>
        ))}
        {children}
      </ul>
    </div>
  );
}

export function SiteFooter({ content }: { content: Content }) {
  const { site, solutions, primaryCta, ui } = content;
  const { contact, legal: entity } = site;
  const year = new Date().getFullYear();

  const company = [
    { label: ui.footer.about, href: "/about" },
    { label: ui.footer.contact, href: "/contact" },
    { label: primaryCta.label, href: primaryCta.href },
  ];

  const legal = [
    { label: ui.footer.privacy, href: "/privacy" },
    { label: ui.footer.terms, href: "/terms" },
    { label: ui.footer.cookies, href: "/cookies" },
  ];

  return (
    <footer data-surface="dark" className="bg-teal-900 text-white">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-12 lg:gap-(--grid-gutter) lg:py-20">
        <div className="lg:col-span-4">
          <LogoLockup className="h-12 w-auto" />
          <p className="mt-6 max-w-sm text-white/80">{site.description}</p>
          {/* Brand marks, dark-surface styling picked up from the footer's data-surface. The row
              hides itself when no profile is live (SocialLinks guards on site.social). */}
          <SocialLinks className="mt-6" labels={ui.social} siteName={site.name} pending={content.socialPending} />
        </div>

        {/* M11: at 1024 the Kannada column headings wrap to two lines and the links below them
            wrap from 360 up. Nothing is clipped — the columns simply need more width — so
            Kannada takes 6 of the 12 columns instead of 5, and drops to two columns per row at
            lg so a heading has twice the measure. English is untouched. */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5 kn:lg:col-span-6 kn:lg:grid-cols-2">
          <FooterColumn title={solutions.label} links={solutions.items} />
          <FooterColumn title={ui.footer.companyTitle} links={company} />
          <FooterColumn title={ui.footer.legalTitle} links={legal}>
            {/* Withdrawing consent has to be as easy as giving it, and both the banner and the
                cookie notice tell the visitor this control is in the footer. */}
            <li>
              <CookieSettingsLink className={footerLink}>{ui.footer.cookieSettings}</CookieSettingsLink>
            </li>
          </FooterColumn>
        </div>

        <address className="not-italic lg:col-span-3 kn:lg:col-span-2">
          <h2 className="font-label text-eyebrow font-medium text-yellow-400 uppercase">{ui.footer.connectTitle}</h2>
          <ul className="mt-4 space-y-3 text-white/85">
            <li>
              <a href={`tel:${contact.phonePrimary.value.tel}`} className="hover:text-white">
                {contact.phonePrimary.value.display}
              </a>
            </li>
            <li>
              <a href={`tel:${contact.phoneSecondary.value.tel}`} className="hover:text-white">
                {contact.phoneSecondary.value.display}
              </a>
              {!isConfirmed(contact.phoneSecondary.status) && <Placeholder>confirm second line</Placeholder>}
            </li>
            <li>
              <a href={`mailto:${contact.email.value}`} className="hover:text-white">
                {contact.email.value}
              </a>
            </li>
            <li>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                {ui.footer.whatsapp}
              </a>
            </li>
            <li className="text-white/70">
              {contact.address.value.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </li>
          </ul>
        </address>
      </div>

      <div className="border-t-2 border-yellow-400 bg-teal-975">
        <div className="container-page flex flex-col gap-2 py-6 text-small text-on-dark-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {entity.entityName ?? site.name}{" "}
            {entity.gstin ? fill(ui.footer.gstin, { gstin: entity.gstin }) : <Placeholder>GSTIN</Placeholder>}
          </p>
          <p className="font-label text-label uppercase">{site.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
