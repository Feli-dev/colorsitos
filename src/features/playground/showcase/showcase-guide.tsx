"use client";


import { useTranslations } from "next-intl";
import type { ShowcaseSectionProps } from "./types";

export function ShowcaseGuide({ shades, resolvedTheme }: ShowcaseSectionProps) {
  const t = useTranslations("playground");

  return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t("showcase.guide.title")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: shades[50]?.hex,
              borderColor: shades[200]?.hex,
              borderWidth: "1px",
              borderStyle: "solid",
            }}
          >
            <h4
              style={{
                color: shades[900]?.hex,
              }}
              className="font-medium mb-2"
            >
              {t("showcase.guide.light.title")}
            </h4>
            <p
              style={{
                color: shades[700]?.hex,
              }}
            >
              {resolvedTheme === "dark"
                ? t("showcase.guide.dark.description")
                : t("showcase.guide.light.description")}
            </p>
            <div className="mt-2 flex gap-1">
              {[50, 100, 200].map((value) => (
                <div
                  key={value}
                  className="w-4 h-4 rounded"
                  style={{
                    backgroundColor:
                      shades[value as keyof typeof shades]?.hex,
                  }}
                />
              ))}
            </div>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: shades[900]?.hex,
              borderColor: shades[700]?.hex,
              borderWidth: "1px",
              borderStyle: "solid",
            }}
          >
            <h4
              style={{
                color: shades[50]?.hex,
              }}
              className="font-medium mb-2"
            >
              {t("showcase.guide.dark.title")}
            </h4>
            <p
              style={{
                color: shades[200]?.hex,
              }}
            >
              {resolvedTheme === "dark"
                ? t("showcase.guide.light.description")
                : t("showcase.guide.dark.description")}
            </p>
            <div className="mt-2 flex gap-1">
              {[700, 800, 900].map((value) => (
                <div
                  key={value}
                  className="w-4 h-4 rounded"
                  style={{
                    backgroundColor:
                      shades[value as keyof typeof shades]?.hex,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}
