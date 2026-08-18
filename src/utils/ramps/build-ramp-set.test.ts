import { describe, expect, it } from "vitest";

import { RAMP_ROLES, type RampPins } from "@/types/colors";
import { generateColorPalette } from "../palette-generator";
import { buildRampSet } from "./build-ramp-set";
import { deriveAccentBase } from "./derive-accent";
import { deriveNeutralBase } from "./derive-neutral";
import { deriveSemanticRamp } from "./derive-semantic";

const BRAND_HEX = "#3182CE";

describe("buildRampSet — shape and origin (M1 foundation)", () => {
  it("returns every RAMP_ROLES key", () => {
    const rampSet = buildRampSet(BRAND_HEX);
    for (const role of RAMP_ROLES) {
      expect(rampSet[role]).toBeDefined();
    }
  });

  it("sets brand's baseHex/shades/origin from the input hex directly", () => {
    const rampSet = buildRampSet(BRAND_HEX);
    expect(rampSet.brand.baseHex).toBe(BRAND_HEX);
    expect(rampSet.brand.shades).toEqual(generateColorPalette(BRAND_HEX));
    expect(rampSet.brand.origin).toBe("brand");
  });

  it("marks every non-brand role as derived when no pins are given", () => {
    const rampSet = buildRampSet(BRAND_HEX);
    for (const role of RAMP_ROLES) {
      if (role === "brand") continue;
      expect(rampSet[role].origin).toBe("derived");
    }
  });
});

describe("buildRampSet — wires the already-shipped derivers", () => {
  it("neutral matches deriveNeutralBase's output", () => {
    const rampSet = buildRampSet(BRAND_HEX);
    const expectedHex = deriveNeutralBase(BRAND_HEX);
    expect(rampSet.neutral.baseHex).toBe(expectedHex);
    expect(rampSet.neutral.shades).toEqual(generateColorPalette(expectedHex));
  });

  it("accent matches deriveAccentBase's output", () => {
    const rampSet = buildRampSet(BRAND_HEX);
    expect(rampSet.accent.baseHex).toBe(deriveAccentBase(BRAND_HEX));
  });

  it.each(["success", "warning", "danger"] as const)(
    "%s matches deriveSemanticRamp's fill",
    (role) => {
      const rampSet = buildRampSet(BRAND_HEX);
      expect(rampSet[role].baseHex).toBe(
        deriveSemanticRamp(role, BRAND_HEX).fill
      );
    }
  );
});

describe("buildRampSet — pins", () => {
  it("uses a pinned hex as the base and marks origin pinned", () => {
    const pins: RampPins = { accent: "#00FF00" };
    const rampSet = buildRampSet(BRAND_HEX, pins);
    expect(rampSet.accent.baseHex).toBe("#00FF00");
    expect(rampSet.accent.origin).toBe("pinned");
    expect(rampSet.accent.shades).toEqual(generateColorPalette("#00FF00"));
  });

  it("derives every role not present in a partial pin set (M4)", () => {
    const pins: RampPins = { accent: "#00FF00" };
    const rampSet = buildRampSet(BRAND_HEX, pins);
    expect(rampSet.neutral.origin).toBe("derived");
    expect(rampSet.success.origin).toBe("derived");
    expect(rampSet.warning.origin).toBe("derived");
    expect(rampSet.danger.origin).toBe("derived");
  });

  it("treats an invalid pin hex as unpinned, never throwing", () => {
    const pins: RampPins = { danger: "not-a-hex" };
    expect(() => buildRampSet(BRAND_HEX, pins)).not.toThrow();
    const rampSet = buildRampSet(BRAND_HEX, pins);
    expect(rampSet.danger.origin).toBe("derived");
    expect(rampSet.danger.baseHex).toBe(
      deriveSemanticRamp("danger", BRAND_HEX).fill
    );
  });
});

describe("buildRampSet — determinism and brand tracking", () => {
  it("is deterministic for the same brand and pins", () => {
    const pins: RampPins = { warning: "#FFAA00" };
    expect(buildRampSet(BRAND_HEX, pins)).toEqual(buildRampSet(BRAND_HEX, pins));
  });

  it("derived ramps track the brand indefinitely -- a new brand changes them", () => {
    const first = buildRampSet(BRAND_HEX);
    const second = buildRampSet("#E53E3E");
    expect(second.accent.baseHex).not.toBe(first.accent.baseHex);
    expect(second.neutral.baseHex).not.toBe(first.neutral.baseHex);
  });
});
