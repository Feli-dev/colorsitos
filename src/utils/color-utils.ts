import { ColorPalette } from "@/types/colors";

/**
 * Convierte un color hex a RGB
 */
export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calcula el contraste entre dos colores
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const luminance1 = getLuminance(rgb1);
  const luminance2 = getLuminance(rgb2);

  const brightest = Math.max(luminance1, luminance2);
  const darkest = Math.min(luminance1, luminance2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Calcula la luminancia de un color RGB
 */
function getLuminance({
  r,
  g,
  b,
}: {
  r: number;
  g: number;
  b: number;
}): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Determina si un color es claro u oscuro
 */
export function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;

  const luminance = getLuminance(rgb);
  return luminance > 0.5;
}

/**
 * Crea una nueva paleta de colores
 */
export function createColorPalette(
  id: string,
  name: string,
  shades: Array<{ value: number; hex: string }>
): ColorPalette {
  return {
    id,
    name,
    shades: shades.map((shade) => ({
      ...shade,
      name: `${id}-${shade.value}`,
    })),
  };
}

/**
 * Valida si un color hex es válido
 */
export function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}
