"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { ColorPaletteComponent } from "@/components/shared/color-palette";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SHADE_STOPS, type PinnableRole, type RampPins } from "@/types/colors";
import { createColorPalette } from "@/utils/color-utils";
import { buildRampSet } from "@/utils/ramps/build-ramp-set";

const DERIVED_ROLES: readonly PinnableRole[] = [
  "neutral",
  "accent",
  "success",
  "warning",
  "danger",
];

export interface DerivedRampsCardProps {
  brandHex: string;
  pins: RampPins;
  onPinChange: (role: PinnableRole, hex: string | null) => void;
}

/**
 * A net-new secondary section (standing rule #1): the five non-brand ramps
 * `buildRampSet` derives from `brandHex`, collapsed by default so the
 * existing generator surface is unaffected until a user opens it.
 *
 * `onPinChange` is not wired to any control yet -- Slice 10 adds the pin
 * controls that call it. Accepting it now keeps this component's props
 * stable across both slices (design decision 6).
 */
export function DerivedRampsCard({ brandHex, pins }: DerivedRampsCardProps) {
  const t = useTranslations();
  const [expanded, setExpanded] = useState(false);
  const rampSet = buildRampSet(brandHex, pins);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("ramps.title")}</CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? t("ramps.collapse") : t("ramps.expand")}
          </Button>
        </div>
      </CardHeader>
      {expanded ? (
        <CardContent className="space-y-6">
          {DERIVED_ROLES.map((role) => {
            const ramp = rampSet[role];
            const roleLabel = t(`ramps.role.${role}`);
            const palette = createColorPalette(
              role,
              roleLabel,
              SHADE_STOPS.map((value) => ({ value, hex: ramp.shades[value] }))
            );
            const originKey = ramp.origin === "pinned" ? "pinned" : "derived";

            return (
              <div key={role} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{roleLabel}</span>
                  <Badge variant="outline">
                    {t(`ramps.origin.${originKey}`)}
                  </Badge>
                </div>
                <ColorPaletteComponent palette={palette} />
              </div>
            );
          })}
        </CardContent>
      ) : null}
    </Card>
  );
}
