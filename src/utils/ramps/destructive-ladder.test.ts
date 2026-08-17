import { describe, expect, it } from "vitest";

import { getContrastRatio } from "../color-utils";
import {
  ANCHOR_DANGER,
  ANCHOR_WARNING,
  DANGER_BAND,
  DANGER_BAND_WIDTH,
  deriveDestructive,
} from "./destructive-ladder";
import { circularDelta, hexFromHsluv, hsluvOf, isInArc } from "./hsluv-hue";

describe("danger band D", () => {
  it("is derived from the anchor hexes, not hand-typed", () => {
    const hRed = hsluvOf(ANCHOR_DANGER).h;
    const hWarning = hsluvOf(ANCHOR_WARNING).h;
    const midpoint = (hRed + hWarning) / 2;

    expect(DANGER_BAND.hi).toBeCloseTo(midpoint);
  });

  it("is narrow enough for rung 3 to ever fire (the sole guard on decision G)", () => {
    expect(DANGER_BAND_WIDTH).toBeLessThanOrEqual(50);
  });
});

describe("rung 0 — achromatic brand", () => {
  it("substitutes canonical red but marks it, never silently", () => {
    const result = deriveDestructive("#808080");

    expect(result.rung).toBe(0);
    expect(result.origin).toBe("anchor-unharmonized");
    expect(result.note).toBe("destructive-achromatic-brand");
    expect(result.hue).toBeCloseTo(hsluvOf(ANCHOR_DANGER).h);
  });
});

describe("rung 1 — brand outside the danger band", () => {
  it("anchors near canonical red with at least 60° separation for a blue brand", () => {
    const brandHex = hexFromHsluv(210, 80, 50);
    const brandHue = hsluvOf(brandHex).h;

    const result = deriveDestructive(brandHex);

    expect(result.rung).toBe(1);
    expect(circularDelta(result.hue, brandHue)).toBeGreaterThanOrEqual(60);
    expect(isInArc(result.hue, DANGER_BAND)).toBe(true);
  });

  it("harmonizes toward the brand by at most 15% of the raw offset", () => {
    const brandHex = hexFromHsluv(210, 80, 50);
    const result = deriveDestructive(brandHex);
    const hRed = hsluvOf(ANCHOR_DANGER).h;

    // Unclamped harmonization would land within 0.15 * rawOffset of H_RED.
    // Once clamped into D it can only move further from the brand, so the
    // clamped hue must still sit inside a generous envelope around H_RED.
    expect(circularDelta(result.hue, hRed)).toBeLessThanOrEqual(20);
  });
});

describe("rung 2 — brand inside the failure band F, close to canonical red", () => {
  it("rotates to the far in-band edge without leaving the band", () => {
    // An orange brand (h≈40) genuinely sits close to red — this is the
    // scenario decision 2's correction calls out explicitly.
    const brandHex = hexFromHsluv(40, 80, 65);

    const result = deriveDestructive(brandHex);

    expect(result.rung).toBe(2);
    expect(isInArc(result.hue, DANGER_BAND)).toBe(true);
  });
});

describe("rung 3 — lightness fallback, darker first", () => {
  it("holds the rung-2 hue and separates on lightness until 3:1 against a light brand", () => {
    // A light red-family brand (L≈65) leaves the darker direction reachable.
    const brandHex = hexFromHsluv(hsluvOf(ANCHOR_DANGER).h, 100, 65);

    const result = deriveDestructive(brandHex);

    expect(result.rung).toBe(3);
    expect(result.degraded).toBeUndefined();
    expect(getContrastRatio(brandHex, result.hex)).toBeGreaterThanOrEqual(3);
  });

  it("marks the pair degraded when only the lighter fallback reaches 3:1", () => {
    // A dark red-family brand (L≈35) — darker destructive cannot separate
    // further (both are already dark), so only the lighter direction works.
    const brandHex = hexFromHsluv(hsluvOf(ANCHOR_DANGER).h, 100, 35);

    const result = deriveDestructive(brandHex);

    expect(result.rung).toBe(3);
    expect(result.degraded).toBe(true);
    expect(getContrastRatio(brandHex, result.hex)).toBeGreaterThanOrEqual(3);
  });
});

describe("rung 4 — never refuse, never silently substitute", () => {
  it("warns via a collision marker and still emits a destructive colour", () => {
    // Mid-lightness red-family brand: neither lightness direction reaches
    // 3:1 (the documented dead zone).
    const brandHex = hexFromHsluv(hsluvOf(ANCHOR_DANGER).h, 100, 50);

    const result = deriveDestructive(brandHex);

    expect(result.rung).toBe(4);
    expect(result.warning).toBe("destructive-collision");
    expect(result.hex).toMatch(/^#[0-9A-F]{6}$/);
  });
});

describe("360-hue sweep termination", () => {
  const SATURATIONS = [0, 10, 40, 70, 100];
  const LIGHTNESSES = [35, 50, 65];

  it("terminates every brand hue at a defined rung and satisfies every invariant", () => {
    const countByRung: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    const hWarning = hsluvOf(ANCHOR_WARNING).h;

    for (let h = 0; h < 360; h++) {
      for (const s of SATURATIONS) {
        for (const l of LIGHTNESSES) {
          const brandHex = hexFromHsluv(h, s, l);
          const result = deriveDestructive(brandHex);
          countByRung[result.rung]++;

          expect([0, 1, 2, 3, 4]).toContain(result.rung);
          expect(Number.isFinite(result.hue)).toBe(true);
          expect(result.hue).toBeGreaterThanOrEqual(0);
          expect(result.hue).toBeLessThan(360);

          if (result.rung === 0) {
            expect(result.origin).toBe("anchor-unharmonized");
            expect(result.note).toBe("destructive-achromatic-brand");
          } else {
            // ALL non-achromatic rungs must keep destructive inside D — this
            // is what makes the destructive-vs-warning separation an
            // all-rung invariant rather than a rung-2/3/4-only one (rev 2).
            expect(isInArc(result.hue, DANGER_BAND)).toBe(true);
            expect(circularDelta(result.hue, hWarning)).toBeGreaterThanOrEqual(
              DANGER_BAND_WIDTH / 2 - 1e-6
            );
          }

          if (result.rung === 1) {
            const brandHue = hsluvOf(brandHex).h;
            expect(circularDelta(result.hue, brandHue)).toBeGreaterThanOrEqual(
              60 - 1e-6
            );
          }

          // Rungs 1-3 must each satisfy hue separation or contrast separation.
          // Rung 0 is exempt: an achromatic brand's "hue" is measurement noise,
          // not a real signal to separate from (see hsluv-hue's isAchromatic).
          if (result.rung > 0 && result.rung < 4) {
            const brandHue = hsluvOf(brandHex).h;
            const deltaH = circularDelta(result.hue, brandHue);
            const contrastOk =
              result.rung === 3
                ? getContrastRatio(brandHex, result.hex) >= 3 - 1e-6
                : false;
            expect(deltaH >= 30 - 1e-6 || contrastOk).toBe(true);
          }

          if (result.rung === 4) {
            expect(result.warning).toBe("destructive-collision");
          }
        }
      }
    }

    // Required, not optional (rev 2 fixed the rev-1 defect where an
    // L=50-only sweep sat in the dead zone and this stayed vacuously 0).
    expect(countByRung[3]).toBeGreaterThan(0);

    // Documents the rung distribution so an anchor change or algorithm
    // drift is visible in the diff, per design's "snapshot the rung
    // histogram over the sweep".
    expect(countByRung).toMatchSnapshot();
  });
});
