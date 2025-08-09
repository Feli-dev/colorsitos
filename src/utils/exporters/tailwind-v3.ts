export type PaletteShades = Record<
  50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950,
  string
>;

export function exportTailwindV3(
  brandKey: string,
  shades: PaletteShades
): string {
  const entries = Object.entries(shades)
    .map(([k, v]) => `        ${k}: '${v}',`)
    .join("\n");

  return `// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ${brandKey}: {
${entries}
        }
      }
    }
  }
} satisfies Config;`;
}
