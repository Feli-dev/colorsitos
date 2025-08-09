"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ColorPalette } from "@/types/colors";
import {
  hexToHslString,
  hexToOklchString,
  hexToRgbString,
} from "@/utils/color-utils";
import { exportChakraV2 } from "@/utils/exporters/chakra-v2";
import { exportChakraV3 } from "@/utils/exporters/chakra-v3";
import { exportTailwindV3 } from "@/utils/exporters/tailwind-v3";
import {
  exportTailwindV4CssVars,
  exportTailwindV4Usage,
} from "@/utils/exporters/tailwind-v4";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

type ExportKind = "tw4" | "tw3" | "chakra3" | "chakra2" | "codes";

interface ExportersPanelProps {
  palette: ColorPalette;
}

export function ExportersPanel({ palette }: ExportersPanelProps) {
  const t = useTranslations();
  const [brandKey, setBrandKey] = useState<string>("brand");
  const [active, setActive] = useState<ExportKind>("tw4");
  const [format, setFormat] = useState<"hex" | "rgb" | "hsl" | "oklch">("hex");
  const [prefix, setPrefix] = useState<string>("");
  const [useIndex, setUseIndex] = useState<boolean>(false);

  function fmt(hex: string): string {
    switch (format) {
      case "rgb":
        return hexToRgbString(hex);
      case "hsl":
        return hexToHslString(hex);
      case "oklch":
        return hexToOklchString(hex);
      default:
        return hex.toUpperCase();
    }
  }

  const shades = useMemo(() => {
    const record = {
      50: "",
      100: "",
      200: "",
      300: "",
      400: "",
      500: "",
      600: "",
      700: "",
      800: "",
      900: "",
      950: "",
    } as Record<
      50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950,
      string
    >;
    for (const s of palette.shades) {
      // @ts-expect-error keys limited to known shades
      record[s.value] = s.hex;
    }
    return record;
  }, [palette]);

  const justTheCodes = useMemo(() => {
    const keys = Object.keys(shades)
      .map((k) => Number(k))
      .sort((a, b) => a - b) as Array<
      50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950
    >;
    return keys.map((k) => fmt(shades[k])).join("\n");
  }, [shades, format]);

  const code = useMemo(() => {
    switch (active) {
      case "tw4":
        // map shades to the selected format
        const v4 = Object.fromEntries(
          Object.entries(shades).map(([k, v]) => [k, fmt(v as string)])
        ) as typeof shades;
        return `${exportTailwindV4CssVars(brandKey, v4, {
          prefix: prefix || undefined,
          useIndex,
        })}\n\n${exportTailwindV4Usage(brandKey)}`;
      case "tw3":
        const v3 = Object.fromEntries(
          Object.entries(shades).map(([k, v]) => [k, fmt(v as string)])
        ) as typeof shades;
        return exportTailwindV3(brandKey, v3);
      case "chakra3":
        const c3 = Object.fromEntries(
          Object.entries(shades).map(([k, v]) => [k, fmt(v as string)])
        ) as typeof shades;
        return exportChakraV3(brandKey, c3);
      case "chakra2":
        const c2 = Object.fromEntries(
          Object.entries(shades).map(([k, v]) => [k, fmt(v as string)])
        ) as typeof shades;
        return exportChakraV2(brandKey, c2);
      case "codes":
        return justTheCodes;
      default:
        return "";
    }
  }, [active, brandKey, shades, format, justTheCodes]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // no-op
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
        {/* Left nav */}
        <div className="flex md:flex-col gap-2">
          <Button
            type="button"
            variant={active === "tw4" ? "default" : "outline"}
            onClick={() => setActive("tw4")}
          >
            Tailwind v4
          </Button>
          <Button
            type="button"
            variant={active === "tw3" ? "default" : "outline"}
            onClick={() => setActive("tw3")}
          >
            Tailwind v3
          </Button>
          <Button
            type="button"
            variant={active === "chakra3" ? "default" : "outline"}
            onClick={() => setActive("chakra3")}
          >
            Chakra v3
          </Button>
          <Button
            type="button"
            variant={active === "chakra2" ? "default" : "outline"}
            onClick={() => setActive("chakra2")}
          >
            Chakra v2
          </Button>
          <Button
            type="button"
            variant={active === "codes" ? "default" : "outline"}
            onClick={() => setActive("codes")}
          >
            {t("export.justCodes")}
          </Button>
        </div>

        {/* Right content */}
        <div className="space-y-3">
          {active !== "codes" && (
            <div className="flex items-center gap-2">
              <label htmlFor="brand" className="text-sm text-muted-foreground">
                {t("export.brandKey")}
              </label>
              <Input
                id="brand"
                value={brandKey}
                onChange={(e) => setBrandKey(e.target.value)}
                className="max-w-xs"
              />
              <div className="flex items-center gap-1 ml-2">
                <Button
                  type="button"
                  variant={format === "hex" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormat("hex")}
                >
                  Hex
                </Button>
                <Button
                  type="button"
                  variant={format === "rgb" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormat("rgb")}
                >
                  RGB
                </Button>
                <Button
                  type="button"
                  variant={format === "hsl" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormat("hsl")}
                >
                  HSL
                </Button>
                <Button
                  type="button"
                  variant={format === "oklch" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormat("oklch")}
                >
                  OKLCH
                </Button>
              </div>
              <div className="ml-auto">
                <Button type="button" onClick={handleCopy} variant="outline">
                  {t("export.copy")}
                </Button>
              </div>
            </div>
          )}

          {active !== "codes" && (
            <pre className="rounded-md border bg-card p-4 overflow-auto text-sm">
              <code>{code}</code>
            </pre>
          )}
          {active === "codes" ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant={format === "hex" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormat("hex")}
                  >
                    Hex
                  </Button>
                  <Button
                    type="button"
                    variant={format === "rgb" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormat("rgb")}
                  >
                    RGB
                  </Button>
                  <Button
                    type="button"
                    variant={format === "hsl" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormat("hsl")}
                  >
                    HSL
                  </Button>
                  <Button
                    type="button"
                    variant={format === "oklch" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormat("oklch")}
                  >
                    OKLCH
                  </Button>
                </div>
                <div className="ml-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(justTheCodes);
                      } catch {}
                    }}
                  >
                    {t("export.copyCodes")}
                  </Button>
                </div>
              </div>
              <pre className="rounded-md border bg-card p-4 overflow-auto text-sm">
                <code>{justTheCodes}</code>
              </pre>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
