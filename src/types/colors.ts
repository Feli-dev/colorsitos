/**
 * The canonical shade scale, in ascending order.
 *
 * This is the single source of truth for which stops a palette has. It is a
 * runtime value as well as a type so that code needing to iterate the stops in
 * order does not have to restate them.
 */
export const SHADE_STOPS = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const;

export type ShadeStop = (typeof SHADE_STOPS)[number];

/** A complete palette: every stop mapped to a colour. */
export type PaletteShades = Record<ShadeStop, string>;

/**
 * Chakra UI v2 has no 950 stop, so its exporter emits one fewer key than every
 * other target. Deriving it here keeps that difference visible in the type
 * system rather than buried in a filtering step.
 */
export type ChakraV2Shades = Record<Exclude<ShadeStop, 950>, string>;

export interface ColorShade {
  value: number;
  hex: string;
  name: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  shades: ColorShade[];
}

export type PaletteComparison = {
  primary: ColorPalette | null;
  secondary: ColorPalette | null;
};
