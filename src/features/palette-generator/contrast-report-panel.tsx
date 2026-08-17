"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ColorPalette, ShadeStop } from "@/types/colors";
import {
  buildContrastReport,
  type ContrastPairingResult,
} from "@/utils/contrast-report";
import { toPaletteShades } from "@/utils/palette-shades";
import { useTranslations } from "next-intl";

export interface ContrastReportPanelProps {
  palette: ColorPalette;
}

/**
 * `ShowcaseGuide` (`src/features/playground/showcase/showcase-guide.tsx`)
 * hardcodes these two text/background combinations. They are audited here
 * through the same WCAG engine as the ramp's own default pairing, without
 * `ShowcaseGuide` itself changing.
 */
const SHOWCASE_GUIDE_PAIRINGS: ReadonlyArray<{
  id: string;
  foreground: ShadeStop;
  background: ShadeStop;
}> = [
  { id: "700-on-50", foreground: 700, background: 50 },
  { id: "200-on-900", foreground: 200, background: 900 },
];

/**
 * Diagnostic WCAG contrast report for the currently generated palette.
 *
 * Read-only: it evaluates `palette`, it never writes back to it. A net-new
 * secondary surface — it does not restyle anything that already exists.
 */
export function ContrastReportPanel({ palette }: ContrastReportPanelProps) {
  const t = useTranslations();
  const shades = toPaletteShades(palette.shades);
  const report = buildContrastReport(
    shades,
    palette.name,
    SHOWCASE_GUIDE_PAIRINGS.map(({ id, foreground, background }) => ({
      id,
      foregroundHex: shades[foreground],
      backgroundHex: shades[background],
    }))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("contrastReport.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {report.pairings.map((pairing) => (
            <ContrastPairingRow key={pairing.id} pairing={pairing} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ContrastPairingRow({ pairing }: { pairing: ContrastPairingResult }) {
  const t = useTranslations();
  const passesAA = pairing.normalText.aa;

  return (
    <li className="flex items-center justify-between gap-2 text-sm">
      <span className="font-mono">{pairing.id}</span>
      <span>{pairing.ratio.toFixed(2)}:1</span>
      <Badge variant={passesAA ? "secondary" : "destructive"}>
        {passesAA ? t("contrastReport.pass") : t("contrastReport.fail")}
      </Badge>
    </li>
  );
}
