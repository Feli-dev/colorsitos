import type { PaletteShades } from "@/types/colors";

/**
 * Split into a fragment (one ramp's named group, no trailing comma of its
 * own) and a wrap (the one `extend.colors` object every fragment sits
 * inside), so a whole-system export (Feature 3) can join several ramps'
 * groups with `",\n"` and wrap them once -- two `extend.colors` keys with
 * the same object literal concatenated directly would be invalid JS/TS.
 * `exportTailwindV3` itself is `wrapTailwindV3(tailwindV3Fragment(...))`,
 * byte-identical to before.
 */
export function tailwindV3Fragment(key: string, shades: PaletteShades): string {
  const entries = Object.entries(shades)
    .map(([k, v]) => `        ${k}: '${v}',`)
    .join("\n");

  return `        ${key}: {
${entries}
        }`;
}

export function wrapTailwindV3(fragment: string): string {
  return `// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
${fragment}
      }
    }
  }
} satisfies Config;`;
}

export function exportTailwindV3(
  brandKey: string,
  shades: PaletteShades
): string {
  return wrapTailwindV3(tailwindV3Fragment(brandKey, shades));
}
