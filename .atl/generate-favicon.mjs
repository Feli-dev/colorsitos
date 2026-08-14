#!/usr/bin/env node
/**
 * Regenerates src/app/favicon.ico from the Logo component's marks.
 *
 *   node .atl/generate-favicon.mjs
 *
 * The icon is the only binary in the repo, so it exists as generated output
 * rather than an opaque blob: the shapes and colours below mirror
 * src/components/logo.tsx, and running this script reproduces the committed
 * file byte for byte.
 *
 * Uses sharp, which is already present as one of Next's dependencies.
 */
import { writeFileSync } from "node:fs";
import sharp from "sharp";

// Four concentric rounded squares rotated 45 degrees, matching logo.tsx:
// sizes 24 / 18 / 12 / 7.2 in its 24px box, scaled so the largest diamond's
// diagonal fits the canvas.
const MARKS = [
  { side: 24, fill: "#DCCEED" },
  { side: 18, fill: "#9A6BDB" },
  { side: 12, fill: "#672AC0" },
  { side: 7.2, fill: "#421C82" },
];

const BOX = 24;
const SIZES = [16, 32, 48];

function svgFor(canvas) {
  // A square of side s rotated 45 degrees spans s * sqrt(2).
  const scale = canvas / (BOX * Math.SQRT2);
  const centre = canvas / 2;

  const shapes = MARKS.map(({ side, fill }) => {
    const s = side * scale;
    const radius = s * 0.16; // Tailwind `rounded` relative to the 24px box.
    const offset = centre - s / 2;
    return (
      `<rect x="${offset.toFixed(3)}" y="${offset.toFixed(3)}" ` +
      `width="${s.toFixed(3)}" height="${s.toFixed(3)}" ` +
      `rx="${radius.toFixed(3)}" fill="${fill}" ` +
      `transform="rotate(45 ${centre} ${centre})"/>`
    );
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas}" height="${canvas}" viewBox="0 0 ${canvas} ${canvas}">${shapes}</svg>`;
}

const pngs = await Promise.all(
  SIZES.map((size) => sharp(Buffer.from(svgFor(size))).png().toBuffer())
);

// ICO container: 6-byte header, then one 16-byte directory entry per image,
// then the PNG payloads. PNG-in-ICO is supported from Windows Vista onward.
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type 1 = icon
header.writeUInt16LE(SIZES.length, 4);

let offset = 6 + SIZES.length * 16;
const entries = [];

SIZES.forEach((size, i) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // palette size, 0 for truecolour
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngs[i].length, 8);
  entry.writeUInt32LE(offset, 12);
  entries.push(entry);
  offset += pngs[i].length;
});

const ico = Buffer.concat([header, ...entries, ...pngs]);
writeFileSync(new URL("../src/app/favicon.ico", import.meta.url), ico);

console.log(
  `wrote src/app/favicon.ico — ${SIZES.join("/")}px, ${ico.length} bytes`
);
