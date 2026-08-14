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
 * Relative luminance at which a colour contrasts equally against white and
 * black, i.e. where the better foreground switches from white to black.
 *
 * Derived rather than chosen. Setting the two WCAG contrast ratios equal,
 *   1.05 / (L + 0.05) = (L + 0.05) / 0.05
 * gives L = sqrt(1.05 * 0.05) - 0.05 ≈ 0.1791.
 *
 * The previous threshold was 0.5, which is the midpoint of *lightness*, not of
 * perceived contrast. It classified anything below half luminance as dark,
 * including colours that plainly read as light — #808080 sits at 0.216.
 */
export const LIGHT_COLOR_LUMINANCE_PIVOT = Math.sqrt(1.05 * 0.05) - 0.05;

/**
 * Determina si un color es claro u oscuro, en el sentido de qué primer plano
 * contrasta mejor sobre él: por encima del pivote gana el negro.
 */
export function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;

  const luminance = getLuminance(rgb);
  return luminance > LIGHT_COLOR_LUMINANCE_PIVOT;
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

/**
 * Normaliza un color hex a formato #RRGGBB en mayúsculas. Lanza error si es inválido.
 */
export function validateHex(input: string): string {
  const raw = (input || "").trim();
  if (raw.length === 0) throw new Error("Invalid hex color");

  const prefixed = raw.startsWith("#") ? raw : `#${raw}`;

  const three = /^#([A-Fa-f0-9]{3})$/;
  const six = /^#([A-Fa-f0-9]{6})$/;

  if (six.test(prefixed)) return prefixed.toUpperCase();

  const m = prefixed.match(three);
  if (m) {
    const [r, g, b] = m[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  throw new Error("Invalid hex color");
}

/**
 * Convierte RGB [0-255] a HSL: h [0-360), s y l en porcentaje [0-100].
 */
export function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    switch (max) {
      case rn:
        h = ((gn - bn) / delta) % 6;
        break;
      case gn:
        h = (bn - rn) / delta + 2;
        break;
      default:
        h = (rn - gn) / delta + 4;
    }
    h = Math.round((h * 60 + 360) % 360);
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return { h, s: s * 100, l: l * 100 };
}

/**
 * Convierte HSL (h en grados [0-360), s y l en porcentaje [0-100]) a RGB [0-255].
 */
export function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  const hn = ((h % 360) + 360) % 360;
  const sn = Math.max(0, Math.min(100, s)) / 100;
  const ln = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1));
  const m = ln - c / 2;

  let rp = 0,
    gp = 0,
    bp = 0;

  if (hn < 60) {
    rp = c;
    gp = x;
    bp = 0;
  } else if (hn < 120) {
    rp = x;
    gp = c;
    bp = 0;
  } else if (hn < 180) {
    rp = 0;
    gp = c;
    bp = x;
  } else if (hn < 240) {
    rp = 0;
    gp = x;
    bp = c;
  } else if (hn < 300) {
    rp = x;
    gp = 0;
    bp = c;
  } else {
    rp = c;
    gp = 0;
    bp = x;
  }

  const r = Math.round((rp + m) * 255);
  const g = Math.round((gp + m) * 255);
  const b = Math.round((bp + m) * 255);

  return { r, g, b };
}

/**
 * Convierte RGB [0-255] a hex #RRGGBB (mayúsculas).
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) =>
    Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Convierte HEX a OKLCH y retorna una cadena CSS oklch(L C H)
 */
export function hexToOklchString(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex.toUpperCase();

  function srgbToLinear(u: number): number {
    const x = u / 255;
    return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  }

  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const b2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.sqrt(a * a + b2 * b2);
  let H = (Math.atan2(b2, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  const fmt = (n: number, d: number) => Number(n.toFixed(d)).toString();
  return `oklch(${fmt(L, 3)} ${fmt(C, 4)} ${fmt(H, 1)})`;
}

export function hexToRgbString(hex: string): string {
  const c = hexToRgb(hex);
  if (!c) return hex.toUpperCase();
  return `rgb(${c.r}, ${c.g}, ${c.b})`;
}

export function hexToHslString(hex: string): string {
  const c = hexToRgb(hex);
  if (!c) return hex.toUpperCase();
  const hsl = rgbToHsl(c.r, c.g, c.b);
  const h = Math.round(hsl.h);
  const s = Math.round(hsl.s);
  const l = Math.round(hsl.l);
  return `hsl(${h} ${s}% ${l}%)`;
}

/**
 * Generates a vibrant random color in hex format
 */
export function generateRandomColor(): string {
  // Generate HSL values that produce vibrant colors
  const h = Math.floor(Math.random() * 360); // Any hue
  const s = Math.floor(Math.random() * 50) + 50; // Saturation between 50-100%
  const l = Math.floor(Math.random() * 40) + 30; // Lightness between 30-70%

  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}
