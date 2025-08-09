export type PaletteShades = Record<
  50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950,
  string
>;

export function exportTailwindV4CssVars(
  brandKey: string,
  shades: PaletteShades,
  opts?: { prefix?: string; useIndex?: boolean }
): string {
  const base = (opts?.prefix ?? "").trim() || brandKey;
  const keys = Object.keys(shades)
    .map((k) => Number(k))
    .sort((a, b) => a - b) as Array<
    50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950
  >;
  const entries = keys
    .map((k, i) => {
      const name = opts?.useIndex ? `${i + 1}` : `${k}`;
      const v = shades[k];
      return `  --${base}-${name}: ${v};`;
    })
    .join("\n");

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
