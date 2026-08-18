import { describe, expect, it } from "vitest";

import { getContrastRatio } from "../color-utils";
import { deriveSemanticRamp, MIN_UI_CONTRAST, SWEEP_L } from "./derive-semantic";
import { hexFromHsluv, hsluvOf } from "./hsluv-hue";
import {
  ANCHOR_HUE,
  CELL_HSLUV,
  readsAsRole,
  SEMANTIC_ROLES,
  type SemanticRole,
} from "./semantic-naming";

/**
 * 8-bit hex round-trip quantization is coarsest at the envelope's
 * lightness/saturation extremes (see `derive-semantic.ts`'s doc comment on
 * `separateForContrast`) -- measured up to ~0.9 degrees in practice. This is
 * a known, bounded property of representing colour as a hex string, not a
 * derivation defect, so hue-invariance and cell-membership assertions below
 * compare within this tolerance rather than asserting exact equality.
 */
const HUE_QUANTIZATION_TOLERANCE = 1;

describe("deriveSemanticRamp — hue is never rotated", () => {
  it.each(SEMANTIC_ROLES)("%s holds ANCHOR_HUE exactly regardless of brand", (role) => {
    const brands = ["#3182CE", "#E53E3E", "#22C55E", "#808080", "#000000", "#FFFFFF"];
    for (const brandHex of brands) {
      const result = deriveSemanticRamp(role, brandHex);
      const emittedHue = hsluvOf(result.fill).h;
      expect(Math.abs(emittedHue - ANCHOR_HUE[role])).toBeLessThan(
        HUE_QUANTIZATION_TOLERANCE
      );
    }
  });
});

describe("separateForContrast — outcome ladder", () => {
  it("direct: an already-compliant brand needs no separation", () => {
    const result = deriveSemanticRamp("danger", "#000000");

    expect(result.outcome).toBe("direct");
    expect(getContrastRatio("#000000", result.fill)).toBeGreaterThanOrEqual(
      MIN_UI_CONTRAST
    );
  });

  it("separated-darker: a light red-family brand separates by darkening first", () => {
    const brandHex = hexFromHsluv(ANCHOR_HUE.danger, 100, 65);

    const result = deriveSemanticRamp("danger", brandHex);

    expect(result.outcome).toBe("separated-darker");
    expect(result.degraded).toBeUndefined();
    expect(getContrastRatio(brandHex, result.fill)).toBeGreaterThanOrEqual(
      MIN_UI_CONTRAST
    );
  });

  it("separated-lighter: a dark red-family brand falls back to lightening, marked degraded", () => {
    const brandHex = hexFromHsluv(ANCHOR_HUE.danger, 100, 35);

    const result = deriveSemanticRamp("danger", brandHex);

    expect(result.outcome).toBe("separated-lighter");
    expect(result.degraded).toBe(true);
    expect(getContrastRatio(brandHex, result.fill)).toBeGreaterThanOrEqual(
      MIN_UI_CONTRAST
    );
  });

  it("collision: a mid-lightness red-family brand in the dead zone still emits, with a warning", () => {
    const brandHex = hexFromHsluv(ANCHOR_HUE.danger, 100, 50);

    const result = deriveSemanticRamp("danger", brandHex);

    expect(result.outcome).toBe("collision");
    expect(result.warning).toBe("role-collision");
    expect(result.fill).toMatch(/^#[0-9A-F]{6}$/);
  });
});

describe("360-hue sweep — outcome histogram + hue invariance + cell membership", () => {
  const SATURATIONS = [0, 10, 40, 70, 100];

  it("terminates every brand at a defined outcome and satisfies every invariant", () => {
    const countByOutcome: Record<string, number> = {
      direct: 0,
      "separated-darker": 0,
      "separated-lighter": 0,
      collision: 0,
    };

    for (let h = 0; h < 360; h++) {
      for (const s of SATURATIONS) {
        for (const l of SWEEP_L) {
          const brandHex = hexFromHsluv(h, s, l);

          for (const role of SEMANTIC_ROLES as SemanticRole[]) {
            const result = deriveSemanticRamp(role, brandHex);
            countByOutcome[result.outcome]++;

            const emittedHue = hsluvOf(result.fill).h;
            expect(Math.abs(emittedHue - ANCHOR_HUE[role])).toBeLessThan(
              HUE_QUANTIZATION_TOLERANCE
            );
            expect(emittedHue).toBeGreaterThanOrEqual(
              CELL_HSLUV[role].lo - HUE_QUANTIZATION_TOLERANCE
            );
            expect(emittedHue).toBeLessThanOrEqual(
              CELL_HSLUV[role].hi + HUE_QUANTIZATION_TOLERANCE
            );

            expect([
              "direct",
              "separated-darker",
              "separated-lighter",
              "collision",
            ]).toContain(result.outcome);
            expect(readsAsRole(role, result.fill)).toBe(true);

            if (result.outcome !== "collision") {
              expect(
                getContrastRatio(brandHex, result.fill)
              ).toBeGreaterThanOrEqual(MIN_UI_CONTRAST - 1e-6);
            } else {
              expect(result.warning).toBe("role-collision");
            }
          }
        }
      }
    }

    // Required, not optional -- same discipline as the retired ladder's own
    // `countByRung[3] > 0` (rev 2 fixed a vacuous single-lightness sweep).
    expect(countByOutcome["separated-darker"]).toBeGreaterThan(0);
    expect(countByOutcome.collision).toBeGreaterThan(0);

    // Replaces, does not append to, the retired rung-histogram snapshot.
    expect(countByOutcome).toMatchSnapshot();
  });
});
