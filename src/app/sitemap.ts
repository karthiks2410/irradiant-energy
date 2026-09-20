import type { MetadataRoute } from "next";
import { isLegalPageIndexable, legalPages } from "@/content/legal";
import { solutions } from "@/content/site";
import { absoluteUrl } from "@/lib/seo";

// v1 routes (report §9.1, decisions D-009). The segment pages come from the nav registry in
// content/site.ts, so adding an offering there also adds it here. changefreq and priority are
// omitted because Google ignores them.
// The legal notices are listed only once counsel has approved them: while they are drafts the
// pages send noindex, and a noindex URL in the sitemap is a Search Console error.
const routes = [
  "/",
  "/solutions",
  ...solutions.items.map((item) => item.href),
  "/get-quote",
  "/about",
  "/contact",
  ...legalPages.filter((page) => isLegalPageIndexable(page.slug)).map((page) => page.href),
];

// The sitemap is a static route handler, so this is the build time, i.e. the last deployment.
// There is no CMS: copy changes ship as deployments.
const lastModified = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({ url: absoluteUrl(path), lastModified }));
}
