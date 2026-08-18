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
import {
  RAMP_ROLES,
  type ColorPalette,
  type RampPins,
  type RampRole,
} from "@/types/colors";
import {
  buildCombinedExportCode,
  buildExportCode,
  exportJustTheCodes,
  type ColorFormat,
  type ExportKind,
} from "@/utils/export-code";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { buildRampSet } from "@/utils/ramps/build-ramp-set";
import { toPaletteShades } from "@/utils/palette-shades";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

interface ExportOption {
  value: ExportKind;
  label: string;
}

/** Which portion of the ramp system a given export document covers (decision A). */
type ExportShape = "single" | "system";

interface ExportersPanelProps {
  palette: ColorPalette;
  /**
   * User-pinned ramp overrides (Feature 3), same flat shape `resolveRamps`
   * reads. Optional so every existing caller keeps working unchanged --
   * omitting it is equivalent to no ramp being pinned.
   */
  pins?: RampPins;
}

export function ExportersPanel({ palette, pins = {} }: ExportersPanelProps) {
  const t = useTranslations();
  const [brandKey, setBrandKey] = useState<string>("brand");
  const [active, setActive] = useState<ExportKind>("codes");
  const [shape, setShape] = useState<ExportShape>("single");
  const [selectedRamp, setSelectedRamp] = useState<RampRole>("brand");
  const { copy, copiedValue } = useCopyToClipboard();
  const [format, setFormat] = useState<ColorFormat>("hex");

  const exportOptions: ExportOption[] = [
    { value: "tw4", label: "Tailwind v4" },
    { value: "tw3", label: "Tailwind v3" },
    { value: "chakra3", label: "Chakra v3" },
    { value: "chakra2", label: "Chakra v2" },
    { value: "cssvars", label: "CSS Variables" },
    { value: "shadcn", label: "shadcn/ui" },
    { value: "codes", label: t("export.justCodes") },
  ];

  // The brand ramp's own shades, exactly as before this slice -- kept as the
  // single source of truth for the "brand" selection so the default,
  // back-compat path is byte-identical to pre-Slice-12 behavior.
  const brandShades = useMemo(() => toPaletteShades(palette.shades), [palette]);

  const brandHex = brandShades[500];

  // Pure and re-derived on every pins/brandHex change (same contract as
  // DerivedRampsCard) -- never a stale snapshot of a ramp taken at pin time.
  const rampSet = useMemo(() => buildRampSet(brandHex, pins), [brandHex, pins]);

  const selectedShades = useMemo(
    () => (selectedRamp === "brand" ? brandShades : rampSet[selectedRamp].shades),
    [selectedRamp, brandShades, rampSet]
  );

  const justTheCodes = useMemo(() => {
    if (shape === "system") {
      return buildCombinedExportCode("codes", rampSet, brandKey, format);
    }
    return exportJustTheCodes(selectedShades, format);
  }, [shape, rampSet, brandKey, format, selectedShades]);

  const code = useMemo(() => {
    if (shape === "system") {
      return buildCombinedExportCode(active, rampSet, brandKey, format);
    }
    return buildExportCode(active, selectedShades, brandKey, format);
  }, [shape, active, rampSet, brandKey, format, selectedShades]);

  const handleCopy = () => copy(code);
  const handleCopyCodes = () => copy(justTheCodes);

  return (
    <Card className="w-full">
      <CardContent className="space-y-4 p-4 sm:p-6">
        {/*
          Two equal grid columns forced each group into half the width. The
          left one needs ~289px for its label plus the 200px trigger, got 273,
          and overflowed its track — so the select overlapped the brand label
          rather than the row growing or wrapping. Visible today on three of
          the six export kinds; the longest label made it obvious.

          Wrapping instead: the row looks the same when both groups fit, and
          drops the brand field to a second line when they do not.
        */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
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
                aria-label={t("export.type")}
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

        {/* Export shape (decision A): a single chosen ramp, or the whole
            six-ramp system as one combined document. */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">
              {t("export.shape.label")}
            </label>
            <Select
              value={shape}
              onValueChange={(value: ExportShape) => setShape(value)}
            >
              <SelectTrigger
                size="sm"
                className="w-full sm:w-auto sm:min-w-[160px]"
                aria-label={t("export.shape.label")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">{t("export.shape.single")}</SelectItem>
                <SelectItem value="system">{t("export.shape.system")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {shape === "single" ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm text-muted-foreground whitespace-nowrap">
                {t("export.ramp.label")}
              </label>
              <Select
                value={selectedRamp}
                onValueChange={(value: RampRole) => setSelectedRamp(value)}
              >
                <SelectTrigger
                  size="sm"
                  className="w-full sm:w-auto sm:min-w-[160px]"
                  aria-label={t("export.ramp.label")}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RAMP_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {t(`ramps.role.${role}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
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
            {copiedValue !== null ? (
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
