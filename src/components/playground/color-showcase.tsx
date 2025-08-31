"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { ColorPalette } from "@/types/colors";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useState } from "react";

interface ColorShowcaseProps {
  palette: ColorPalette;
}

export function ColorShowcase({ palette }: ColorShowcaseProps) {
  const t = useTranslations("playground");
  const { resolvedTheme } = useTheme();
  const [progress] = useState(33);
  const [sliderValue, setSliderValue] = useState([50]);
  const [switchEnabled, setSwitchEnabled] = useState(true);

  // Helper function to get shade by value
  const getShade = (value: number) => {
    return palette.shades.find((shade) => shade.value === value);
  };

  const shades = {
    50: getShade(50),
    100: getShade(100),
    200: getShade(200),
    300: getShade(300),
    400: getShade(400),
    500: getShade(500),
    600: getShade(600),
    700: getShade(700),
    800: getShade(800),
    900: getShade(900),
    950: getShade(950),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("showcase.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Buttons Section */}
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

        {/* Cards Section */}
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

        {/* Form Elements Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t("showcase.forms.title")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  {t("showcase.forms.input.label")}
                </label>
                <Input
                  placeholder={t("showcase.forms.input.placeholder")}
                  style={{
                    borderColor: shades[300]?.hex,
                    backgroundColor:
                      resolvedTheme === "dark"
                        ? shades[900]?.hex
                        : shades[50]?.hex,
                    color:
                      resolvedTheme === "dark"
                        ? shades[50]?.hex
                        : shades[900]?.hex,
                  }}
                />
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
                  {t("showcase.forms.select.label")}
                </label>
                <Select>
                  <SelectTrigger
                    style={{
                      borderColor: shades[300]?.hex,
                      backgroundColor:
                        resolvedTheme === "dark"
                          ? shades[900]?.hex
                          : shades[50]?.hex,
                      color:
                        resolvedTheme === "dark"
                          ? shades[50]?.hex
                          : shades[900]?.hex,
                    }}
                  >
                    <SelectValue
                      placeholder={t("showcase.forms.select.placeholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Opción 1</SelectItem>
                    <SelectItem value="option2">Opción 2</SelectItem>
                    <SelectItem value="option3">Opción 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

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
                  {t("showcase.forms.slider.label")}
                </label>
                <Slider
                  value={sliderValue}
                  onValueChange={setSliderValue}
                  max={100}
                  step={1}
                  className="w-full"
                  style={{
                    // @ts-expect-error - Custom CSS properties for slider styling
                    "--slider-track": shades[200]?.hex,
                    "--slider-range": shades[500]?.hex,
                    "--slider-thumb": shades[500]?.hex,
                  }}
                />
                <div
                  className="text-sm"
                  style={{
                    color:
                      resolvedTheme === "dark" ? shades[300]?.hex : undefined,
                  }}
                >
                  Valor: {sliderValue[0]}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={switchEnabled}
                  onCheckedChange={setSwitchEnabled}
                  style={{
                    // @ts-expect-error - Custom CSS properties for switch styling
                    "--switch-bg": switchEnabled
                      ? shades[500]?.hex
                      : shades[300]?.hex,
                  }}
                />
                <label
                  style={{
                    color:
                      resolvedTheme === "dark"
                        ? shades[200]?.hex
                        : shades[700]?.hex,
                  }}
                  className="text-sm font-medium"
                >
                  {switchEnabled
                    ? t("showcase.forms.switch.on")
                    : t("showcase.forms.switch.off")}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Progress and Badges Section */}
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
                className="w-full"
                style={{
                  // @ts-expect-error - Custom CSS properties for progress bar styling
                  "--progress-background": shades[200]?.hex,
                  "--progress-foreground": shades[500]?.hex,
                }}
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

        {/* Color Usage Guide */}
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
      </CardContent>
    </Card>
  );
}
