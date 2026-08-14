/**
 * Custom hook for generating random colors and their palette variants.
 * Provides coherent colors for the hero section text with good contrast and accessibility.
 */

import {
  generateAccessibleTextColors,
  type TextColors,
} from "@/utils/text-colors";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Interface defining the colors generated for text rendering.
 * Includes primary, secondary, and palette variants for consistent theming.
 */
/** The shape the hero consumes. Defined in src/utils/text-colors. */
type RandomTextColors = TextColors;



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
    const next = generateAccessibleTextColors();

    if (next) {
      setColors(next);
      return;
    }

    // Every attempt missed the contrast floor; the defaults above still read.
    console.warn(
      "Could not generate colors with good contrast, using default values"
    );
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
  colors: string[]
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
    return createColoredText(text, colorArray);
  };

  return {
    ...colors,
    regenerate: colors.regenerate,
    isDarkTheme,
    createColoredText: createColoredTextFn,
  };
}
