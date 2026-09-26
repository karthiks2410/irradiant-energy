import { Link } from "@/components/i18n/LocaleLink";
import { getContent } from "@/i18n/content";
import { getLocale } from "@/i18n/server";

export interface Crumb {
  name: string;
  href: string;
}

/**
 * Visible breadcrumb trail (report §9.2). Home is added automatically, so the trail mirrors
 * <BreadcrumbJsonLd> exactly; the current page is plain text with aria-current.
 *
 * Every inner page opens with this line — it is the first thing that tells a visitor they have
 * left the home page (owner review round 2, point 1).
 *
 * It reads the first crumb and its own label from the content layer rather than taking them as
 * props: "Home" and "Breadcrumb" belong to this component in every trail on the site, so a call
 * site would only be repeating them. The crumbs BETWEEN Home and the current page are the page's
 * own words and still arrive as props.
 */
export async function Breadcrumbs({ trail = [], current }: { trail?: readonly Crumb[]; current: string }) {
  const { ui } = getContent(await getLocale());
  const links: readonly Crumb[] = [{ name: ui.breadcrumbs.home, href: "/" }, ...trail];
  return (
    <nav aria-label={ui.breadcrumbs.ariaLabel}>
      <ol className="flex flex-wrap items-center gap-x-2 font-label text-label text-grey-600 in-data-[surface=dark]:text-white/70">
        {links.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-x-2">
            <Link
              href={crumb.href}
              className="inline-flex min-h-11 items-center transition-colors duration-200 hover:text-green-700 in-data-[surface=dark]:hover:text-white"
            >
              {crumb.name}
            </Link>
            <span aria-hidden="true">/</span>
          </li>
        ))}
        <li aria-current="page" className="flex min-h-11 items-center text-carbon in-data-[surface=dark]:text-white">
          {current}
        </li>
      </ol>
    </nav>
  );
}
