import { AboutBand } from "@/components/home/AboutBand";
import { AudiencePathsBand } from "@/components/home/AudiencePathsBand";
import { HomeCalculator } from "@/components/home/HomeCalculator";
import { FinalCtaBand } from "@/components/home/FinalCtaBand";
import { HomeFaqBand } from "@/components/home/HomeFaqBand";
import { HomeHero } from "@/components/home/HomeHero";
import { BrandRailBand } from "@/components/home/BrandRailBand";
import { HomeEstimateProvider } from "@/components/home/HomeEstimateProvider";
import { ProjectsBand } from "@/components/home/ProjectsBand";
import { SystemBand } from "@/components/home/SystemBand";
import { WhyBand } from "@/components/home/WhyBand";
import { getContent } from "@/i18n/content";
import { langParams } from "@/i18n/registry";
import { getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

// pageMetadata appends " | Irradiant Energy" (the layout's title.template does not reach the
// root segment), so the title stays short enough that the brand suffix is not what a search
// result truncates; the long phrase is the description.
/** Publishing gate: this page exists only in the locales the registry publishes it in. */
export const generateStaticParams = () => langParams("home");

export async function generateMetadata() {
  const locale = await getLocale();
  const content = getContent(locale);
  return pageMetadata({
    title: content.home.meta.title,
    description: content.site.description,
    path: "/",
    locale,
  });
}

// Surfaces alternate canvas → white → dark for rhythm (report §6.9). The projects band is
// canvas, which is the only value that alternates on both sides of it: the calculator above
// paints itself dark and the closing band below is dark.
export default async function HomePage() {
  // One read of the merged content for the whole page. Every band below takes what it needs from
  // it as props: none of them imports a content module, so a band can be moved into a client
  // island later without dragging both languages' copy into the browser.
  const content = getContent(await getLocale());

  return (
    <HomeEstimateProvider>
      <HomeHero content={content} />
      <AudiencePathsBand content={content} />
      <AboutBand content={content} />
      <SystemBand content={content} />
      <WhyBand content={content} />
      <BrandRailBand content={content} />
      <HomeCalculator content={content} />
      <ProjectsBand content={content} />
      <HomeFaqBand content={content} />
      <FinalCtaBand content={content} />
    </HomeEstimateProvider>
  );
}
