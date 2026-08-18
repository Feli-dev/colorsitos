import { SHADE_STOPS, type PaletteShades } from "@/types/colors";

/**
 * Emits the palette as plain CSS custom properties on `:root`.
 *
 * This is what the Tailwind v4 export used to produce. It is genuinely useful
 * — it works in any stylesheet, with or without a framework — but it is not a
 * Tailwind theme and generates no utilities, so it lives here under its own
 * name instead of promising something it cannot deliver.
 *
 * Split into a fragment (the variable lines for one ramp) and a wrap (the
 * one-and-only `:root` block every fragment sits inside) so a whole-system
 * export (Feature 3) can join several ramps' fragments and wrap them once --
 * two `:root` blocks would be redundant, conflict-prone CSS.
 * `exportCssVariables` itself is `wrapCssVariables(cssVariablesFragment(...))`,
 * byte-identical to before.
 */
export function cssVariablesFragment(key: string, shades: PaletteShades): string {
  return SHADE_STOPS.map(
    (stop) => `  --${key}-${stop}: ${shades[stop]};`
  ).join("\n");
}

export function wrapCssVariables(fragment: string): string {
  return `/* globals.css */
:root {
${fragment}
}`;
}

export function exportCssVariables(
  brandKey: string,
  shades: PaletteShades
): string {
  return wrapCssVariables(cssVariablesFragment(brandKey, shades));
}

export function exportCssVariablesUsage(brandKey: string): string {
  return `/* Usage example */
.btn-${brandKey} {
  background-color: var(--${brandKey}-500);
  color: white;
}

.btn-${brandKey}:hover {
  background-color: var(--${brandKey}-600);
}`;
}
