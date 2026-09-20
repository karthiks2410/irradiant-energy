import { AboutBand } from "@/components/home/AboutBand";
import { AudiencePathsBand } from "@/components/home/AudiencePathsBand";
import { CalculatorTeaser } from "@/components/home/CalculatorTeaser";
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

// Surfaces alternate canvas → white → dark for rhythm (report §6.9); the projects band
// drops out in production, which leaves the FAQ's white between the two dark bands.
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <AudiencePathsBand />
      <AboutBand />
      <SystemBand />
      <WhyBand />
      <CalculatorTeaser />
      <ProjectsBand />
      <HomeFaqBand />
      <FinalCtaBand />
    </>
  );
}
