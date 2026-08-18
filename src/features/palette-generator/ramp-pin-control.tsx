"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PinnableRole, Ramp } from "@/types/colors";
import { isValidHex } from "@/utils/color-utils";

export interface RampPinControlProps {
  role: PinnableRole;
  roleLabel: string;
  ramp: Ramp;
  onPin: (hex: string) => void;
  onReset: () => void;
  /** Fired once, the first time the user opens the override field for this role. */
  onTouch?: () => void;
}

/**
 * Origin badge plus a pin/unpin control for one derived ramp (design decision
 * 6). Pinning stops the ramp from following the brand (decision B'/`RampSet`
 * contract); resetting drops the pin so it resumes tracking the brand.
 */
export function RampPinControl({
  role,
  roleLabel,
  ramp,
  onPin,
  onReset,
  onTouch,
}: RampPinControlProps) {
  const t = useTranslations();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(ramp.baseHex);

  const isPinned = ramp.origin === "pinned";

  function startEditing() {
    setDraft(ramp.baseHex);
    setEditing(true);
    onTouch?.();
  }

  function applyDraft() {
    const normalized = draft.startsWith("#") ? draft : `#${draft}`;
    if (!isValidHex(normalized)) return;
    onPin(normalized);
    setEditing(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2" data-role={role}>
      <Badge variant="outline">
        {t(`ramps.origin.${isPinned ? "pinned" : "derived"}`)}
      </Badge>

      {editing ? (
        <>
          <Input
            aria-label={`${t("ramps.pin.inputLabel")} ${roleLabel}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="h-8 w-28"
          />
          <Button type="button" size="sm" onClick={applyDraft}>
            {t("ramps.pin.apply")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setEditing(false)}
          >
            {t("ramps.pin.cancel")}
          </Button>
        </>
      ) : (
        <Button type="button" size="sm" variant="outline" onClick={startEditing}>
          {t("ramps.pin.override")}
        </Button>
      )}

      {isPinned ? (
        <Button type="button" size="sm" variant="ghost" onClick={onReset}>
          {t("ramps.pin.reset")}
        </Button>
      ) : null}
    </div>
  );
}
