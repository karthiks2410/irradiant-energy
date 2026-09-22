import { AboutBand } from "@/components/home/AboutBand";
import { AudiencePathsBand } from "@/components/home/AudiencePathsBand";
import { HomeCalculator } from "@/components/home/HomeCalculator";
import { FinalCtaBand } from "@/components/home/FinalCtaBand";
import { HomeFaqBand } from "@/components/home/HomeFaqBand";
import { HomeHero } from "@/components/home/HomeHero";
import { BrandRail } from "@/components/home/BrandRail";
import { HomeEstimateProvider } from "@/components/home/HomeEstimateProvider";
import { ProjectsBand } from "@/components/home/ProjectsBand";
import { SystemBand } from "@/components/home/SystemBand";
import { WhyBand } from "@/components/home/WhyBand";
import { site } from "@/content/site";
import { langParams } from "@/i18n/registry";
import { getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

// pageMetadata appends " | Irradiant Energy" (the layout's title.template does not reach the
// root segment), so the title stays short enough that the brand suffix is not what a search
// result truncates; the long phrase is the description.
/** Publishing gate: this page exists only in the locales the registry publishes it in. */
export const generateStaticParams = () => langParams("home");

export async function generateMetadata() {
  return pageMetadata({
    title: "Rooftop solar across Karnataka",
    description: site.description,
    path: "/",
    locale: await getLocale(),
  });
}

// Surfaces alternate canvas → white → dark for rhythm (report §6.9). The projects band is
// canvas, which is the only value that alternates on both sides of it: the calculator above
// paints itself dark and the closing band below is dark.
export default function HomePage() {
  return (
    <HomeEstimateProvider>
      <HomeHero />
      <AudiencePathsBand />
      <AboutBand />
      <SystemBand />
      <WhyBand />
      <BrandRail />
      <HomeCalculator />
      <ProjectsBand />
      <HomeFaqBand />
      <FinalCtaBand />
    </HomeEstimateProvider>
  );
}
