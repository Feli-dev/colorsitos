/**
 * Custom hook for generating random colors and their palette variants.
 * Provides coherent colors for the hero section text with good contrast and accessibility.
 */

import { rgbToHex } from "@/utils/color-utils";
import { generateColorPalette } from "@/utils/palette-generator";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Interface defining the colors generated for text rendering.
 * Includes primary, secondary, and palette variants for consistent theming.
 */
interface RandomTextColors {
  /** Primary color for main text rendering */
  primary: string;
  /** Secondary color for gradients or accents */
  secondary: string;
  /** Color for dark text when needed */
  dark: string;
  /** Color for light text when needed */
  light: string;
  /** Complete color palette with all shade variations */
  palette: Record<
    50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950,
    string
  >;
  /** Light colors optimized for dark mode backgrounds */
  lightColors: string[];
  /** Dark colors optimized for light mode backgrounds */
  darkColors: string[];
}

/**
 * Generates a random hex color value.
 * @returns Random hex color in #RRGGBB format
 */
function generateRandomHexColor(): string {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return rgbToHex(r, g, b);
}

/**
 * Determines if a color is dark based on its luminance value.
 * Uses the relative luminance formula to calculate perceived brightness.
 * @param hexColor - Color in hex format
 * @returns true if the color is considered dark (luminance < 0.5)
 */
function isDarkColor(hexColor: string): boolean {
  // Convert hex to RGB values
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate luminance using relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance < 0.5;
}

/**
 * Calculates the contrast ratio between two colors using relative luminance formula.
 * Used for accessibility compliance (WCAG guidelines).
 * @param color1 - First color in hex format
 * @param color2 - Second color in hex format
 * @returns Contrast ratio between 1 and 21 (higher is better contrast)
 */
function calculateContrastRatio(color1: string, color2: string): number {
  // Convert hex to RGB values
  const getRGB = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  const [r1, g1, b1] = getRGB(color1);
  const [r2, g2, b2] = getRGB(color2);

  // Calculate relative luminance using WCAG formula
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Hook that generates random colors and their palette variants.
 * Ensures good contrast ratios for accessibility compliance.
 * @returns Object with colors for text rendering and regenerate function
 */
export function useRandomColors(): RandomTextColors & {
  regenerate: () => void;
} {
  const [colors, setColors] = useState<RandomTextColors>({
    primary: "#8B5CF6", // Default primary color (violet)
    secondary: "#3B82F6", // Default secondary color (blue)
    dark: "#1F2937", // Default dark color
    light: "#F9FAFB", // Default light color
    palette: {
      50: "#F9FAFB",
      100: "#F3F4F6",
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#8B5CF6",
      600: "#3B82F6",
      700: "#374151",
      800: "#1F2937",
      900: "#111827",
      950: "#030712",
    },
    lightColors: ["#F9FAFB", "#F3F4F6", "#E5E7EB", "#D1D5DB", "#9CA3AF"],
    darkColors: ["#374151", "#1F2937", "#111827", "#030712"],
  });

  /**
   * Generates new random colors and their variants with good contrast ratios
   */
  const generateNewColors = () => {
    try {
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        // Generate random base color
        const baseColor = generateRandomHexColor();

        // Generate complete palette using existing system
        const palette = generateColorPalette(baseColor);

        // Select appropriate colors from the palette
        const primary = palette[500]; // Base color
        const secondary = palette[600]; // Darker variant
        const dark = palette[800]; // Very dark variant
        const light = palette[200]; // Light variant

        // Check contrast with white and black backgrounds
        const contrastWithWhite = calculateContrastRatio(primary, "#FFFFFF");
        const contrastWithBlack = calculateContrastRatio(primary, "#000000");

        // Ensure contrast ratio is at least 4.5:1 (WCAG AA standard)
        if (contrastWithWhite >= 4.5 || contrastWithBlack >= 4.5) {
          // Separate light colors (for dark mode) and dark colors (for light mode)
          const lightColors = [
            palette[50],
            palette[100],
            palette[200],
            palette[300],
            palette[400],
          ].filter((color) => color !== undefined);

          const darkColors = [
            palette[600],
            palette[700],
            palette[800],
            palette[900],
            palette[950],
          ].filter((color) => color !== undefined);

          setColors({
            primary,
            secondary,
            dark,
            light,
            palette,
            lightColors,
            darkColors,
          });
          return;
        }

        attempts++;
      }

      // If no color with good contrast was found, use default colors
      console.warn(
        "Could not generate colors with good contrast, using default values"
      );
    } catch (error) {
      console.warn(
        "Error generating random colors, using default values:",
        error
      );
      // Keep default colors if there's an error
    }
  };

  /**
   * Public function to regenerate colors with new random values
   */
  const regenerate = () => {
    generateNewColors();
  };

  // Generate initial colors when component mounts
  useEffect(() => {
    generateNewColors();
  }, []);

  return {
    ...colors,
    regenerate,
  };
}

/**
 * Creates a text component with individual colors for each letter.
 * Useful for creating animated colorful text effects.
 * @param text - The text to colorize
 * @param colors - Array of colors to use for each character
 * @param isDarkMode - Whether the app is in dark mode
 * @returns Array of objects containing letter and color pairs
 */
export function createColoredText(
  text: string,
  colors: string[],
  isDarkMode: boolean
): Array<{ letter: string; color: string }> {
  if (!text || colors.length === 0) return [];

  return text.split("").map((letter, index) => ({
    letter,
    color: colors[index % colors.length],
  }));
}

/**
 * Hook that generates random colors optimized for text rendering.
 * Ensures good contrast ratios and readability across different themes.
 */
export function useRandomTextColors(): RandomTextColors & {
  regenerate: () => void;
  isDarkTheme: boolean;
  createColoredText: (
    text: string,
    isDarkMode?: boolean
  ) => Array<{ letter: string; color: string }>;
} {
  const colors = useRandomColors();
  const { resolvedTheme } = useTheme();

  // Determine whether to use dark theme based on system theme
  const isDarkTheme = resolvedTheme === "dark";

  /**
   * Function to create letter-by-letter colored text
   */
  const createColoredTextFn = (text: string, isDarkMode?: boolean) => {
    const useDarkMode = isDarkMode !== undefined ? isDarkMode : isDarkTheme;
    const colorArray = useDarkMode ? colors.lightColors : colors.darkColors;
    return createColoredText(text, colorArray, useDarkMode);
  };

  return {
    ...colors,
    regenerate: colors.regenerate,
    isDarkTheme,
    createColoredText: createColoredTextFn,
  };
}
