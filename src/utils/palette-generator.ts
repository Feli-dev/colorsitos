import {
  hexToRgb,
  hslToRgb,
  rgbToHex,
  rgbToHsl,
  validateHex,
} from "./color-utils";

/**
 * Color Palette Generator
 *
 * Utility for generating color palettes from base colors. This module provides functions to create
 * cohesive color schemes for theme customization.
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

/**
 * Color type definitions based on hue ranges in HSL color space. Each range maps to a specific
 * color family for palette generation.
 */
const COLOR_RANGES = [
  { min: 0, max: 15, type: "red" },
  { min: 15, max: 42, type: "orange" },
  { min: 42, max: 90, type: "yellow" },
  { min: 90, max: 150, type: "green" },
  { min: 150, max: 210, type: "cyan" },
  { min: 210, max: 270, type: "blue" },
  { min: 270, max: 315, type: "purple" },
  { min: 315, max: 360, type: "pink" },
] as const;

/**
 * Shade configuration for each color type. Contains lightness targets, saturation multipliers, and
 * hue shifts to generate harmonious color palettes.
 *
 * @description Each color type has different characteristics:
 * - targetL: Target lightness percentage (null means use base color lightness)
 * - sMultiplier: Saturation multiplier to adjust color intensity
 * - hShift: Hue shift in degrees to create color harmony
 */
const SHADE_CONFIGS: Record<
  string,
  Record<
    number,
    { targetL: number | null; sMultiplier: number; hShift: number }
  >
