/**
 * Brand icons: the favicon set and the web-app icons, drawn from the D-005 symbol.
 *
 *   npm run icons
 *
 * Writes these files, which are committed; run it again only when the symbol or the settings
 * below change:
 *
 *   src/app/icon.svg                    round favicon, vector (Next links it with sizes="any")
 *   src/app/favicon.ico                 16, 32 and 48 px. Chrome's address-bar suggestions,
 *                                       bookmarks and many crawlers ask for /favicon.ico
 *   src/app/icon1.png                   96 px round favicon. Google Search shows a site icon only
 *                                       from a linked file that is a square multiple of 48 px
 *   public/icons/icon-192.png           web-app manifest, purpose "any" (round)
 *   public/icons/icon-512.png           web-app manifest, purpose "any" (round)
 *   public/icons/icon-maskable-512.png  web-app manifest, purpose "maskable" (full-bleed square)
 *
 * The Apple touch icon stays code-generated (src/app/apple-icon.tsx) and uses the same
 * ICON_SYMBOL_SCALE, so every icon carries the mark at the same size.
 *
 * Shape. Browser tabs, address-bar suggestions and Google results show a round badge (a green
 * disc edge to edge, transparent outside it), which reads fuller than a square at 16 px. The
 * home-screen icons are different: iOS and Android cut their own shape, so the Apple icon and the
 * maskable icon are full-bleed squares and the OS does the rounding.
 *
 * Optical weight. At 16 px the symbol's rays are about 1.3 px wide and fall between pixel columns,
 * so they rasterise as pale green smears. The favicon files therefore thicken the symbol with a
 * white outline, in master units: REGULAR for the favicon at 32 px and up, SMALL for 16 px (the
 * rays come out about 2 px and white). The SVG switches to SMALL by itself when it is drawn at
 * 24 CSS px or less (a media query inside an SVG image is evaluated against the image's own
 * size). The web-app icons are 180 px and larger and use the master outline unchanged.
 *
 * Rendering is sharp (libvips + librsvg), which Next installs as an optional dependency, so there
 * is nothing extra to install. The output depends only on these inputs and the sharp version.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { ICON_SYMBOL_SCALE, SYMBOL_PATHS } from "../src/components/brand/symbol.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const GREEN = "#06a64c"; // Radiant Green
const WHITE = "#ffffff";

/** Extra outline round the symbol, in master units (see "Optical weight" above). */
const WEIGHT = { master: 0, regular: 1.6, small: 2.4 } as const;

/** The maskable safe zone is the central circle of 80% diameter; the symbol keeps the same
 *  proportion of it that it has of the round favicon. */
const MASKABLE_SCALE = ICON_SYMBOL_SCALE * 0.8;

function symbol(scale: number, weight: number): string {
  const outline = weight > 0 ? ` stroke="${WHITE}" stroke-width="${weight}" stroke-linejoin="round"` : "";
  const paths = SYMBOL_PATHS.map((d) => `<path d="${d}"/>`).join("");
  return `<g fill="${WHITE}"${outline} transform="translate(50 50) scale(${scale}) translate(-50 -50)">${paths}</g>`;
}

/** The round favicon badge on a 100-unit canvas. */
function badge(weight: number, style = ""): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${style}` +
    `<circle cx="50" cy="50" r="50" fill="${GREEN}"/>${symbol(ICON_SYMBOL_SCALE, weight)}</svg>`
  );
}

/** A full-bleed square tile, for icons whose shape the OS cuts. */
function tile(scale: number): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<rect width="100" height="100" fill="${GREEN}"/>${symbol(scale, WEIGHT.master)}</svg>`
  );
}

/** Rasterise straight at the target size, so librsvg anti-aliases on the final pixel grid. */
function atSize(svg: string, size: number) {
  return sharp(Buffer.from(svg.replace("<svg ", `<svg width="${size}" height="${size}" `)));
}

async function png(svg: string, size: number): Promise<Buffer> {
  return atSize(svg, size).png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
}

