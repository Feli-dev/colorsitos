import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ColorPalette } from "@/types/colors";
import { getContrastRatio } from "@/utils/color-utils";
import { ContrastReportPanel } from "./contrast-report-panel";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

/**
 * A synthetic ramp engineered so its three audited pairings land on both
 * sides of the AA line:
 * - 900 (#050505) on 50 (#FFFFFF) — near-black on white, clearly passes.
 * - 700 (#FAFAFA) on 50 (#FFFFFF) — near-white on white, clearly fails.
 * - 200 (#0F0F0F) on 900 (#050505) — near-black on near-black, clearly fails.
 */
const MIXED_PALETTE: ColorPalette = {
  id: "mono",
  name: "Mono",
  shades: [
    { value: 50, hex: "#FFFFFF", name: "mono-50" },
    { value: 100, hex: "#F0F0F0", name: "mono-100" },
    { value: 200, hex: "#0F0F0F", name: "mono-200" },
    { value: 300, hex: "#CCCCCC", name: "mono-300" },
    { value: 400, hex: "#AAAAAA", name: "mono-400" },
    { value: 500, hex: "#808080", name: "mono-500" },
    { value: 600, hex: "#666666", name: "mono-600" },
    { value: 700, hex: "#FAFAFA", name: "mono-700" },
    { value: 800, hex: "#222222", name: "mono-800" },
    { value: 900, hex: "#050505", name: "mono-900" },
    { value: 950, hex: "#000000", name: "mono-950" },
  ],
};

describe("ContrastReportPanel", () => {
  it("renders the ramp's own pairing plus ShowcaseGuide's two hardcoded pairings", () => {
    render(<ContrastReportPanel palette={MIXED_PALETTE} />);

    expect(screen.getByText("900-on-50")).toBeInTheDocument();
    expect(screen.getByText("700-on-50")).toBeInTheDocument();
    expect(screen.getByText("200-on-900")).toBeInTheDocument();
  });

  it("shows the real computed ratio for each pairing, not a placeholder", () => {
    render(<ContrastReportPanel palette={MIXED_PALETTE} />);

    const expectedRatio = getContrastRatio("#050505", "#FFFFFF").toFixed(2);
    expect(screen.getByText(`${expectedRatio}:1`)).toBeInTheDocument();
  });

  it("flags ShowcaseGuide's failing pairings distinctly from the passing one", () => {
    render(<ContrastReportPanel palette={MIXED_PALETTE} />);

    // 900-on-50 clears AA; 700-on-50 and 200-on-900 do not — a fixed count of
    // pass/fail badges only follows from the real per-pairing branch running.
    expect(screen.getAllByText("contrastReport.pass")).toHaveLength(1);
    expect(screen.getAllByText("contrastReport.fail")).toHaveLength(2);
  });

  it("titles the section", () => {
    render(<ContrastReportPanel palette={MIXED_PALETTE} />);

    expect(screen.getByText("contrastReport.title")).toBeInTheDocument();
  });
});

const RED_PALETTE: ColorPalette = {
  id: "danger",
  name: "Danger",
  shades: [
    { value: 50, hex: "#FBEEEE", name: "danger-50" },
    { value: 100, hex: "#F8DCDC", name: "danger-100" },
    { value: 200, hex: "#F3BCBC", name: "danger-200" },
    { value: 300, hex: "#EE9696", name: "danger-300" },
    { value: 400, hex: "#EB7070", name: "danger-400" },
    { value: 500, hex: "#E53E3E", name: "danger-500" },
    { value: 600, hex: "#B83030", name: "danger-600" },
    { value: 700, hex: "#8A2222", name: "danger-700" },
    { value: 800, hex: "#631515", name: "danger-800" },
    { value: 900, hex: "#3B0909", name: "danger-900" },
    { value: 950, hex: "#280404", name: "danger-950" },
  ],
};

const BLUE_PALETTE: ColorPalette = {
  id: "brand",
  name: "Brand",
  shades: [
    { value: 50, hex: "#EBF8FF", name: "brand-50" },
    { value: 100, hex: "#BEE3F8", name: "brand-100" },
    { value: 200, hex: "#90CDF4", name: "brand-200" },
    { value: 300, hex: "#63B3ED", name: "brand-300" },
    { value: 400, hex: "#4299E1", name: "brand-400" },
    { value: 500, hex: "#3182CE", name: "brand-500" },
    { value: 600, hex: "#2B6CB0", name: "brand-600" },
    { value: 700, hex: "#2C5282", name: "brand-700" },
    { value: 800, hex: "#2A4365", name: "brand-800" },
    { value: 900, hex: "#1A365D", name: "brand-900" },
    { value: 950, hex: "#0F2942", name: "brand-950" },
  ],
};

describe("ContrastReportPanel role-pair collision audit", () => {
  it("warns when the brand's primary and destructive share a red-family hue", () => {
    render(<ContrastReportPanel palette={RED_PALETTE} />);

    expect(screen.getByText("primary / destructive")).toBeInTheDocument();
    expect(
      screen.getByText("contrastReport.rolePairs.warning")
    ).toBeInTheDocument();
  });

  it("reports no collision for a brand comfortably separated from destructive", () => {
    render(<ContrastReportPanel palette={BLUE_PALETTE} />);

    expect(screen.getByText("primary / destructive")).toBeInTheDocument();
    expect(
      screen.getByText("contrastReport.rolePairs.ok")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("contrastReport.rolePairs.warning")
    ).not.toBeInTheDocument();
  });
});
