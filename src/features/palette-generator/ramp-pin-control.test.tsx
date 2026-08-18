import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Ramp } from "@/types/colors";
import { RampPinControl } from "./ramp-pin-control";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

function makeRamp(overrides: Partial<Ramp> = {}): Ramp {
  return {
    role: "accent",
    baseHex: "#4B0082",
    shades: {
      50: "#F1EAF9",
      100: "#DFCBF1",
      200: "#C6A2E6",
      300: "#A978DA",
      400: "#8C50CE",
      500: "#4B0082",
      600: "#3E006B",
      700: "#310054",
      800: "#24003D",
      900: "#170026",
      950: "#0E0017",
    },
    origin: "derived",
    ...overrides,
  };
}

describe("RampPinControl", () => {
  it("shows a derived badge, an override action, and no reset button when unpinned", () => {
    render(
      <RampPinControl
        role="accent"
        roleLabel="Accent"
        ramp={makeRamp()}
        onPin={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByText("ramps.origin.derived")).toBeInTheDocument();
    expect(screen.getByText("ramps.pin.override")).toBeInTheDocument();
    expect(screen.queryByText("ramps.pin.reset")).not.toBeInTheDocument();
  });

  it("shows a pinned badge and a reset button when pinned, and reset calls onReset", async () => {
    const onReset = vi.fn();
    render(
      <RampPinControl
        role="accent"
        roleLabel="Accent"
        ramp={makeRamp({ origin: "pinned" })}
        onPin={vi.fn()}
        onReset={onReset}
      />
    );

    expect(screen.getByText("ramps.origin.pinned")).toBeInTheDocument();
    await userEvent.click(screen.getByText("ramps.pin.reset"));

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("reveals a hex field pre-filled with the current base hex, and fires onTouch", async () => {
    const onTouch = vi.fn();
    render(
      <RampPinControl
        role="accent"
        roleLabel="Accent"
        ramp={makeRamp({ baseHex: "#4B0082" })}
        onPin={vi.fn()}
        onReset={vi.fn()}
        onTouch={onTouch}
      />
    );

    await userEvent.click(screen.getByText("ramps.pin.override"));

    expect(onTouch).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("textbox")).toHaveValue("#4B0082");
  });

  it("applies a valid typed hex through onPin, normalized with a leading #", async () => {
    const onPin = vi.fn();
    render(
      <RampPinControl
        role="accent"
        roleLabel="Accent"
        ramp={makeRamp()}
        onPin={onPin}
        onReset={vi.fn()}
      />
    );

    await userEvent.click(screen.getByText("ramps.pin.override"));
    const field = screen.getByRole("textbox");
    await userEvent.clear(field);
    await userEvent.type(field, "123456");
    await userEvent.click(screen.getByText("ramps.pin.apply"));

    expect(onPin).toHaveBeenCalledWith("#123456");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("does not call onPin for an invalid hex, and keeps the field open", async () => {
    const onPin = vi.fn();
    render(
      <RampPinControl
        role="accent"
        roleLabel="Accent"
        ramp={makeRamp()}
        onPin={onPin}
        onReset={vi.fn()}
      />
    );

    await userEvent.click(screen.getByText("ramps.pin.override"));
    const field = screen.getByRole("textbox");
    await userEvent.clear(field);
    await userEvent.type(field, "not-a-color");
    await userEvent.click(screen.getByText("ramps.pin.apply"));

    expect(onPin).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});
