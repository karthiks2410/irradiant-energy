import type { MetadataRoute } from "next";
import { allowIndexing } from "@/lib/env";
import { absoluteUrl } from "@/lib/seo";

// Crawling opens only when the real domain is configured in production (lib/env.ts), so previews
// and the bare *.vercel.app host never compete with the live site (report §13.5).
export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
