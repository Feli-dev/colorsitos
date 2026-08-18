import { Hsluv } from "hsluv";

/**
 * HSLuv hue/saturation/lightness helpers.
 *
 * Centralizes the hue arithmetic the destructive hue-separation ladder needs
 * (decision B), and the NaN/near-zero-saturation handling that used to be
 * inlined twice in `palette-generator.ts` for the "grayscale colour has no
 * meaningful hue" case (`isAchromatic`, `S_ACHROMATIC`).
 */

export interface HsluvColor {
  h: number;
  s: number;
  l: number;
}

/** Normalizes a hue to the canonical range [0, 360). */
function normalizeHue(h: number): number {
  return ((h % 360) + 360) % 360;
}

/** HSLuv h/s/l for a hex colour. Hue is in degrees, [0, 360). */
export function hsluvOf(hex: string): HsluvColor {
  const converter = new Hsluv();
  converter.hex = hex;
  converter.hexToHsluv();
  return { h: converter.hsluv_h, s: converter.hsluv_s, l: converter.hsluv_l };
}

/** HSLuv hue only, in degrees [0, 360). Shorthand for `hsluvOf(hex).h`. */
export function hsluvHue(hex: string): number {
  return hsluvOf(hex).h;
}

/** Builds an uppercase hex colour from HSLuv h/s/l. `h` is normalized first. */
export function hexFromHsluv(h: number, s: number, l: number): string {
  const converter = new Hsluv();
  converter.hsluv_h = normalizeHue(h);
  converter.hsluv_s = s;
  converter.hsluv_l = l;
  converter.hsluvToHex();
  return converter.hex.toUpperCase();
}

/** Unsigned angular distance between two hues, the short way around, in [0, 180]. */
export function circularDelta(a: number, b: number): number {
  const diff = Math.abs(normalizeHue(a) - normalizeHue(b));
  return Math.min(diff, 360 - diff);
}

/**
 * Signed angular offset from `from` to `to`, in (-180, 180]. Positive means
 * `to` sits clockwise (increasing hue) from `from`. The exact-opposite case
 * (180° either way) resolves to -180 by construction, never +180 — this is
 * the ladder's rung-1 tiebreak (decision 2, R7).
 */
export function circularSignedDelta(from: number, to: number): number {
  return ((normalizeHue(to) - normalizeHue(from) + 540) % 360) - 180;
}

/** A hue interval. Wraps through 0 when `lo > hi` (e.g. `{ lo: 350, hi: 30 }`). */
export interface HueArc {
  lo: number;
  hi: number;
}

/** Whether `hue` falls inside `arc`, accounting for wraparound. */
export function isInArc(hue: number, arc: HueArc): boolean {
  const h = normalizeHue(hue);
  return arc.lo <= arc.hi ? h >= arc.lo && h <= arc.hi : h >= arc.lo || h <= arc.hi;
}

/**
 * Clamps `hue` into `arc`. A hue already inside is returned unchanged;
 * otherwise it moves to whichever edge is circularly nearer.
 */
export function clampToArc(hue: number, arc: HueArc): number {
  const h = normalizeHue(hue);
  if (isInArc(h, arc)) return h;

  const distToLo = circularDelta(h, arc.lo);
  const distToHi = circularDelta(h, arc.hi);
  return distToLo <= distToHi ? arc.lo : arc.hi;
}

/**
 * HSLuv saturation below which a colour is treated as having no meaningful
 * hue — a grey brand cannot be hue-separated from anything (rung 0).
 */
export const S_ACHROMATIC = 5;

/** Whether `hex`'s HSLuv saturation is below `S_ACHROMATIC`. */
export function isAchromatic(hex: string): boolean {
  return hsluvOf(hex).s < S_ACHROMATIC;
}
