import { SHADE_STOPS, type PaletteShades } from "@/types/colors";

export function exportTailwindV4CssVars(
  brandKey: string,
  shades: PaletteShades,
  opts?: { prefix?: string; useIndex?: boolean }
): string {
  const base = (opts?.prefix ?? "").trim() || brandKey;

  // Iterating SHADE_STOPS rather than sorting Object.keys keeps the ascending
  // order without casting the parsed keys back to stop values.
  const entries = SHADE_STOPS.map((stop, i) => {
    const name = opts?.useIndex ? `${i + 1}` : `${stop}`;
    return `  --${base}-${name}: ${shades[stop]};`;
  }).join("\n");

  return `/* globals.css */
:root {
${entries}
}`;
}

export function exportTailwindV4Usage(brandKey: string): string {
  return `/* Usage example (Tailwind v4) */
.btn-brand {
  background-color: var(--${brandKey}-500);
  color: white;
}

.btn-brand:hover {
  background-color: var(--${brandKey}-600);
}`;
}
