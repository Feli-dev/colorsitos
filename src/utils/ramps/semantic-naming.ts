import { hexToRgb, rgbToHsl } from "../color-utils";
import { hexFromHsluv, hsluvOf, isInArc, type HueArc } from "./hsluv-hue";

/**
 * Semantic-role naming (decision B'): a canonical anchor per role, harmonized
 * to the brand by saturation and lightness ONLY, never hue.
 *
 * Root cause this module exists to never repeat (design rev 7): a tolerance
 * must be computed in the same basis as the check that consumes it. Naming
 * lives in HSL (its sectors align with RGB dominance -- "reads as X"); the
 * HSLuv constants below are the CONSERVATIVE PREIMAGE of each HSL interval,
 * never an HSL interval with a hand-claimed HSLuv margin.
 */

export type SemanticRole = "danger" | "warning" | "success";
export const SEMANTIC_ROLES: readonly SemanticRole[] = [
  "danger",
  "warning",
  "success",
];

/** Angular width of a hue arc, accounting for wraparound (`lo > hi`). */
export function width(arc: HueArc): number {
  return arc.lo <= arc.hi ? arc.hi - arc.lo : arc.hi - arc.lo + 360;
}

/** Midpoint of a non-wrapping hue arc. */
function centre(arc: HueArc): number {
  return (arc.lo + arc.hi) / 2;
}

/** Canonical anchor hex per role -- the HSL naming reference colour. */
export const ANCHOR_HEX: Record<SemanticRole, string> = {
  danger: "#FF0000",
  warning: "#F59E0B",
  success: "#22C55E",
};

/**
 * The HSL "naming cell" per role: the narrow HSL-hue range that reads
 * unambiguously as this role, centred on its anchor. A primitive
 * definitional input, not a derived quantity -- `readsAsRole` never
 * consumes this directly, only `HSL_WINDOW` below.
 */
export const HSL_CELL: Record<SemanticRole, HueArc> = {
  danger: { lo: 355.0, hi: 12.5 },
  warning: { lo: 31.5, hi: 41.5 },
  success: { lo: 113.0, hi: 151.0 },
};

/**
 * The HSL "window": the full anchor-to-anchor range in which a colour reads
 * as this role and not a neighbour. `readsAsRole` checks membership here.
 */
export const HSL_WINDOW: Record<SemanticRole, HueArc> = {
  danger: { lo: 350, hi: 25 },
  warning: { lo: 25, hi: 45 },
  success: { lo: 84, hi: 160 },
};

/**
 * Pinned HSLuv preimages of the two HSL definitions above (`hsluv@1.0.1`,
 * `S in [70,100] x L in [20,80]`). `recomputePreimage`/`recomputeWindowPreimage`
 * are the executable contract that reproduces them, within a documented
 * tolerance (this module's own sampling grid is coarser than the original
 * review computation's). Do not hand-edit -- change `HSL_CELL`/`HSL_WINDOW`
 * and recompute instead.
 */
export const CELL_HSLUV: Record<SemanticRole, HueArc> = {
  danger: { lo: 11.6, hi: 15.0 },
  warning: { lo: 49.3, hi: 50.1 },
  success: { lo: 127.3, hi: 137.5 },
};

export const WINDOW_HSLUV: Record<SemanticRole, HueArc> = {
  danger: { lo: 10.4, hi: 23.8 },
  warning: { lo: 41.3, hi: 57.4 },
  success: { lo: 115.2, hi: 147.1 },
};

/** Fixed harmonization hue per role: the centre of its own HSLuv cell. Never rotated. */
export const ANCHOR_HUE: Record<SemanticRole, number> = {
  danger: centre(CELL_HSLUV.danger),
  warning: centre(CELL_HSLUV.warning),
  success: centre(CELL_HSLUV.success),
};

/** The operating envelope every fill and brand render is validated across. */
const S_ENVELOPE_MIN = 70;
const S_ENVELOPE_MAX = 100;
const L_ENVELOPE_MIN = 20;
const L_ENVELOPE_MAX = 80;

/** Sampling resolution for the conservative-preimage sweep below. */
const HUE_SAMPLE_STEP = 0.1;
const S_SAMPLE_STEP = 2;
const L_SAMPLE_STEP = 2;

