import type { PaletteShades } from "@/types/colors";
import { isLightColor } from "@/utils/color-utils";
import { deriveDestructive } from "@/utils/ramps/destructive-ladder";

/**
 * shadcn/ui exporter — decision D's two seams.
 *
 * `deriveRolesFromSingleRamp` and `renderShadcnTheme` are deliberately
 * separate: the renderer never reads a `PaletteShades` ramp, only a
 * completed `RoleMap`. Feature 3 will add `deriveRolesFromRampSet` as a
 * second deriver reading a multi-ramp `RampSet` instead — the renderer does
 * not change either way.
 *
 * This repo's shadcn contract (`src/app/globals.css`) is the reference for
 * which tokens exist: no `--destructive-foreground` (`button.tsx`/`badge.tsx`
 * hardcode `text-white`), no `--chart-*`/`--sidebar-*` (no consumer for
 * either in this exporter's scope).
 */

export const ROLE_KEYS = [
  "background",
  "foreground",
  "card",
  "cardForeground",
  "popover",
  "popoverForeground",
  "primary",
  "primaryForeground",
  "secondary",
  "secondaryForeground",
  "muted",
  "mutedForeground",
  "accent",
  "accentForeground",
  "destructive",
  "border",
  "input",
  "ring",
] as const;

export type RoleKey = (typeof ROLE_KEYS)[number];

/** One role's colour in each theme mode. */
export interface RoleValue {
  light: string;
  dark: string;
}

/**
 * A complete shadcn semantic role set. Both `deriveRolesFromSingleRamp` (this
 * slice) and the future `deriveRolesFromRampSet` (Feature 3) produce this
 * exact shape, which is all `renderShadcnTheme` ever consumes.
 */
export type RoleMap = Record<RoleKey, RoleValue>;

/** The exact CSS custom-property name for each role, per this repo's contract. */
export const ROLE_CSS_VAR: Record<RoleKey, string> = {
  background: "background",
  foreground: "foreground",
  card: "card",
  cardForeground: "card-foreground",
  popover: "popover",
  popoverForeground: "popover-foreground",
  primary: "primary",
  primaryForeground: "primary-foreground",
  secondary: "secondary",
  secondaryForeground: "secondary-foreground",
  muted: "muted",
  mutedForeground: "muted-foreground",
  accent: "accent",
  accentForeground: "accent-foreground",
  destructive: "destructive",
  border: "border",
  input: "input",
  ring: "ring",
};

/** Picks whichever ramp extreme contrasts best as text on `hex`. */
function foregroundFor(hex: string, shades: PaletteShades): string {
  return isLightColor(hex) ? shades[950] : shades[50];
}

/**
 * Derives a full `RoleMap` from a single brand ramp.
 *
 * Without a distinct neutral ramp (Feature 3), surfaces like `card`/`muted`/
 * `accent` are approximated from the brand ramp's own light and dark stops —
 * the same approximation shadcn's own scaffolded near-grey OKLCH values make
 * for a from-scratch theme. Feature 3's `deriveRolesFromRampSet` replaces
 * these lookups with real derived-neutral/accent ramps without touching
 * `renderShadcnTheme` (decision D).
 */
export function deriveRolesFromSingleRamp(shades: PaletteShades): RoleMap {
  const destructiveHex = deriveDestructive(shades[500]).hex;

  const primaryLight = shades[600];
  const primaryDark = shades[400];

  return {
    background: { light: shades[50], dark: shades[950] },
    foreground: { light: shades[950], dark: shades[50] },
    card: { light: shades[100], dark: shades[900] },
    cardForeground: { light: shades[950], dark: shades[50] },
    popover: { light: shades[100], dark: shades[900] },
    popoverForeground: { light: shades[950], dark: shades[50] },
    primary: { light: primaryLight, dark: primaryDark },
    primaryForeground: {
      light: foregroundFor(primaryLight, shades),
      dark: foregroundFor(primaryDark, shades),
    },
    secondary: { light: shades[200], dark: shades[700] },
    secondaryForeground: { light: shades[900], dark: shades[100] },
    muted: { light: shades[100], dark: shades[800] },
    mutedForeground: { light: shades[600], dark: shades[400] },
    accent: { light: shades[200], dark: shades[700] },
    accentForeground: { light: shades[900], dark: shades[100] },
    destructive: { light: destructiveHex, dark: destructiveHex },
    border: { light: shades[200], dark: shades[800] },
    input: { light: shades[200], dark: shades[800] },
    ring: { light: primaryLight, dark: primaryDark },
  };
}

/** Renders one mode's block body, in `ROLE_KEYS` order. */
function renderBlock(roles: RoleMap, mode: "light" | "dark"): string {
  return ROLE_KEYS.map(
    (key) => `  --${ROLE_CSS_VAR[key]}: ${roles[key][mode]};`
  ).join("\n");
}

/**
 * Renders a shadcn/ui theme (light `:root` + `.dark`) from a `RoleMap`.
 *
 * Pure and ramp-independent: it reads only the `RoleMap` it is given, never
 * a ramp, never any derivation logic — a hand-built `RoleMap` renders exactly
 * the same way as one produced by a deriver (decision D's whole point).
 */
export function renderShadcnTheme(roles: RoleMap): string {
  return `/* globals.css */
:root {
${renderBlock(roles, "light")}
}

.dark {
${renderBlock(roles, "dark")}
}`;
}
