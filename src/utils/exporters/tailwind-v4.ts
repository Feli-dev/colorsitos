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
 *
 * Split into a fragment (the variable lines for one ramp) and a wrap (the
 * one-and-only `@theme` block every fragment sits inside) so a whole-system
 * export (Feature 3) can join several ramps' fragments and wrap them once --
 * two `@theme` blocks would be invalid CSS. `exportTailwindV4Theme` itself is
 * `wrapTailwindV4Theme(tailwindV4Fragment(...))`, byte-identical to before.
 */
export function tailwindV4Fragment(key: string, shades: PaletteShades): string {
  // Iterating SHADE_STOPS rather than sorting Object.keys keeps the ascending
  // order without casting the parsed keys back to stop values.
  return SHADE_STOPS.map(
    (stop) => `  --color-${key}-${stop}: ${shades[stop]};`
  ).join("\n");
}

export function wrapTailwindV4Theme(fragment: string): string {
  return `/* globals.css */
@import "tailwindcss";

@theme {
${fragment}
}`;
}

export function exportTailwindV4Theme(
  brandKey: string,
  shades: PaletteShades
): string {
  return wrapTailwindV4Theme(tailwindV4Fragment(brandKey, shades));
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
