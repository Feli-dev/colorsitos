import type { ColorShade, PaletteShades } from "@/types/colors";

/**
 * Builds a complete PaletteShades from a ColorShade list.
 *
 * `ColorShade.value` is a plain number, so indexing a PaletteShades with it
 * cannot be verified by the compiler. Callers used to bridge that with a
 * `@ts-expect-error` on the accumulator; naming every stop here instead keeps
 * the conversion checked, and adding a stop to SHADE_STOPS turns the omission
 * into a compile error rather than a missing key at runtime.
 *
 * @param shades Shades to read from. Order does not matter.
 * @param fallback Value for a stop the list does not cover.
 */
export function toPaletteShades(
  shades: readonly ColorShade[],
  fallback = ""
): PaletteShades {
  const at = (stop: number): string =>
    shades.find((shade) => shade.value === stop)?.hex ?? fallback;

  return {
    50: at(50),
    100: at(100),
    200: at(200),
    300: at(300),
    400: at(400),
    500: at(500),
    600: at(600),
    700: at(700),
    800: at(800),
    900: at(900),
    950: at(950),
  };
}
