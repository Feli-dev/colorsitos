import type { PaletteShades } from "@/types/colors";
import chroma from "chroma-js";
import { Hsluv } from "hsluv";
import { validateHex } from "./color-utils";

/**
 * Color Palette Generator
 *
 * Utility for generating color palettes from base colors using advanced algorithms.
 * This module provides functions to create cohesive color schemes for theme customization.
 *
 * Features:
 * - Support for linear and perceived color modes
 * - Configurable hue, saturation, and lightness tweaks
 * - Better handling of grayscale colors
 * - Improved interpolation for lightness distribution
 *
 * @example
 * ```typescript
 * import { generateColorPalette } from './palette-generator';
 *
 * const palette = generateColorPalette('#3182ce');
 * console.log(palette[500]); // '#3182CE' (base color)
 * console.log(palette[50]);  // Light shade
 * console.log(palette[900]); // Dark shade
 * ```
 */

// Configuration for palette generation
export interface PaletteConfig {
  value: string; // Hex color value without #
  valueStop: number; // The stop where the base color should appear (typically 500)
  colorMode?: "linear" | "perceived"; // Color space to use
  h?: number; // Hue tweak multiplier
  s?: number; // Saturation tweak multiplier
  lMin?: number; // Minimum lightness (0-100)
  lMax?: number; // Maximum lightness (0-100)
}

export interface SwatchValue {
  stop: number;
  hex: string;
  h: number;
  hScale: number;
  s: number;
  sScale: number;
  l: number;
}

// Default configuration matching tints-dev behavior
const DEFAULT_PALETTE_CONFIG: Required<PaletteConfig> = {
  value: "",
  valueStop: 500,
  colorMode: "perceived",
  h: 0,
  s: 0,
  lMin: 0,
  lMax: 100,
};

/**
 * Creates swatches using advanced color generation algorithm based on tints-dev
 */
function createSwatches(palette: PaletteConfig): SwatchValue[] {
  const config = {
    ...DEFAULT_PALETTE_CONFIG,
    ...palette,
  };

  const { value, valueStop } = config;

  // Tweaks may be passed in, otherwise use defaults
  const colorMode = config.colorMode ?? DEFAULT_PALETTE_CONFIG.colorMode;
  const h = config.h ?? DEFAULT_PALETTE_CONFIG.h;
  const s = config.s ?? DEFAULT_PALETTE_CONFIG.s;
  const lMin = config.lMin ?? DEFAULT_PALETTE_CONFIG.lMin;
  const lMax = config.lMax ?? DEFAULT_PALETTE_CONFIG.lMax;

  // All available stops (including 0 and 1000 for calculation)
  const allStops = [
    0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000,
  ];

  // Create base color from input
  const baseColor = chroma(`#${value}`);
  const [baseH, baseS, baseL] = baseColor.hsl();

  // Handle grayscale colors (NaN hue) by setting a default hue
  const normalizedBaseH = isNaN(baseH) ? 0 : baseH;

  // 1. Create hue scale
  const valueStopIndex = allStops.indexOf(valueStop);
  if (valueStopIndex === -1) {
    throw new Error(`Invalid valueStop: ${valueStop}`);
  }

  const hueScale = allStops.map((stop) => {
    const stopIndex = allStops.indexOf(stop);
    const diff = Math.abs(stopIndex - valueStopIndex);
    const tweakValue = h ? diff * h : 0;
    return { stop, tweak: tweakValue };
  });

  // 2. Create saturation scale
  const saturationScale = allStops.map((stop) => {
    const stopIndex = allStops.indexOf(stop);
    const diff = Math.abs(stopIndex - valueStopIndex);
    const tweakValue = s ? Math.round((diff + 1) * s * (1 + diff / 10)) : 0;
    return { stop, tweak: Math.min(tweakValue, 100) };
  });

  // 3. Create lightness distribution
  const hsluv = new Hsluv();
  hsluv.hex = `#${value}`;
  hsluv.hexToHsluv();

  const lightnessValue = colorMode === "linear" ? baseL * 100 : hsluv.hsluv_l;

  // Create the three anchor points
  const distributionAnchors = [
    { stop: 0, tweak: lMax },
    { stop: valueStop, tweak: lightnessValue },
    { stop: 1000, tweak: lMin },
  ];

  // Interpolate for missing stops
  const distributionScale = allStops.map((stop) => {
    // If it's an anchor point, use the anchor value
    const anchor = distributionAnchors.find((a) => a.stop === stop);
    if (anchor) {
      return anchor;
    }

    // Otherwise interpolate between anchor points
    let leftAnchor, rightAnchor;

    if (stop < valueStop) {
      leftAnchor = distributionAnchors[0]; // stop 0
      rightAnchor = distributionAnchors[1]; // valueStop
    } else {
      leftAnchor = distributionAnchors[1]; // valueStop
      rightAnchor = distributionAnchors[2]; // stop 1000
    }

    // Linear interpolation
    const range = rightAnchor.stop - leftAnchor.stop;
    const position = stop - leftAnchor.stop;
    const ratio = position / range;
    const tweak =
      leftAnchor.tweak + (rightAnchor.tweak - leftAnchor.tweak) * ratio;

    return { stop, tweak: Math.round(tweak) };
  });

  const swatches = allStops.map((stop, stopIndex) => {
    if (stop === valueStop) {
      // Preserve exact input color
      const inputColor = chroma(`#${value.toUpperCase()}`);
      const [finalH, finalS, finalL] = inputColor.hsl();

      return {
        stop,
        hex: `#${value.toUpperCase()}`,
        h: isNaN(finalH) ? 0 : finalH,
        hScale: 0,
        s: isNaN(finalS) ? 0 : finalS * 100,
        sScale: (isNaN(finalS) ? 0 : finalS * 100) - 50,
        l: isNaN(finalL) ? 0 : finalL * 100,
      };
    }

    // Get tweaks for this stop
    const hTweak = hueScale[stopIndex].tweak;
    const sTweak = saturationScale[stopIndex].tweak;
    const lTweak = distributionScale[stopIndex].tweak;

    let newColor: chroma.Color;

    if (colorMode === "linear") {
      // Direct HSL manipulation for linear mode
      const newH = (normalizedBaseH + hTweak) % 360;
      const newS = Math.max(0, Math.min(100, baseS * 100 + sTweak));
      const newL = Math.max(0, Math.min(100, lTweak));

      newColor = chroma.hsl(newH, newS / 100, newL / 100);
    } else {
      // HSLuv for perceived mode
      const hsluv = new Hsluv();
      hsluv.hex = `#${value}`;
      hsluv.hexToHsluv();

      // Handle grayscale colors in HSLuv (NaN hue)
      const normalizedHsluvH = isNaN(hsluv.hsluv_h) ? 0 : hsluv.hsluv_h;
      const newHsluvH = (normalizedHsluvH + hTweak) % 360;
      const newHsluvS = Math.max(0, Math.min(100, hsluv.hsluv_s + sTweak));
      const newHsluvL = Math.max(0, Math.min(100, lTweak));

      hsluv.hsluv_h = newHsluvH;
      hsluv.hsluv_s = newHsluvS;
      hsluv.hsluv_l = newHsluvL;
      hsluv.hsluvToHex();

      newColor = chroma(hsluv.hex);
    }

    const [finalH, finalS, finalL] = newColor.hsl();

    return {
      stop,
      hex: newColor.hex().toUpperCase(),
      h: isNaN(finalH) ? 0 : finalH,
      hScale: ((((hTweak + 180) % 360) - 180) / 180) * 50,
      s: isNaN(finalS) ? 0 : finalS * 100,
      sScale: (isNaN(finalS) ? 0 : finalS * 100) - 50,
      l: isNaN(finalL) ? 0 : finalL * 100,
    };
  });

  return swatches;
}

