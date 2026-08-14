import type { PaletteShades } from "@/types/colors";

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
