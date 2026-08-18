"use client";

import { useTranslations } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { HarmonyRule } from "@/utils/ramps/derive-accent";

/**
 * Only the three rules named in the design's UI scope. `deriveAccentBase`
 * also supports `splitComplementary`, but this picker deliberately does not
 * surface it -- the accent harmony control appears only after the user
 * touches accent, and offers complementary/analogous/triadic.
 */
const HARMONY_OPTIONS: readonly HarmonyRule[] = [
  "complementary",
  "analogous",
  "triadic",
];

export interface AccentHarmonyPickerProps {
  value: HarmonyRule;
  onChange: (rule: HarmonyRule) => void;
}

/**
 * The accent harmony rule is never persisted in the URL (design requirement)
 * -- the resulting accent hex is what gets shared/saved, not the rule that
 * produced it. This picker only ever affects an unpinned accent ramp.
 */
export function AccentHarmonyPicker({ value, onChange }: AccentHarmonyPickerProps) {
  const t = useTranslations();

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-muted-foreground whitespace-nowrap">
        {t("ramps.harmony.label")}
      </label>
      <Select value={value} onValueChange={(v) => onChange(v as HarmonyRule)}>
        <SelectTrigger size="sm" className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {HARMONY_OPTIONS.map((rule) => (
            <SelectItem key={rule} value={rule}>
              {t(`ramps.harmony.${rule}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
