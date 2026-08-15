import type { PaletteShades } from "@/types/colors";
import { getContrastRatio, rgbToHex } from "./color-utils";
import { generateColorPalette } from "./palette-generator";

/** WCAG AA for normal-size text. */
export const CONTRAST_FLOOR = 4.5;

/** How many random colours to try before giving up on the contrast floor. */
export const MAX_ATTEMPTS = 10;

export interface TextColors {
  primary: string;
  secondary: string;
  dark: string;
  light: string;
  palette: PaletteShades;
  /** Light end of the ramp, for use on dark backgrounds. */
  lightColors: string[];
  /** Dark end of the ramp, for use on light backgrounds. */
  darkColors: string[];
}

/**
 * A uniformly random colour across the RGB cube.
 *
 * Distinct from `generateRandomColor` in color-utils, which biases towards
 * vivid hues by generating in HSL. Both existed, under confusingly similar
 * names, in three places.
 */
export function randomHexColor(): string {
  return rgbToHex(
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256)
  );
}

/**
 * Whether a colour clears the contrast floor against at least one of black or
 * white. One of the two is enough — text sits on one background or the other.
 *
 * NOTE: at the AA floor of 4.5 this is always true, so it never rejects
 * anything. The worst possible colour sits at the crossover where both ratios
 * are equal, and that value is
 *
 *   1.05 / sqrt(1.05 * 0.05) = 4.5826
 *
 * which already clears 4.5. Verified by brute-forcing every grey plus 200k
 * random colours: the worst found was #BF42AB at exactly 4.5826.
 *
 * The check is kept rather than deleted because CONTRAST_FLOOR is a knob. Raise
 * it to 7 for AAA and this starts rejecting, at which point the retry loop in
 * generateAccessibleTextColors starts doing real work.
 */
export function meetsContrastFloor(color: string): boolean {
  return (
    getContrastRatio(color, "#FFFFFF") >= CONTRAST_FLOOR ||
    getContrastRatio(color, "#000000") >= CONTRAST_FLOOR
  );
}

/** Maps a generated palette onto the roles the hero text needs. */
export function toTextColors(palette: PaletteShades): TextColors {
  return {
    primary: palette[500],
    secondary: palette[600],
    dark: palette[800],
    light: palette[200],
    palette,
    lightColors: [
      palette[50],
      palette[100],
      palette[200],
      palette[300],
      palette[400],
    ],
    darkColors: [palette[600], palette[700], palette[800], palette[900], palette[950]],
  };
}

/**
 * Draws random base colours until one produces a palette whose 500 stop clears
 * the contrast floor.
 *
 * Returns null rather than throwing when every attempt fails, so the caller
 * decides what to fall back to — the hook keeps its defaults.
 */
export function generateAccessibleTextColors(
  attempts: number = MAX_ATTEMPTS
): TextColors | null {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const palette = generateColorPalette(randomHexColor());
      if (meetsContrastFloor(palette[500])) return toTextColors(palette);
    } catch {
      // A malformed colour just costs one attempt.
    }
  }

  return null;
}
