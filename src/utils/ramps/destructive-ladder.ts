import { getContrastRatio } from "../color-utils";
import {
  circularDelta,
  circularSignedDelta,
  clampToArc,
  hexFromHsluv,
  hsluvOf,
  isAchromatic,
  type HueArc,
} from "./hsluv-hue";

/**
 * The destructive hue-separation ladder (decision B / G).
 *
 * Derives a `--destructive` hue (and a concrete fill colour) from the brand
 * hue so that destructive never reads as "the brand, but red" and never
 * collides with a canonical warning colour — without ever refusing to
 * derive or silently substituting canonical red when the brand itself is
 * red-family (decision G).
 *
 * Recommended default anchors (design decision 2's open question, resolved):
 * canonical red for danger, canonical amber for warning. Changing either
 * requires re-deriving `DANGER_BAND` and re-running the 360-hue sweep.
 */

/** Canonical destructive-red anchor. */
export const ANCHOR_DANGER = "#FF0000";
/** Canonical warning anchor — its hue bounds how wide the danger band may be. */
export const ANCHOR_WARNING = "#F59E0B";

const H_RED = hsluvOf(ANCHOR_DANGER).h;
const H_WARNING = hsluvOf(ANCHOR_WARNING).h;
const ANCHOR_DANGER_LIGHTNESS = hsluvOf(ANCHOR_DANGER).l;

/**
 * D's high edge: the midpoint between H_RED and H_WARNING. Destructive never
 * enters warning's half-arc, by construction.
 */
const D_HI = (H_RED + H_WARNING) / 2;

/**
 * D's low edge, mirrored below H_RED. There is no semantic anchor below red,
 * so centring D on red is the only non-arbitrary choice.
 */
const D_LO_RAW = H_RED - (D_HI - H_RED);
const D_LO = ((D_LO_RAW % 360) + 360) % 360;

/** The danger band: the only hues destructive is allowed to occupy. */
export const DANGER_BAND: HueArc = { lo: D_LO, hi: D_HI };

/**
 * Angular width of the danger band. The sole runtime guard on decision G's
 * satisfiability — no clamp exists that could make this test unfailable
 * (rev 2 deleted the runtime clamp that used to defeat it).
 */
export const DANGER_BAND_WIDTH = D_HI - D_LO_RAW;

const HARMONIZE_CAP = 0.15;
const RUNG1_MIN_SEPARATION = 60;
/** Rung 1 passes iff |d| >= this. Derived from the 60° requirement and the 15% cap. */
const RUNG1_FAILURE_HALF_WIDTH = RUNG1_MIN_SEPARATION / (1 - HARMONIZE_CAP);

const HUE_SEPARATION_THRESHOLD = 30;
const MIN_UI_CONTRAST = 3.0;
const LIGHTNESS_MIN = 20;
const LIGHTNESS_MAX = 80;
/** Destructive fills stay at maximum HSLuv saturation; only lightness steps. */
const FILL_SATURATION = 100;

export type DestructiveOrigin = "anchor-unharmonized" | "derived";

export interface DestructiveResult {
  rung: 0 | 1 | 2 | 3 | 4;
  /** The chosen destructive hue, in degrees [0, 360). */
  hue: number;
  /** The HSLuv lightness used to build `hex`. */
  lightness: number;
  /** A concrete destructive fill colour at `hue`/`lightness`. */
  hex: string;
  origin: DestructiveOrigin;
  /** Set only at rung 0 — explains the achromatic-brand substitution. */
  note?: "destructive-achromatic-brand";
  /** Set only when rung 3 had to fall back to the lighter direction. */
  degraded?: boolean;
  /** Set only at rung 4 — 3:1 was unreachable in either direction. */
  warning?: "destructive-collision";
}

/**
 * Derives a destructive colour from a brand hex via the four-rung ladder.
 * Pure and deterministic: never calls `generateColorPalette`, never throws.
 */
export function deriveDestructive(brandHex: string): DestructiveResult {
  if (isAchromatic(brandHex)) {
    return {
      rung: 0,
      hue: H_RED,
      lightness: ANCHOR_DANGER_LIGHTNESS,
      hex: hexFromHsluv(H_RED, FILL_SATURATION, ANCHOR_DANGER_LIGHTNESS),
      origin: "anchor-unharmonized",
      note: "destructive-achromatic-brand",
    };
  }

  const brandHue = hsluvOf(brandHex).h;
  const { hue, rung } = deriveHueCandidate(brandHue);

  const deltaFromBrand = circularDelta(hue, brandHue);
  if (deltaFromBrand >= HUE_SEPARATION_THRESHOLD) {
    return {
      rung,
      hue,
      lightness: ANCHOR_DANGER_LIGHTNESS,
      hex: hexFromHsluv(hue, FILL_SATURATION, ANCHOR_DANGER_LIGHTNESS),
      origin: "derived",
    };
  }

  return separateByLightness(brandHex, hue);
}

/** Rungs 1-2: pick a hue in D, without yet checking whether it separates enough. */
function deriveHueCandidate(brandHue: number): { hue: number; rung: 1 | 2 } {
  const signedOffset = circularSignedDelta(H_RED, brandHue);
  const absOffset = Math.abs(signedOffset);

  if (absOffset >= RUNG1_FAILURE_HALF_WIDTH) {
    const unclamped = H_RED + HARMONIZE_CAP * signedOffset;
    return { hue: clampToArc(unclamped, DANGER_BAND), rung: 1 };
  }

  const distToLo = circularDelta(brandHue, DANGER_BAND.lo);
  const distToHi = circularDelta(brandHue, DANGER_BAND.hi);
  // Tie (brand at H_RED, both edges equidistant) prefers D_LO.
  const hue = distToLo >= distToHi ? DANGER_BAND.lo : DANGER_BAND.hi;
  return { hue, rung: 2 };
}

/**
 * Rung 3/4: hue alone isn't enough. Holds `hue` and steps the destructive
 * fill's lightness darker first (decision G: "darker red"), falling back to
 * lighter only if darker cannot reach 3:1 (marked `degraded`). If neither
 * direction reaches it, keeps the highest-contrast candidate found and warns
 * (rung 4) — destructive is still emitted, never withheld, never silently
 * replaced with an unmarked canonical red.
 */
function separateByLightness(brandHex: string, hue: number): DestructiveResult {
  let best = { lightness: ANCHOR_DANGER_LIGHTNESS, contrast: -Infinity, degraded: false };

  for (let l = ANCHOR_DANGER_LIGHTNESS; l >= LIGHTNESS_MIN; l -= 1) {
    const hex = hexFromHsluv(hue, FILL_SATURATION, l);
    const contrast = getContrastRatio(brandHex, hex);
    if (contrast > best.contrast) best = { lightness: l, contrast, degraded: false };
    if (contrast >= MIN_UI_CONTRAST) {
      return { rung: 3, hue, lightness: l, hex, origin: "derived" };
    }
  }

  for (let l = ANCHOR_DANGER_LIGHTNESS; l <= LIGHTNESS_MAX; l += 1) {
    const hex = hexFromHsluv(hue, FILL_SATURATION, l);
    const contrast = getContrastRatio(brandHex, hex);
    if (contrast > best.contrast) best = { lightness: l, contrast, degraded: true };
    if (contrast >= MIN_UI_CONTRAST) {
      return { rung: 3, hue, lightness: l, hex, origin: "derived", degraded: true };
    }
  }

  return {
    rung: 4,
    hue,
    lightness: best.lightness,
    hex: hexFromHsluv(hue, FILL_SATURATION, best.lightness),
    origin: "derived",
    warning: "destructive-collision",
  };
}
