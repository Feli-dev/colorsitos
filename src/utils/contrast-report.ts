import type { PaletteShades, ShadeStop } from "@/types/colors";
import { getContrastRatio } from "./color-utils";

/** WCAG 2.x pass/fail at each of the three defined thresholds. */
export interface ContrastThresholds {
  /** 4.5:1 AA / 7:1 AAA. */
  normalText: { aa: boolean; aaa: boolean };
  /** 3:1 AA / 4.5:1 AAA. */
  largeText: { aa: boolean; aaa: boolean };
  /** 3:1, SC 1.4.11 non-text contrast. */
  uiComponent: { aa: boolean };
}

/** A foreground/background pair to evaluate, before it has a verdict. */
export interface ContrastPairingInput {
  id: string;
  foregroundHex: string;
  backgroundHex: string;
}

/** A pairing once its contrast ratio and WCAG verdicts have been computed. */
export interface ContrastPairingResult extends ContrastPairingInput, ContrastThresholds {
  ratio: number;
}

export interface ContrastReport {
  label: string;
  pairings: ContrastPairingResult[];
}

/**
 * The one pairing evaluated for every ramp by default: its darkest text stop
 * against its lightest background stop, the ramp's own natural extremes.
 *
 * Consumers add ramp-external pairings (e.g. a specific component's hardcoded
 * text/background combination) via `extraPairings` rather than this list
 * growing to know about every call site.
 */
const DEFAULT_PAIRINGS: ReadonlyArray<{
  id: string;
  foreground: ShadeStop;
  background: ShadeStop;
}> = [{ id: "900-on-50", foreground: 900, background: 50 }];

/**
 * WCAG 2.x contrast verdicts for one foreground/background pair.
 *
 * Deliberately WCAG 2.x only — no APCA/Lc value and no WCAG 3 threshold, per
 * the contrast-report capability's scope.
 */
export function evaluateContrastPairing(
  foregroundHex: string,
  backgroundHex: string
): ContrastThresholds & { ratio: number } {
  const ratio = getContrastRatio(foregroundHex, backgroundHex);

  return {
    ratio,
    normalText: { aa: ratio >= 4.5, aaa: ratio >= 7 },
    largeText: { aa: ratio >= 3, aaa: ratio >= 4.5 },
    uiComponent: { aa: ratio >= 3 },
  };
}

/**
 * Builds a diagnostic WCAG contrast report for one ramp. Never mutates
 * `shades` — it only reads from it.
 *
 * Composable per ramp: call this once per ramp with a distinct `label` and
 * each call returns an independent report; nothing here is shared or cached
 * across calls.
 *
 * `extraPairings` lets a caller fold in pairings this function has no
 * built-in knowledge of — e.g. `ShowcaseGuide`'s hardcoded 700-on-50 and
 * 200-on-900 combinations — so they are audited through the same WCAG logic
 * without `ShowcaseGuide` itself changing.
 */
export function buildContrastReport(
  shades: PaletteShades,
  label = "Ramp",
  extraPairings: ContrastPairingInput[] = []
): ContrastReport {
  const basePairings: ContrastPairingInput[] = DEFAULT_PAIRINGS.map(
    ({ id, foreground, background }) => ({
      id,
      foregroundHex: shades[foreground],
      backgroundHex: shades[background],
    })
  );

  const pairings = [...basePairings, ...extraPairings].map((pairing) => ({
    ...pairing,
    ...evaluateContrastPairing(pairing.foregroundHex, pairing.backgroundHex),
  }));

  return { label, pairings };
}
