import { ImageResponse } from "next/og";
import { site } from "@/content/site";
import { socialImage } from "@/lib/seo";
import { BrandMark } from "./BrandMark";

/**
 * Site-wide social card (1200×630), shared by app/opengraph-image.tsx and app/twitter-image.tsx.
 * Brand pairings only: white and Solar Yellow text on Deep Teal, the symbol in Radiant Green.
 * Satori rules apply: flexbox only, every multi-child box declares display:flex.
 */

// Brand tokens, duplicated from globals.css because Satori cannot read CSS variables.
const teal = "#02342b";
const green = "#06a64c";
const white = "#ffffff";
const yellow = "#ffcd00";

const eyebrow = site.tagline.toUpperCase();

/**
 * Manrope ExtraBold, subset to the glyphs on the card, via the Google Fonts CSS endpoint. Node's
 * fetch is served a TrueType face, the format Satori accepts. Any failure (offline CI, a blocked
 * network) degrades to Satori's bundled default face instead of failing the build.
 */
async function loadManrope(): Promise<ArrayBuffer | undefined> {
  try {
    const text = encodeURIComponent(`${site.name}${eyebrow}`);
    const css = await fetch(`https://fonts.googleapis.com/css2?family=Manrope:wght@800&text=${text}`);
    if (!css.ok) return undefined;
    const fontUrl = (await css.text()).match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!fontUrl) return undefined;
    const font = await fetch(fontUrl);
    return font.ok ? await font.arrayBuffer() : undefined;
  } catch {
    return undefined;
  }
}

// The font does not depend on request data, so it is loaded once at module scope.
const manrope = await loadManrope();

export function renderSocialImage(): ImageResponse {
  const fontFamily = manrope ? "Manrope" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: teal,
          color: white,
          fontFamily,
        }}
      >
        <BrandMark size={112} fill={green} />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 104, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.015em" }}>
            {site.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 32 }}>
            <div style={{ width: 40, height: 3, background: yellow, marginRight: 20 }} />
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "0.2em", color: yellow }}>{eyebrow}</div>
          </div>
        </div>
      </div>
    ),
    {
      width: socialImage.width,
      height: socialImage.height,
      fonts: manrope ? [{ name: "Manrope", data: manrope, weight: 800, style: "normal" }] : undefined,
    },
  );
}
