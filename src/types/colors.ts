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

/**
 * Feature 3 (multi-ramp palette): a full theme is six ramps composed on top
 * of `PaletteShades` above -- that type is unchanged, every existing consumer
 * keeps reading it directly. `brand` is always the user's own input; the
 * other five are derived from it, or pinned to a user override.
 */
export const RAMP_ROLES = [
  "brand",
  "neutral",
  "accent",
  "success",
  "warning",
  "danger",
] as const;

export type RampRole = (typeof RAMP_ROLES)[number];

/** Every role a user can pin/override. `brand` is the input, never pinned. */
export type PinnableRole = Exclude<RampRole, "brand">;

/** How a ramp's base colour was determined. */
export type RampOrigin = "brand" | "derived" | "pinned";

/** One ramp: its role, base colour, full shade scale, and origin. */
export interface Ramp {
  role: RampRole;
  baseHex: string;
  shades: PaletteShades;
  origin: RampOrigin;
}

/** A complete theme: every role mapped to its ramp. */
export type RampSet = Record<RampRole, Ramp>;

/**
 * User-chosen overrides, persisted FLAT (role -> hex), never nested under a
 * `.shades` key -- this shape structurally rules out the
 * `saved.ramps.accent.shades` crash class (decision B', M5).
 */
export type RampPins = Partial<Record<PinnableRole, string>>;
