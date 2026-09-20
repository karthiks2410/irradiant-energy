import Link from "next/link";
import { isConfirmed, primaryCta, site, solutions, whatsappLink } from "@/content/site";
import { showPlaceholders } from "@/lib/env";
import { LogoLockup } from "@/components/brand/Logo";

const company = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: primaryCta.label, href: primaryCta.href },
];

const legal = [
  { label: "Privacy notice", href: "/privacy" },
  { label: "Terms of use", href: "/terms" },
  { label: "Cookie notice", href: "/cookies" },
];

function Placeholder({ children }: { children: string }) {
  if (!showPlaceholders) return null;
  return <span className="font-mono text-label text-yellow-400 uppercase">[{children}]</span>;
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="font-mono text-eyebrow font-medium text-yellow-400 uppercase">{title}</h2>
      <ul className="mt-4 space-y-1">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="inline-flex min-h-11 items-center text-white/85 transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const { contact, legal: entity } = site;
  const year = new Date().getFullYear();

  return (
    <footer data-surface="dark" className="bg-teal-900 text-white">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-12 lg:gap-(--grid-gutter) lg:py-20">
        <div className="lg:col-span-4">
          <LogoLockup className="h-12 w-auto" />
          <p className="mt-6 max-w-sm text-white/80">{site.description}</p>
          {site.social.length > 0 && (
          <ul className="mt-6 flex gap-2">
            {site.social.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center rounded-full border border-white/25 px-4 text-small font-medium transition-colors hover:bg-white hover:text-teal-900"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          )}
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
          <FooterColumn title={solutions.label} links={solutions.items} />
          <FooterColumn title="Company" links={company} />
          <FooterColumn title="Legal" links={legal} />
        </div>

        <address className="not-italic lg:col-span-3">
          <h2 className="font-mono text-eyebrow font-medium text-yellow-400 uppercase">Connect</h2>
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
                WhatsApp us
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
            © {year} {site.name}. {entity.entityName ?? <Placeholder>legal entity name</Placeholder>}{" "}
            {entity.gstin ? `GSTIN ${entity.gstin}` : <Placeholder>GSTIN</Placeholder>}
          </p>
          <p className="font-mono text-label uppercase">{site.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
