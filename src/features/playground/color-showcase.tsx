"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SHADE_STOPS, type ColorPalette } from "@/types/colors";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { ShowcaseButtons } from "./showcase/showcase-buttons";
import { ShowcaseCards } from "./showcase/showcase-cards";
import { ShowcaseForms } from "./showcase/showcase-forms";
import { ShowcaseGuide } from "./showcase/showcase-guide";
import { ShowcaseMisc } from "./showcase/showcase-misc";
import type { ShowcaseShades } from "./showcase/types";

interface ColorShowcaseProps {
  palette: ColorPalette;
}

/**
 * Previews a generated palette across real components.
 *
 * Each section owns its own file and its own local state; this composes them
 * and resolves the palette once so every section indexes the same map.
 */
export function ColorShowcase({ palette }: ColorShowcaseProps) {
  const t = useTranslations("playground");
  const { resolvedTheme } = useTheme();

  const shades: ShowcaseShades = Object.fromEntries(
    SHADE_STOPS.map((stop) => [
      stop,
      palette.shades.find((shade) => shade.value === stop),
    ])
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("showcase.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <ShowcaseButtons shades={shades} resolvedTheme={resolvedTheme} />
        <ShowcaseCards shades={shades} />
        <ShowcaseForms shades={shades} resolvedTheme={resolvedTheme} />
        <ShowcaseMisc shades={shades} resolvedTheme={resolvedTheme} />
        <ShowcaseGuide shades={shades} resolvedTheme={resolvedTheme} />
      </CardContent>
    </Card>
  );
}