/**
 * Generates a complete color palette from a base color using advanced algorithm.
 *
 * This new implementation uses the tints-dev algorithm which provides:
 * - Better color interpolation
 * - Support for HSLuv color space (perceived mode)
 * - Configurable hue, saturation, and lightness tweaks
 * - Improved handling of grayscale colors
 *
 * @param baseHex The base hex color (with or without #)
 * @param options Configuration options for palette generation
 * @returns Complete color palette with all standard shades
 * @throws Error if the hex color is invalid or generation fails
 */
function generateColorPalette(
  baseHex: string,
  options?: Partial<PaletteConfig>
): PaletteShades {
  try {
    const hex = validateHex(baseHex);
    const config: PaletteConfig = {
      value: hex.replace("#", ""),
      valueStop: 500,
      ...options,
    };

    const swatches = createSwatches(config);

    // Convert swatches to the expected format for colorsitos
    const palette: PaletteShades = {
      50: swatches.find((s) => s.stop === 50)?.hex || "#FFFFFF",
      100: swatches.find((s) => s.stop === 100)?.hex || "#FFFFFF",
      200: swatches.find((s) => s.stop === 200)?.hex || "#FFFFFF",
      300: swatches.find((s) => s.stop === 300)?.hex || "#FFFFFF",
      400: swatches.find((s) => s.stop === 400)?.hex || "#FFFFFF",
      500: swatches.find((s) => s.stop === 500)?.hex || hex,
      600: swatches.find((s) => s.stop === 600)?.hex || "#000000",
      700: swatches.find((s) => s.stop === 700)?.hex || "#000000",
      800: swatches.find((s) => s.stop === 800)?.hex || "#000000",
      900: swatches.find((s) => s.stop === 900)?.hex || "#000000",
      950: swatches.find((s) => s.stop === 950)?.hex || "#000000",
    };

    return palette;
  } catch (error) {
    throw new Error(
      `generatePalette error: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export { createSwatches, generateColorPalette };
