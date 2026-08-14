import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ColorTooltip } from "./color-tooltip";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const toastMessage = vi.fn();
const toastError = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    message: (...args: unknown[]) => toastMessage(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

const writeText = vi.fn<(value: string) => Promise<void>>();

beforeEach(() => {
  writeText.mockReset().mockResolvedValue(undefined);
  toastMessage.mockReset();
  toastError.mockReset();
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
});

/** Mirrors how hero.tsx renders a trigger: a span promising button semantics. */
const renderTrigger = (onCopy?: (value: string) => void) =>
  render(
    <ColorTooltip colorValue="#3182CE" showCopyIcon={false} onCopy={onCopy}>
      <span role="button" tabIndex={0} aria-label="Color #3182CE">
        C
      </span>
    </ColorTooltip>
  );

describe("ColorTooltip keyboard activation", () => {
  it("copies on Enter", async () => {
    renderTrigger();

    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });

    expect(writeText).toHaveBeenCalledWith("#3182CE");
  });

  it("copies on Space", () => {
    renderTrigger();

    fireEvent.keyDown(screen.getByRole("button"), { key: " " });

    expect(writeText).toHaveBeenCalledWith("#3182CE");
  });

  it("prevents default on Space so the page does not scroll", () => {
    renderTrigger();

    const event = new KeyboardEvent("keydown", {
      key: " ",
      bubbles: true,
      cancelable: true,
    });
    screen.getByRole("button").dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("ignores other keys", () => {
    renderTrigger();
    const trigger = screen.getByRole("button");

    for (const key of ["a", "Tab", "Escape", "ArrowRight", "Shift"]) {
      fireEvent.keyDown(trigger, { key });
    }

    expect(writeText).not.toHaveBeenCalled();
  });

  it("still copies on click — the mouse path must survive", () => {
    renderTrigger();

    fireEvent.click(screen.getByRole("button"));

    expect(writeText).toHaveBeenCalledWith("#3182CE");
  });

  it("notifies onCopy for keyboard activation, not just clicks", async () => {
    const onCopy = vi.fn();
    renderTrigger(onCopy);

    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
    await vi.waitFor(() => expect(onCopy).toHaveBeenCalledWith("#3182CE"));
  });

  it("surfaces a toast when the clipboard rejects", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    renderTrigger();

    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });

    await vi.waitFor(() => expect(toastError).toHaveBeenCalled());
    expect(toastMessage).not.toHaveBeenCalled();
  });
});
