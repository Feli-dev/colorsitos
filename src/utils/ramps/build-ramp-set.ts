import type { PinnableRole, Ramp, RampOrigin, RampPins, RampSet } from "@/types/colors";
import { isValidHex } from "../color-utils";
import { generateColorPalette } from "../palette-generator";
import { deriveAccentBase } from "./derive-accent";
import { deriveNeutralBase } from "./derive-neutral";
import { deriveSemanticRamp } from "./derive-semantic";
import type { SemanticRole } from "./semantic-naming";

/**
 * Composition root (design decisions 3/4): the brand ramp plus five
 * derived-or-pinned ramps. This is the ONLY place that combines the neutral,
 * accent, and semantic derivers into one `RampSet`.
 */

const PINNABLE_ROLES: readonly PinnableRole[] = [
  "neutral",
  "accent",
  "success",
  "warning",
  "danger",
];

const SEMANTIC_ROLES: readonly SemanticRole[] = ["success", "warning", "danger"];

function isSemanticRole(role: PinnableRole): role is SemanticRole {
  return (SEMANTIC_ROLES as readonly string[]).includes(role);
}

/** The would-be-derived base hex for a non-brand role, ignoring any pin. */
function derivedBaseFor(role: PinnableRole, brandHex: string): string {
  if (role === "neutral") return deriveNeutralBase(brandHex);
  if (role === "accent") return deriveAccentBase(brandHex);
  if (isSemanticRole(role)) return deriveSemanticRamp(role, brandHex).fill;
  return brandHex;
}

/** A pin is honoured only when it parses as a valid hex; otherwise unpinned. */
function pinnedHexFor(pins: RampPins, role: PinnableRole): string | undefined {
  const hex = pins[role];
  return hex && isValidHex(hex) ? hex : undefined;
}

function makeRamp(
  role: Ramp["role"],
  baseHex: string,
  origin: RampOrigin
): Ramp {
  return { role, baseHex, shades: generateColorPalette(baseHex), origin };
}

/**
 * Builds a full `RampSet` from a brand hex and optional pins. Pure: the same
 * `(brandHex, pins)` always returns the same `RampSet` -- unpinned roles are
 * never cached at pin time, so they track the brand indefinitely. Never
 * throws for a valid `brandHex`: an invalid pin hex degrades to "derived"
 * rather than propagating the bad input.
 */
export function buildRampSet(brandHex: string, pins: RampPins = {}): RampSet {
  const rampSet = {
    brand: makeRamp("brand", brandHex, "brand"),
  } as RampSet;

  for (const role of PINNABLE_ROLES) {
    const pinned = pinnedHexFor(pins, role);
    const baseHex = pinned ?? derivedBaseFor(role, brandHex);
    rampSet[role] = makeRamp(role, baseHex, pinned ? "pinned" : "derived");
  }

  return rampSet;
}
