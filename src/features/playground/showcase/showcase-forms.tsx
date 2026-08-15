"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { ShowcaseSectionProps } from "./types";

export function ShowcaseForms({ shades, resolvedTheme }: ShowcaseSectionProps) {
  const t = useTranslations("playground");
  const [sliderValue, setSliderValue] = useState([50]);
  const [switchEnabled, setSwitchEnabled] = useState(true);

  return (
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
                  <SelectItem value="option1">
                    {t("showcase.forms.select.options.one")}
                  </SelectItem>
                  <SelectItem value="option2">
                    {t("showcase.forms.select.options.two")}
                  </SelectItem>
                  <SelectItem value="option3">
                    {t("showcase.forms.select.options.three")}
                  </SelectItem>
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
              />
              <div
                className="text-sm"
                style={{
                  color:
                    resolvedTheme === "dark" ? shades[300]?.hex : undefined,
                }}
              >
                {t("showcase.forms.slider.value", { value: sliderValue[0] })}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={switchEnabled}
                onCheckedChange={setSwitchEnabled}
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
  );
}
