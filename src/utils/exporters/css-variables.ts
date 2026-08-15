import { SHADE_STOPS, type PaletteShades } from "@/types/colors";

/**
 * Emits the palette as plain CSS custom properties on `:root`.
 *
 * This is what the Tailwind v4 export used to produce. It is genuinely useful
 * — it works in any stylesheet, with or without a framework — but it is not a
 * Tailwind theme and generates no utilities, so it lives here under its own
 * name instead of promising something it cannot deliver.
 */
export function exportCssVariables(
  brandKey: string,
  shades: PaletteShades
): string {
  const entries = SHADE_STOPS.map(
    (stop) => `  --${brandKey}-${stop}: ${shades[stop]};`
  ).join("\n");

  return `/* globals.css */
:root {
${entries}
}`;
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
