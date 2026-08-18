import { hexToRgb, hslToRgb, rgbToHex, rgbToHsl } from "../color-utils";

/**
 * Neutral ramp derivation (design decision B' boundary): neutral has NO
 * naming constraint, so it is a plain hue-preserving desaturation of the
 * brand -- unaffected by the semantic-role anchor/window machinery in
 * `semantic-naming.ts`/`derive-semantic.ts`.
 */

/** Saturation ceiling so the ramp reads as neutral, not a tinted brand swatch. */
export const NEUTRAL_SATURATION_MAX = 8;

/**
 * Derives the neutral ramp's base hex: the brand's own hue and lightness,
 * saturation capped at `NEUTRAL_SATURATION_MAX`. Pure; never throws for a
 * hex `hexToRgb` can parse (an unparseable hex is returned unchanged, same
 * degrade-safely posture as the rest of this subsystem).
 */
export function deriveNeutralBase(brandHex: string): string {
  const rgb = hexToRgb(brandHex);
  if (!rgb) return brandHex;

  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const neutralS = Math.min(s, NEUTRAL_SATURATION_MAX);
  const neutralRgb = hslToRgb(h, neutralS, l);

  return rgbToHex(neutralRgb.r, neutralRgb.g, neutralRgb.b);
}
