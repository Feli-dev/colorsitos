import { getContrastRatio } from "../color-utils";
import { hexFromHsluv, hsluvOf } from "./hsluv-hue";
import { ANCHOR_HEX, ANCHOR_HUE, readsAsRole, type SemanticRole } from "./semantic-naming";

/**
 * Semantic ramp derivation (decision B'): `hue = ANCHOR_HUE[role]`, fixed,
 * never rotated -- only saturation/lightness harmonize toward the brand.
 * Applies uniformly to danger/warning/success, replacing the danger-only
 * hue ladder (retired `destructive-ladder.ts`): measurement showed all
 * three HSLuv naming cells are under 16 degrees wide, so hue harmonization
 * could never move the needle.
 */

/**
 * Saturation floor, tied to the envelope's own lower bound
 * (`semantic-naming.ts`'s `S in [70,100]`): anything at or above it is
 * guaranteed by `recomputePreimage`'s contract to land inside the
 * validated cell/window.
 */
const S_FLOOR = 70;

/** How much the brand's own HSLuv lightness pulls the initial fill lightness. */
const LIGHTNESS_PULL = 0.15;

/** Initial-fill lightness clamp, per design's derivation pseudocode. */
const INITIAL_LIGHTNESS_MIN = 30;
const INITIAL_LIGHTNESS_MAX = 70;

/** Lightness-stepping bounds for `separateForContrast`, matching the envelope's own L bounds. */
const SEPARATION_LIGHTNESS_MIN = 20;
const SEPARATION_LIGHTNESS_MAX = 80;

const MIN_UI_CONTRAST = 3.0;

/** Each role's natural resting lightness: its own anchor hex's HSLuv lightness. */
const L_ANCHOR: Record<SemanticRole, number> = {
  danger: hsluvOf(ANCHOR_HEX.danger).l,
  warning: hsluvOf(ANCHOR_HEX.warning).l,
  success: hsluvOf(ANCHOR_HEX.success).l,
};

function clamp(value: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, value));
}

export type SeparationOutcome =
  | "direct"
  | "separated-darker"
  | "separated-lighter"
  | "collision";

export interface SemanticRampResult {
  fill: string;
  outcome: SeparationOutcome;
  /** Set only when the lighter fallback was needed. */
  degraded?: boolean;
  /** Set only at `collision` -- 3:1 was unreachable in either direction. */
  warning?: "role-collision";
}

/**
 * Shared fallback (decision G's surviving half, generalized to all three
 * roles): direct -> darker -> lighter -> collision, never throwing, never
 * refusing to derive. `hue`/`saturation` are threaded through EXACTLY --
 * every candidate is built directly from `hexFromHsluv(hue, saturation, l)`,
 * never by re-measuring a previous candidate's own hex (which would
 * compound hex round-trip quantization near the envelope's extremes).
 */
export function separateForContrast(
  hue: number,
  saturation: number,
  initialLightness: number,
  brandHex: string,
  role: SemanticRole
): SemanticRampResult {
  const initialFill = hexFromHsluv(hue, saturation, initialLightness);
  const initialContrast = getContrastRatio(brandHex, initialFill);
  if (initialContrast >= MIN_UI_CONTRAST) {
    return { fill: initialFill, outcome: "direct" };
  }

  let best = { fill: initialFill, contrast: initialContrast };

  for (let l = initialLightness; l >= SEPARATION_LIGHTNESS_MIN; l -= 1) {
    const candidate = hexFromHsluv(hue, saturation, l);
    if (!readsAsRole(role, candidate)) break;
    const contrast = getContrastRatio(brandHex, candidate);
    if (contrast > best.contrast) best = { fill: candidate, contrast };
    if (contrast >= MIN_UI_CONTRAST) {
      return { fill: candidate, outcome: "separated-darker" };
    }
  }

  for (let l = initialLightness; l <= SEPARATION_LIGHTNESS_MAX; l += 1) {
    const candidate = hexFromHsluv(hue, saturation, l);
    if (!readsAsRole(role, candidate)) break;
    const contrast = getContrastRatio(brandHex, candidate);
    if (contrast > best.contrast) best = { fill: candidate, contrast };
    if (contrast >= MIN_UI_CONTRAST) {
      return { fill: candidate, outcome: "separated-lighter", degraded: true };
    }
  }

  return { fill: best.fill, outcome: "collision", warning: "role-collision" };
}

/**
 * Derives a semantic ramp's fill colour from a brand hex. Pure, never
 * throws. Hue is always `ANCHOR_HUE[role]` -- brand-independent by
 * construction, stronger than the retired ladder's hue-separation guarantee.
 */
export function deriveSemanticRamp(
  role: SemanticRole,
  brandHex: string
): SemanticRampResult {
  const hue = ANCHOR_HUE[role];
  const brand = hsluvOf(brandHex);
  const saturation = clamp(brand.s, S_FLOOR, 100);
  const lightness = clamp(
    L_ANCHOR[role] + LIGHTNESS_PULL * (brand.l - L_ANCHOR[role]),
    INITIAL_LIGHTNESS_MIN,
    INITIAL_LIGHTNESS_MAX
  );

  return separateForContrast(hue, saturation, lightness, brandHex, role);
}

/**
 * The dead zone: brand lightness values where neither direction reaches
 * 3:1 against either fill extreme, for any saturation in the envelope.
 * Empirically hue-independent (contrast tracks luminance, not hue), so one
 * shared zone -- probed via `danger`'s own anchor -- serves every role.
 */
function computeDeadZone(): { lo: number; hi: number } {
  const probeHue = ANCHOR_HUE.danger;
  const fillAtMin = hexFromHsluv(probeHue, 100, SEPARATION_LIGHTNESS_MIN);
  const fillAtMax = hexFromHsluv(probeHue, 100, SEPARATION_LIGHTNESS_MAX);

  let lo: number | null = null;
  let hi: number | null = null;

  for (let l = 0; l <= 100; l += 1) {
    let allFail = true;
    for (let s = S_FLOOR; s <= 100; s += 5) {
      const brand = hexFromHsluv(probeHue, s, l);
      if (
        getContrastRatio(brand, fillAtMin) >= MIN_UI_CONTRAST ||
        getContrastRatio(brand, fillAtMax) >= MIN_UI_CONTRAST
      ) {
        allFail = false;
        break;
      }
    }
    if (allFail) {
      if (lo === null) lo = l;
      hi = l;
    }
  }

  if (lo === null || hi === null) {
    throw new Error(
      "computeDeadZone: Z is empty -- collision would be unreachable; report, do not silently accept"
    );
  }
  return { lo, hi };
}

const DEAD_ZONE = computeDeadZone();

/** Derived, not hard-coded: below / centre / above the dead zone. */
export const SWEEP_L: readonly number[] = [
  Math.round((0 + DEAD_ZONE.lo) / 2),
  Math.round((DEAD_ZONE.lo + DEAD_ZONE.hi) / 2),
  Math.round((DEAD_ZONE.hi + 100) / 2),
];

export { MIN_UI_CONTRAST };
