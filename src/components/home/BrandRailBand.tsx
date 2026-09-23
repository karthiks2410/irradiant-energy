import type { Content } from "@/i18n/content";
import { BrandRail } from "./BrandRail";

/**
 * Server half of the equipment rail.
 *
 * <BrandRail> has to hydrate — it stops the rails when they leave the viewport — so it may not
 * import a content module. This reads the merged copy and hands it over, which is the pattern
 * every island on this page follows.
 */
export function BrandRailBand({ content }: { content: Content }) {
  const { brands } = content.home;
  return <BrandRail copy={brands.copy} items={brands.items} />;
}
