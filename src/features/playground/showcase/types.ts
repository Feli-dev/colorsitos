import type { ColorPalette, ShadeStop } from "@/types/colors";
import type { CSSProperties } from "react";

/** A palette indexed by stop, with gaps possible if a shade is missing. */
export type ShowcaseShades = Partial<Record<ShadeStop, ColorPalette["shades"][number]>>;

export interface ShowcaseSectionProps {
  shades: ShowcaseShades;
  resolvedTheme: string | undefined;
}

/**
 * Inline styles that may carry CSS custom properties.
 *
 * React's CSSProperties has no index signature for `--*`, so setting one is a
 * type error. This widens it precisely rather than suppressing the error —
 * which matters, because the previous attempt at theming these controls used
 * `@ts-expect-error` and the properties it set were never read by anything.
 */
export type StyleWithVars = CSSProperties &
  Record<`--${string}`, string | undefined>;

/**
 * Palette colours for the controls that shadcn primitives style through their
 * own tokens — slider, switch, progress. Consumed by Tailwind arbitrary
 * variants on each component, so the class names stay statically analysable and
 * only the values vary.
 */
export function controlVars(
  shades: ShowcaseShades,
  isDark: boolean
): StyleWithVars {
  return {
    "--pg-accent": shades[500]?.hex,
    "--pg-track": (isDark ? shades[800] : shades[200])?.hex,
    "--pg-muted": (isDark ? shades[700] : shades[300])?.hex,
  };
}
