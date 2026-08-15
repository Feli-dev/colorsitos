"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import type { ShowcaseSectionProps } from "./types";

export function ShowcaseCards({ shades }: Pick<ShowcaseSectionProps, "shades">) {
  const t = useTranslations("playground");

  return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t("showcase.cards.title")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            style={{
              backgroundColor: shades[50]?.hex,
              borderColor: shades[200]?.hex,
            }}
          >
            <CardHeader>
              <CardTitle
                style={{ color: shades[900]?.hex }}
                className="text-lg"
              >
                {t("showcase.cards.light.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ color: shades[700]?.hex }}>
                {t("showcase.cards.light.description")}
              </p>
            </CardContent>
          </Card>

          <Card
            style={{
              backgroundColor: shades[100]?.hex,
              borderColor: shades[300]?.hex,
            }}
          >
            <CardHeader>
              <CardTitle
                style={{ color: shades[900]?.hex }}
                className="text-lg"
              >
                {t("showcase.cards.medium.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ color: shades[700]?.hex }}>
                {t("showcase.cards.medium.description")}
              </p>
            </CardContent>
          </Card>

          <Card
            style={{
              backgroundColor: shades[800]?.hex,
              borderColor: shades[700]?.hex,
            }}
          >
            <CardHeader>
              <CardTitle
                style={{ color: shades[50]?.hex }}
                className="text-lg"
              >
                {t("showcase.cards.dark.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ color: shades[100]?.hex }}>
                {t("showcase.cards.dark.description")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
