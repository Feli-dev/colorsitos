"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { controlVars, type ShowcaseSectionProps } from "./types";

export function ShowcaseMisc({ shades, resolvedTheme }: ShowcaseSectionProps) {
  const t = useTranslations("playground");
  const [progress] = useState(33);
  const vars = controlVars(shades, resolvedTheme === "dark");

  return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t("showcase.misc.title")}</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              style={{
                color:
                  resolvedTheme === "dark"
                    ? shades[200]?.hex
                    : shades[700]?.hex,
              }}
              className="text-sm font-medium"
            >
              {t("showcase.misc.progress.label")}
            </label>
            <Progress
              value={progress}
              style={vars}
              className="w-full bg-[var(--pg-track)] [&>*]:bg-[var(--pg-accent)]"
            />
            <div
              className="flex justify-between text-sm"
              style={{
                color:
                  resolvedTheme === "dark" ? shades[300]?.hex : undefined,
              }}
            >
              <span>0%</span>
              <span>{progress}%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="space-y-2">
            <label
              style={{
                color:
                  resolvedTheme === "dark"
                    ? shades[200]?.hex
                    : shades[700]?.hex,
              }}
              className="text-sm font-medium"
            >
              {t("showcase.misc.badges.label")}
            </label>
            <div className="flex flex-wrap gap-2">
              <Badge
                style={{
                  backgroundColor: shades[500]?.hex,
                  color: "white",
                }}
              >
                {t("showcase.misc.badges.primary")}
              </Badge>
              <Badge
                variant="secondary"
                style={{
                  backgroundColor: shades[200]?.hex,
                  color: shades[800]?.hex,
                }}
              >
                {t("showcase.misc.badges.secondary")}
              </Badge>
              <Badge
                variant="outline"
                style={{
                  borderColor: shades[300]?.hex,
                  color:
                    resolvedTheme === "dark"
                      ? shades[50]?.hex
                      : shades[700]?.hex,
                }}
                className="border-2"
              >
                {t("showcase.misc.badges.outline")}
              </Badge>
            </div>
          </div>
        </div>
      </div>
  );
}
