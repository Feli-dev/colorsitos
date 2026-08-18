"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { ColorPaletteComponent } from "@/components/shared/color-palette";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SHADE_STOPS,
  type PinnableRole,
  type Ramp,
  type RampPins,
} from "@/types/colors";
import { createColorPalette } from "@/utils/color-utils";
import { generateColorPalette } from "@/utils/palette-generator";
import { buildRampSet } from "@/utils/ramps/build-ramp-set";
import {
  DEFAULT_HARMONY_RULE,
  deriveAccentBase,
  type HarmonyRule,
} from "@/utils/ramps/derive-accent";
import { AccentHarmonyPicker } from "./accent-harmony-picker";
import { RampPinControl } from "./ramp-pin-control";

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
 * Overriding a role's colour pins it (it stops following the brand); the
 * accent harmony picker appears only once the user touches accent's own
 * control, and the rule it picks is never persisted (design requirement) --
 * it only affects the ramp actually shown while accent stays unpinned.
 */
export function DerivedRampsCard({
  brandHex,
  pins,
  onPinChange,
}: DerivedRampsCardProps) {
  const t = useTranslations();
  const [expanded, setExpanded] = useState(false);
  const [accentTouched, setAccentTouched] = useState(false);
  const [harmonyRule, setHarmonyRule] = useState<HarmonyRule>(
    DEFAULT_HARMONY_RULE
  );

  const rampSet = useMemo(() => buildRampSet(brandHex, pins), [brandHex, pins]);

  const accentRamp: Ramp = useMemo(() => {
    if (pins.accent) return rampSet.accent;
    const baseHex = deriveAccentBase(brandHex, harmonyRule);
    return { ...rampSet.accent, baseHex, shades: generateColorPalette(baseHex) };
  }, [rampSet.accent, pins.accent, brandHex, harmonyRule]);

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
            const ramp = role === "accent" ? accentRamp : rampSet[role];
            const roleLabel = t(`ramps.role.${role}`);
            const palette = createColorPalette(
              role,
              roleLabel,
              SHADE_STOPS.map((value) => ({ value, hex: ramp.shades[value] }))
            );

            return (
              <div key={role} className="space-y-2" data-testid={`ramp-${role}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{roleLabel}</span>
                  <RampPinControl
                    role={role}
                    roleLabel={roleLabel}
                    ramp={ramp}
                    onPin={(hex) => onPinChange(role, hex)}
                    onReset={() => onPinChange(role, null)}
                    onTouch={
                      role === "accent" ? () => setAccentTouched(true) : undefined
                    }
                  />
                </div>
                {role === "accent" && accentTouched ? (
                  <AccentHarmonyPicker
                    value={harmonyRule}
                    onChange={setHarmonyRule}
                  />
                ) : null}
                <ColorPaletteComponent palette={palette} />
              </div>
            );
          })}
        </CardContent>
      ) : null}
    </Card>
  );
}
