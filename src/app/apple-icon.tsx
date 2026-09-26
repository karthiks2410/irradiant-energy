import { ImageResponse } from "next/og";
import { ICON_SYMBOL_SCALE, SYMBOL_CROP } from "@/components/brand/symbol";
import { BrandMark } from "@/components/seo/BrandMark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// The symbol's crop drawn at the icon scale the favicon uses (146px of 180), so the touch icon
// carries the same mark at the same size as the browser tab.
const markSize = Math.round((size.width * SYMBOL_CROP * ICON_SYMBOL_SCALE) / 100);

// White symbol on a Radiant Green tile (brand PDF p.35, D-005 row 04). iOS rounds the corners
// itself, so the tile bleeds to the edge; the round badge is only for the favicon.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#06a64c",
        }}
      >
        <BrandMark size={markSize} fill="#ffffff" />
      </div>
    ),
    size,
  );
}
