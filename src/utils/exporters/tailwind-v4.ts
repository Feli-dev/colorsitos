import { SHADE_STOPS, type PaletteShades } from "@/types/colors";

/**
 * Emits a Tailwind v4 theme block.
 *
 * Two details are load-bearing, and getting either wrong produces valid CSS
 * that generates no utilities at all:
 *
 * - `@theme`, not `:root`. Tailwind reads theme variables from this at-rule
 *   specifically; custom properties declared on `:root` are just CSS, and
 *   Tailwind never sees them.
 * - the `--color-*` namespace. That is what turns a variable into the
 *   `bg-*`, `text-*` and `border-*` families; a bare `--brand-500` produces
 *   nothing, whichever at-rule it sits in.
 *
 * Plain `@theme` rather than `@theme inline`, because these are literal colour
 * values. `inline` exists for variables that reference other variables.
 */
export function exportTailwindV4Theme(
  brandKey: string,
  shades: PaletteShades
): string {
  // Iterating SHADE_STOPS rather than sorting Object.keys keeps the ascending
  // order without casting the parsed keys back to stop values.
  const entries = SHADE_STOPS.map(
    (stop) => `  --color-${brandKey}-${stop}: ${shades[stop]};`
  ).join("\n");

  return `/* globals.css */
@import "tailwindcss";

@theme {
${entries}
}`;
}

/**
 * Shows the utilities the theme block generates.
 *
 * Deliberately markup rather than CSS: utility classes are the entire reason
 * to pick the Tailwind export, so an example written in raw `background-color`
 * would demonstrate the one thing this export is not for.
 */
export function exportTailwindV4Usage(brandKey: string): string {
  return `<!-- Usage example (Tailwind v4) -->
<button class="bg-${brandKey}-500 hover:bg-${brandKey}-600 text-white">
  Button
</button>

<p class="text-${brandKey}-700 border-${brandKey}-200">Text and border</p>`;
}
