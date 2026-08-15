import type { ColorPalette, ShadeStop } from "@/types/colors";

/** A palette indexed by stop, with gaps possible if a shade is missing. */
export type ShowcaseShades = Partial<Record<ShadeStop, ColorPalette["shades"][number]>>;

export interface ShowcaseSectionProps {
  shades: ShowcaseShades;
  resolvedTheme: string | undefined;
}
