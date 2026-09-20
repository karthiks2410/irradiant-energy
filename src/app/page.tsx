import { AboutBand } from "@/components/home/AboutBand";
import { AudiencePathsBand } from "@/components/home/AudiencePathsBand";
import { HomeCalculator } from "@/components/home/HomeCalculator";
import { FinalCtaBand } from "@/components/home/FinalCtaBand";
import { HomeFaqBand } from "@/components/home/HomeFaqBand";
import { HomeHero } from "@/components/home/HomeHero";
import { ProjectsBand } from "@/components/home/ProjectsBand";
import { SystemBand } from "@/components/home/SystemBand";
import { WhyBand } from "@/components/home/WhyBand";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

// pageMetadata appends " | Irradiant Energy" (the layout's title.template does not reach the
// root segment), so the title stays short enough that the brand suffix is not what a search
// result truncates; the long phrase is the description.
export const metadata = pageMetadata({
  title: "Rooftop solar in Bengaluru",
  description: site.description,
  path: "/",
});

// Surfaces alternate canvas → white → dark for rhythm (report §6.9). The projects band is
// canvas, which is the only value that alternates on both sides of it: the calculator above
// paints itself dark and the closing band below is dark.
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <AudiencePathsBand />
      <AboutBand />
      <SystemBand />
      <WhyBand />
      <HomeCalculator />
      <ProjectsBand />
      <HomeFaqBand />
      <FinalCtaBand />
    </>
  );
}
