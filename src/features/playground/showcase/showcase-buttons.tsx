"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import type { ShowcaseSectionProps } from "./types";

export function ShowcaseButtons({ shades, resolvedTheme }: ShowcaseSectionProps) {
  const t = useTranslations("playground");

  return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {t("showcase.buttons.title")}
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button
            style={{
              backgroundColor: shades[500]?.hex,
              borderColor: shades[600]?.hex,
            }}
            className="text-white hover:opacity-90"
          >
            {t("showcase.buttons.primary")}
          </Button>
          <Button
            variant="outline"
            style={{
              borderColor: shades[300]?.hex,
              color:
                resolvedTheme === "dark" ? shades[50]?.hex : shades[700]?.hex,
            }}
            className="border-2"
          >
            {t("showcase.buttons.secondary")}
          </Button>
          <Button
            variant="ghost"
            style={{
              color:
                resolvedTheme === "dark"
                  ? shades[100]?.hex
                  : shades[700]?.hex,
            }}
          >
            {t("showcase.buttons.ghost")}
          </Button>
          <Button
            variant="link"
            style={{
              color:
                resolvedTheme === "dark"
                  ? shades[100]?.hex
                  : shades[700]?.hex,
            }}
          >
            {t("showcase.buttons.link")}
          </Button>
        </div>
      </div>
  );
}