> = {
  red: {
    50: { targetL: 98, sMultiplier: 0.4, hShift: 3 },
    100: { targetL: 95, sMultiplier: 0.55, hShift: 2 },
    200: { targetL: 89, sMultiplier: 0.7, hShift: 1 },
    300: { targetL: 76, sMultiplier: 0.85, hShift: 0.5 },
    400: { targetL: 66, sMultiplier: 0.95, hShift: 0 },
    500: { targetL: null, sMultiplier: 1.0, hShift: 0 },
    600: { targetL: 48, sMultiplier: 1.05, hShift: -1 },
    700: { targetL: 38, sMultiplier: 1.1, hShift: -2 },
    800: { targetL: 31, sMultiplier: 1.05, hShift: -3 },
    900: { targetL: 26, sMultiplier: 1.0, hShift: -4 },
    950: { targetL: 15, sMultiplier: 0.9, hShift: -5 },
  },

  orange: {
    50: { targetL: 96, sMultiplier: 1.0, hShift: 8 },
    100: { targetL: 92, sMultiplier: 1.0, hShift: 9 },
    200: { targetL: 83, sMultiplier: 1.0, hShift: 7 },
    300: { targetL: 72, sMultiplier: 1.0, hShift: 6 },
    400: { targetL: 61, sMultiplier: 1.0, hShift: 2 },
    500: { targetL: null, sMultiplier: 1.0, hShift: 0 },
    600: { targetL: 48, sMultiplier: 0.95, hShift: -4 },
    700: { targetL: 40, sMultiplier: 0.93, hShift: -7 },
    800: { targetL: 34, sMultiplier: 0.84, hShift: -9 },
    900: { targetL: 28, sMultiplier: 0.79, hShift: -9 },
    950: { targetL: 18, sMultiplier: 0.72, hShift: -10 },
  },

  yellow: {
    50: { targetL: 96, sMultiplier: 1.0, hShift: 8 },
    100: { targetL: 89, sMultiplier: 1.0, hShift: 6 },
    200: { targetL: 78, sMultiplier: 1.0, hShift: 9 },
    300: { targetL: 67, sMultiplier: 1.0, hShift: 7 },
    400: { targetL: 56, sMultiplier: 1.0, hShift: 5 },
    500: { targetL: null, sMultiplier: 1.0, hShift: 0 },
    600: { targetL: 47, sMultiplier: 1.0, hShift: -5 },
    700: { targetL: 40, sMultiplier: 1.0, hShift: -12 },
    800: { targetL: 34, sMultiplier: 0.9, hShift: -15 },
    900: { targetL: 28, sMultiplier: 0.85, hShift: -16 },
    950: { targetL: 19, sMultiplier: 0.75, hShift: -18 },
  },

  green: {
    50: { targetL: 96, sMultiplier: 0.8, hShift: -8 },
    100: { targetL: 90, sMultiplier: 0.95, hShift: -10 },
    200: { targetL: 80, sMultiplier: 0.9, hShift: -8 },
    300: { targetL: 67, sMultiplier: 0.85, hShift: -4 },
    400: { targetL: 52, sMultiplier: 0.64, hShift: -2 },
    500: { targetL: null, sMultiplier: 1.0, hShift: 0 },
    600: { targetL: 30, sMultiplier: 1.11, hShift: 1 },
    700: { targetL: 24, sMultiplier: 1.11, hShift: 2 },
    800: { targetL: 20, sMultiplier: 1.05, hShift: 3 },
    900: { targetL: 17, sMultiplier: 1.0, hShift: 4 },
    950: { targetL: 10, sMultiplier: 0.9, hShift: 5 },
  },

  cyan: {
    50: { targetL: 96, sMultiplier: 0.8, hShift: -8 },
    100: { targetL: 90, sMultiplier: 0.95, hShift: -10 },
    200: { targetL: 80, sMultiplier: 0.9, hShift: -8 },
    300: { targetL: 67, sMultiplier: 0.85, hShift: -4 },
    400: { targetL: 52, sMultiplier: 0.64, hShift: -2 },
    500: { targetL: null, sMultiplier: 1.0, hShift: 0 },
    600: { targetL: 30, sMultiplier: 1.11, hShift: 1 },
    700: { targetL: 24, sMultiplier: 1.11, hShift: 2 },
    800: { targetL: 20, sMultiplier: 1.05, hShift: 3 },
    900: { targetL: 17, sMultiplier: 1.0, hShift: 4 },
    950: { targetL: 10, sMultiplier: 0.9, hShift: 5 },
  },

  blue: {
    50: { targetL: 98, sMultiplier: 0.35, hShift: 2 },
    100: { targetL: 94, sMultiplier: 0.55, hShift: 1.5 },
    200: { targetL: 87, sMultiplier: 0.75, hShift: 1 },
    300: { targetL: 78, sMultiplier: 1.06, hShift: 0.5 },
    400: { targetL: 64, sMultiplier: 0.98, hShift: 0 },
    500: { targetL: null, sMultiplier: 1.0, hShift: 0 },
    600: { targetL: 46, sMultiplier: 1.03, hShift: -0.9 },
    700: { targetL: 37, sMultiplier: 1.07, hShift: -1.9 },
    800: { targetL: 31, sMultiplier: 1.03, hShift: -2.9 },
    900: { targetL: 26, sMultiplier: 1.0, hShift: -3.8 },
    950: { targetL: 15, sMultiplier: 0.92, hShift: -4.5 },
  },

  purple: {
    50: { targetL: 97, sMultiplier: 0.4, hShift: 4 },
    100: { targetL: 93, sMultiplier: 0.6, hShift: 3 },
    200: { targetL: 87, sMultiplier: 0.8, hShift: 2 },
    300: { targetL: 82, sMultiplier: 1.1, hShift: 1 },
    400: { targetL: 65, sMultiplier: 0.98, hShift: 0.5 },
    500: { targetL: null, sMultiplier: 1.0, hShift: 0 },
    600: { targetL: 45, sMultiplier: 1.02, hShift: 0 },
    700: { targetL: 37, sMultiplier: 1.05, hShift: -1 },
    800: { targetL: 31, sMultiplier: 1.02, hShift: -2 },
    900: { targetL: 26, sMultiplier: 0.98, hShift: -2.5 },
    950: { targetL: 15, sMultiplier: 0.9, hShift: -3 },
  },

  gray: {
    50: { targetL: 98, sMultiplier: 0.15, hShift: 0 },
    100: { targetL: 95, sMultiplier: 0.25, hShift: 0 },
    200: { targetL: 89, sMultiplier: 0.35, hShift: 0 },
    300: { targetL: 81, sMultiplier: 0.45, hShift: 0 },
    400: { targetL: 64, sMultiplier: 0.6, hShift: 0 },
    500: { targetL: null, sMultiplier: 1.0, hShift: 0 },
    600: { targetL: 40, sMultiplier: 0.9, hShift: 0 },
    700: { targetL: 30, sMultiplier: 0.8, hShift: 0 },
    800: { targetL: 21, sMultiplier: 0.7, hShift: 0 },
    900: { targetL: 14, sMultiplier: 0.6, hShift: 0 },
    950: { targetL: 8, sMultiplier: 0.5, hShift: 0 },
  },

  pink: {
    50: { targetL: 97, sMultiplier: 0.4, hShift: 4 },
    100: { targetL: 93, sMultiplier: 0.6, hShift: 3 },
    200: { targetL: 87, sMultiplier: 0.8, hShift: 2 },
    300: { targetL: 75, sMultiplier: 0.9, hShift: 1 },
    400: { targetL: 65, sMultiplier: 0.98, hShift: 0.5 },
    500: { targetL: null, sMultiplier: 1.0, hShift: 0 },
    600: { targetL: 45, sMultiplier: 1.02, hShift: 0 },
    700: { targetL: 37, sMultiplier: 1.05, hShift: -1 },
    800: { targetL: 31, sMultiplier: 1.02, hShift: -2 },
    900: { targetL: 26, sMultiplier: 0.98, hShift: -2.5 },
    950: { targetL: 15, sMultiplier: 0.9, hShift: -3 },
  },
};

/** Saturation threshold below which a color is considered grayscale */
const GRAY_SATURATION_THRESHOLD = 15;

/** The base shade (500) represents the input color without modifications */
const BASE_SHADE = 500;

