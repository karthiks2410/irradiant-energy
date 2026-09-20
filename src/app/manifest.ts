import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Irradiant",
    description: site.description,
    lang: "en-IN",
    start_url: "/",
    display: "minimal-ui",
    background_color: "#f6f7f2",
    theme_color: "#02342b",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
