import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AccentHarmonyPicker } from "./accent-harmony-picker";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("AccentHarmonyPicker", () => {
  it("shows the currently selected rule's label", () => {
    render(<AccentHarmonyPicker value="triadic" onChange={vi.fn()} />);

    expect(screen.getByRole("combobox")).toHaveTextContent(
      "ramps.harmony.triadic"
    );
  });

  it("offers exactly complementary, analogous and triadic -- not splitComplementary", async () => {
    render(<AccentHarmonyPicker value="complementary" onChange={vi.fn()} />);

    await userEvent.click(screen.getByRole("combobox"));

    expect(
      await screen.findByRole("option", { name: "ramps.harmony.analogous" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "ramps.harmony.triadic" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: /splitComplementary/i })
    ).not.toBeInTheDocument();
  });

  it("calls onChange with the picked rule", async () => {
    const onChange = vi.fn();
    render(<AccentHarmonyPicker value="complementary" onChange={onChange} />);

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(
      await screen.findByRole("option", { name: "ramps.harmony.analogous" })
    );

    expect(onChange).toHaveBeenCalledWith("analogous");
  });
});
