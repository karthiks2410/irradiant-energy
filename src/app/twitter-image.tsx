import { renderSocialImage } from "@/components/seo/SocialImage";
import { socialImage } from "@/lib/seo";

export const alt = socialImage.alt;
export const size = { width: socialImage.width, height: socialImage.height };
export const contentType = "image/png";

export default function Image() {
  return renderSocialImage();
}
