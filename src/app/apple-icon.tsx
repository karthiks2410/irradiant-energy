import { ImageResponse } from "next/og";
import { BrandMark } from "@/components/seo/BrandMark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// White symbol on a Radiant Green tile, the same crop as app/icon.svg (brand PDF p.35, D-005
// row 04). iOS rounds the corners itself, so the tile bleeds to the edge.
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
        <BrandMark size={128} fill="#ffffff" />
      </div>
    ),
    size,
  );
}