async function rgba(svg: string, size: number): Promise<Buffer> {
  const { data, info } = await atSize(svg, size).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== size || info.height !== size || info.channels !== 4) {
    throw new Error(`Expected ${size}x${size} RGBA, got ${info.width}x${info.height}x${info.channels}`);
  }
  return data;
}

/**
 * One ICO image as a 32-bit BMP (DIB): BITMAPINFOHEADER, then BGRA rows bottom-up, then the 1-bit
 * AND mask (set where the pixel is fully transparent). BMP rather than PNG-in-ICO so the oldest
 * readers can open it too; at 16 to 48 px the difference in bytes is small.
 */
function dib(size: number, pixels: Buffer): Buffer {
  const maskRow = Math.ceil(size / 32) * 4;
  const colour = size * size * 4;
  const out = Buffer.alloc(40 + colour + maskRow * size);
  out.writeUInt32LE(40, 0); // header size
  out.writeInt32LE(size, 4); // width
  out.writeInt32LE(size * 2, 8); // height: colour + mask
  out.writeUInt16LE(1, 12); // planes
  out.writeUInt16LE(32, 14); // bits per pixel
  out.writeUInt32LE(0, 16); // BI_RGB
  out.writeUInt32LE(colour + maskRow * size, 20);
  for (let row = 0; row < size; row++) {
    const src = size - 1 - row; // bottom-up
    for (let x = 0; x < size; x++) {
      const s = (src * size + x) * 4;
      const d = 40 + (row * size + x) * 4;
      out[d] = pixels[s + 2];
      out[d + 1] = pixels[s + 1];
      out[d + 2] = pixels[s];
      out[d + 3] = pixels[s + 3];
      if (pixels[s + 3] === 0) out[40 + colour + row * maskRow + (x >> 3)] |= 0x80 >> (x & 7);
    }
  }
  return out;
}

function ico(frames: { size: number; pixels: Buffer }[]): Buffer {
  const images = frames.map(({ size, pixels }) => dib(size, pixels));
  const dir = Buffer.alloc(6 + 16 * frames.length);
  dir.writeUInt16LE(0, 0); // reserved
  dir.writeUInt16LE(1, 2); // type: icon
  dir.writeUInt16LE(frames.length, 4);
  let offset = dir.length;
  frames.forEach(({ size }, i) => {
    const e = 6 + 16 * i;
    dir.writeUInt8(size % 256, e); // width (0 means 256)
    dir.writeUInt8(size % 256, e + 1); // height
    dir.writeUInt8(0, e + 2); // palette size
    dir.writeUInt8(0, e + 3); // reserved
    dir.writeUInt16LE(1, e + 4); // planes
    dir.writeUInt16LE(32, e + 6); // bits per pixel
    dir.writeUInt32LE(images[i].length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    offset += images[i].length;
  });
  return Buffer.concat([dir, ...images]);
}

const smallAtTiny = `<style>@media (max-width:24px){g{stroke-width:${WEIGHT.small}}}</style>`;
const favicon = badge(WEIGHT.regular);

const outputs: [string, Buffer][] = [
  ["src/app/icon.svg", Buffer.from(badge(WEIGHT.regular, smallAtTiny) + "\n")],
  [
    "src/app/favicon.ico",
    ico([
      { size: 16, pixels: await rgba(badge(WEIGHT.small), 16) },
      { size: 32, pixels: await rgba(favicon, 32) },
      { size: 48, pixels: await rgba(favicon, 48) },
    ]),
  ],
  ["src/app/icon1.png", await png(favicon, 96)],
  ["public/icons/icon-192.png", await png(badge(WEIGHT.master), 192)],
  ["public/icons/icon-512.png", await png(badge(WEIGHT.master), 512)],
  ["public/icons/icon-maskable-512.png", await png(tile(MASKABLE_SCALE), 512)],
];

for (const [file, bytes] of outputs) {
  const target = path.join(ROOT, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, bytes);
  console.log(`${file.padEnd(36)} ${bytes.length.toLocaleString("en")} bytes`);
}
