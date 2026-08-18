import { hexToRgb, hslToRgb, rgbToHex, rgbToHsl } from "../color-utils";

/**
 * Accent ramp derivation (design decision B' boundary): accent has NO naming
 * constraint -- harmony IS the feature, so real hue rotations survive
 * untouched here. Never apply `readsAsRole`/anchor-based derivation to
 * accent; doing so would destroy the harmony rotations that are the point.
 */

export type HarmonyRule =
  | "complementary"
  | "splitComplementary"
  | "triadic"
  | "analogous";

/** Fixed hue rotation, in degrees, per harmony rule. */
export const HARMONY_ROTATION: Record<HarmonyRule, number> = {
  complementary: 180,
  splitComplementary: 150,
  triadic: 120,
  analogous: 30,
};

/** Used when deriving an unpinned accent with no rule chosen yet (Slice 10 UI). */
export const DEFAULT_HARMONY_RULE: HarmonyRule = "complementary";

/**
 * Derives the accent ramp's base hex: the brand's hue rotated by `rule`,
 * saturation/lightness preserved. Pure; never throws for a hex `hexToRgb`
 * can parse.
 */
export function deriveAccentBase(
  brandHex: string,
  rule: HarmonyRule = DEFAULT_HARMONY_RULE
): string {
  const rgb = hexToRgb(brandHex);
  if (!rgb) return brandHex;

  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const rotatedHue = (h + HARMONY_ROTATION[rule]) % 360;
  const accentRgb = hslToRgb(rotatedHue, s, l);

  return rgbToHex(accentRgb.r, accentRgb.g, accentRgb.b);
}