/**
 * How far (HSLuv degrees, either side) the preimage search scans around each
 * role's own anchor hex's raw HSLuv hue. HSL and HSLuv numbers for the same
 * named colour differ (e.g. warning's HSL window `[25,45]` vs HSLuv window
 * `[41.3,57.4]`), so the scan must centre on the HSLuv side, not reuse the
 * HSL arc's own bounds. 45 comfortably covers the widest window (success,
 * 31.9 degrees) either side of its anchor.
 */
const HUE_SCAN_RADIUS = 45;

/** Whether rendering `hsluvHue` at EVERY (S, L) envelope point keeps the measured HSL hue inside `hslArc`. */
function isSafeForEveryEnvelopePoint(hsluvHue: number, hslArc: HueArc): boolean {
  for (let s = S_ENVELOPE_MIN; s <= S_ENVELOPE_MAX; s += S_SAMPLE_STEP) {
    for (let l = L_ENVELOPE_MIN; l <= L_ENVELOPE_MAX; l += L_SAMPLE_STEP) {
      const rgb = hexToRgb(hexFromHsluv(hsluvHue, s, l));
      if (!rgb) continue;
      const { h } = rgbToHsl(rgb.r, rgb.g, rgb.b);
      if (!isInArc(h, hslArc)) return false;
    }
  }
  return true;
}

/**
 * Conservative preimage: which HSLuv hues, rendered ANYWHERE in the S,L
 * envelope, are guaranteed to measure inside `hslArc`. Scans
 * `HUE_SCAN_RADIUS` degrees either side of `scanCentreHue` -- the executable
 * contract behind `CELL_HSLUV`/`WINDOW_HSLUV` above.
 */
function conservativePreimage(hslArc: HueArc, scanCentreHue: number): HueArc {
  const steps = Math.round((2 * HUE_SCAN_RADIUS) / HUE_SAMPLE_STEP);
  let lo: number | null = null;
  let hi: number | null = null;

  for (let i = 0; i <= steps; i++) {
    const rawHue = scanCentreHue - HUE_SCAN_RADIUS + i * HUE_SAMPLE_STEP;
    const normalizedHue = ((rawHue % 360) + 360) % 360;

    if (isSafeForEveryEnvelopePoint(normalizedHue, hslArc)) {
      if (lo === null) lo = rawHue;
      hi = rawHue;
    }
  }

  if (lo === null || hi === null) {
    throw new Error(
      "conservativePreimage: no HSLuv hue is safe across the envelope -- an empty preimage is a loud failure, never a licence to widen the window"
    );
  }
  return { lo, hi };
}

/** Recomputes `CELL_HSLUV[role]` from `HSL_CELL[role]` -- the pinned constant's contract. */
export function recomputePreimage(role: SemanticRole): HueArc {
  return conservativePreimage(HSL_CELL[role], hsluvOf(ANCHOR_HEX[role]).h);
}

/** Recomputes `WINDOW_HSLUV[role]` from `HSL_WINDOW[role]` -- the pinned constant's contract. */
export function recomputeWindowPreimage(role: SemanticRole): HueArc {
  return conservativePreimage(HSL_WINDOW[role], hsluvOf(ANCHOR_HEX[role]).h);
}

/**
 * Secondary net, only specified for `danger`: a hue-window pass alone can't
 * distinguish red from magenta at high saturation (`#e80071` passes this
 * check at 0.51), but the window rejects that case on hue alone, so
 * dominance never has to carry that load. `warning`/`success` have no
 * dominance guard -- design specifies none, and neither has a known
 * false-positive case.
 */
function passesDominance(role: SemanticRole, r: number, g: number, b: number): boolean {
  if (role !== "danger") return true;
  return (r - Math.max(g, b)) / Math.max(r, 1) >= 0.25;
}

/**
 * Whether `hex` reads as `role`'s colour: HSL hue inside the role's window,
 * plus the secondary dominance net for danger. The hue window carries the
 * assertion (see `passesDominance`).
 */
export function readsAsRole(role: SemanticRole, hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const { h } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return isInArc(h, HSL_WINDOW[role]) && passesDominance(role, rgb.r, rgb.g, rgb.b);
}
