"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ColorPalette } from "@/types/colors";
import {
  buildExportCode,
  exportJustTheCodes,
  type ColorFormat,
  type ExportKind,
} from "@/utils/export-code";
import { toPaletteShades } from "@/utils/palette-shades";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

interface ExportOption {
  value: ExportKind;
  label: string;
}

interface ExportersPanelProps {
  palette: ColorPalette;
}

export function ExportersPanel({ palette }: ExportersPanelProps) {
  const t = useTranslations();
  const [brandKey, setBrandKey] = useState<string>("brand");
  const [active, setActive] = useState<ExportKind>("codes");
  const [format, setFormat] = useState<ColorFormat>("hex");
  const [copied, setCopied] = useState<boolean>(false);

  const exportOptions: ExportOption[] = [
    { value: "tw4", label: "Tailwind v4" },
    { value: "tw3", label: "Tailwind v3" },
    { value: "chakra3", label: "Chakra v3" },
    { value: "chakra2", label: "Chakra v2" },
    { value: "codes", label: t("export.justCodes") },
  ];

  const shades = useMemo(() => toPaletteShades(palette.shades), [palette]);

  const justTheCodes = useMemo(
    () => exportJustTheCodes(shades, format),
    [shades, format]
  );

  const code = useMemo(
    () => buildExportCode(active, shades, brandKey, format),
    [active, brandKey, shades, format]
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // no-op
    }
  }

  async function handleCopyCodes() {
    try {
      await navigator.clipboard.writeText(justTheCodes);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // no-op
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="space-y-4 p-4 sm:p-6">
        <div
          className={`grid items-center justify-between gap-2 ${
            active === "codes" ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {/* Export type selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">
              {t("export.type")}
            </label>
            <Select
              value={active}
              onValueChange={(value: ExportKind) => setActive(value)}
            >
              <SelectTrigger
                size="default"
                className="w-full sm:w-auto sm:min-w-[200px]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {exportOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Controls section */}
          <div>
            {active !== "codes" && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label
                  htmlFor="brand"
                  className="text-sm text-muted-foreground whitespace-nowrap"
                >
                  {t("export.brandKey")}
                </label>
                <Input
                  id="brand"
                  value={brandKey}
                  onChange={(e) => setBrandKey(e.target.value)}
                  className="w-full sm:max-w-xs"
                />
              </div>
            )}
          </div>
        </div>

        {/* Format buttons */}
        <div className="grid grid-cols-4 md:flex flex-wrap gap-1">
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

        {/* Code display with copy button */}
        <div className="relative">
          <Button
            type="button"
            onClick={active === "codes" ? handleCopyCodes : handleCopy}
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 z-10 h-8 w-8 p-0 hover:bg-background/80 transition-colors duration-200"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600 animate-in zoom-in-75 fade-in duration-300 ease-out scale-105" />
            ) : (
              <Copy className="h-4 w-4 animate-in zoom-in-95 fade-in duration-200 ease-out" />
            )}
          </Button>
          <pre className="rounded-md border bg-card p-3 sm:p-4 pr-12 overflow-auto text-xs sm:text-sm">
            <code>{active === "codes" ? justTheCodes : code}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
