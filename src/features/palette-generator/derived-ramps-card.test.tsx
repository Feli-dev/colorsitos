import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { buildRampSet } from "@/utils/ramps/build-ramp-set";
import { DerivedRampsCard } from "./derived-ramps-card";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const BRAND_A = "#3182CE";
const BRAND_B = "#E53E3E";

const noop = () => {};

describe("DerivedRampsCard", () => {
  it("is collapsed by default -- no ramp swatches rendered", () => {
    render(<DerivedRampsCard brandHex={BRAND_A} pins={{}} onPinChange={noop} />);

    expect(screen.getByText("ramps.title")).toBeInTheDocument();
    expect(screen.queryByText("ramps.role.neutral")).not.toBeInTheDocument();
  });

  it("expands to show all five non-brand roles, badged as derived from brand", async () => {
    render(<DerivedRampsCard brandHex={BRAND_A} pins={{}} onPinChange={noop} />);

    await userEvent.click(screen.getByText("ramps.expand"));

    for (const role of ["neutral", "accent", "success", "warning", "danger"]) {
      expect(screen.getByText(`ramps.role.${role}`)).toBeInTheDocument();
    }
    expect(screen.getAllByText("ramps.origin.derived")).toHaveLength(5);
    expect(screen.queryByText("ramps.origin.pinned")).not.toBeInTheDocument();
  });

  it("renders the real derived accent hex, not a hardcoded value", async () => {
    render(<DerivedRampsCard brandHex={BRAND_A} pins={{}} onPinChange={noop} />);
    await userEvent.click(screen.getByText("ramps.expand"));

    const accentBase = buildRampSet(BRAND_A).accent.baseHex;
    expect(
      screen.getByLabelText(new RegExp(`500 ${accentBase}$`, "i"))
    ).toBeInTheDocument();
  });

  it("a different brand hex derives genuinely different ramp swatches", async () => {
    const accentA = buildRampSet(BRAND_A).accent.baseHex;
    const accentB = buildRampSet(BRAND_B).accent.baseHex;
    expect(accentA).not.toBe(accentB);

    render(<DerivedRampsCard brandHex={BRAND_B} pins={{}} onPinChange={noop} />);
    await userEvent.click(screen.getByText("ramps.expand"));

    expect(
      screen.getByLabelText(new RegExp(`500 ${accentB}$`, "i"))
    ).toBeInTheDocument();
  });

  it("badges a pinned role as pinned and shows its pinned hex, while others stay derived", async () => {
    const pinnedHex = "#123456";
    render(
      <DerivedRampsCard
        brandHex={BRAND_A}
        pins={{ accent: pinnedHex }}
        onPinChange={noop}
      />
    );
    await userEvent.click(screen.getByText("ramps.expand"));

    expect(screen.getAllByText("ramps.origin.derived")).toHaveLength(4);
    expect(screen.getByText("ramps.origin.pinned")).toBeInTheDocument();
    expect(
      screen.getByLabelText(new RegExp(`500 ${pinnedHex}$`, "i"))
    ).toBeInTheDocument();
  });
});