/** Default color type used when hue doesn't match any defined range */
const DEFAULT_COLOR_TYPE = "pink";

// Helper functions

/**
 * Determines the color type based on HSL hue and saturation values. Used to select appropriate
 * shade configurations for palette generation.
 *
 * @param {number} hue HSL hue value (0-360)
 * @param {number} saturation HSL saturation value (0-100)
 * @returns Color type string ('red', 'blue', 'green', etc.)
 * @example
 * ```typescript
 * getColorType(0, 80); // 'red'
 * getColorType(240, 90); // 'blue'
 * getColorType(120, 5); // 'gray' (low saturation)
 * ```
 */
function getColorType(hue: number, saturation: number): string {
  const isGray = saturation < GRAY_SATURATION_THRESHOLD;
  if (isGray) return "gray";

  const normalizedHue = ((hue % 360) + 360) % 360;

  const colorType = COLOR_RANGES.find(
    (range) => normalizedHue >= range.min && normalizedHue < range.max
  )?.type;

  return colorType || DEFAULT_COLOR_TYPE;
}

/**
 * Retrieves shade configuration for a specific color type.
 *
 * @param {string} colorType The color type ('red', 'blue', 'green', etc.)
 * @returns Configuration object for generating color shades
 */
function getColorSpecificConfig(colorType: string) {
  return SHADE_CONFIGS[colorType] || SHADE_CONFIGS[DEFAULT_COLOR_TYPE];
}

/**
 * Generates a specific shade color based on base HSL values and configuration.
 *
 * @param {number} shade The shade number (50, 100, 200, etc.)
 * @param {{ h: number; s: number; l: number }} baseHsl Base color in HSL format
 * @param {number} baseHsl.h Base color in HSL format hue
 * @param {number} baseHsl.s Base color in HSL format saturation
 * @param {number} baseHsl.l Base color in HSL format lightness
 * @param {{ targetL: number | null; sMultiplier: number; hShift: number }} config Shade
 * @param {number | null} config.targetL Target lightness (null means use base color lightness)
 * @param {number} config.sMultiplier Saturation multiplier to adjust color intensity
 * @param {number} config.hShift Hue shift in degrees to create color harmony
 * @returns Generated color as hexadecimal string
 */
function generateShadeColor(
  shade: number,
  baseHsl: { h: number; s: number; l: number },
  config: { targetL: number | null; sMultiplier: number; hShift: number }
): string {
  const newS = baseHsl.s * config.sMultiplier;
  const newH = (baseHsl.h + config.hShift + 360) % 360;
  const newL = config.targetL !== null ? config.targetL : baseHsl.l;
  const newRgb = hslToRgb(newH, newS, newL);

  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Generates a complete color palette from a base color.
 *
 * The function creates a full spectrum of color shades (50-900) based on the input color. The base
 * color is used as the 500 shade, and other shades are generated using color-specific algorithms
 * that maintain visual harmony and accessibility.
 *
 * @param {string} baseHex The base hex color (used as 500 shade)
 * @returns Complete color palette with all standard shades
 * @throws Error if the hex color is invalid or generation fails
 * @example
 * ```typescript
 * const palette = generateColorPalette('#3182ce');
 * // Returns:
 * // {
 * //   50: '#ebf8ff',
 * //   100: '#bee3f8',
 * //   200: '#90cdf4',
 * //   300: '#63b3ed',
 * //   400: '#4299e1',
 * //   500: '#3182ce', // base color
 * //   600: '#2b77cb',
 * //   700: '#2c5aa0',
 * //   800: '#2a4365',
 * //   900: '#1a365d'
 * // }
 * ```
 */
function generateColorPalette(
  baseHex: string
): Record<
  50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950,
  string
> {
  try {
    const hex = validateHex(baseHex);
    const rgb = hexToRgb(hex);
    if (!rgb) throw new Error("Invalid hex color");
    const baseHsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const colorType = getColorType(baseHsl.h, baseHsl.s);
    const shadeConfigs = getColorSpecificConfig(colorType);

    return {
      50: generateShadeColor(50, baseHsl, shadeConfigs[50]),
      100: generateShadeColor(100, baseHsl, shadeConfigs[100]),
      200: generateShadeColor(200, baseHsl, shadeConfigs[200]),
      300: generateShadeColor(300, baseHsl, shadeConfigs[300]),
      400: generateShadeColor(400, baseHsl, shadeConfigs[400]),
      500: hex,
      600: generateShadeColor(600, baseHsl, shadeConfigs[600]),
      700: generateShadeColor(700, baseHsl, shadeConfigs[700]),
      800: generateShadeColor(800, baseHsl, shadeConfigs[800]),
      900: generateShadeColor(900, baseHsl, shadeConfigs[900]),
      950: generateShadeColor(950, baseHsl, shadeConfigs[950]),
    };
  } catch (error) {
    throw new Error(
      `generatePalette error: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export { generateColorPalette };
